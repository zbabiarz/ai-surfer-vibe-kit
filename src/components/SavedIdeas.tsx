import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pencil, ChevronDown, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface AppIdea {
  id: string;
  name: string;
  purpose: string;
  target_audience: string;
  main_features: string;
  created_at: string;
}

export function SavedIdeas({ userId, onLoadIdea, compact }: { userId: string, onLoadIdea: (idea: AppIdea) => void, compact?: boolean }) {
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    loadIdeas();
  }, [userId]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      toast.error('Failed to load saved ideas');
    } finally {
      setLoading(false);
    }
  };

  const deleteIdea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('app_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIdeas(ideas.filter(idea => idea.id !== id));
      toast.success('Idea deleted successfully');
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSelectIdea = (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (idea) {
      setSelectedId(ideaId);
      onLoadIdea(idea);
      setIsOpen(false);
      toast.success('Idea loaded into form');
    }
  };

  const handleDeleteIdea = async (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }
    await deleteIdea(ideaId);
    if (selectedId === ideaId) {
      setSelectedId('');
    }
  };

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg animate-pulse">
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
      </div>
    );
  }

  if (ideas.length === 0) {
    return null;
  }

  const selectedIdea = ideas.find(i => i.id === selectedId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-brand-300 dark:border-brand-500 transition-all duration-300 hover:shadow-[0_0_24px_rgba(247,138,140,0.25)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 text-left group px-6 py-4 hover:bg-brand-50/40 dark:hover:bg-brand-400/10 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 bg-brand-100 dark:bg-brand-400/20 rounded-lg p-2">
            <BookOpen className="w-5 h-5 text-brand-500 dark:text-brand-300" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400 dark:text-brand-300 block mb-0.5">
              Saved Ideas
            </span>
            <span className="font-bold text-base text-neutral-dark dark:text-gray-100 block">
              {selectedIdea ? selectedIdea.name : 'Load a Saved Idea'}
            </span>
            {selectedIdea && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created {formatDate(selectedIdea.created_at)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline-block text-xs font-medium text-brand-400 dark:text-brand-300 bg-brand-50 dark:bg-brand-400/20 px-3 py-1 rounded-full">
            {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-brand-400 dark:text-brand-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className={`group relative rounded-lg transition-all duration-200 ${
                  selectedId === idea.id
                    ? 'bg-brand-50 dark:bg-brand-400/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <button
                  onClick={() => handleSelectIdea(idea.id)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-gray-100 truncate">
                      {idea.name || 'Untitled Idea'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Created {formatDate(idea.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {selectedId === idea.id && (
                      <Pencil className="w-4 h-4 text-brand-400 dark:text-brand-300" />
                    )}
                    <button
                      onClick={(e) => handleDeleteIdea(idea.id, e)}
                      className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
