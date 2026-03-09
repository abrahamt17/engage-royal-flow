import { useParams, useNavigate } from "react-router-dom";
import { useCampaigns, useCampaignCreators, useCreatorContent } from "@/hooks/useData";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, FileText, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
  draft: "bg-warning/10 text-warning border-warning/20",
  paused: "bg-accent/10 text-accent border-accent/20",
};

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaigns = [] } = useCampaigns();
  const { data: assignments = [] } = useCampaignCreators(id);
  const { data: allContent = [] } = useCreatorContent();

  const campaign = campaigns.find((c) => c.id === id);

  const { data: payrollData = [] } = useQuery({
    queryKey: ["campaign-payroll", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("payroll")
        .select("*, campaign_creators!inner(campaign_id)")
        .eq("campaign_creators.campaign_id", id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const campaignContent = allContent.filter((content: any) =>
    assignments.some((a: any) => a.id === content.campaign_creator_id)
  );

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Campaign not found</p>
          <Button onClick={() => navigate("/campaigns")} className="mt-4">
            Back to Campaigns
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalSpent = payrollData.reduce((sum, p) => sum + Number(p.total_payment || 0), 0);
  const avgPerformance = campaignContent.length > 0
    ? campaignContent.reduce((sum: number, c: any) => sum + (Number(c.performance_score) || 0), 0) / campaignContent.length
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/campaigns")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {campaign.platforms.join(", ")} • {campaign.content_type || "Video"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={statusStyles[campaign.status] ?? ""}>
            {campaign.status}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${campaign.budget.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSpent / campaign.budget) * 100).toFixed(1)}% of budget
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creators</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaignContent.length}</div>
              <p className="text-xs text-muted-foreground">
                Avg score: {avgPerformance.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Creators */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Creators</CardTitle>
            <CardDescription>
              Creators participating in this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No creators assigned yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Base Pay</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Total Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment: any) => {
                    const creator = assignment.creators;
                    const content = campaignContent.filter(
                      (c: any) => c.campaign_creator_id === assignment.id
                    );
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {creator?.name || "Unknown"}
                          <div className="text-xs text-muted-foreground">
                            @{creator?.handle || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignment.status}</Badge>
                        </TableCell>
                        <TableCell>${Number(assignment.base_pay || 0).toLocaleString()}</TableCell>
                        <TableCell>{content.length} posts</TableCell>
                        <TableCell className="font-medium">
                          ${Number(assignment.total_earned || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Content Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Content Submissions</CardTitle>
            <CardDescription>
              All content submitted for this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaignContent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No content submitted yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Match Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignContent.map((content: any) => {
                    const assignment = assignments.find((a: any) => a.id === content.campaign_creator_id);
                    const engagement = content.likes + content.comments + content.shares;
                    return (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">
                          {assignment?.creators?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{content.platform}</Badge>
                        </TableCell>
                        <TableCell>{Number(content.views || 0).toLocaleString()}</TableCell>
                        <TableCell>{engagement.toLocaleString()}</TableCell>
                        <TableCell>{Number(content.performance_score || 0).toFixed(1)}%</TableCell>
                        <TableCell>{Number(content.audience_match_score || 0).toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payroll Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Breakdown</CardTitle>
            <CardDescription>
              Payment records for this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payrollData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No payroll records yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Base Pay</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${Number(payment.base_pay).toLocaleString()}</TableCell>
                      <TableCell>${Number(payment.bonus).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">
                        ${Number(payment.total_payment).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetail;
