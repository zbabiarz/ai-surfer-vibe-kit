import { useState, useEffect, useRef } from 'react';
import { X, Send, RefreshCw, Copy, Check, Sparkles, ArrowRight, Lock, FileText, GitCompare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface PromptEnhancerProps {
  originalPrompt: string;
  userId: string;
  onClose: () => void;
  onUseEnhancedPrompt: (prompt: string) => void;
}

const DAILY_LIMIT = 3;

type ResultView = 'enhanced' | 'original' | 'compare';

export function PromptEnhancer({ originalPrompt, userId, onClose, onUseEnhancedPrompt }: PromptEnhancerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [resultView, setResultView] = useState<ResultView>('enhanced');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkDailyLimit();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading && !enhancedPrompt && !limitReached && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [loading, enhancedPrompt, limitReached, messages.length]);

  async function checkDailyLimit() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('prompt_enhancements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString());

    if (error) {
      console.error('Error checking daily limit:', error);
      setDailyCount(0);
      startAnalysis();
      return;
    }

    const used = count ?? 0;
    setDailyCount(used);

    if (used >= DAILY_LIMIT) {
      setLimitReached(true);
    } else {
      startAnalysis();
    }
  }

  async function startAnalysis() {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-prompt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            originalPrompt,
            messages: [],
            phase: 'analyze',
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze prompt');
      }

      const data = await response.json();
      setMessages([{ role: 'assistant', content: data.message }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
      setMessages([{ role: 'assistant', content: `Sorry, I encountered an error: ${msg}. Please close and try again.` }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!userInput.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: userInput };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-prompt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            originalPrompt,
            messages: updatedMessages,
            phase: 'continue',
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to continue conversation');
      }

      const data = await response.json();

      if (data.done) {
        setEnhancedPrompt(data.enhancedPrompt);
        await recordUsage();
      } else {
        setMessages([...updatedMessages, { role: 'assistant', content: data.message }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
      setMessages([...updatedMessages, { role: 'assistant', content: `Sorry, I encountered an error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function recordUsage() {
    const { error } = await supabase
      .from('prompt_enhancements')
      .insert({ user_id: userId });

    if (error) {
      console.error('Error recording enhancement usage:', error);
    }
  }

  function handleCopy() {
    if (!enhancedPrompt) return;
    navigator.clipboard.writeText(enhancedPrompt);
    setCopied(true);
    toast.success('Enhanced prompt copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleUse() {
    if (!enhancedPrompt) return;
    onUseEnhancedPrompt(enhancedPrompt);
    onClose();
  }

  const remaining = dailyCount !== null ? Math.max(0, DAILY_LIMIT - dailyCount) : null;

  const viewTabs: { key: ResultView; label: string; icon: typeof FileText }[] = [
    { key: 'enhanced', label: 'Enhanced', icon: Sparkles },
    { key: 'original', label: 'Original', icon: FileText },
    { key: 'compare', label: 'Compare', icon: GitCompare },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${enhancedPrompt ? 'max-w-6xl' : 'max-w-2xl'} max-h-[90vh] flex flex-col border-2 border-brand-200 dark:border-gray-700 overflow-hidden transition-all duration-300`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-400 to-accent1-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-lg font-extrabold uppercase text-white">
              Prompt Enhancer
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {remaining !== null && !limitReached && (
              <span className="text-white/90 text-sm font-medium">
                {remaining} enhancement{remaining !== 1 ? 's' : ''} left today
              </span>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {limitReached ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Daily Limit Reached
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              You've used all {DAILY_LIMIT} prompt enhancements for today. Come back tomorrow for more!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-400 hover:bg-brand-500 text-white rounded-xl transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        ) : enhancedPrompt ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5">
                  Your Enhanced Prompt
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review, compare, then copy or use it directly.
                </p>
              </div>
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 gap-0.5">
                {viewTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setResultView(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      resultView === tab.key
                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {resultView === 'enhanced' && (
                <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                  <ReactMarkdown>{enhancedPrompt}</ReactMarkdown>
                </div>
              )}

              {resultView === 'original' && (
                <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                  <ReactMarkdown>{originalPrompt}</ReactMarkdown>
                </div>
              )}

              {resultView === 'compare' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Original</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-300 dark:border-gray-600 h-[55vh] overflow-y-auto">
                      <ReactMarkdown>{originalPrompt}</ReactMarkdown>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-400"></div>
                      <span className="text-sm font-semibold text-brand-500 dark:text-brand-300 uppercase tracking-wide">Enhanced</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-brand-50/50 dark:bg-gray-700/50 rounded-xl p-5 border border-brand-200 dark:border-brand-400/30 h-[55vh] overflow-y-auto">
                      <ReactMarkdown>{enhancedPrompt}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleUse}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-400 to-accent1-400 hover:from-brand-500 hover:to-accent1-500 text-white rounded-xl transition-colors font-medium shadow-lg"
              >
                <ArrowRight className="w-4 h-4" />
                Use Enhanced Prompt
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-10 h-10 text-brand-400 animate-spin mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Analyzing your prompt...
                  </p>
                </div>
              )}
              {messages.map((msg, idx) =>
                msg.role === 'assistant' ? (
                  <div key={idx} className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-accent1-400 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Prompt Enhancer
                      </span>
                    </div>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-4 last:mb-0">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900 dark:text-white">
                            {children}
                          </strong>
                        ),
                        ol: ({ children }) => (
                          <ol className="space-y-3 mt-1">{children}</ol>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-3 mt-1">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed pl-2 border-l-2 border-brand-200 dark:border-brand-400/40">
                            {children}
                          </li>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div key={idx} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed bg-brand-400 text-white">
                      {msg.content}
                    </div>
                  </div>
                )
              )}
              {loading && messages.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3">
                    <RefreshCw className="w-4 h-4 text-brand-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                Answer any or all of the questions above, then we'll enhance your prompt.
              </p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your answers here..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !userInput.trim()}
                  className="px-5 py-3 bg-brand-400 hover:bg-brand-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
