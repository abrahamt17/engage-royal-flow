import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const usePerformanceAlerts = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["performance_alerts", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from("performance_alerts")
        .select("*, campaigns(name), creators(name, handle)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
    refetchInterval: 15000,
  });
};

export const useMarkAlertRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("performance_alerts")
        .update({ is_read: true })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance_alerts"] });
    },
  });
};

export const useContracts = (campaignId?: string) => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["contracts", brandId, campaignId],
    queryFn: async () => {
      if (!brandId) return [];
      let query = supabase
        .from("creator_contracts")
        .select("*, campaigns(name), creators(name, handle), brands(company_name)")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      if (campaignId) query = query.eq("campaign_id", campaignId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contract: {
      campaign_id: string;
      creator_id: string;
      brand_id: string;
      contract_number: string;
      deliverables?: any[];
      payment_milestones?: any[];
      terms?: string;
      start_date?: string;
      end_date?: string;
      base_pay?: number;
      bonus_structure?: any;
    }) => {
      const { data, error } = await supabase
        .from("creator_contracts")
        .insert(contract)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};

export const useSignContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, party, signature }: { contractId: string; party: "brand" | "creator"; signature: string }) => {
      const update = party === "brand"
        ? { signed_by_brand: true, signed_by_brand_at: new Date().toISOString(), brand_signature: signature, status: "pending_creator" }
        : { signed_by_creator: true, signed_by_creator_at: new Date().toISOString(), creator_signature: signature, status: "active" };
      const { error } = await supabase
        .from("creator_contracts")
        .update(update)
        .eq("id", contractId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};

export const useCampaignAutomations = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["campaign_automations", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from("campaign_automations")
        .select("*, campaigns(name)")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
};

export const useUpdateCampaignAutomationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ automationId, status }: { automationId: string; status: string }) => {
      const { error } = await supabase
        .from("campaign_automations")
        .update({
          status,
          last_run_at: status === "active" ? new Date().toISOString() : undefined,
        })
        .eq("id", automationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign_automations"] });
    },
  });
};
