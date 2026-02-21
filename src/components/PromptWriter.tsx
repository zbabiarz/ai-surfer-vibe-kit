import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PromptWriterProps {
  initialPrompt: string;
}

export default function PromptWriter({ initialPrompt }: PromptWriterProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEnhancePopup, setShowEnhancePopup] = useState(false);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in to enhance prompts');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prompt`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await response.json();
      setEnhancedPrompt(data.enhancedPrompt);
      toast.success('Prompt enhanced successfully!');
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      toast.error('Failed to enhance prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully!');
  };

  const handleEnhanceMore = () => {
    setShowEnhancePopup(true);
    setTimeout(() => {
      window.open('https://chatgpt.com/g/g-N2vGURx4w-gpt-prompt-genius', '_blank');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light via-brand-200/20 to-neutral-light dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-brand-400 to-accent1-400 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                AI Prompt Enhancer
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Transform your ideas into powerful prompts
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-white resize-none"
                rows={6}
                placeholder="Enter your prompt here..."
              />
            </div>

            <button
              onClick={enhancePrompt}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-brand-400 to-accent1-400 hover:from-brand-500 hover:to-accent1-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? 'Enhancing...' : 'Enhance My Prompt'}
            </button>
          </div>
        </div>

        {enhancedPrompt && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Enhanced Prompt
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(enhancedPrompt)}
                  className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-200 group"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200" />
                  )}
                </button>
                <button
                  onClick={() => downloadAsText(enhancedPrompt, 'enhanced-prompt.txt')}
                  className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-200 group"
                  title="Download as text file"
                >
                  <Download className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200" />
                </button>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 mb-6">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {enhancedPrompt}
              </p>
            </div>
            <button
              onClick={handleEnhanceMore}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Enhance my prompt even more
            </button>
          </div>
        )}
      </div>

      {showEnhancePopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowEnhancePopup(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Opening GPT Prompt Genius
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We're taking you to an advanced AI tool to enhance your prompt even further!
              </p>
              <button
                onClick={() => setShowEnhancePopup(false)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
