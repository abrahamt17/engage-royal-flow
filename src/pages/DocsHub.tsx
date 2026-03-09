import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BookOpen, Code2, FileText, Share2 } from "lucide-react";

const docs = [
  {
    icon: Code2,
    title: "Developer & Tester Manual",
    description: "Deep technical reference covering architecture, algorithms, APIs, database schema, edge functions, fraud detection logic, and testing strategies.",
    path: "/docs/dev-manual",
    color: "text-cyan-400",
  },
  {
    icon: BookOpen,
    title: "Full Platform Documentation",
    description: "Comprehensive documentation covering every module, feature, integration, and workflow in the CreatorPay platform.",
    path: "/docs/full",
    color: "text-emerald-400",
  },
  {
    icon: Share2,
    title: "Quick Reference & Social Media Kit",
    description: "One-page summary, elevator pitch, feature highlights, and ready-to-post social media content for marketing.",
    path: "/docs/quick-social",
    color: "text-violet-400",
  },
  {
    icon: FileText,
    title: "User Manual",
    description: "Simple, friendly step-by-step guide for brands, creators, and admins to use every feature of the platform.",
    path: "/docs/user-manual",
    color: "text-amber-400",
  },
];

const DocsHub = () => (
  <DashboardLayout title="Documentation" subtitle="Platform guides, references, and marketing materials">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
      {docs.map((doc) => (
        <Link key={doc.path} to={doc.path} className="group">
          <Card className="h-full transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <doc.icon className={`h-5 w-5 ${doc.color}`} />
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">{doc.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">{doc.description}</CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  </DashboardLayout>
);

export default DocsHub;
