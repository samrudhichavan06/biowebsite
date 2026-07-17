import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/collections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, File, FileText, Book, Layout, Zap } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

interface DownloadFile {
  id: string;
  title: string;
  type: "brochure" | "floor_plan" | "manual" | "agenda" | "guidelines";
  fileUrl: string;
  fileSize: number;
  category: string;
  description?: string;
}

const STATIC_DOWNLOADS: DownloadFile[] = [
  {
    id: "static-bioenergy-agenda",
    title: "Bioenergy Global Agenda",
    type: "agenda",
    fileUrl: "https://drive.google.com/uc?export=download&id=18cO9r_ixoM8pQvHpSTN_62kEMlyeWq-l",
    fileSize: 0,
    category: "Visitor",
    description: "Complete agenda for the Bioenergy Global conference",
  },
  {
    id: "static-bioenergy-speakers",
    title: "Bioenergy Global Conference Speakers",
    type: "manual",
    fileUrl: "https://drive.google.com/uc?export=download&id=1bOXMW9yESmZNnnqHCAcT-UYy4mO4kATY",
    fileSize: 0,
    category: "Visitor",
    description: "List of conference speakers at Bioenergy Global",
  },
  {
    id: "static-bioenergy-brochure",
    title: "Bioenergy Global Brochure",
    type: "brochure",
    fileUrl: "https://drive.google.com/uc?export=download&id=1CJVti2Wlpa6Bm0SF4uRGzsDJJGHeaW1x",
    fileSize: 0,
    category: "Visitor",
    description: "Official brochure for Bioenergy Global event",
  },
];

export default function DownloadCenter() {
  const [downloads, setDownloads] = useState<DownloadFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    if (!db) return;

    try {
      setLoading(true);
      const q = query(collection(db, COLLECTIONS.DOWNLOADS));
      const snapshot = await getDocs(q);
      const firestoreDownloads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DownloadFile[];
      setDownloads([...STATIC_DOWNLOADS, ...firestoreDownloads]);
    } catch (error) {
      console.error("Error loading downloads:", error);
      setDownloads(STATIC_DOWNLOADS);
    } finally {
      setLoading(false);
    }
  };

  const filteredDownloads = downloads;

  const getTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      brochure: <FileText className="w-5 h-5 text-primary" />,
      floor_plan: <Layout className="w-5 h-5 text-accent" />,
      manual: <Book className="w-5 h-5 text-primary" />,
      agenda: <File className="w-5 h-5 text-primary" />,
      guidelines: <Zap className="w-5 h-5 text-accent" />,
    };
    return icons[type] || <File className="w-5 h-5 text-primary" />;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      brochure: "Brochure",
      floor_plan: "Floor Plan",
      manual: "Manual",
      agenda: "Agenda",
      guidelines: "Guidelines",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      brochure: "bg-primary/10 text-primary",
      floor_plan: "bg-accent/10 text-accent",
      manual: "bg-primary/10 text-primary",
      agenda: "bg-primary/10 text-primary",
      guidelines: "bg-accent/10 text-accent",
    };
    return colors[type] || "bg-primary/10 text-primary";
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      <Nav />

      <div className="flex-1 px-4 py-12 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Download className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-display text-foreground">Download Center</h1>
          </div>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Access all event resources, guidelines, brochures, and documents in one place
          </p>
        </div>

        {/* Downloads Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading resources...</p>
          </div>
        ) : filteredDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads.map(file => (
              <Card key={file.id} className="hover:shadow-card transition-all border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg">
                        {getTypeIcon(file.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base line-clamp-2 text-foreground">{file.title}</CardTitle>
                        <p className="text-xs text-foreground/60 mt-1">
                          {file.fileSize} MB
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${getTypeColor(file.type)}`}>
                      {getTypeLabel(file.type)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Category: <span className="font-semibold">{file.category}</span>
                    </p>
                    {file.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{file.description}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => downloadFile(file.fileUrl, file.title)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Resources Available</h3>
            <p className="text-gray-500">
              No resources are available for the selected category at this time.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="text-blue-600" />
                Event Brochures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Access comprehensive event brochures with all details about Bioenergy Expo 2026
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="text-purple-600" />
                Floor Plans & Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View detailed venue floor plans and booth allocation maps
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Book className="text-amber-600" />
                Guidelines & Manuals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Download role-specific manuals and operational guidelines
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
