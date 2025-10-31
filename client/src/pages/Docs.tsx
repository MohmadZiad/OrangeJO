import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import GlassCard from "@/components/GlassCard";
import { useLanguage } from "@/lib/language-context";
import { BookOpen, Search, FileText, Calculator, TrendingUp, MessageCircle, Loader2 } from "lucide-react";
import type { Document } from "@shared/schema";

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "calculator":
      return Calculator;
    case "pro-rata":
      return TrendingUp;
    case "assistant":
      return MessageCircle;
    default:
      return FileText;
  }
};

export default function Docs() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch documents from backend
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/documents?q=${encodeURIComponent(searchQuery)}`
        : '/api/documents';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  });

  const filteredDocs = documents.filter(doc => {
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query) ||
      doc.category.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

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
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            {t("docsTitle")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t("docsSubtitle")}
          </p>

          {/* Search bar */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchDocs")}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/70 dark:bg-neutral-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-lg shadow-glass"
                data-testid="input-search-docs"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Documentation grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {isLoading && (
            <div className="col-span-full flex items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-orange-400" data-testid="loader-docs" />
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {!isLoading && filteredDocs.length > 0 && filteredDocs.map((doc, index) => {
              const Icon = getCategoryIcon(doc.category);
              return (
                <motion.div
                  key={doc.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  <GlassCard 
                    className="p-6 h-full group cursor-pointer"
                    data-testid={`card-doc-${doc.id}`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-bold text-lg mb-1 text-foreground" data-testid={`text-doc-${doc.id}-title`}>
                          {doc.title}
                        </h3>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4" data-testid={`text-doc-${doc.id}-description`}>
                      {doc.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs bg-background border border-border text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
            
            {!isLoading && filteredDocs.length === 0 && (
              <motion.div
                className="col-span-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="p-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-orange-400" />
                  </div>
                  <p className="text-lg font-medium mb-2">{t("noResults")}</p>
                  <p className="text-muted-foreground">
                    Try adjusting your search query
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
