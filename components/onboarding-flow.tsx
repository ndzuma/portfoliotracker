"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Shield,
  ChartPie,
  TrendUp,
  Lightning,
  Brain,
  Globe,
  CurrencyDollar,
  Upload,
  FileText,
  Crosshair,
  TrendDown,
  Percent,
  Calendar,
} from "@phosphor-icons/react";
import Image from "next/image";

interface OnboardingFlowProps {
  userId: string;
  userName: string;
}

interface OnboardingData {
  language: string;
  currency: string;
  theme: "light" | "dark";
  aiProvider: string;
  openRouterApiKey?: string;
  portfolioName: string;
  portfolioDescription: string;
  riskTolerance?: string;
  timeHorizon?: string;
  investmentThesis: string;
  thesisFile?: File;
  targetValue?: number;
  targetReturn?: number;
  targetYearlyReturn?: number;
  targetContribution?: number;
}

export function OnboardingFlow({ userId, userName }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [portfolioStep, setPortfolioStep] = useState(1); // Sub-step for portfolio creation
  const [data, setData] = useState<OnboardingData>({
    language: "en",
    currency: "USD",
    theme: "dark",
    aiProvider: "default",
    portfolioName: "",
    portfolioDescription: "",
    investmentThesis: "",
  });

  // Mutations
  const savePreferences = useMutation(api.users.saveOnboardingPreferences);
  const saveAiPreferences = useMutation(api.users.saveOnboardingAiPreferences);
  const createPortfolio = useMutation(api.portfolios.createPortfolio);
  const upsertGoals = useMutation(api.goals.upsertGoals);
  const uploadDocument = useMutation(api.documents.uploadDocument);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const markComplete = useMutation(api.users.markOnboardingComplete);

  const handleNext = () => {
    if (currentStep === 4) {
      // Portfolio creation multi-step
      if (portfolioStep < 3) {
        setPortfolioStep(portfolioStep + 1);
      } else {
        setCurrentStep(5);
        setPortfolioStep(1);
      }
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 4 && portfolioStep > 1) {
      setPortfolioStep(portfolioStep - 1);
    } else if (currentStep === 4 && portfolioStep === 1) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
      setPortfolioStep(3);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save preferences
      await savePreferences({
        userId: userId as any,
        currency: data.currency,
        language: data.language,
        theme: data.theme,
      });

      // Save AI preferences
      await saveAiPreferences({
        userId: userId as any,
        aiProvider: data.aiProvider,
        openRouterApiKey: data.openRouterApiKey,
      });

      // Create portfolio
      const portfolioId = await createPortfolio({
        userId: userId as any,
        name: data.portfolioName,
        description: data.portfolioDescription,
        riskTolerance: data.riskTolerance,
        timeHorizon: data.timeHorizon,
      });

      // Upload thesis file if provided
      if (data.thesisFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": data.thesisFile.type },
          body: data.thesisFile,
        });
        const { storageId } = await result.json();

        await uploadDocument({
          storageId,
          userId: userId as any,
          portfolioId,
          fileName: data.thesisFile.name,
          type: "Portfolio Thesis",
        });
      }

      // Save goals if any are provided
      if (
        data.targetValue ||
        data.targetReturn ||
        data.targetYearlyReturn ||
        data.targetContribution
      ) {
        await upsertGoals({
          portfolioId: portfolioId as any,
          targetValue: data.targetValue,
          targetReturn: data.targetReturn,
          targetYearlyReturn: data.targetYearlyReturn,
          targetContribution: data.targetContribution,
        });
      }

      // Move to final step
      setCurrentStep(5);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    }
  };

  const handleComplete = async () => {
    try {
      await markComplete({ userId: userId as any });
      window.location.href = "/";
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const canProceedStep2 = data.language && data.currency;
  const canProceedStep3 = data.aiProvider;
  const canProceedPortfolioStep1 = data.portfolioName.trim();
  const canProceedPortfolioStep2 = data.riskTolerance && data.timeHorizon;

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const staggerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  };

  const cardHoverVariants = {
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98 },
  };

  // Custom interactive components
  const CurrencyButton = ({ code, symbol, active, onClick }: any) => (
    <motion.button
      variants={cardHoverVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`relative p-6 rounded-2xl border transition-all ${
        active
          ? "border-white/[0.3] bg-white/[0.08] shadow-lg shadow-white/[0.05]"
          : "border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03]"
      }`}
    >
      <div className="text-center">
        <div
          className={`text-2xl font-bold mb-2 ${active ? "text-white" : "text-zinc-400"}`}
        >
          {symbol}
        </div>
        <div
          className={`text-sm ${active ? "text-zinc-300" : "text-zinc-500"}`}
        >
          {code}
        </div>
      </div>
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-3 h-3 rounded-full bg-emerald-400"
        />
      )}
    </motion.button>
  );

  const RiskCard = ({
    level,
    title,
    description,
    color,
    active,
    onClick,
  }: any) => (
    <motion.button
      variants={cardHoverVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`relative p-6 rounded-2xl border transition-all text-left w-full ${
        active
          ? "border-white/[0.3] bg-white/[0.08] shadow-lg shadow-white/[0.05]"
          : "border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3
            className={`font-semibold mb-2 ${active ? "text-white" : "text-zinc-300"}`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${active ? "text-zinc-300" : "text-zinc-500"}`}
          >
            {description}
          </p>
        </div>
      </div>
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-3 h-3 rounded-full bg-emerald-400"
        />
      )}
    </motion.button>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#09090b" }}
    >
      {/* Sticky Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl"
        style={{ background: "rgba(9,9,11,0.92)" }}
      >
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-semibold text-white tracking-tight">
              PulsePortfolio
            </span>
          </motion.div>
          <motion.a
            href="mailto:support@pulsefolio.net"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            support@pulsefolio.net
          </motion.a>
        </div>
      </motion.header>

      {/* Main Content with Centered Container */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-center"
              >
                <motion.div
                  variants={staggerVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <div className="mb-8">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight"
                    >
                      Welcome to the future,{" "}
                      <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                        {userName}
                      </span>
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto"
                    >
                      Let's craft your personalized investment tracking
                      experience with AI-powered insights and professional-grade
                      analytics
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Preferences */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Your Preferences
                  </h2>
                  <p className="text-zinc-400 text-lg">
                    Choose your language and currency for the perfect experience
                  </p>
                </div>

                <div className="space-y-12">
                  {/* Language Selection */}
                  <motion.div
                    variants={staggerVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Globe className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        Language
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { code: "en", name: "English", flag: "🇺🇸" },
                        { code: "es", name: "Español", flag: "🇪🇸" },
                        { code: "fr", name: "Français", flag: "🇫🇷" },
                      ].map((lang) => (
                        <motion.button
                          key={lang.code}
                          variants={cardHoverVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() =>
                            setData({ ...data, language: lang.code })
                          }
                          className={`p-6 rounded-2xl border transition-all ${
                            data.language === lang.code
                              ? "border-white/[0.3] bg-white/[0.08] shadow-lg"
                              : "border-white/[0.06] hover:border-white/[0.15]"
                          }`}
                        >
                          <div className="text-3xl mb-3">{lang.flag}</div>
                          <div
                            className={`font-medium ${
                              data.language === lang.code
                                ? "text-white"
                                : "text-zinc-300"
                            }`}
                          >
                            {lang.name}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Currency Selection */}
                  <motion.div
                    variants={staggerVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <CurrencyDollar className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        Base Currency
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { code: "USD", symbol: "$" },
                        { code: "EUR", symbol: "€" },
                        { code: "GBP", symbol: "£" },
                        { code: "CAD", symbol: "C$" },
                        { code: "JPY", symbol: "¥" },
                        { code: "AUD", symbol: "A$" },
                        { code: "CHF", symbol: "CHF" },
                      ].map((currency) => (
                        <CurrencyButton
                          key={currency.code}
                          code={currency.code}
                          symbol={currency.symbol}
                          active={data.currency === currency.code}
                          onClick={() =>
                            setData({ ...data, currency: currency.code })
                          }
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Step 3: AI Preferences (Keep existing design - it's good) */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    AI Intelligence Setup
                  </h2>
                  <p className="text-zinc-400 text-lg">
                    Choose how you'd like AI to power your investment insights
                  </p>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                  {[
                    {
                      value: "default",
                      title: "Use Our AI Service",
                      description:
                        "Let us handle everything with our optimized AI models",
                      icon: <Brain className="h-6 w-6" />,
                      badge: "Recommended",
                      color: "bg-emerald-500/10 text-emerald-400",
                    },
                    {
                      value: "openrouter",
                      title: "OpenRouter API",
                      description:
                        "Use your own OpenRouter API key for premium models",
                      icon: <Lightning className="h-6 w-6" />,
                      badge: "Advanced",
                      color: "bg-blue-500/10 text-blue-400",
                    },
                    {
                      value: "selfhosted",
                      title: "Self-Hosted AI",
                      description: "Connect your own AI instance (coming soon)",
                      icon: <Shield className="h-6 w-6" />,
                      badge: "Coming Soon",
                      color: "bg-zinc-700 text-zinc-400",
                      disabled: true,
                    },
                  ].map((option, index) => (
                    <motion.div
                      key={option.value}
                      variants={staggerVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                    >
                      <motion.button
                        variants={cardHoverVariants}
                        whileHover={!option.disabled ? "hover" : {}}
                        whileTap={!option.disabled ? "tap" : {}}
                        onClick={() =>
                          !option.disabled &&
                          setData({ ...data, aiProvider: option.value })
                        }
                        disabled={option.disabled}
                        className={`w-full p-6 rounded-2xl border transition-all text-left ${
                          data.aiProvider === option.value
                            ? "border-white/[0.3] bg-white/[0.08] shadow-lg shadow-white/[0.05]"
                            : "border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03]"
                        } ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              data.aiProvider === option.value
                                ? "bg-white/[0.1] text-white"
                                : "bg-zinc-800 text-zinc-400"
                            } transition-colors flex-shrink-0`}
                          >
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-semibold text-lg">
                                {option.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${option.color}`}
                              >
                                {option.badge}
                              </span>
                            </div>
                            <p className="text-zinc-400">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))}

                  {data.aiProvider === "openrouter" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 p-6 bg-zinc-900/50 rounded-2xl border border-white/[0.06]"
                    >
                      <Label className="text-sm font-medium text-white mb-3 block">
                        OpenRouter API Key
                      </Label>
                      <Input
                        type="password"
                        value={data.openRouterApiKey || ""}
                        onChange={(e) =>
                          setData({ ...data, openRouterApiKey: e.target.value })
                        }
                        placeholder="sk-or-..."
                        className="bg-zinc-900 border-white/[0.06] text-white h-12"
                      />
                      <p className="text-xs text-zinc-500 mt-2">
                        Get your API key from{" "}
                        <a
                          href="https://openrouter.ai"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          openrouter.ai
                        </a>
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Portfolio Creation (Multi-step) */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Create Your First Portfolio
                  </h2>
                  <p className="text-zinc-400 text-lg">
                    {portfolioStep === 1 && "Tell us about your portfolio"}
                    {portfolioStep === 2 &&
                      "Define your risk profile and timeline"}
                    {portfolioStep === 3 &&
                      "Set your investment goals and thesis"}
                  </p>
                </div>

                {/* Portfolio Sub-Step Indicators */}
                <div className="flex justify-center mb-12">
                  <div className="flex items-center gap-4">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                            portfolioStep >= step
                              ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                              : "border-zinc-700 text-zinc-500"
                          }`}
                        >
                          {step}
                        </div>
                        {step < 3 && (
                          <div
                            className={`w-12 h-0.5 mx-2 ${
                              portfolioStep > step
                                ? "bg-emerald-400"
                                : "bg-zinc-700"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-w-2xl mx-auto">
                  {/* Portfolio Step 1: Basic Info */}
                  {portfolioStep === 1 && (
                    <div className="space-y-8">
                      <motion.div
                        variants={staggerVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="space-y-4"
                      >
                        <Label className="text-lg font-medium text-white flex items-center gap-3">
                          <Briefcase className="h-5 w-5" />
                          Portfolio Name
                        </Label>
                        <Input
                          value={data.portfolioName}
                          onChange={(e) =>
                            setData({ ...data, portfolioName: e.target.value })
                          }
                          placeholder="e.g., Growth Portfolio, Retirement Fund, Tech Investments..."
                          className="bg-zinc-900/80 border-white/[0.15] text-white h-14 text-lg rounded-xl focus:border-white/[0.3] transition-all"
                          autoFocus
                        />
                      </motion.div>

                      <motion.div
                        variants={staggerVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="space-y-4"
                      >
                        <Label className="text-lg font-medium text-white flex items-center gap-3">
                          <FileText className="h-5 w-5" />
                          Description
                        </Label>
                        <Textarea
                          value={data.portfolioDescription}
                          onChange={(e) =>
                            setData({
                              ...data,
                              portfolioDescription: e.target.value,
                            })
                          }
                          placeholder="Describe your investment strategy, focus areas, or approach..."
                          rows={4}
                          className="bg-zinc-900/80 border-white/[0.15] text-white resize-none rounded-xl focus:border-white/[0.3] transition-all"
                        />
                      </motion.div>
                    </div>
                  )}

                  {/* Portfolio Step 2: Risk & Timeline */}
                  {portfolioStep === 2 && (
                    <div className="space-y-10">
                      <motion.div
                        variants={staggerVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                          <Shield className="h-5 w-5" />
                          Risk Tolerance
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              value: "Conservative",
                              title: "Conservative",
                              description:
                                "Stable, low-risk investments with steady returns",
                              color: "bg-blue-500/20",
                            },
                            {
                              value: "Moderate",
                              title: "Moderate",
                              description:
                                "Balanced approach with moderate risk and growth potential",
                              color: "bg-yellow-500/20",
                            },
                            {
                              value: "Aggressive",
                              title: "Aggressive",
                              description:
                                "High-risk, high-reward investments for maximum growth",
                              color: "bg-red-500/20",
                            },
                          ].map((risk) => (
                            <RiskCard
                              key={risk.value}
                              level={risk.value}
                              title={risk.title}
                              description={risk.description}
                              color={risk.color}
                              active={data.riskTolerance === risk.value}
                              onClick={() =>
                                setData({ ...data, riskTolerance: risk.value })
                              }
                            />
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={staggerVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                          <Calendar className="h-5 w-5" />
                          Time Horizon
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              value: "Short-term (< 3 years)",
                              title: "Short-term",
                              subtitle: "< 3 years",
                            },
                            {
                              value: "Medium-term (3-10 years)",
                              title: "Medium-term",
                              subtitle: "3-10 years",
                            },
                            {
                              value: "Long-term (10+ years)",
                              title: "Long-term",
                              subtitle: "10+ years",
                            },
                          ].map((horizon) => (
                            <motion.button
                              key={horizon.value}
                              variants={cardHoverVariants}
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() =>
                                setData({ ...data, timeHorizon: horizon.value })
                              }
                              className={`p-6 rounded-2xl border transition-all text-center ${
                                data.timeHorizon === horizon.value
                                  ? "border-white/[0.3] bg-white/[0.08] shadow-lg"
                                  : "border-white/[0.06] hover:border-white/[0.15]"
                              }`}
                            >
                              <div
                                className={`font-semibold mb-2 ${
                                  data.timeHorizon === horizon.value
                                    ? "text-white"
                                    : "text-zinc-300"
                                }`}
                              >
                                {horizon.title}
                              </div>
                              <div
                                className={`text-sm ${
                                  data.timeHorizon === horizon.value
                                    ? "text-zinc-300"
                                    : "text-zinc-500"
                                }`}
                              >
                                {horizon.subtitle}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Portfolio Step 3: Goals & Thesis */}
                  {portfolioStep === 3 && (
                    <div className="space-y-10">
                      {/* Investment Goals */}
                      <motion.div
                        variants={staggerVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                          <Crosshair className="h-5 w-5" />
                          Investment Goals{" "}
                          <span className="text-sm font-normal text-zinc-500">
                            (Optional)
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                              <CurrencyDollar className="h-4 w-4" />
                              Target Portfolio Value
                            </Label>
                            <Input
                              type="number"
                              value={data.targetValue || ""}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  targetValue: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder="e.g., 100000"
                              className="bg-zinc-900/80 border-white/[0.15] text-white h-12 rounded-xl"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                              <TrendUp className="h-4 w-4" />
                              Target Overall Return (%)
                            </Label>
                            <Input
                              type="number"
                              value={data.targetReturn || ""}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  targetReturn: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder="e.g., 8"
                              className="bg-zinc-900/80 border-white/[0.15] text-white h-12 rounded-xl"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                              <Percent className="h-4 w-4" />
                              Target Yearly Return (%)
                            </Label>
                            <Input
                              type="number"
                              value={data.targetYearlyReturn || ""}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  targetYearlyReturn: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder="e.g., 12"
                              className="bg-zinc-900/80 border-white/[0.15] text-white h-12 rounded-xl"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                              <TrendDown className="h-4 w-4" />
                              Monthly Contribution
                            </Label>
                            <Input
                              type="number"
                              value={data.targetContribution || ""}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  targetContribution: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder="e.g., 1000"
                              className="bg-zinc-900/80 border-white/[0.15] text-white h-12 rounded-xl"
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Investment Thesis */}
                      <motion.div
                        variants={staggerVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                          <Brain className="h-5 w-5" />
                          Investment Thesis{" "}
                          <span className="text-sm font-normal text-zinc-500">
                            (Optional)
                          </span>
                        </h3>

                        <div className="space-y-6">
                          {/* File Upload */}
                          <div className="border-2 border-dashed border-white/[0.15] rounded-2xl p-8 text-center">
                            <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-4" />
                            <div className="space-y-2">
                              <p className="text-white font-medium">
                                Upload your thesis document
                              </p>
                              <p className="text-sm text-zinc-500">
                                PDF, DOC, or TXT files
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setData({ ...data, thesisFile: file });
                                }
                              }}
                              className="hidden"
                              id="thesis-upload"
                            />
                            <label
                              htmlFor="thesis-upload"
                              className="inline-block mt-4 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] rounded-xl border border-white/[0.15] text-white cursor-pointer transition-all"
                            >
                              Choose File
                            </label>
                            {data.thesisFile && (
                              <p className="mt-3 text-sm text-emerald-400">
                                ✓ {data.thesisFile.name} uploaded
                              </p>
                            )}
                          </div>

                          {/* OR */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-white/[0.15]" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="bg-[#09090b] px-4 text-zinc-500">
                                OR
                              </span>
                            </div>
                          </div>

                          {/* Text Input */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-zinc-300">
                              Write your investment thesis
                            </Label>
                            <Textarea
                              value={data.investmentThesis}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  investmentThesis: e.target.value,
                                })
                              }
                              placeholder="Describe your investment philosophy, market outlook, sector preferences, or strategy rationale..."
                              rows={6}
                              className="bg-zinc-900/80 border-white/[0.15] text-white resize-none rounded-xl focus:border-white/[0.3] transition-all"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Feature Showcase */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="text-center mb-16">
                  <motion.h2
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl font-bold text-white mb-6"
                  >
                    🎉 You're All Set!
                  </motion.h2>
                  <p className="text-xl text-zinc-400">
                    Welcome to the future of investment tracking
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {[
                    {
                      icon: <Briefcase className="h-8 w-8" />,
                      title: "Portfolio Management",
                      description:
                        "Track all your investments in one place with real-time updates and comprehensive analytics.",
                      color: "bg-blue-500/10",
                    },
                    {
                      icon: <ChartPie className="h-8 w-8" />,
                      title: "Asset Allocation",
                      description:
                        "Visualize your portfolio distribution and optimize your investment mix.",
                      color: "bg-purple-500/10",
                    },
                    {
                      icon: <TrendUp className="h-8 w-8" />,
                      title: "Performance Analytics",
                      description:
                        "Detailed performance metrics, benchmarking, and historical analysis.",
                      color: "bg-emerald-500/10",
                    },
                    {
                      icon: <Brain className="h-8 w-8" />,
                      title: "AI Insights",
                      description:
                        "Get intelligent market summaries and portfolio recommendations.",
                      color: "bg-orange-500/10",
                    },
                    {
                      icon: <Shield className="h-8 w-8" />,
                      title: "Secure Data",
                      description:
                        "Your financial information is protected with enterprise-grade security.",
                      color: "bg-red-500/10",
                    },
                    {
                      icon: <Lightning className="h-8 w-8" />,
                      title: "Real-time Updates",
                      description:
                        "Live market data and instant portfolio valuation updates.",
                      color: "bg-yellow-500/10",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      variants={staggerVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="p-6 rounded-2xl border border-white/[0.06] bg-zinc-950/60 hover:border-white/[0.12] transition-all cursor-pointer"
                    >
                      <div
                        className={`p-4 rounded-xl ${feature.color} text-white mb-6 inline-block`}
                      >
                        {feature.icon}
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Footer Navigation */}
      {currentStep < 5 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="sticky bottom-0 z-50 border-t border-white/[0.06] backdrop-blur-xl"
          style={{ background: "rgba(9,9,11,0.92)" }}
        >
          <div className="max-w-[1600px] mx-auto px-8 py-6 flex items-center justify-between">
            <div>
              {(currentStep > 1 ||
                (currentStep === 4 && portfolioStep > 1)) && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="text-zinc-400 hover:text-white hover:bg-white/[0.08] px-8 py-3 rounded-xl transition-all"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Step indicator */}
              <div className="text-sm text-zinc-500">
                Step {currentStep} of 4
                {currentStep === 4 && ` (${portfolioStep}/3)`}
              </div>

              <div>
                {currentStep === 4 && portfolioStep === 3 ? (
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
                  >
                    Submit & Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (currentStep === 2 && !canProceedStep2) ||
                      (currentStep === 3 && !canProceedStep3) ||
                      (currentStep === 4 &&
                        portfolioStep === 1 &&
                        !canProceedPortfolioStep1) ||
                      (currentStep === 4 &&
                        portfolioStep === 2 &&
                        !canProceedPortfolioStep2)
                    }
                    className="bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Complete Button for Final Step */}
      {currentStep === 5 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="sticky bottom-0 z-50 border-t border-white/[0.06] backdrop-blur-xl"
          style={{ background: "rgba(9,9,11,0.92)" }}
        >
          <div className="max-w-[1600px] mx-auto px-8 py-8 text-center">
            <Button
              onClick={handleComplete}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-12 py-4 text-lg rounded-xl font-medium transition-all shadow-lg"
            >
              Enter Your Dashboard
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
