"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  MapPin,
  MagnifyingGlass,
  CaretDown,
  Check,
  Sparkle,
  Rocket,
  CircleNotch,
} from "@phosphor-icons/react";
import Image from "next/image";
import {
  CURRENCIES,
  searchCurrencies,
  type CurrencyMeta,
} from "@/lib/currency";
import { useAvailableCurrencies } from "@/hooks/useCurrency";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

interface OnboardingFlowProps {
  userId: string;
  userName: string;
}

/* ─── Market Region Options (matches settings) ─── */
const MARKET_REGIONS = [
  { value: "US", label: "US", flag: "🇺🇸" },
  { value: "EU", label: "Europe", flag: "🇪🇺" },
  { value: "APAC", label: "Asia-Pacific", flag: "🌏" },
  { value: "AF", label: "Africa", flag: "🌍" },
  { value: "GLOBAL", label: "Global", flag: "🌐" },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   CURRENCY PICKER — searchable dropdown (matches settings page)
   ═══════════════════════════════════════════════════════════════════════════ */

function CurrencyPicker({
  value,
  onChange,
  currencies,
}: {
  value: string;
  onChange: (code: string) => void;
  currencies?: CurrencyMeta[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = currencies ?? CURRENCIES;
  const filtered = searchCurrencies(query, list);
  const selected = list.find((c) => c.code === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 bg-zinc-900 border text-zinc-300 text-xs
          pl-3 pr-2 py-1.5 rounded-lg cursor-pointer min-w-[160px] h-8
          hover:border-white/[0.12] hover:text-white transition-colors
          ${open ? "border-white/[0.2] ring-1 ring-white/10" : "border-white/[0.06]"}
        `}
      >
        {selected && (
          <span className="text-sm leading-none">{selected.flag}</span>
        )}
        <span className="flex-1 text-left font-semibold">{value}</span>
        {selected && (
          <span className="text-zinc-600 text-[10px]">{selected.symbol}</span>
        )}
        <CaretDown
          className={`h-3 w-3 text-zinc-600 transition-transform ml-1 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1.5 left-0 w-[280px] rounded-xl border border-white/[0.08] bg-zinc-950 shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
              <MagnifyingGlass className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search currencies…"
                className="bg-transparent text-xs text-zinc-300 placeholder:text-zinc-700 outline-none w-full"
              />
            </div>

            {/* List */}
            <div className="max-h-[260px] overflow-y-auto overflow-x-hidden scrollbar-hide">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-zinc-600">
                  No currencies found
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    className={`
                      flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors
                      hover:bg-white/[0.04]
                      ${c.code === value ? "bg-white/[0.04]" : ""}
                    `}
                  >
                    <span className="text-sm w-6 text-center shrink-0">
                      {c.flag}
                    </span>
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        c.code === value ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      {c.code}
                    </span>
                    <span className="text-[11px] text-zinc-600 flex-1 truncate">
                      {c.name}
                    </span>
                    <span className="text-[11px] text-zinc-700 shrink-0 w-5 text-right">
                      {c.symbol}
                    </span>
                    {c.code === value && (
                      <Check className="h-3 w-3 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OnboardingData {
  language: string;
  currency: string;
  marketRegion: string;
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
  const [portfolioStep, setPortfolioStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    language: "en",
    currency: "USD",
    marketRegion: "US",
    theme: "dark",
    aiProvider: "default",
    portfolioName: "",
    portfolioDescription: "",
    investmentThesis: "",
  });

  const { currencies } = useAvailableCurrencies();
  const byoaiEnabled = useFeatureFlag("byoai");

  const savePreferences = useMutation(api.users.saveOnboardingPreferences);
  const saveAiPreferences = useMutation(api.users.saveOnboardingAiPreferences);
  const createPortfolio = useMutation(api.portfolios.createPortfolio);
  const createGoalsFromOnboarding = useMutation(
    api.portfolioGoals.createGoalsFromOnboarding,
  );
  const uploadDocument = useMutation(api.documents.uploadDocument);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const markComplete = useMutation(api.users.markOnboardingComplete);

  const handleNext = () => {
    setDirection(1);
    if (currentStep === 4) {
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
    setDirection(-1);
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

  const SUBMIT_PHASES = useMemo(
    () => [
      "Saving your preferences…",
      "Configuring AI engine…",
      "Creating your portfolio…",
      "Setting investment targets…",
      "Launching your dashboard…",
    ],
    [],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitPhase(0);

    try {
      await savePreferences({
        userId: userId as any,
        currency: data.currency,
        language: data.language,
        marketRegion: data.marketRegion,
        theme: data.theme,
      });

      setSubmitPhase(1);

      await saveAiPreferences({
        userId: userId as any,
        aiProvider: data.aiProvider,
        openRouterApiKey: data.openRouterApiKey,
      });

      setSubmitPhase(2);

      const portfolioId = await createPortfolio({
        userId: userId as any,
        name: data.portfolioName,
        description: data.portfolioDescription,
        riskTolerance: data.riskTolerance,
        timeHorizon: data.timeHorizon,
      });

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

      setSubmitPhase(3);

      if (
        data.targetValue ||
        data.targetReturn ||
        data.targetYearlyReturn ||
        data.targetContribution
      ) {
        await createGoalsFromOnboarding({
          portfolioId,
          targetValue: data.targetValue,
          targetReturn: data.targetReturn,
          targetYearlyReturn: data.targetYearlyReturn,
          targetContribution: data.targetContribution,
        });
      }

      setSubmitPhase(4);

      await markComplete({ userId: userId as any });
      window.location.href = "/";
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsSubmitting(false);
      setSubmitPhase(0);
    }
  };

  const canProceedStep2 = data.language && data.currency && data.marketRegion;
  const canProceedStep3 = data.aiProvider;
  const canProceedPortfolioStep1 = data.portfolioName.trim();
  const canProceedPortfolioStep2 = data.riskTolerance && data.timeHorizon;

  /* ──────────────────────────────────────────────────────────────────────
     ANIMATION VARIANTS
     ────────────────────────────────────────────────────────────────────── */
  const containerVariants = {
    initial: { opacity: 0, y: direction * 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: direction * -20 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    initial: { opacity: 1 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0,
      },
    },
  };

  /* ──────────────────────────────────────────────────────────────────────
     LAUNCH SEQUENCE — shown during submission
     ────────────────────────────────────────────────────────────────────── */
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center text-center px-6"
        >
          {/* Pulsing icon */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0px rgba(var(--primary-rgb,99,102,241),0.3)",
                "0 0 0 20px rgba(var(--primary-rgb,99,102,241),0)",
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            className="h-20 w-20 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            >
              <Rocket className="h-9 w-9 text-primary" weight="duotone" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3"
          >
            Setting everything up
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-sm text-zinc-500 mb-10 max-w-xs"
          >
            Hang tight — we're preparing your financial command center.
          </motion.p>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mb-8">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${((submitPhase + 1) / SUBMIT_PHASES.length) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Phase status lines */}
          <div className="space-y-2.5 w-64">
            {SUBMIT_PHASES.map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: i <= submitPhase ? 1 : 0.25,
                  x: 0,
                }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-2.5 text-xs"
              >
                {i < submitPhase ? (
                  <Check
                    className="h-3.5 w-3.5 text-primary flex-shrink-0"
                    weight="bold"
                  />
                ) : i === submitPhase ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <CircleNotch
                      className="h-3.5 w-3.5 text-primary flex-shrink-0"
                      weight="bold"
                    />
                  </motion.div>
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-zinc-700 flex-shrink-0" />
                )}
                <span
                  className={
                    i <= submitPhase ? "text-zinc-300" : "text-zinc-600"
                  }
                >
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-md"
        style={{ background: "rgba(9,9,11,0.8)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              PulsePortfolio
            </span>
          </div>
          <div className="text-xs text-zinc-500">
            Step {currentStep} of 5
            {currentStep === 4 && ` (${portfolioStep}/3)`}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <div className="text-center space-y-8">
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.h1
                      variants={itemVariants}
                      className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                    >
                      Welcome, <span className="text-primary">{userName}</span>
                    </motion.h1>

                    <motion.p
                      variants={itemVariants}
                      className="text-base text-zinc-400 max-w-lg mx-auto leading-relaxed"
                    >
                      Let's set up your portfolio and personalize your
                      investment tracking experience.
                    </motion.p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Preferences */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-3xl font-bold text-white">
                      Your Preferences
                    </h2>
                    <p className="text-sm text-zinc-400 mt-2">
                      Customize your experience
                    </p>
                  </motion.div>

                  <div className="space-y-6">
                    {/* Language */}
                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                        <Globe className="h-4 w-4 text-primary" />
                        Language
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { code: "en", name: "English", flag: "🇬🇧" },
                          { code: "pt", name: "Português", flag: "🇵🇹" },
                        ].map((lang) => (
                          <motion.button
                            key={lang.code}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              setData({ ...data, language: lang.code })
                            }
                            className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                              data.language === lang.code
                                ? "border-primary bg-primary/10 text-white"
                                : "border-white/[0.06] bg-zinc-900/50 text-zinc-400 hover:border-white/[0.12]"
                            }`}
                          >
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Currency */}
                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                        <CurrencyDollar className="h-4 w-4 text-primary" />
                        Base Currency
                      </label>
                      <div className="text-xs text-zinc-500 mb-2">
                        150+ currencies available
                      </div>
                      <CurrencyPicker
                        value={data.currency}
                        onChange={(currency) => setData({ ...data, currency })}
                        currencies={currencies}
                      />
                    </motion.div>

                    {/* Market Region */}
                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        Market Region
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {MARKET_REGIONS.map((region) => (
                          <motion.button
                            key={region.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              setData({
                                ...data,
                                marketRegion: region.value,
                              })
                            }
                            className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                              data.marketRegion === region.value
                                ? "border-primary bg-primary/10 text-white"
                                : "border-white/[0.06] bg-zinc-900/50 text-zinc-400 hover:border-white/[0.12]"
                            }`}
                          >
                            <div className="text-lg mb-1">{region.flag}</div>
                            {region.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* STEP 3: AI Preferences */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-3xl font-bold text-white">
                      AI Intelligence
                    </h2>
                    <p className="text-sm text-zinc-400 mt-2">
                      Choose how AI powers your insights
                    </p>
                  </motion.div>

                  <div className="space-y-3">
                    {[
                      {
                        value: "default",
                        title: "Use Our AI Service",
                        description: "Optimized models",
                        icon: <Brain className="h-5 w-5" />,
                        badge: "Recommended",
                        flagRequired: undefined,
                      },
                      {
                        value: "openrouter",
                        title: "OpenRouter API",
                        description: "Premium models",
                        icon: <Lightning className="h-5 w-5" />,
                        badge: "Advanced",
                        flagRequired: "byoai",
                      },
                      {
                        value: "selfhosted",
                        title: "Self-Hosted AI",
                        description: "Coming soon",
                        icon: <Shield className="h-5 w-5" />,
                        badge: "Beta",
                        disabled: true,
                        flagRequired: "byoai",
                      },
                    ]
                      .filter((option) => {
                        if (option.flagRequired === "byoai" && !byoaiEnabled) {
                          return false;
                        }
                        return true;
                      })
                      .map((option) => (
                        <motion.button
                          key={option.value}
                          variants={itemVariants}
                          whileHover={!option.disabled ? { scale: 1.01 } : {}}
                          whileTap={!option.disabled ? { scale: 0.99 } : {}}
                          onClick={() =>
                            !option.disabled &&
                            setData({ ...data, aiProvider: option.value })
                          }
                          disabled={option.disabled}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${
                            data.aiProvider === option.value
                              ? "border-primary bg-primary/10"
                              : "border-white/[0.06] bg-zinc-900/50 hover:border-white/[0.12]"
                          } ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                data.aiProvider === option.value
                                  ? "bg-primary/20 text-primary"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {option.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-white">
                                  {option.title}
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                  {option.badge}
                                </span>
                              </div>
                              <div className="text-xs text-zinc-500 mt-0.5">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                  </div>

                  {data.aiProvider === "openrouter" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-lg bg-zinc-900/50 border border-white/[0.06]"
                    >
                      <label className="block text-xs font-medium text-zinc-400 mb-2">
                        OpenRouter API Key
                      </label>
                      <input
                        type="password"
                        value={data.openRouterApiKey || ""}
                        onChange={(e) =>
                          setData({
                            ...data,
                            openRouterApiKey: e.target.value,
                          })
                        }
                        placeholder="sk-..."
                        className="w-full px-3 py-2 bg-zinc-800 border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary"
                      />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* STEP 4: Portfolio Creation */}
            {currentStep === 4 && (
              <motion.div
                key={`step4-${portfolioStep}`}
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-3xl font-bold text-white">
                      {portfolioStep === 1 && "Create Portfolio"}
                      {portfolioStep === 2 && "Risk Profile"}
                      {portfolioStep === 3 && "Investment Targets"}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-2">
                      {portfolioStep === 1 &&
                        "Give your portfolio a name and description"}
                      {portfolioStep === 2 &&
                        "Define your risk tolerance and time horizon"}
                      {portfolioStep === 3 &&
                        "Set your investment targets (optional)"}
                    </p>
                  </motion.div>

                  {portfolioStep === 1 && (
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="space-y-6"
                    >
                      <motion.div variants={itemVariants}>
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Portfolio Name
                        </label>
                        <input
                          type="text"
                          value={data.portfolioName}
                          onChange={(e) =>
                            setData({
                              ...data,
                              portfolioName: e.target.value,
                            })
                          }
                          placeholder="e.g., My Long-term Portfolio"
                          className="w-full px-4 py-2.5 bg-zinc-900 border border-white/[0.06] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-primary" />
                          Description
                        </label>
                        <textarea
                          value={data.portfolioDescription}
                          onChange={(e) =>
                            setData({
                              ...data,
                              portfolioDescription: e.target.value,
                            })
                          }
                          placeholder="What's this portfolio for? Your investment strategy and goals..."
                          className="w-full px-4 py-2.5 bg-zinc-900 border border-white/[0.06] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary resize-none h-24 transition-colors"
                        />
                      </motion.div>
                    </motion.div>
                  )}

                  {portfolioStep === 2 && (
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="space-y-6"
                    >
                      <motion.div variants={itemVariants}>
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                          <Shield className="h-4 w-4 text-primary" />
                          Risk Tolerance
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: "Conservative", icon: Shield },
                            { value: "Moderate", icon: ChartPie },
                            { value: "Aggressive", icon: TrendDown },
                          ].map((option) => (
                            <motion.button
                              key={option.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setData({
                                  ...data,
                                  riskTolerance: option.value,
                                })
                              }
                              className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                                data.riskTolerance === option.value
                                  ? "border-primary bg-primary/10 text-white"
                                  : "border-white/[0.06] bg-zinc-900/50 text-zinc-400 hover:border-white/[0.12]"
                              }`}
                            >
                              {option.value}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4 text-primary" />
                          Time Horizon
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            {
                              label: "Short-term (< 3 years)",
                              value: "Short-term (< 3 years)",
                            },
                            {
                              label: "Medium-term (3-10 years)",
                              value: "Medium-term (3-10 years)",
                            },
                            {
                              label: "Long-term (> 10 years)",
                              value: "Long-term (> 10 years)",
                            },
                          ].map((option) => (
                            <motion.button
                              key={option.value}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() =>
                                setData({ ...data, timeHorizon: option.value })
                              }
                              className={`p-3 rounded-lg border transition-all text-sm font-medium text-left ${
                                data.timeHorizon === option.value
                                  ? "border-primary bg-primary/10 text-white"
                                  : "border-white/[0.06] bg-zinc-900/50 text-zinc-400 hover:border-white/[0.12]"
                              }`}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {portfolioStep === 3 && (
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="space-y-6"
                    >
                      <motion.div variants={itemVariants}>
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                          <Brain className="h-4 w-4 text-primary" />
                          Portfolio Investment Thesis{" "}
                          <span className="text-xs text-zinc-500 font-normal">
                            (Optional)
                          </span>
                        </label>

                        {/* Document upload */}
                        <div className="border-2 border-dashed border-white/[0.12] rounded-lg p-6 text-center hover:border-white/[0.20] transition-colors">
                          <input
                            type="file"
                            onChange={(e) =>
                              setData({
                                ...data,
                                thesisFile: e.target.files?.[0],
                              })
                            }
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            id="thesis-upload"
                          />
                          <label
                            htmlFor="thesis-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="h-5 w-5 text-zinc-400" />
                            <div className="text-sm">
                              <span className="text-white font-medium">
                                Click to upload
                              </span>{" "}
                              <span className="text-zinc-400">
                                or drag and drop
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500">
                              PDF, DOC, or TXT (Max 10MB)
                            </div>
                            {data.thesisFile && (
                              <div className="mt-2 text-xs text-primary font-medium">
                                ✓ {data.thesisFile.name}
                              </div>
                            )}
                          </label>
                        </div>

                        {/* "or" divider */}
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-white/[0.06]" />
                          <span className="text-xs text-zinc-500 uppercase tracking-widest">
                            or
                          </span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>

                        {/* Text input */}
                        <textarea
                          value={data.investmentThesis}
                          onChange={(e) =>
                            setData({
                              ...data,
                              investmentThesis: e.target.value,
                            })
                          }
                          placeholder="Write your investment strategy and philosophy..."
                          className="w-full px-4 py-2.5 bg-zinc-900 border border-white/[0.06] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary resize-none h-24 transition-colors"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
                          <Crosshair className="h-4 w-4 text-primary" />
                          Investment Targets{" "}
                          <span className="text-xs text-zinc-500 font-normal">
                            (All Optional)
                          </span>
                        </label>
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-zinc-400 mb-2">
                              Target Portfolio Value{" "}
                              <span className="text-zinc-600">(Optional)</span>
                            </div>
                            <input
                              type="number"
                              value={data.targetValue || ""}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  targetValue: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder="e.g., 100000"
                              className="w-full px-4 py-2.5 bg-zinc-900 border border-white/[0.06] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary text-sm transition-colors"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400 mb-2">
                              Target Return (%){" "}
                              <span className="text-zinc-600">(Optional)</span>
                            </div>
                            <input
                              type="number"
                              step="0.1"
                              value={data.targetReturn || ""}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  targetReturn: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder="e.g., 8.5"
                              className="w-full px-4 py-2.5 bg-zinc-900 border border-white/[0.06] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary text-sm transition-colors"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400 mb-2">
                              Yearly Contribution{" "}
                              <span className="text-zinc-600">(Optional)</span>
                            </div>
                            <input
                              type="number"
                              value={data.targetYearlyReturn || ""}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  targetYearlyReturn: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder="e.g., 5000"
                              className="w-full px-4 py-2.5 bg-zinc-900 border border-white/[0.06] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary text-sm transition-colors"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* STEP 5: Done */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <div className="text-center space-y-4">
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30"
                    >
                      <Check className="h-8 w-8 text-primary" />
                    </motion.div>

                    <motion.h2
                      variants={itemVariants}
                      className="text-3xl font-bold text-white mt-6"
                    >
                      You're All Set!
                    </motion.h2>

                    <motion.p
                      variants={itemVariants}
                      className="text-base text-zinc-400 max-w-lg mx-auto"
                    >
                      Your portfolio is ready. Let's start tracking your
                      investments with real-time insights and AI-powered
                      analysis.
                    </motion.p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer - Navigation */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-t border-white/[0.06] bg-zinc-900/50 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            {(currentStep > 1 || (currentStep === 4 && portfolioStep > 1)) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </motion.button>
            )}
          </div>

          <div>
            {currentStep === 5 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                className="flex items-center gap-2 text-sm px-4 py-2 bg-white hover:bg-zinc-100 text-black rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
