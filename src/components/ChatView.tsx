import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Shield, Lock, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEncryptedChat, type ChatMessage } from "@/hooks/useEncryptedChat";
import { useAuth } from "@/hooks/useAuth";
import { ShieldPulse } from "@/components/animations/ShieldPulse";
import { ChatOverlapBanner } from "@/components/ChatOverlapBanner";
import { ItineraryShareCard, decodeItineraryMessage, encodeItineraryMessage, type ItineraryCardData } from "@/components/ItineraryShareCard";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface ChatViewProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  onBack: () => void;
}

export function ChatView({ recipientId, recipientName, recipientAvatar, onBack }: ChatViewProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useEncryptedChat(recipientId);
  const [input, setInput] = useState("");
  const [showShield, setShowShield] = useState(true);
  const [shieldDone, setShieldDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user's itineraries for sharing
  const { data: myItineraries } = useQuery({
    queryKey: ["my-itineraries", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("itineraries").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch user's profile for teaches/learns
  const { data: myProfile } = useQuery({
    queryKey: ["my-profile-skills", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("teaches, learns").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  // Auto-dismiss shield after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowShield(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ShieldPulse entry overlay */}
      <ShieldPulse visible={showShield} onComplete={() => setShieldDone(true)} />

      {/* Header */}
      <motion.div
        className="flex items-center gap-3 p-4 border-b border-border bg-card/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="h-10 w-10 rounded-full gradient-gold flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
          {recipientAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold truncate">{recipientName}</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3 text-primary" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="h-4 w-4 text-primary" />
        </div>
      </motion.div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* E2E notice */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs text-primary">
            <Lock className="h-3 w-3" />
            Messages are encrypted with AES-256-GCM
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-10 rounded-2xl animate-pulse",
                  i % 2 === 0 ? "bg-secondary/50 w-2/3 ml-auto" : "bg-muted/50 w-3/4"
                )}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-center">
              Start a conversation with {recipientName}.<br />
              All messages are end-to-end encrypted.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.senderId === user?.id}
                showTimestamp={
                  i === 0 ||
                  new Date(msg.createdAt).getTime() -
                    new Date(messages[i - 1].createdAt).getTime() >
                    300000
                }
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input area */}
      <motion.div
        className="p-4 border-t border-border bg-card/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-2 items-end">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-secondary/50 border-border min-h-[44px]"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="gradient-gold text-primary-foreground min-h-[44px] w-11 shrink-0"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function MessageBubble({
  message,
  isMine,
  showTimestamp,
}: {
  message: ChatMessage;
  isMine: boolean;
  showTimestamp: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn("flex flex-col", isMine ? "items-end" : "items-start")}
    >
      {showTimestamp && (
        <span className="text-[10px] text-muted-foreground mb-1 px-2">
          {format(new Date(message.createdAt), "h:mm a")}
        </span>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isMine
            ? "gradient-gold text-primary-foreground rounded-br-md"
            : "bg-secondary/60 text-foreground rounded-bl-md"
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
