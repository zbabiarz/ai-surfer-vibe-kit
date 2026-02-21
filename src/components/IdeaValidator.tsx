import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Lightbulb, Target, TrendingUp, Zap, MessageSquare, Users, Rocket } from 'lucide-react';
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
  yourEdge: string;
  biggestRisk: string;
  pivotSuggestions: string[];
  quickWin: string;
}

interface IdeaValidatorProps {
  formData: FormData;
}

function ScoreBar({ label, score, reason, icon: Icon }: { label: string; score: number; reason: string; icon: React.ElementType }) {
  const getBarColor = (score: number) => {
    if (score >= 8) return 'from-emerald-400 to-emerald-500';
    if (score >= 6) return 'from-amber-400 to-amber-500';
    if (score >= 4) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 6) return 'text-amber-600 dark:text-amber-400';
    if (score >= 4) return 'text-orange-600 dark:text-orange-400';
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

export function IdeaValidator({ formData }: IdeaValidatorProps) {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const validateIdea = async () => {
    if (!formData.name && !formData.purpose) {
      toast.error('Please fill in the App Name or "What does your app do?" field first.');
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
      setResult(data);
      setIsExpanded(true);
      toast.success('Idea validated!');
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="mb-6">
      <button
        onClick={validateIdea}
        disabled={validating}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
        style={{ boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' }}
      >
        <Shield className={`w-5 h-5 ${validating ? 'animate-pulse' : ''}`} />
        <span>
          {validating ? 'Analyzing Your Idea...' : 'Validate My Idea'}
        </span>
      </button>

      {validating && (
        <div className="mt-4 p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="font-semibold text-violet-700 dark:text-violet-300">Analyzing your app idea...</p>
              <p className="text-sm text-violet-600 dark:text-violet-400">Researching market, competitors, and viability</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-extrabold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Overall Score</p>
                <VerdictBadge verdict={result.verdict} />
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div className="px-6 pb-6 space-y-6">
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

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
                <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase text-blue-700 dark:text-blue-300 mb-3">
                  <MessageSquare className="w-4 h-4" />
                  Community Signals
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
                <div className="bg-violet-50 dark:bg-violet-900/30 rounded-2xl p-5 border border-violet-200 dark:border-violet-800">
                  <h4 className="flex items-center gap-2 text-sm font-extrabold uppercase text-violet-700 dark:text-violet-300 mb-3">
                    <Rocket className="w-4 h-4" />
                    Pivot Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {result.pivotSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-violet-800 dark:text-violet-200">
                        <span className="text-violet-500 font-bold">{index + 1}.</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-5 text-white">
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
