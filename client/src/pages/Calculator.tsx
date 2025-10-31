import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Calculator as CalcIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import type { Calculation } from "@shared/schema";

interface CalculatorForm {
  type: "simple" | "percentage" | "compound";
  input1: number;
  input2: number;
  input3?: number;
}

export default function Calculator() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [result, setResult] = useState<{ value: number; formula: string } | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CalculatorForm>({
    defaultValues: {
      type: "simple",
      input1: 0,
      input2: 0,
      input3: 0,
    },
  });

  const calcType = watch("type");

  // Fetch recent calculations
  const { data: calculations, isLoading: isLoadingHistory } = useQuery<Calculation[]>({
    queryKey: ["/api/calculations"],
  });

  // Create calculation mutation
  const createCalculation = useMutation({
    mutationFn: async (data: { type: string; input1: number; input2: number; input3: number | null; result: number; formula: string }) => {
      return await apiRequest("POST", "/api/calculations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
      toast({
        title: "Calculation saved",
        description: "Your calculation has been saved successfully",
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

  const onSubmit = (data: CalculatorForm) => {
    let resultValue = 0;
    let formula = "";

    switch (data.type) {
      case "simple":
        resultValue = data.input1 + data.input2;
        formula = `${data.input1} + ${data.input2} = ${resultValue}`;
        break;
      case "percentage":
        resultValue = (data.input1 * data.input2) / 100;
        formula = `${data.input2}% of ${data.input1} = ${resultValue}`;
        break;
      case "compound":
        resultValue = (data.input1 + data.input2) * (data.input3 || 1);
        formula = `(${data.input1} + ${data.input2}) × ${data.input3 || 1} = ${resultValue}`;
        break;
    }

    setResult({ value: resultValue, formula });

    // Save to backend
    createCalculation.mutate({
      type: data.type,
      input1: data.input1,
      input2: data.input2,
      input3: data.input3 || null,
      result: resultValue,
      formula,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-orange-50/30 dark:to-orange-950/10">
      <Header />
      
      <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
        {/* Page header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 mb-6 shadow-xl">
            <CalcIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            {t("calcTitle")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("calcSubtitle")}
          </p>
        </motion.div>

        {/* Calculator form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-8 md:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Calculation type */}
              <div>
                <label className="block text-sm font-medium mb-3" data-testid="label-calc-type">
                  {t("calcType")}
                </label>
                <select
                  {...register("type")}
                  className="w-full px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  data-testid="select-calc-type"
                >
                  <option value="simple">{t("calcSimple")}</option>
                  <option value="percentage">{t("calcPercentage")}</option>
                  <option value="compound">{t("calcCompound")}</option>
                </select>
              </div>

              {/* Input 1 */}
              <div>
                <label className="block text-sm font-medium mb-3" data-testid="label-input1">
                  {t("calcInput1")}
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("input1", { required: true, valueAsNumber: true })}
                  className="w-full px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  data-testid="input-calc-input1"
                />
              </div>

              {/* Input 2 */}
              <div>
                <label className="block text-sm font-medium mb-3" data-testid="label-input2">
                  {t("calcInput2")}
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("input2", { required: true, valueAsNumber: true })}
                  className="w-full px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  data-testid="input-calc-input2"
                />
              </div>

              {/* Input 3 (only for compound) */}
              {calcType === "compound" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium mb-3" data-testid="label-input3">
                    {t("calcInput3")}
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("input3", { valueAsNumber: true })}
                    className="w-full px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    data-testid="input-calc-input3"
                  />
                </motion.div>
              )}

              {/* Submit button */}
              <GradientButton 
                type="submit" 
                disabled={createCalculation.isPending}
                className="w-full justify-center py-4 text-base"
                data-testid="button-calculate"
              >
                {createCalculation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Calculating...
                  </>
                ) : (
                  t("calculate")
                )}
              </GradientButton>
            </form>

            {/* Result display */}
            {result && (
              <motion.div
                className="mt-8 pt-8 border-t border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t("result")}
                  </p>
                  <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent mb-4" data-testid="text-result-value">
                    {result.value.toLocaleString()}
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t("formula")}
                    </p>
                    <p className="font-mono text-foreground" data-testid="text-result-formula">
                      {result.formula}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
