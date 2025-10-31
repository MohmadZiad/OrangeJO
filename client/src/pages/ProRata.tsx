import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ProRata as ProRataType } from "@shared/schema";

interface ProRataForm {
  totalAmount: number;
  totalDays: number;
  daysUsed: number;
  description: string;
}

export default function ProRata() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [result, setResult] = useState<{ proRataAmount: number; dailyRate: number; chartData: any[] } | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProRataForm>({
    defaultValues: {
      totalAmount: 0,
      totalDays: 30,
      daysUsed: 0,
      description: "",
    },
  });

  // Fetch recent pro-rata calculations
  const { data: proRataHistory, isLoading: isLoadingHistory } = useQuery<ProRataType[]>({
    queryKey: ["/api/pro-rata"],
  });

  // Create pro-rata mutation
  const createProRata = useMutation({
    mutationFn: async (data: { totalAmount: number; totalDays: number; daysUsed: number; description: string }) => {
      return await apiRequest("POST", "/api/pro-rata", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pro-rata"] });
      toast({
        title: "Calculation saved",
        description: "Your pro-rata calculation has been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save calculation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProRataForm) => {
    const dailyRate = data.totalAmount / data.totalDays;
    const proRataAmount = dailyRate * data.daysUsed;

    const chartData = [
      { name: "Total", amount: data.totalAmount },
      { name: "Pro-Rata", amount: proRataAmount },
      { name: "Remaining", amount: data.totalAmount - proRataAmount },
    ];

    setResult({ proRataAmount, dailyRate, chartData });

    // Save to backend
    createProRata.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-orange-50/30 dark:to-orange-950/10">
      <Header />
      
      <div className="container mx-auto px-6 pt-32 pb-24 max-w-6xl">
        {/* Page header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 mb-6 shadow-xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            {t("proRataTitle")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("proRataSubtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium mb-3" data-testid="label-total-amount">
                    {t("totalAmount")}
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("totalAmount", { required: true, valueAsNumber: true })}
                    className="w-full px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    data-testid="input-total-amount"
                  />
                </div>

                {/* Total Days */}
                <div>
                  <label className="block text-sm font-medium mb-3" data-testid="label-total-days">
                    {t("totalDays")}
                  </label>
                  <input
                    type="number"
                    {...register("totalDays", { required: true, valueAsNumber: true, min: 1 })}
                    className="w-full px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    data-testid="input-total-days"
                  />
                </div>

                {/* Days Used */}
                <div>
                  <label className="block text-sm font-medium mb-3" data-testid="label-days-used">
                    {t("daysUsed")}
                  </label>
                  <input
                    type="number"
                    {...register("daysUsed", { required: true, valueAsNumber: true, min: 0 })}
                    className="w-full px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    data-testid="input-days-used"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-3" data-testid="label-description">
                    {t("description")}
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                    data-testid="input-description"
                  />
                </div>

                {/* Submit button */}
                <GradientButton 
                  type="submit" 
                  disabled={createProRata.isPending}
                  className="w-full justify-center py-4 text-base"
                  data-testid="button-calculate-prorata"
                >
                  {createProRata.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Calculating...
                    </>
                  ) : (
                    t("calculateProRata")
                  )}
                </GradientButton>
              </form>
            </GlassCard>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlassCard className="p-8 h-full">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Pro-Rata Amount */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t("proRataAmount")}
                    </p>
                    <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent" data-testid="text-prorata-result">
                      ${result.proRataAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Daily Rate */}
                  <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Daily Rate
                    </p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-daily-rate">
                      ${result.dailyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Usage Progress</span>
                      <span className="font-medium text-orange-500">
                        {((result.proRataAmount / result.chartData[0].amount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-orange-100 dark:bg-orange-900/20 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(result.proRataAmount / result.chartData[0].amount) * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "1rem",
                          }}
                        />
                        <Bar dataKey="amount" fill="url(#orangeGradient)" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--orange-500))" />
                            <stop offset="100%" stopColor="hsl(var(--orange-400))" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="text-muted-foreground">
                      Fill in the form to calculate pro-rata amount
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
