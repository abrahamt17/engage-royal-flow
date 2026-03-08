import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCampaigns, useCreators, useCampaignCreators } from "@/hooks/useData";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
  draft: "bg-warning/10 text-warning border-warning/20",
  paused: "bg-accent/10 text-accent border-accent/20",
};

const CampaignTable = () => {
  const { data: campaigns = [], isLoading } = useCampaigns();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground p-4">Loading campaigns...</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No campaigns yet. Create your first one!</p>
      </div>
    );
  }

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
            <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id} className="border-border hover:bg-secondary/30 cursor-pointer transition-colors">
              <TableCell className="font-medium text-card-foreground">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {c.platforms?.join(", ") || "—"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusStyles[c.status] ?? ""}>
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">${c.budget.toLocaleString()}</TableCell>
              <TableCell className="font-medium text-card-foreground">${c.spent.toLocaleString()}</TableCell>
              <TableCell className="text-muted-foreground">{c.content_type ?? "video"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignTable;
