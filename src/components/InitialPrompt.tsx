import { useState, useEffect } from 'react';
import { Copy, CreditCard as Edit2, Check, ChevronDown, ChevronUp, Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { PromptEnhancer } from './PromptEnhancer';

interface InitialPromptProps {
  generatedPrompt: string;
  onPromptChange: (prompt: string) => void;
  userId: string;
}

export function InitialPrompt({ generatedPrompt, onPromptChange, userId }: InitialPromptProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(generatedPrompt);
  const [expanded, setExpanded] = useState(false);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [isNewPrompt, setIsNewPrompt] = useState(false);

  useEffect(() => {
    setEditedPrompt(generatedPrompt);
    if (generatedPrompt) {
      setExpanded(true);
      setIsNewPrompt(true);
      const timer = setTimeout(() => setIsNewPrompt(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [generatedPrompt]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    onPromptChange(editedPrompt);
    toast.success('Prompt updated!');
  };

  const handleUseEnhancedPrompt = (prompt: string) => {
    setEnhancedPrompt(prompt);
    toast.success('Enhanced prompt ready! Compare side by side below.');
  };

  const hasEnhanced = enhancedPrompt !== null;

  return (
    <>
      <div className="bg-gradient-to-br from-white to-brand-200/30 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl shadow-xl border border-brand-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h2 className="text-3xl font-extrabold uppercase bg-gradient-to-r from-brand-500 to-brand-400 dark:from-brand-400 dark:to-brand-200 bg-clip-text text-transparent flex items-center gap-2">
            <FileText className="w-8 h-8 text-brand-500 dark:text-brand-400" />
            {hasEnhanced ? 'Prompt Comparison' : 'Initial App Foundational Prompt'}
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 bg-neutral-light dark:bg-gray-700 text-neutral-dark dark:text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-sm text-sm font-medium whitespace-nowrap"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Expand</span>
                </>
              )}
            </button>
            {!hasEnhanced && (
              <>
                <button
                  onClick={() => copyToClipboard(editedPrompt)}
                  className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm font-medium whitespace-nowrap"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-500 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm font-medium whitespace-nowrap"
                >
                  {isEditing ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {hasEnhanced ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Original Prompt
                </h3>
                <button
                  onClick={() => copyToClipboard(editedPrompt)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
              <div className={`w-full p-5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-neutral-light to-white dark:from-gray-700 dark:to-gray-750 text-gray-900 dark:text-gray-100 overflow-auto whitespace-pre-wrap transition-all duration-300 font-mono text-sm shadow-inner ${
                expanded ? 'h-[600px]' : 'h-64'
              }`}>
                {editedPrompt || 'No prompt generated yet.'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                  Enhanced Prompt
                </h3>
                <button
                  onClick={() => copyToClipboard(enhancedPrompt)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
              <div className={`w-full p-5 border-2 border-brand-300 dark:border-brand-700 rounded-xl bg-gradient-to-br from-brand-50 to-white dark:from-gray-700 dark:to-gray-750 text-gray-900 dark:text-gray-100 overflow-auto transition-all duration-300 text-sm shadow-inner ${
                expanded ? 'h-[600px]' : 'h-64'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{enhancedPrompt}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isEditing ? (
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className={`w-full p-5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 font-mono text-sm shadow-inner ${
                  expanded ? 'h-[600px]' : 'h-48'
                }`}
              />
            ) : (
              <div className={`w-full p-5 border-2 rounded-xl bg-gradient-to-br from-neutral-light to-white dark:from-gray-700 dark:to-gray-750 text-gray-900 dark:text-gray-100 overflow-auto whitespace-pre-wrap transition-all duration-300 font-mono text-sm shadow-inner ${
                expanded ? 'h-[600px]' : 'h-48'
              } ${isNewPrompt ? 'animate-glow-green border-green-400' : 'border-gray-300 dark:border-gray-600'}`}>
                {editedPrompt || 'No prompt generated yet. Click "Generate Prompt" above to create one.'}
              </div>
            )}
          </>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowEnhancer(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-400 to-accent1-400 hover:from-brand-500 hover:to-accent1-400 text-white px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 font-bold text-base animate-pulse"
            style={{
              boxShadow: '0 0 40px rgba(247, 138, 140, 0.6)',
            }}
          >
            <Sparkles className="w-6 h-6" />
            <span>{hasEnhanced ? 'Enhance Again' : 'Enhance my prompt even more!'}</span>
          </button>
        </div>
      </div>

      {showEnhancer && (
        <PromptEnhancer
          originalPrompt={editedPrompt}
          userId={userId}
          onClose={() => setShowEnhancer(false)}
          onUseEnhancedPrompt={handleUseEnhancedPrompt}
        />
      )}
    </>
  );
}
