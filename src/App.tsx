import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { SavedIdeas } from './components/SavedIdeas';
import { InitialPrompt } from './components/InitialPrompt';
import { AppForm } from './components/AppForm';
import { DarkModeToggle } from './components/DarkModeToggle';
import { PreMadePrompts } from './components/PreMadePrompts';
import { FreeAPIs } from './components/FreeAPIs';
import { IDEList } from './components/IDEList';
import { IdeaGenerator } from './components/IdeaGenerator';
import { LogOut, ExternalLink, Github, Users, Send, Gamepad2, Play, X, Music, Paintbrush2, ChevronDown, CalendarCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

interface AppIdea {
  id?: string;
  name: string;
  purpose: string;
  target_audience: string;
  main_features: string;
  design_notes: string;
  monetization: string;
  user_id: string;
}

const LOGO_URL = 'https://storage.googleapis.com/msgsndr/QFjnAi2H2A9Cpxi7l0ri/media/699097ce772de9472c02c5ac.png';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [selectedIdea, setSelectedIdea] = useState<AppIdea | null>(null);
  const [showLoadIdea, setShowLoadIdea] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleLoadIdea = (idea: AppIdea) => {
    setSelectedIdea(idea);
    setShowLoadIdea(false);
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-neutral-light dark:bg-gray-900 transition-colors duration-200 font-montserrat">
      <Toaster position="top-right" />

      <header className="bg-brand-400 dark:bg-brand-500 border-b border-brand-500 dark:border-brand-600 transition-colors duration-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <img
                src={LOGO_URL}
                alt="The AI Surfer"
                className="h-32 w-auto mb-2"
              />
              <h1 className="text-2xl font-extrabold uppercase text-white">
                Your Idea. Your App. No Code.
              </h1>
              <p className="text-white/90 italic text-sm">
                The No-Code Revolution Starts Here.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <PreMadePrompts onSelectPrompt={(prompt) => setGeneratedPrompt(prompt)} />
              <FreeAPIs />
              <DarkModeToggle />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white hover:bg-neutral-light text-neutral-dark px-4 py-2 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-brand-200 dark:border-gray-700 transition-colors duration-200">
          <h2 className="text-xl font-extrabold uppercase text-neutral-dark dark:text-gray-100 mb-4 text-center">
            How to use this platform
          </h2>
          <div className="flex justify-center">
            <button
              onClick={() => setShowVideoModal(true)}
              className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white px-8 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(247,138,140,0.7)] transform hover:-translate-y-1 font-semibold text-lg animate-pulse hover:animate-none"
            >
              <Play className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              <span className="transition-transform duration-300">Watch Overview Video</span>
            </button>
          </div>
        </div>

        {showVideoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full">
              <div className="flex justify-between items-center p-4 border-b border-brand-200 dark:border-gray-600">
                <h3 className="text-xl font-extrabold uppercase text-neutral-dark dark:text-gray-100">
                  Platform Overview Video
                </h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-neutral-dark/50 dark:text-gray-400 hover:text-neutral-dark dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/kcf6tsou5Us"
                    title="Platform Overview Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <IdeaGenerator
          userId={user.id}
          onUseIdea={handleLoadIdea}
        />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-brand-200 dark:border-gray-700 transition-colors duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-400 to-brand-500 dark:from-brand-500 dark:to-brand-600 px-6 py-3">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-2 bg-white/30 rounded-full" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <ExternalLink className="w-5 h-5 text-white" />
              <h2 className="text-2xl font-extrabold uppercase text-white">Vibe Coder Toolkit Quicklinks</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href="https://bolt.new/?rid=l3uyub"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 bg-brand-400 hover:bg-brand-500 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(247,138,140,0.6)] transform hover:-translate-y-1 font-medium"
              >
                <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">Bolt.new</span>
              </a>
              <a
                href="https://wisprflow.ai/r?ZACH38"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 bg-accent1-400 hover:bg-accent1-500 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(244,138,183,0.6)] transform hover:-translate-y-1 font-medium"
              >
                <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">Wispr Flow</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 bg-neutral-dark hover:bg-neutral-dark/80 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(74,74,74,0.4)] transform hover:-translate-y-1 font-medium"
              >
                <Github className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">GitHub</span>
              </a>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showAllTools ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <a
                  href="https://theaisurfer.com/training?am_id=zachbabiarz372"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 bg-accent2-400 hover:bg-accent2-500 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(218,123,180,0.6)] transform hover:-translate-y-1 font-medium"
                >
                  <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                  <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">AI Surfer Mastermind</span>
                </a>
                <a
                  href="https://21st.dev/community/components"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(2,132,199,0.6)] transform hover:-translate-y-1 font-medium"
                >
                  <Paintbrush2 className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                  <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">Design Components & Usage</span>
                </a>
                <a
                  href="https://chat.whatsapp.com/JuUZxvRRZMsEBoZQbvbhDc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 bg-[#FFA07A] hover:bg-[#FF8C5A] text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(255,160,122,0.6)] transform hover:-translate-y-1 font-medium"
                >
                  <Users className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                  <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">AI Surfer Cohort Community</span>
                </a>
                <a
                  href="https://link.coachmatixmail.com/widget/form/zyHqKCKcHdqw5ibKYT6v"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 bg-accent1-500 hover:bg-accent1-600 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(240,109,163,0.6)] transform hover:-translate-y-1 font-medium"
                >
                  <Send className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                  <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">Feedback Form</span>
                </a>
                <Link
                  to="/terminology-game"
                  className="group flex items-center justify-center gap-2 bg-accent2-500 hover:bg-accent2-600 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(208,96,163,0.6)] transform hover:-translate-y-1 font-medium"
                >
                  <Gamepad2 className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                  <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">Terminology Game</span>
                </Link>
                <a
                  href="https://open.spotify.com/playlist/6ShbEV1621eRllS7ZL0JCM?si=f2tbX1sfQKap6YaBZ-DqgA&pi=OZ3Hqx86SUSeh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1aa34a] text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(29,185,84,0.6)] transform hover:-translate-y-1 font-medium"
                >
                  <Music className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                  <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">Zach's Vibes</span>
                </a>
                <a
                  href="https://tutsflow.com/free-open-source-icon-libraries/#3-lucide-icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] transform hover:-translate-y-1 font-medium"
                >
                  <Paintbrush2 className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                  <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">Icon Libraries</span>
                </a>
                <IDEList
                  buttonClassName="group flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(20,184,166,0.6)] transform hover:-translate-y-1 font-medium w-full"
                  iconClassName="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1"
                  labelClassName="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2"
                />
                <a
                  href="https://link.coachmatixmail.com/widget/booking/qZ3MgiU9ussrrr0wtCxc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(247,138,140,0.6)] transform hover:-translate-y-1 font-medium"
                >
                  <CalendarCheck className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-y-1" />
                  <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2">Book 1-on-1 Help Call</span>
                </a>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAllTools(!showAllTools)}
                className="flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              >
                <span>{showAllTools ? 'Show less' : 'Show more tools'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllTools ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <SavedIdeas
          userId={user.id}
          onLoadIdea={handleLoadIdea}
          compact={true}
        />

        <AppForm
          userId={user.id}
          onGeneratePrompt={setGeneratedPrompt}
          selectedIdea={selectedIdea}
        />

        <InitialPrompt
          generatedPrompt={generatedPrompt}
          onPromptChange={setGeneratedPrompt}
          userId={user.id}
        />
      </div>
    </div>
  );
}
