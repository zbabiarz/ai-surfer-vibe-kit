import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Lightbulb, Target, TrendingUp, Zap, MessageSquare, Users, Rocket, Globe, BarChart2, Search, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  purpose: string;
  target_audience: string;
  main_features: string;
  design_notes: string;
  monetization: string;
}

interface ScoreDetail {
  score: number;
  reason: string;
}

interface Competitor {
  name: string;
  url: string;
  pricing: string;
  weakness: string;
  description?: string;
}

interface ValidationResult {
  overallScore: number;
  verdict: "GO" | "MAYBE" | "PIVOT";
  scores: {
    marketNeed: ScoreDetail;
    competition: ScoreDetail;
    monetization: ScoreDetail;
    feasibility: ScoreDetail;
  };
  competitors: Competitor[];
  redditSignals: string[];
  marketTrends?: string[];
  searchInsights?: string;
  yourEdge: string;
  biggestRisk: string;
  pivotSuggestions: string[];
  quickWin: string;
}

interface IdeaValidatorProps {
  formData: FormData;
  userId: string;
  ideaId?: string;
}

const DAILY_LIMIT = 3;

const LOADING_STEPS = [
  { label: 'Searching web for competitors', sublabel: 'Scanning product directories & review sites' },
  { label: 'Finding community pain points', sublabel: 'Reading Reddit, forums & app store reviews' },
  { label: 'Analyzing market trends', sublabel: 'Checking industry reports & funding signals' },
  { label: 'Generating your scorecard', sublabel: 'Synthesizing research into actionable insights' },
];

function LoadingSteps({ activeStep }: { activeStep: number }) {
  return (
    <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Running deep market research...</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Searching multiple sources for a comprehensive analysis</p>
        </div>
      </div>
      <div className="space-y-3">
        {LOADING_STEPS.map((step, index) => {
          const isDone = index < activeStep;
          const isActive = index === activeStep;
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                  : isDone
                  ? 'opacity-60'
                  : 'opacity-30'
              }`}
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isDone ? (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : isDone ? 'text-gray-600 dark:text-gray-400 line-through' : 'text-gray-500 dark:text-gray-500'}`}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">{step.sublabel}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBar({ label, score, reason, icon: Icon }: { label: string; score: number; reason: string; icon: React.ElementType }) {
  const getBarColor = (s: number) => {
    if (s >= 8) return 'from-emerald-400 to-emerald-500';
    if (s >= 6) return 'from-amber-400 to-amber-500';
    if (s >= 4) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getTextColor = (s: number) => {
    if (s >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (s >= 6) return 'text-amber-600 dark:text-amber-400';
    if (s >= 4) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className={`text-lg font-bold ${getTextColor(score)}`}>{score}/10</span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getBarColor(score)} rounded-full transition-all duration-500`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{reason}</p>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: "GO" | "MAYBE" | "PIVOT" }) {
  const config = {
    GO: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700' },
    MAYBE: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' },
    PIVOT: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
  };
  const { bg, text, border } = config[verdict];
  return (
    <span className={`px-4 py-2 rounded-full font-bold text-lg ${bg} ${text} border-2 ${border}`}>
      {verdict}
    </span>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
      <Globe className="w-3 h-3" />
      Live web search
    </span>
  );
}

function UsagePips({ used, limit }: { used: number; limit: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: limit }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < used
              ? 'bg-red-400 dark:bg-red-500'
              : 'bg-gray-200 dark:bg-gray-600'
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{used}/{limit} today</span>
    </div>
  );
}

export function IdeaValidator({ formData, userId, ideaId }: IdeaValidatorProps) {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [savedValidationId, setSavedValidationId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [usedToday, setUsedToday] = useState(0);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDailyUsage = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('validation_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());
    setUsedToday(count ?? 0);
  };

  const loadExistingValidation = async (id: string) => {
    setLoadingExisting(true);
    try {
      const { data, error } = await supabase
        .from('idea_validations')
        .select('id, result')
        .eq('app_idea_id', id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setResult(data.result as ValidationResult);
        setSavedValidationId(data.id);
        setIsExpanded(true);
      } else {
        setResult(null);
        setSavedValidationId(null);
      }
    } catch (err) {
      console.error('Error loading existing validation:', err);
    } finally {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    fetchDailyUsage();
  }, [userId]);

  useEffect(() => {
    if (ideaId) {
      loadExistingValidation(ideaId);
    } else {
      setResult(null);
      setSavedValidationId(null);
    }
  }, [ideaId]);

  useEffect(() => {
    if (validating) {
      setActiveStep(0);
      let step = 0;
      const durations = [8000, 10000, 8000, 99999];
      stepIntervalRef.current = setInterval(() => {
        step += 1;
        if (step < LOADING_STEPS.length) {
          setActiveStep(step);
          clearInterval(stepIntervalRef.current!);
          stepIntervalRef.current = setInterval(() => {
            step += 1;
            if (step < LOADING_STEPS.length) {
              setActiveStep(step);
            }
          }, durations[step] || 8000);
        }
      }, durations[0]);
    } else {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [validating]);

  const saveValidationResult = async (validationResult: ValidationResult) => {
    if (!ideaId) return;
    try {
      const { data, error } = await supabase
        .from('idea_validations')
        .upsert(
          { user_id: userId, app_idea_id: ideaId, result: validationResult },
          { onConflict: 'app_idea_id' }
        )
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (data) setSavedValidationId(data.id);
    } catch (err) {
      console.error('Error saving validation:', err);
    }
  };

  const logUsageAttempt = async () => {
    await supabase
      .from('validation_usage')
      .insert({ user_id: userId });
    await fetchDailyUsage();
  };

  const validateIdea = async () => {
    if (!formData.name && !formData.purpose) {
      toast.error('Please fill in the App Name or "What does your app do?" field first.');
      return;
    }

    if (usedToday >= DAILY_LIMIT) {
      toast.error(`You've used all ${DAILY_LIMIT} validations for today. Come back tomorrow!`, { duration: 5000 });
      return;
    }

    if (!ideaId) {
      toast.error('Please save your idea first before running a validation.');
      return;
    }

    try {
      setValidating(true);
      setResult(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnonKey;

      const res = await fetch(`${supabaseUrl}/functions/v1/validate-idea`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          name: formData.name || '',
          purpose: formData.purpose || '',
          target_audience: formData.target_audience || '',
          main_features: formData.main_features || '',
          design_notes: formData.design_notes || '',
          monetization: formData.monetization || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Validation failed (${res.status})`);
      }

      const data: ValidationResult = await res.json();

      await Promise.all([
        logUsageAttempt(),
        saveValidationResult(data),
      ]);

      setResult(data);
      setIsExpanded(true);
      toast.success('Analysis complete and saved!');
    } catch (error) {
      console.error('Error validating idea:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to validate idea. Please try again.';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setValidating(false);
    }
  };

  const deleteValidation = async () => {
    if (!savedValidationId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('idea_validations')
        .delete()
        .eq('id', savedValidationId);
      if (error) throw error;
      setResult(null);
      setSavedValidationId(null);
      setShowDeleteConfirm(false);
      toast.success('Analysis deleted.');
    } catch (err) {
      console.error('Error deleting validation:', err);
      toast.error('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const isAtLimit = usedToday >= DAILY_LIMIT;
  const canValidate = !isAtLimit && !!ideaId;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <UsagePips used={usedToday} limit={DAILY_LIMIT} />
        {!ideaId && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Save your idea to enable validation</p>
        )}
      </div>

      <button
        onClick={validateIdea}
        disabled={validating || isAtLimit || !ideaId}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform font-semibold text-base
          ${canValidate && !validating
            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white hover:scale-[1.02] hover:shadow-xl'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        style={canValidate && !validating ? { boxShadow: '0 4px 20px rgba(37, 99, 235, 0.35)' } : {}}
      >
        {result && !validating ? (
          <>
            <RefreshCw className={`w-5 h-5 ${validating ? 'animate-spin' : ''}`} />
            <span>Re-run Analysis</span>
            <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">
              uses 1 of {DAILY_LIMIT - usedToday} left
            </span>
          </>
        ) : (
          <>
            <Search className={`w-5 h-5 ${validating ? 'animate-pulse' : ''}`} />
            <span>
              {validating ? 'Researching & Analyzing...' : isAtLimit ? 'Daily limit reached' : 'Deep Validate My Idea'}
            </span>
            {!validating && !isAtLimit && (
              <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">Live Web Search</span>
            )}
          </>
        )}
      </button>

      {isAtLimit && (
        <p className="text-center text-xs text-red-500 dark:text-red-400 mt-2">
          You've used all {DAILY_LIMIT} validations for today. Resets at midnight.
        </p>
      )}

      {validating && <LoadingSteps activeStep={activeStep} />}

      {loadingExisting && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-4">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Loading saved analysis...
        </div>
      )}

      {result && !validating && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between pr-4 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 flex items-center gap-4 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-0.5">Overall Score</p>
                <div className={`text-5xl font-extrabold leading-none ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </div>
              </div>
              <VerdictBadge verdict={result.verdict} />
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400 ml-auto" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              )}
            </button>

            <div className="flex-shrink-0">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteValidation}
                    disabled={deleting}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Confirm delete'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete this analysis"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="px-6 pb-6 pt-4 space-y-6">

              {result.searchInsights && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <Globe className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{result.searchInsights}</p>
                </div>
              )}

              <div className="grid gap-4">
                <ScoreBar
                  label="Market Need"
                  score={result.scores.marketNeed.score}
                  reason={result.scores.marketNeed.reason}
                  icon={Target}
                />
                <ScoreBar
                  label="Competition Landscape"
                  score={result.scores.competition.score}
                  reason={result.scores.competition.reason}
                  icon={Users}
                />
                <ScoreBar
                  label="Monetization Potential"
                  score={result.scores.monetization.score}
                  reason={result.scores.monetization.reason}
                  icon={TrendingUp}
                />
                <ScoreBar
                  label="Feasibility"
                  score={result.scores.feasibility.score}
                  reason={result.scores.feasibility.reason}
                  icon={Zap}
                />
              </div>

              {result.marketTrends && result.marketTrends.length > 0 && (
                <div className="bg-sky-50 dark:bg-sky-900/30 rounded-2xl p-5 border border-sky-200 dark:border-sky-800">
                  <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase text-sky-700 dark:text-sky-300 mb-3">
                    <BarChart2 className="w-4 h-4" />
                    Market Trends
                    <span className="ml-auto"><LiveBadge /></span>
                  </h4>
                  <ul className="space-y-2">
                    {result.marketTrends.map((trend, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-sky-800 dark:text-sky-200">
                        <span className="text-sky-400 font-bold mt-0.5">↗</span>
                        <span>{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
                <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase text-blue-700 dark:text-blue-300 mb-3">
                  <MessageSquare className="w-4 h-4" />
                  Community Signals
                  <span className="ml-auto"><LiveBadge /></span>
                </h4>
                <ul className="space-y-2">
                  {result.redditSignals.map((signal, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <span className="text-blue-500 mt-0.5">"</span>
                      <span className="italic">{signal}</span>
                      <span className="text-blue-500 mt-0.5">"</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-2xl p-5 border border-orange-200 dark:border-orange-800">
                <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase text-orange-700 dark:text-orange-300 mb-3">
                  <Users className="w-4 h-4" />
                  Top Competitors
                  <span className="ml-auto"><LiveBadge /></span>
                </h4>
                <div className="grid gap-3">
                  {result.competitors.map((competitor, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                      <div className="flex items-center justify-between mb-2">
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-orange-700 dark:text-orange-300 hover:underline flex items-center gap-1"
                        >
                          {competitor.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-xs bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                          {competitor.pricing}
                        </span>
                      </div>
                      {competitor.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{competitor.description}</p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-orange-600 dark:text-orange-400">Weakness:</span> {competitor.weakness}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800">
                <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase text-emerald-700 dark:text-emerald-300 mb-3">
                  <Lightbulb className="w-4 h-4" />
                  Your Edge
                </h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">{result.yourEdge}</p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-5 border border-red-200 dark:border-red-800">
                <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase text-red-700 dark:text-red-300 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  Biggest Risk
                </h4>
                <p className="text-sm text-red-800 dark:text-red-200">{result.biggestRisk}</p>
              </div>

              {result.overallScore < 60 && result.pivotSuggestions && result.pivotSuggestions.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-5 border border-amber-200 dark:border-amber-800">
                  <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase text-amber-700 dark:text-amber-300 mb-3">
                    <Rocket className="w-4 h-4" />
                    Pivot Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {result.pivotSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                        <span className="text-amber-500 font-bold">{index + 1}.</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-5 text-white">
                <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase mb-2">
                  <Zap className="w-4 h-4" />
                  Quick Win — Your Next Step
                </h4>
                <p className="text-sm opacity-95">{result.quickWin}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
