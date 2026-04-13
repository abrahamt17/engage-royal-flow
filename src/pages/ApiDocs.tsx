import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Code, Copy, Check, Globe, Key, Zap } from "lucide-react";
import { useState } from "react";

const ApiDocs = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-api/v1`;

  const endpoints = [
    { method: "GET", path: "/campaigns", desc: "List campaigns visible to the signed-in user", params: "limit, offset" },
    { method: "GET", path: "/campaigns/:id", desc: "Get one campaign visible to the signed-in user", params: "—" },
    { method: "GET", path: "/creators", desc: "List creator with optional directory filters", params: "limit, offset, category, platform, min_engagement" },
    { method: "GET", path: "/creators/:id", desc: "Get a creator profile", params: "—" },
    { method: "GET", path: "/payroll", desc: "List payroll entries visible to the signed-in user", params: "limit, offset" },
    { method: "GET", path: "/analytics", desc: "Get summary analytics for the signed-in user context", params: "—" },
    { method: "GET", path: "/fraud", desc: "Get fraud risk data", params: "limit, offset" },
    { method: "GET", path: "/benchmarks", desc: "Get benchmark catalog entries", params: "limit, offset" },
  ];

  const copyUrl = (path: string) => {
    navigator.clipboard.writeText(`${baseUrl}${path}`);
    setCopiedEndpoint(path);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const exampleCode = `// Example: Fetch creators
const response = await fetch(
  '${baseUrl}/creators?limit=10&category=Tech',
  {
    headers: {
      'Authorization': 'Bearer USER_ACCESS_TOKEN',
      'apikey': 'YOUR_ANON_KEY',
      'Content-Type': 'application/json',
    },
  }
);
const { data } = await response.json();
console.log(data);`;

  return (
    <DashboardLayout title="API Documentation" subtitle="Authenticated REST API for CreatorPay account data">
      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Base URL</span>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded break-all">{baseUrl}</code>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Key className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Authentication</span>
            </div>
            <p className="text-xs">Signed-in user bearer token via <code className="bg-muted px-1 rounded">Authorization</code> header</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Endpoints</span>
            </div>
            <p className="text-2xl font-bold">{endpoints.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4" /> API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((ep) => (
                <TableRow key={ep.path}>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">
                      {ep.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{ep.path}</code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ep.desc}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ep.params}</TableCell>
                  <TableCell>
                    <button onClick={() => copyUrl(ep.path)} className="text-muted-foreground hover:text-foreground">
                      {copiedEndpoint === ep.path ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs font-mono whitespace-pre-wrap">
            {exampleCode}
          </pre>
        </CardContent>
      </Card>

      {/* Response Format */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Response Format</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs font-mono whitespace-pre-wrap">
{`{
  "data": [...],           // Array or Object
  "meta": {
    "version": "v1",
    "resource": "creators",
    "pagination": {
      "limit": 25,
      "offset": 0,
      "count": 134,
      "has_more": true
    }
  }
}`}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Campaign and payroll resources are scoped by Supabase RLS to the authenticated user. This endpoint is not an anonymous public API.
          </p>
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold">Use Cases</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-accent/50 rounded-lg p-3">
                <p className="text-xs font-medium">🏢 Agencies</p>
                <p className="text-[10px] text-muted-foreground">Integrate creator data into agency dashboards</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-3">
                <p className="text-xs font-medium">🛒 E-commerce</p>
                <p className="text-[10px] text-muted-foreground">Connect campaign performance to sales data</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-3">
                <p className="text-xs font-medium">📊 Marketing Tools</p>
                <p className="text-[10px] text-muted-foreground">Pull analytics into reporting platforms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ApiDocs;
