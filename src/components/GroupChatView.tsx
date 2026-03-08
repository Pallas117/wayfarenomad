import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useGroupMessages, useSendGroupMessage, type GroupChat } from "@/hooks/useGroupChat";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

interface GroupChatViewProps {
  groupChat: GroupChat;
  onBack: () => void;
}

export function GroupChatView({ groupChat, onBack }: GroupChatViewProps) {
  const { user } = useAuth();
  const { messages, isLoading } = useGroupMessages(groupChat.id);
  const sendMessage = useSendGroupMessage();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const content = text.trim();
    setText("");
    haptic("tap");

    await sendMessage.mutateAsync({
      groupChatId: groupChat.id,
      senderId: user.id,
      content,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold truncate">{groupChat.name}</h3>
          <p className="text-xs text-muted-foreground">
            {groupChat.member_count ?? 0} members
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}
              >
                {!isOwn && (
                  <div className="h-8 w-8 rounded-full gradient-gold flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    {msg.sender_avatar}
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] rounded-xl px-3 py-2",
                  isOwn ? "bg-primary text-primary-foreground" : "glass-card"
                )}>
                  {!isOwn && (
                    <p className="text-xs font-medium text-primary mb-0.5">{msg.sender_name}</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                  )}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message the group..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!text.trim() || sendMessage.isPending}
          className="gradient-gold text-primary-foreground min-h-[44px] min-w-[44px]"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
