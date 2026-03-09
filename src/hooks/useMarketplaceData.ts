import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useCreatorTrustDetails = (creatorId?: string) => {
  return useQuery({
    queryKey: ["creator_trust", creatorId],
    queryFn: async () => {
      if (!creatorId) return null;
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("id", creatorId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!creatorId,
  });
};

export const useCreatorRatings = (creatorId?: string) => {
  return useQuery({
    queryKey: ["creator_ratings", creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      const { data, error } = await supabase
        .from("brand_creator_ratings")
        .select("*, brands(company_name), campaigns(name)")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!creatorId,
  });
};

export const useSubmitRating = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rating: {
      brand_id: string;
      creator_id: string;
      campaign_id?: string;
      overall_rating: number;
      communication_rating?: number;
      content_quality_rating?: number;
      delivery_rating?: number;
      professionalism_rating?: number;
      review_text?: string;
    }) => {
      const { data, error } = await supabase
        .from("brand_creator_ratings")
        .upsert(rating, { onConflict: "brand_id,creator_id,campaign_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["creator_ratings", vars.creator_id] });
    },
  });
};

export const useMarketplaceCreators = (filters: {
  search?: string;
  category?: string;
  minEngagement?: number;
  maxEngagement?: number;
  minFollowers?: number;
  maxFollowers?: number;
  platform?: string;
  location?: string;
  minTrustScore?: number;
}) => {
  return useQuery({
    queryKey: ["marketplace_creators", filters],
    queryFn: async () => {
      let query = supabase
        .from("creators")
        .select("*")
        .eq("is_marketplace_listed", true)
        .order("trust_score", { ascending: false });

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,handle.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
      }
      if (filters.category) query = query.eq("category", filters.category);
      if (filters.minEngagement) query = query.gte("avg_engagement_rate", filters.minEngagement);
      if (filters.maxEngagement) query = query.lte("avg_engagement_rate", filters.maxEngagement);
      if (filters.minFollowers) query = query.gte("follower_count", filters.minFollowers);
      if (filters.maxFollowers) query = query.lte("follower_count", filters.maxFollowers);
      if (filters.platform) query = query.contains("platforms", [filters.platform]);
      if (filters.minTrustScore) query = query.gte("trust_score", filters.minTrustScore);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useConversionTracking = (campaignId?: string) => {
  return useQuery({
    queryKey: ["conversion_tracking", campaignId],
    queryFn: async () => {
      let query = supabase
        .from("conversion_tracking")
        .select("*, campaigns(name), creators(name, handle)")
        .order("created_at", { ascending: false });
      if (campaignId) query = query.eq("campaign_id", campaignId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useCreateTrackingCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tracking: {
      campaign_id: string;
      creator_id?: string;
      tracking_type: string;
      tracking_code: string;
    }) => {
      const { data, error } = await supabase
        .from("conversion_tracking")
        .insert(tracking)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversion_tracking"] });
    },
  });
};

export const useContentAnalysis = (contentId?: string) => {
  return useQuery({
    queryKey: ["content_analysis", contentId],
    queryFn: async () => {
      if (!contentId) return null;
      const { data, error } = await supabase
        .from("content_analysis")
        .select("*")
        .eq("content_id", contentId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!contentId,
  });
};

export const useAllContentAnalyses = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["all_content_analyses", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_analysis")
        .select("*, creator_content(*, campaign_creators(*, creators(*), campaigns(*)))")
        .order("analyzed_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
};
