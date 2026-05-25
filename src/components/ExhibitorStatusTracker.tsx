import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, ExhibitorFeedback, DocumentApproval } from "@/lib/collections";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, FileCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ExhibitorStatusTrackerProps {
  exhibitorId: string;
}

export const ExhibitorStatusTracker = ({ exhibitorId }: ExhibitorStatusTrackerProps) => {
  const [feedback, setFeedback] = useState<ExhibitorFeedback[]>([]);
  const [documentApprovals, setDocumentApprovals] = useState<DocumentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeedbackAndDocuments();
  }, [exhibitorId]);

  const loadFeedbackAndDocuments = async () => {
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
      toast.error("Failed to load status information");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 border-red-300 text-red-900";
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-900";
      case "low":
        return "bg-green-100 border-green-300 text-green-900";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const pendingCount = feedback.filter(f => f.status === "pending").length;
  const pendingDocs = documentApprovals.filter(d => d.status === "pending").length;

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Loading status information...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Document Approvals Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Document Approvals</h3>
          {pendingDocs > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{pendingDocs} pending</span>
          )}
        </div>
        <div className="space-y-2">
          {documentApprovals.length === 0 ? (
            <p className="text-sm text-gray-500">No documents submitted yet</p>
          ) : (
            documentApprovals.map(doc => (
              <Card key={doc.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">{doc.documentType.replace("_", " ")}</span>
                      {getStatusIcon(doc.status)}
                    </div>
                    <p className="text-xs text-gray-600">{doc.documentName}</p>
                    {doc.adminNotes && (
                      <p className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                        <strong>Note:</strong> {doc.adminNotes}
                      </p>
                    )}
                    {doc.reviewedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reviewed: {doc.reviewedAt.toDate().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                    doc.status === "approved" ? "bg-green-100 text-green-800" :
                    doc.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Feedback Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Admin Feedback</h3>
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{pendingCount} unresolved</span>
          )}
        </div>
        <div className="space-y-2">
          {feedback.length === 0 ? (
            <p className="text-sm text-gray-500">No feedback yet</p>
          ) : (
            feedback.map(item => (
              <Card key={item.id} className={`p-3 border ${getPriorityColor(item.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{item.feedbackType.replace("_", " ")}</span>
                  <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                    item.status === "resolved" ? "bg-green-200 text-green-800" :
                    item.status === "acknowledged" ? "bg-blue-200 text-blue-800" :
                    "bg-yellow-200 text-yellow-800"
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm mt-1">{item.comment}</p>
                <p className="text-xs text-gray-600 mt-2">
                  {item.updatedAt?.toDate().toLocaleDateString()}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
