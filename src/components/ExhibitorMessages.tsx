import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, ExhibitorMessage } from "@/lib/collections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ExhibitorMessagesProps {
  exhibitorId: string;
  exhibitorName: string;
  exhibitorEmail: string;
}

export const ExhibitorMessages = ({ exhibitorId, exhibitorName, exhibitorEmail }: ExhibitorMessagesProps) => {
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

      // Mark messages as read
      snapshot.docs.forEach(async docSnap => {
        const msgData = docSnap.data() as ExhibitorMessage;
        if (!msgData.read && msgData.senderRole === "admin") {
          await updateDoc(doc(db, COLLECTIONS.EXHIBITOR_MESSAGES, docSnap.id), {
            read: true,
            readAt: serverTimestamp(),
          });
        }
      });
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
        senderId: exhibitorId,
        senderRole: "exhibitor",
        senderName: exhibitorName,
        subject: "Message from Exhibitor",
        message: newMessage,
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success("Message sent to admin");
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

  const unreadCount = messages.filter(m => !m.read && m.senderRole === "admin").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Messages</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{unreadCount}</span>
          )}
        </div>
        {!showCompose && (
          <Button onClick={() => setShowCompose(true)} variant="outline" size="sm">
            New Message
          </Button>
        )}
      </div>

      {showCompose && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">To</label>
              <div className="text-sm text-gray-600 mt-1">Admin Support</div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Message</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-2 border rounded text-sm"
                rows={4}
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
        </Card>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No messages yet</div>
        ) : (
          messages.map(msg => (
            <Card key={msg.id} className={`p-3 ${msg.senderRole === "admin" && !msg.read ? "bg-blue-50 border-blue-300" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{msg.senderName}</span>
                    {msg.senderRole === "admin" && msg.read && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {msg.createdAt?.toDate().toLocaleDateString()} {msg.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-sm mt-2">{msg.message}</p>
                  {msg.attachmentUrl && (
                    <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-2 inline-block">
                      📎 {msg.attachmentName}
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
