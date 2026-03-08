import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useBrand = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => {
      if (!brandId) return null;
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("id", brandId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });
};

export const useCampaigns = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["campaigns", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
};

export const useCreators = () => {
  return useQuery({
    queryKey: ["creators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .order("avg_engagement_rate", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useCampaignCreators = (campaignId?: string) => {
  return useQuery({
    queryKey: ["campaign_creators", campaignId],
    queryFn: async () => {
      let query = supabase
        .from("campaign_creators")
        .select("*, creators(*), campaigns(*)");
      if (campaignId) query = query.eq("campaign_id", campaignId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: campaignId ? !!campaignId : true,
  });
};

export const usePayroll = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["payroll", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from("payroll")
        .select("*, campaign_creators(*, creators(*), campaigns(*))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
};
