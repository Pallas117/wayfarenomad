import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Lock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GoldCardSkeleton } from "@/components/animations/GoldSkeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface Conversation {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ConversationListProps {
  onSelectConversation: (conv: Conversation) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadConversations = async () => {
      // Get all messages involving the user, grouped by conversation partner
      const { data: sent } = await supabase
        .from("messages")
        .select("receiver_id, content, created_at, read")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      const { data: received } = await supabase
        .from("messages")
        .select("sender_id, content, created_at, read")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      // Build conversation map
      const convMap = new Map<string, { lastAt: string; encrypted: string; unread: number }>();

      sent?.forEach((m) => {
        const id = m.receiver_id;
        const existing = convMap.get(id);
        if (!existing || m.created_at > existing.lastAt) {
          convMap.set(id, {
            lastAt: m.created_at,
            encrypted: m.content,
            unread: existing?.unread ?? 0,
          });
        }
      });

      received?.forEach((m) => {
        const id = m.sender_id;
        const existing = convMap.get(id);
        const unread = (existing?.unread ?? 0) + (!m.read ? 1 : 0);
        if (!existing || m.created_at > existing.lastAt) {
          convMap.set(id, {
            lastAt: m.created_at,
            encrypted: m.content,
            unread,
          });
        } else if (existing) {
          existing.unread = unread;
        }
      });

      if (convMap.size === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for conversation partners
      const partnerIds = Array.from(convMap.keys());
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", partnerIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );

      const convList: Conversation[] = partnerIds
        .map((id) => {
          const conv = convMap.get(id)!;
          const profile = profileMap.get(id);
          const name = profile?.display_name || "Nomad";
          return {
            recipientId: id,
            recipientName: name,
            recipientAvatar: name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            lastMessage: "🔒 Encrypted message",
            lastMessageAt: conv.lastAt,
            unreadCount: conv.unread,
          };
        })
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

      setConversations(convList);
      setLoading(false);
    };

    loadConversations();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <GoldCardSkeleton />
        <GoldCardSkeleton />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-center">
          No conversations yet.<br />
          Connect with someone on the Social tab to start chatting.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {conversations.map((conv, i) => (
          <motion.button
            key={conv.recipientId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelectConversation(conv)}
            className="w-full flex items-center gap-3 p-4 rounded-xl glass-card hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="relative">
              <div className="h-12 w-12 rounded-full gradient-gold flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                {conv.recipientAvatar}
              </div>
              {conv.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-destructive-foreground">
                  {conv.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold truncate">{conv.recipientName}</h3>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Lock className="h-3 w-3 text-primary shrink-0" />
                <p className={cn(
                  "text-xs truncate",
                  conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
