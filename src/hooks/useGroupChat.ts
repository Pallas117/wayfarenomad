import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface GroupChat {
  id: string;
  name: string;
  hangout_id: string | null;
  expedition_id: string | null;
  created_by: string;
  created_at: string;
  member_count?: number;
  last_message?: string;
  last_message_at?: string;
}

export interface GroupMessage {
  id: string;
  group_chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export function useGroupChats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["group-chats"],
    queryFn: async () => {
      // Get groups user is a member of
      const { data: memberships } = await supabase
        .from("group_chat_members")
        .select("group_chat_id")
        .eq("user_id", user!.id);

      if (!memberships?.length) return [];

      const groupIds = memberships.map((m) => m.group_chat_id);
      const { data: groups, error } = await supabase
        .from("group_chats")
        .select("*")
        .in("id", groupIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get member counts
      const { data: members } = await supabase
        .from("group_chat_members")
        .select("group_chat_id")
        .in("group_chat_id", groupIds);

      const countMap = new Map<string, number>();
      members?.forEach((m) => {
        countMap.set(m.group_chat_id, (countMap.get(m.group_chat_id) ?? 0) + 1);
      });

      // Get last message per group
      const { data: lastMessages } = await supabase
        .from("group_messages")
        .select("group_chat_id, content, created_at")
        .in("group_chat_id", groupIds)
        .order("created_at", { ascending: false });

      const lastMsgMap = new Map<string, { content: string; created_at: string }>();
      lastMessages?.forEach((m) => {
        if (!lastMsgMap.has(m.group_chat_id)) {
          lastMsgMap.set(m.group_chat_id, { content: m.content, created_at: m.created_at });
        }
      });

      return (groups ?? []).map((g) => ({
        ...g,
        member_count: countMap.get(g.id) ?? 0,
        last_message: lastMsgMap.get(g.id)?.content,
        last_message_at: lastMsgMap.get(g.id)?.created_at,
      })) as GroupChat[];
    },
    enabled: !!user,
  });
}

export function useGroupMessages(groupChatId: string | null) {
  const { user } = useAuth();
  const [realtimeMessages, setRealtimeMessages] = useState<GroupMessage[]>([]);
  const queryClient = useQueryClient();

  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["group-messages", groupChatId],
    queryFn: async () => {
      if (!groupChatId) return [];

      const { data: messages, error } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_chat_id", groupChatId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("user_id, display_name")
        .in("user_id", senderIds);

      const profileMap = new Map(
        (profiles ?? []).map((p: any) => [p.user_id, p])
      );

      return (messages ?? []).map((m) => {
        const profile = profileMap.get(m.sender_id);
        const name = profile?.display_name ?? "Nomad";
        return {
          ...m,
          sender_name: name,
          sender_avatar: name
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        };
      }) as GroupMessage[];
    },
    enabled: !!groupChatId && !!user,
  });

  // Realtime subscription
  useEffect(() => {
    if (!groupChatId) return;

    setRealtimeMessages([]);

    const channel = supabase
      .channel(`group-${groupChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_chat_id=eq.${groupChatId}`,
        },
        async (payload) => {
          const msg = payload.new as GroupMessage;
          // Fetch sender profile
          const { data: profile } = await supabase
            .from("public_profiles" as any)
            .select("display_name")
            .eq("user_id", msg.sender_id)
            .single();

          const name = profile?.display_name ?? "Nomad";
          setRealtimeMessages((prev) => [
            ...prev,
            {
              ...msg,
              sender_name: name,
              sender_avatar: name
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupChatId]);

  const allMessages = [...(initialMessages ?? []), ...realtimeMessages].filter(
    (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index
  );

  return { messages: allMessages, isLoading };
}

export function useSendGroupMessage() {
  return useMutation({
    mutationFn: async ({
      groupChatId,
      senderId,
      content,
    }: {
      groupChatId: string;
      senderId: string;
      content: string;
    }) => {
      const { error } = await supabase
        .from("group_messages")
        .insert({
          group_chat_id: groupChatId,
          sender_id: senderId,
          content,
        });
      if (error) throw error;

      // Notify other group members via push
      const { data: members } = await supabase
        .from("group_chat_members")
        .select("user_id")
        .eq("group_chat_id", groupChatId)
        .neq("user_id", senderId);

      if (members?.length) {
        const { data: group } = await supabase
          .from("group_chats")
          .select("name")
          .eq("id", groupChatId)
          .single();

        const { data: profile } = await supabase
          .from("public_profiles" as any)
          .select("display_name")
          .eq("user_id", senderId)
          .single();

        supabase.functions.invoke("send-push", {
          body: {
            type: "group_message",
            receiver_ids: members.map((m) => m.user_id),
            sender_name: profile?.display_name || "Someone",
            group_name: group?.name || "Group Chat",
          },
        }).catch(console.error);
      }
    },
  });
}

export function useJoinGroupChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupChatId,
      userId,
    }: {
      groupChatId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("group_chat_members")
        .insert({ group_chat_id: groupChatId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-chats"] });
    },
  });
}
