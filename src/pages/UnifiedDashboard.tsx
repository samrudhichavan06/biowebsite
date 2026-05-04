import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearAuth, isAuthenticated } from "@/lib/auth";
import { COLLECTIONS } from "@/lib/collections";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Download, LogOut, Bell, User, FileText, QrCode } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export default function UnifiedDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }

    loadUserData();
    loadDownloads();
    loadNotifications();
  }, [user, navigate]);

  const loadUserData = async () => {
    if (!user || !db) return;

    try {
      let collectionName = "";
      switch (user.role) {
        case "exhibitor":
          collectionName = COLLECTIONS.EXHIBITORS;
          break;
        case "visitor":
          collectionName = COLLECTIONS.VISITORS;
          break;
        case "delegate":
          collectionName = COLLECTIONS.DELEGATES;
          break;
        case "fabricator":
          collectionName = COLLECTIONS.FABRICATORS;
          break;
        default:
          return;
      }

      const q = query(collection(db, collectionName), where("email", "==", user.email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setUserData(snapshot.docs[0].data());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadDownloads = async () => {
    if (!user || !db) return;

    try {
      const roleToCategory: Record<string, string> = {
        exhibitor: "Exhibitor",
        visitor: "Visitor",
        delegate: "Delegate",
        fabricator: "Fabricator",
      };

      const category = roleToCategory[user.role] || user.role;
      const q = query(collection(db, COLLECTIONS.DOWNLOADS), where("category", "==", category));
      const snapshot = await getDocs(q);

      setDownloads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error loading downloads:", error);
    }
  };

  const loadNotifications = async () => {
    if (!user || !db) return;

    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where("recipientId", "==", user.id)
      );
      const snapshot = await getDocs(q);

      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      exhibitor: "from-primary to-primary/80",
      visitor: "from-primary to-primary/80",
      delegate: "from-accent to-accent/80",
      fabricator: "from-accent to-accent/80",
      admin: "from-primary to-accent",
    };
    return colors[role] || "from-primary to-primary/80";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      <Nav />

      <div className="flex-1 px-4 py-12 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getRoleColor(user.role)} text-primary-foreground rounded-2xl p-8 mb-10 shadow-card`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold font-display mb-3">Welcome, {user.name}!</h1>
              <p className="text-lg opacity-95">
                Role: <span className="font-semibold capitalize">{user.role}</span>
              </p>
              {user.companyName && (
                <p className="text-lg opacity-95">
                  Company: <span className="font-semibold">{user.companyName}</span>
                </p>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold capitalize">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Bell className="mx-auto mb-2 text-orange-600" size={24} />
                <p className="text-sm text-gray-600">Notifications</p>
                <p className="text-lg font-semibold">{notifications.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Download className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-sm text-gray-600">Resources</p>
                <p className="text-lg font-semibold">{downloads.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <QrCode className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-sm text-gray-600">Badge</p>
                <p className="text-lg font-semibold">Ready</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-white border-b">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {user.role === "exhibitor" && <TabsTrigger value="exhibitor">Exhibitor Tools</TabsTrigger>}
            {user.role === "fabricator" && <TabsTrigger value="fabricator">Design Submission</TabsTrigger>}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                {userData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(userData).map(([key, value]) => {
                      if (["id", "createdAt", "updatedAt", "timestamp"].includes(key)) return null;
                      return (
                        <div key={key}>
                          <label className="text-sm font-semibold text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </label>
                          <p className="text-gray-900 mt-1">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>Loading profile data...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download size={20} />
                  Available Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {downloads.length > 0 ? (
                  <div className="space-y-3">
                    {downloads.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-semibold">{file.title}</p>
                          <p className="text-sm text-gray-600">
                            {file.type.replace(/_/g, " ")} • {file.fileSize} MB
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => downloadFile(file.fileUrl, file.title)}
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">No resources available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  Your Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          notif.type === "success"
                            ? "bg-green-50 border-green-500"
                            : notif.type === "error"
                              ? "bg-red-50 border-red-500"
                              : notif.type === "warning"
                                ? "bg-yellow-50 border-yellow-500"
                                : "bg-blue-50 border-blue-500"
                        }`}
                      >
                        <p className="font-semibold">{notif.title}</p>
                        <p className="text-sm mt-1">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exhibitor Tools */}
          {user.role === "exhibitor" && (
            <TabsContent value="exhibitor">
              <Card>
                <CardHeader>
                  <CardTitle>Exhibitor Zone Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 mb-4">Manage your stall booking and materials</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="w-full" variant="outline">
                      <FileText size={18} className="mr-2" />
                      View Stall Allocation
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download size={18} className="mr-2" />
                      Download Exhibitor Manual
                    </Button>
                    <Button className="w-full" variant="outline">
                      Upload Booth Materials
                    </Button>
                    <Button className="w-full" variant="outline">
                      View Payment Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Fabricator Tools */}
          {user.role === "fabricator" && (
            <TabsContent value="fabricator">
              <Card>
                <CardHeader>
                  <CardTitle>Design Submission & Approval</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 mb-4">Submit and track your design approvals</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="w-full" variant="outline">
                      <FileText size={18} className="mr-2" />
                      View Guidelines
                    </Button>
                    <Button className="w-full" variant="outline">
                      Submit New Design
                    </Button>
                    <Button className="w-full" variant="outline">
                      Track Submissions
                    </Button>
                    <Button className="w-full" variant="outline">
                      Download Approval Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
