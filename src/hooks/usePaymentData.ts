import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const usePayoutBatches = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["payout_batches", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from("payout_batches")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
};

export const useEscrow = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["campaign_escrow", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from("campaign_escrow")
        .select("*, campaigns(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
};

export const useTaxDocuments = () => {
  return useQuery({
    queryKey: ["tax_documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_tax_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};