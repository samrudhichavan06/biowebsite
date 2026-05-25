import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, ExhibitorFeedback, DocumentApproval } from "@/lib/collections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileCheck, MessageSquare, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface AdminFeedbackManagementProps {
  exhibitorId: string;
  exhibitorName: string;
  adminId: string;
}

export const AdminFeedbackManagement = ({ exhibitorId, exhibitorName, adminId }: AdminFeedbackManagementProps) => {
  const [feedback, setFeedback] = useState<ExhibitorFeedback[]>([]);
  const [documentApprovals, setDocumentApprovals] = useState<DocumentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    title: "",
    comment: "",
    feedbackType: "general" as ExhibitorFeedback["feedbackType"],
    priority: "medium" as ExhibitorFeedback["priority"],
  });

  useEffect(() => {
    loadFeedbackAndDocs();
  }, [exhibitorId]);

  const loadFeedbackAndDocs = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      // Load feedback
      const feedbackQ = query(
        collection(db, COLLECTIONS.EXHIBITOR_FEEDBACK),
        where("exhibitorId", "==", exhibitorId)
      );
      const feedbackSnapshot = await getDocs(feedbackQ);
      const feedbackData = feedbackSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as ExhibitorFeedback }))
        .sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime());

      // Load document approvals
      const docsQ = query(
        collection(db, COLLECTIONS.DOCUMENT_APPROVALS),
        where("exhibitorId", "==", exhibitorId)
      );
      const docsSnapshot = await getDocs(docsQ);
      const docsData = docsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as DocumentApproval }))
        .sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime());

      setFeedback(feedbackData);
      setDocumentApprovals(docsData);
    } catch (error) {
      console.error("Error loading feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!feedbackData.title.trim() || !feedbackData.comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, COLLECTIONS.EXHIBITOR_FEEDBACK), {
        exhibitorId,
        adminId,
        title: feedbackData.title,
        comment: feedbackData.comment,
        feedbackType: feedbackData.feedbackType,
        priority: feedbackData.priority,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Feedback added");
      setFeedbackData({ title: "", comment: "", feedbackType: "general", priority: "medium" });
      setShowFeedbackForm(false);
      loadFeedbackAndDocs();
    } catch (error) {
      console.error("Error adding feedback:", error);
      toast.error("Failed to add feedback");
    }
  };

  const handleUpdateDocumentStatus = async (docId: string, status: "approved" | "rejected", notes: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.DOCUMENT_APPROVALS, docId), {
        status,
        adminNotes: notes,
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(`Document ${status}`);
      loadFeedbackAndDocs();
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId: string, status: "resolved" | "acknowledged") => {
    try {
      await updateDoc(doc(db, COLLECTIONS.EXHIBITOR_FEEDBACK, feedbackId), {
        status,
        updatedAt: serverTimestamp(),
      });

      toast.success("Feedback updated");
      loadFeedbackAndDocs();
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Document Approvals */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Document Approvals</h3>
          </div>
        </div>

        {documentApprovals.length === 0 ? (
          <p className="text-sm text-gray-500">No documents submitted</p>
        ) : (
          <div className="space-y-2">
            {documentApprovals.map(doc => (
              <div key={doc.id} className="p-3 border rounded bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm capitalize">{doc.documentType.replace("_", " ")}</p>
                    <p className="text-xs text-gray-600">{doc.documentName}</p>
                    <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                      View Document
                    </a>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                    doc.status === "approved" ? "bg-green-100 text-green-800" :
                    doc.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {doc.status}
                  </span>
                </div>

                {doc.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateDocumentStatus(doc.id, "approved", "Approved")}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateDocumentStatus(doc.id, "rejected", "Needs revision")}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {doc.adminNotes && (
                  <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
                    <strong>Notes:</strong> {doc.adminNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Feedback Management */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Feedback</h3>
          </div>
          {!showFeedbackForm && (
            <Button onClick={() => setShowFeedbackForm(true)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Feedback
            </Button>
          )}
        </div>

        {showFeedbackForm && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Feedback Type</label>
              <select
                value={feedbackData.feedbackType}
                onChange={(e) => setFeedbackData({ ...feedbackData, feedbackType: e.target.value as any })}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="general">General</option>
                <option value="logo">Logo</option>
                <option value="brochure">Brochure</option>
                <option value="booth_design">Booth Design</option>
                <option value="materials">Materials</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Priority</label>
              <select
                value={feedbackData.priority}
                onChange={(e) => setFeedbackData({ ...feedbackData, priority: e.target.value as any })}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Title</label>
              <input
                type="text"
                value={feedbackData.title}
                onChange={(e) => setFeedbackData({ ...feedbackData, title: e.target.value })}
                placeholder="Feedback title..."
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Comment</label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                placeholder="Your feedback..."
                className="w-full p-2 border rounded text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowFeedbackForm(false);
                  setFeedbackData({ title: "", comment: "", feedbackType: "general", priority: "medium" });
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddFeedback} className="bg-purple-600 hover:bg-purple-700">
                Add Feedback
              </Button>
            </div>
          </div>
        )}

        {feedback.length === 0 ? (
          <p className="text-sm text-gray-500">No feedback yet</p>
        ) : (
          <div className="space-y-2">
            {feedback.map(item => (
              <div
                key={item.id}
                className={`p-3 border rounded ${
                  item.priority === "high" ? "bg-red-50 border-red-200" :
                  item.priority === "medium" ? "bg-yellow-50 border-yellow-200" :
                  "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600 capitalize">{item.feedbackType.replace("_", " ")} • {item.priority}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                    item.status === "resolved" ? "bg-green-100 text-green-800" :
                    item.status === "acknowledged" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-sm mb-2">{item.comment}</p>

                {item.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateFeedbackStatus(item.id, "acknowledged")}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateFeedbackStatus(item.id, "resolved")}
                      className="text-green-600 hover:text-green-700"
                    >
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
