import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Lock, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleGate } from "@/components/RoleGate";
import { ConversationList, type Conversation } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";
import { GroupChatView } from "@/components/GroupChatView";
import { useGroupChats, useJoinGroupChat, type GroupChat } from "@/hooks/useGroupChat";
import { useAuth } from "@/hooks/useAuth";
import { GoldCardSkeleton } from "@/components/animations/GoldSkeleton";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type MessageTab = "direct" | "groups";

function GroupChatList({ onSelect }: { onSelect: (gc: GroupChat) => void }) {
  const { data: groups, isLoading } = useGroupChats();

  if (isLoading) {
    return <div className="space-y-3 p-4"><GoldCardSkeleton /><GoldCardSkeleton /></div>;
  }

  if (!groups?.length) {
    return (
      <motion.div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-center">No group chats yet.<br />Join a hangout to start chatting with the group.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((gc, i) => (
        <motion.button
          key={gc.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(gc)}
          className="w-full flex items-center gap-3 p-4 rounded-xl glass-card hover:bg-secondary/30 transition-colors text-left"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold truncate">{gc.name}</h3>
              {gc.last_message_at && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(gc.last_message_at), { addSuffix: true })}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {gc.last_message || `${gc.member_count ?? 0} members`}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function MessagesContent() {
  const [searchParams] = useSearchParams();
  const initialRecipient = searchParams.get("to");
  const initialName = searchParams.get("name") || "Traveler";

  const [messageTab, setMessageTab] = useState<MessageTab>("direct");
  const [activeChat, setActiveChat] = useState<{
    recipientId: string;
    recipientName: string;
    recipientAvatar: string;
  } | null>(
    initialRecipient
      ? {
          recipientId: initialRecipient,
          recipientName: initialName,
          recipientAvatar: initialName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
        }
      : null
  );
  const [activeGroupChat, setActiveGroupChat] = useState<GroupChat | null>(null);

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

  if (activeGroupChat) {
    return (
      <div className="h-[calc(100vh-5rem)]">
        <GroupChatView groupChat={activeGroupChat} onBack={() => setActiveGroupChat(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-display font-bold">Messages</h1>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 text-primary" />
          <span>E2E Encrypted</span>
        </div>
      </motion.div>

      <Tabs value={messageTab} onValueChange={(v) => setMessageTab(v as MessageTab)} className="mb-4">
        <TabsList className="w-full bg-secondary/50">
          <TabsTrigger value="direct" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-1.5" /> Direct
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">
            <Users className="h-4 w-4 mr-1.5" /> Groups
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {messageTab === "direct" ? (
        <ConversationList
          onSelectConversation={(conv) =>
            setActiveChat({
              recipientId: conv.recipientId,
              recipientName: conv.recipientName,
              recipientAvatar: conv.recipientAvatar,
            })
          }
        />
      ) : (
        <GroupChatList onSelect={setActiveGroupChat} />
      )}
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
