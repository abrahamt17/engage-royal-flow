import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const campaigns = [
  {
    id: 1,
    name: "Summer Launch 2026",
    platform: "TikTok",
    status: "active",
    budget: "$45,000",
    spent: "$28,340",
    creators: 48,
    roi: "3.2x",
  },
  {
    id: 2,
    name: "Product Reveal Series",
    platform: "Instagram",
    status: "active",
    budget: "$32,000",
    spent: "$19,200",
    creators: 25,
    roi: "2.8x",
  },
  {
    id: 3,
    name: "Brand Awareness Q1",
    platform: "YouTube",
    status: "completed",
    budget: "$60,000",
    spent: "$58,400",
    creators: 15,
    roi: "4.1x",
  },
  {
    id: 4,
    name: "Micro-Influencer Push",
    platform: "TikTok",
    status: "draft",
    budget: "$18,000",
    spent: "$0",
    creators: 0,
    roi: "—",
  },
  {
    id: 5,
    name: "Holiday Campaign",
    platform: "Multi",
    status: "active",
    budget: "$75,000",
    spent: "$42,100",
    creators: 92,
    roi: "2.5x",
  },
];

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
  draft: "bg-warning/10 text-warning border-warning/20",
};

const CampaignTable = () => {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Campaign</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Platform</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Budget</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Spent</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Creators</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">ROI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id} className="border-border hover:bg-secondary/30 cursor-pointer transition-colors">
              <TableCell className="font-medium text-card-foreground">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.platform}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusStyles[c.status]}>
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{c.budget}</TableCell>
              <TableCell className="text-card-foreground font-medium">{c.spent}</TableCell>
              <TableCell className="text-muted-foreground">{c.creators}</TableCell>
              <TableCell className="text-right font-semibold text-card-foreground">{c.roi}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignTable;
