import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useCreatorLoyalty = () => {
  return useQuery({
    queryKey: ["creator_loyalty"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_loyalty")
        .select("*, creators(name, handle, follower_count, avg_engagement_rate, category)")
        .order("total_points", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useComplianceRecords = () => {
  const { brandId } = useAuth();
  return useQuery({
    queryKey: ["compliance_records", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_records")
        .select("*, creators(name, handle), brands(company_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!brandId,
  });
};

export const useCreateComplianceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: {
      creator_id: string;
      brand_id: string;
      compliance_type: string;
      jurisdiction: string;
      tax_year?: number;
      amount?: number;
      currency?: string;
      due_date?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("compliance_records")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance_records"] });
    },
  });
};

export const useIndustryBenchmarks = () => {
  return useQuery({
    queryKey: ["industry_benchmarks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industry_benchmarks")
        .select("*")
        .order("category");
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useCreateBenchmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (benchmark: {
      category: string;
      platform: string;
      metric_name: string;
      metric_value: number;
      sample_size?: number;
      period?: string;
    }) => {
      const { data, error } = await supabase
        .from("industry_benchmarks")
        .insert(benchmark)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industry_benchmarks"] });
    },
  });
};
