import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import GlassCard from "@/components/GlassCard";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Sparkles, Loader2 } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

export default function Assistant() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat messages with polling
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/messages", {
        role: "user",
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSend = async () => {
    if (!input.trim() || sendMessage.isPending) return;

    const messageContent = input;
    setInput("");
    sendMessage.mutate(messageContent);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isThinking = sendMessage.isPending || (messages.length > 0 && messages[messages.length - 1]?.role === "user");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-orange-50/30 dark:to-orange-950/10">
      <Header />
      
      <div className="container mx-auto px-6 pt-32 pb-24 max-w-5xl">
        {/* Page header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 mb-6 shadow-xl">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            {t("assistantTitle")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("assistantSubtitle")}
          </p>
        </motion.div>

        {/* Chat container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="h-[600px] flex flex-col">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading && (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-400" data-testid="loader-messages" />
                </div>
              )}
              
              {!isLoading && messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-10 h-10 text-orange-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">Start a conversation</p>
                    <p className="text-muted-foreground">
                      Ask me anything about calculations or how to use the tools
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        max-w-[80%] rounded-3xl px-5 py-3
                        ${message.role === "user"
                          ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                          : "bg-card border border-card-border"
                        }
                      `}
                      data-testid={`message-${message.role}`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div ref={messagesEndRef} />

              {/* Typing indicator */}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-card border border-card-border rounded-3xl px-5 py-3">
                    <div className="flex gap-2">
                      <motion.div
                        className="w-2 h-2 bg-orange-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-orange-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-orange-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div className="p-6 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("typeMessage")}
                  className="flex-1 px-5 py-3 rounded-2xl bg-background border-2 border-border focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  data-testid="input-message"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sendMessage.isPending}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                  data-testid="button-send-message"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">{sendMessage.isPending ? "Sending..." : t("send")}</span>
                </button>
              </form>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
