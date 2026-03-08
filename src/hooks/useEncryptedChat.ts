import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { deriveConversationKey, encryptMessage, decryptMessage } from "@/lib/crypto";

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  decrypted?: boolean;
}

export function useEncryptedChat(recipientId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const keyRef = useRef<string | null>(null);

  // Derive conversation key
  useEffect(() => {
    if (!user?.id || !recipientId) return;
    deriveConversationKey(user.id, recipientId).then((key) => {
      keyRef.current = key;
    });
  }, [user?.id, recipientId]);

  // Decrypt a single message
  const decrypt = useCallback(async (encrypted: string): Promise<string> => {
    if (!keyRef.current) return "[key unavailable]";
    try {
      return await decryptMessage(encrypted, keyRef.current);
    } catch {
      return "[decryption failed]";
    }
  }, []);

  // Load existing messages
  useEffect(() => {
    if (!user?.id || !recipientId) return;

    const loadMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
        .limit(100);

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Wait for key
      while (!keyRef.current) {
        await new Promise((r) => setTimeout(r, 50));
      }

      const decrypted = await Promise.all(
        data.map(async (m) => ({
          id: m.id,
          senderId: m.sender_id,
          content: await decrypt(m.content),
          createdAt: m.created_at,
          read: m.read ?? false,
          decrypted: true,
        }))
      );
      setMessages(decrypted);
      setLoading(false);

      // Mark unread as read
      const unread = data.filter(
        (m) => m.receiver_id === user.id && !m.read
      );
      if (unread.length > 0) {
        await supabase
          .from("messages")
          .update({ read: true })
          .in("id", unread.map((m) => m.id));
      }
    };

    loadMessages();
  }, [user?.id, recipientId, decrypt]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id || !recipientId) return;

    const channel = supabase
      .channel(`chat:${[user.id, recipientId].sort().join(":")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const m = payload.new as any;
          // Only process messages for this conversation
          const isOurs =
            (m.sender_id === user.id && m.receiver_id === recipientId) ||
            (m.sender_id === recipientId && m.receiver_id === user.id);
          if (!isOurs) return;

          // Don't duplicate if we already added it optimistically
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === m.id)) return prev;
            return prev; // Will be added below
          });

          const content = await decrypt(m.content);
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === m.id)) return prev;
            return [
              ...prev,
              {
                id: m.id,
                senderId: m.sender_id,
                content,
                createdAt: m.created_at,
                read: m.read ?? false,
                decrypted: true,
              },
            ];
          });

          // Auto-mark as read
          if (m.receiver_id === user.id) {
            await supabase
              .from("messages")
              .update({ read: true })
              .eq("id", m.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, recipientId, decrypt]);

  // Send encrypted message
  const sendMessage = useCallback(
    async (plaintext: string) => {
      if (!user?.id || !recipientId || !keyRef.current) return;

      const encrypted = await encryptMessage(plaintext, keyRef.current);
      const optimisticId = crypto.randomUUID();

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          senderId: user.id,
          content: plaintext,
          createdAt: new Date().toISOString(),
          read: false,
          decrypted: true,
        },
      ]);

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: recipientId,
          content: encrypted,
        })
        .select()
        .single();

      // Trigger push notification for recipient (fire-and-forget)
      supabase.functions.invoke("send-push", {
        body: { receiver_id: recipientId, sender_name: "A nomad" },
      }).catch(() => {});

      if (data) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, id: data.id, createdAt: data.created_at } : m
          )
        );
      }

      if (error) {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    },
    [user?.id, recipientId]
  );

  return { messages, loading, sendMessage };
}
