import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Lock } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { ConversationList, type Conversation } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";

function MessagesContent() {
  const [searchParams] = useSearchParams();
  const initialRecipient = searchParams.get("to");
  const initialName = searchParams.get("name") || "Nomad";

  const [activeChat, setActiveChat] = useState<{
    recipientId: string;
    recipientName: string;
    recipientAvatar: string;
  } | null>(
    initialRecipient
      ? {
          recipientId: initialRecipient,
          recipientName: initialName,
          recipientAvatar: initialName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        }
      : null
  );

  if (activeChat) {
    return (
      <div className="h-[calc(100vh-5rem)]">
        <ChatView
          recipientId={activeChat.recipientId}
          recipientName={activeChat.recipientName}
          recipientAvatar={activeChat.recipientAvatar}
          onBack={() => setActiveChat(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-display font-bold">Messages</h1>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 text-primary" />
          <span>E2E Encrypted</span>
        </div>
      </motion.div>

      <ConversationList
        onSelectConversation={(conv) =>
          setActiveChat({
            recipientId: conv.recipientId,
            recipientName: conv.recipientName,
            recipientAvatar: conv.recipientAvatar,
          })
        }
      />
    </div>
  );
}

export default function Messages() {
  return (
    <RoleGate minRank={0}>
      <MessagesContent />
    </RoleGate>
  );
}
