import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, ExhibitorMessage } from "@/lib/collections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Send, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface AdminExhibitorMessagingProps {
  exhibitorId: string;
  exhibitorName: string;
  onMessagesRead?: () => void;
}

export const AdminExhibitorMessaging = ({ exhibitorId, exhibitorName, onMessagesRead }: AdminExhibitorMessagingProps) => {
  const [messages, setMessages] = useState<ExhibitorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [exhibitorId]);

  const loadMessages = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, COLLECTIONS.EXHIBITOR_MESSAGES),
        where("exhibitorId", "==", exhibitorId)
      );
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as ExhibitorMessage }))
        .sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime());
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      await addDoc(collection(db, COLLECTIONS.EXHIBITOR_MESSAGES), {
        exhibitorId,
        senderId: "admin",
        senderRole: "admin",
        senderName: "Admin Support",
        subject: "Message from Admin",
        message: newMessage,
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success("Message sent to exhibitor");
      setNewMessage("");
      setShowCompose(false);
      loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.EXHIBITOR_MESSAGES, messageId), {
        deleted: true,
      });
      toast.success("Message deleted");
      loadMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!db) return;

    const unreadExhibitorMessages = messages.filter((message) => message.senderRole === "exhibitor" && !message.read);
    if (unreadExhibitorMessages.length === 0) {
      toast.info("No unread exhibitor messages");
      return;
    }

    try {
      await Promise.all(
        unreadExhibitorMessages.map((message) =>
          updateDoc(doc(db, COLLECTIONS.EXHIBITOR_MESSAGES, message.id), {
            read: true,
            readAt: serverTimestamp(),
          })
        )
      );

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.senderRole === "exhibitor" ? { ...message, read: true } : message
        )
      );

      onMessagesRead?.();
      toast.success("Marked as read");
    } catch (error) {
      console.error("Error marking messages as read:", error);
      toast.error("Failed to mark messages as read");
    }
  };

  const unreadCount = messages.filter(m => !m.read && m.senderRole === "exhibitor").length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Messages with {exhibitorName}</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{unreadCount} unread</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="secondary" size="sm">
              Mark Read
            </Button>
          )}
          {!showCompose && (
            <Button onClick={() => setShowCompose(true)} variant="outline" size="sm">
              Send Message
            </Button>
          )}
        </div>
      </div>

      {showCompose && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">To</label>
              <div className="text-sm text-gray-600 mt-1">{exhibitorName}</div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Message</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-2 border rounded text-sm"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCompose(false);
                  setNewMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No messages yet</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`p-3 border rounded ${msg.senderRole === "exhibitor" && !msg.read ? "bg-yellow-50 border-yellow-300" : "bg-white"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{msg.senderName}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      msg.senderRole === "admin" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                    }`}>
                      {msg.senderRole}
                    </span>
                    {msg.senderRole === "exhibitor" && !msg.read && (
                      <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Unread</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {msg.createdAt?.toDate().toLocaleDateString()} {msg.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-sm mt-2">{msg.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
