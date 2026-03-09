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
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: creators = [] } = useCreators();
  const { data: assignments = [] } = useCampaignCreators();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");

  const assignCreator = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campaign_creators").insert({
        campaign_id: selectedCampaign,
        creator_id: selectedCreator,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign_creators"] });
      toast.success("Creator assigned to campaign!");
      setOpen(false);
      setSelectedCampaign("");
      setSelectedCreator("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getAssignedCreators = (campaignId: string) => {
    return assignments.filter((a: any) => a.campaign_id === campaignId);
  };

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
    <>
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
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => {
              const assigned = getAssignedCreators(c.id);
              return (
                <TableRow 
                  key={c.id} 
                  className="border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/campaigns/${c.id}`)}
                >
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
                  <TableCell className="text-muted-foreground">{assigned.length} assigned</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(c.id);
                        setOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Creator to Campaign</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              assignCreator.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-xs">Campaign</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign} required>
                <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Creator</Label>
              <Select value={selectedCreator} onValueChange={setSelectedCreator} required>
                <SelectTrigger><SelectValue placeholder="Select creator" /></SelectTrigger>
                <SelectContent>
                  {creators.map((cr: any) => (
                    <SelectItem key={cr.id} value={cr.id}>
                      {cr.name} (@{cr.handle})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={assignCreator.isPending}>
              {assignCreator.isPending ? "Assigning..." : "Assign Creator"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CampaignTable;
