import { useState } from 'react';
import { Lightbulb, MessageCircle, Sparkles, RefreshCw, Copy, CheckCircle, Send, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

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

interface IdeaGeneratorProps {
  onUseIdea: (idea: AppIdea) => void;
  userId: string;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const CURATED_IDEAS = [
  {
    name: "Habit Tracker",
    purpose: "A simple daily habit tracking app to help users build and maintain positive habits",
    target_audience: "Anyone looking to improve their daily routines and build better habits",
    main_features: "Daily check-ins\nStreak tracking\nHabit categories\nProgress visualization\nReminder notifications",
    design_notes: "Clean, minimal interface with satisfying checkmark animations. Use encouraging colors and celebratory effects for streaks.",
    monetization: "Free with optional premium features for advanced analytics"
  },
  {
    name: "Where Should I Eat?",
    purpose: "A fun decision-making app that randomly picks a restaurant or cuisine type when you can't decide",
    target_audience: "Indecisive diners and food lovers",
    main_features: "Spin wheel animation\nCuisine preferences\nLocation-based suggestions\nHistory of choices\nCustom restaurant list",
    design_notes: "Playful and colorful design with a prominent spin button. Use food emojis and appetizing imagery.",
    monetization: "Free with ads, premium removes ads"
  },
  {
    name: "Quick Note Taker",
    purpose: "Ultra-simple note-taking app with instant access and no distractions",
    target_audience: "Students, professionals, and anyone needing quick note capture",
    main_features: "Instant note creation\nTag system\nSearch functionality\nColor coding\nMarkdown support",
    design_notes: "Minimalist design focusing on speed. Large text area, subtle toolbar, keyboard shortcuts.",
    monetization: "Free with optional cloud sync premium tier"
  },
  {
    name: "Pomodoro Timer Pro",
    purpose: "Productivity timer using the Pomodoro Technique with work/break intervals",
    target_audience: "Students, freelancers, and remote workers",
    main_features: "25-minute work timers\n5-minute break timers\nSession tracking\nDaily statistics\nCustomizable intervals",
    design_notes: "Focus on large, readable timer display. Calming colors for break mode, energetic colors for work mode.",
    monetization: "Free with upgrade for custom sounds and themes"
  },
  {
    name: "Daily Affirmations",
    purpose: "Start each day with a positive affirmation to boost mood and motivation",
    target_audience: "Anyone interested in self-improvement and positive thinking",
    main_features: "Random daily affirmation\nFavorite affirmations\nCustom affirmations\nShare to social media\nReminder scheduling",
    design_notes: "Calming, uplifting design with beautiful background images. Large, readable text.",
    monetization: "Free with in-app purchases for premium affirmation packs"
  },
  {
    name: "Personal Finance Dashboard",
    purpose: "Simple dashboard to track income, expenses, and savings goals",
    target_audience: "Young adults and anyone wanting better financial awareness",
    main_features: "Income/expense tracking\nCategory breakdown\nSavings goals\nMonthly reports\nBudget alerts",
    design_notes: "Clean, professional look with charts and graphs. Green for income, red for expenses.",
    monetization: "Free basic version, premium for advanced reports"
  },
  {
    name: "Random Decision Maker",
    purpose: "Can't decide? Let this app make random choices for you with custom options",
    target_audience: "Indecisive people needing help with daily choices",
    main_features: "Add custom options\nRandom selection\nWeighted choices\nDecision history\nFun animations",
    design_notes: "Playful interface with button or wheel to trigger selection. Celebration animation on result.",
    monetization: "Free with option to remove ads"
  },
  {
    name: "Water Intake Tracker",
    purpose: "Track daily water consumption and stay hydrated with reminders",
    target_audience: "Health-conscious individuals",
    main_features: "Cup/glass logging\nDaily goal setting\nHydration reminders\nProgress visualization\nWeekly reports",
    design_notes: "Fresh, water-themed blue design. Visual water bottle that fills up as you log intake.",
    monetization: "Free with optional premium themes"
  },
  {
    name: "Quote of the Day",
    purpose: "Inspirational quotes delivered daily to motivate and inspire",
    target_audience: "Anyone seeking daily inspiration",
    main_features: "Daily quote delivery\nCategory filters\nFavorite quotes\nShare functionality\nAuthor information",
    design_notes: "Elegant typography with beautiful background images. Easy navigation and sharing.",
    monetization: "Free with ads, premium removes ads"
  },
  {
    name: "Simple To-Do List",
    purpose: "No-frills task management focusing on getting things done",
    target_audience: "Busy professionals and students",
    main_features: "Quick task entry\nCheck off completed tasks\nTask priorities\nDue dates\nTask categories",
    design_notes: "Minimalist design with satisfying task completion animations. Focus on clarity.",
    monetization: "Free with cloud sync as premium feature"
  },
  {
    name: "Mood Tracker",
    purpose: "Track your daily moods and emotions to identify patterns",
    target_audience: "Anyone interested in mental health and self-awareness",
    main_features: "Daily mood logging\nEmotion categories\nMood calendar view\nTrend analysis\nJournal notes",
    design_notes: "Calming, supportive design with color-coded moods. Simple emoji-based input.",
    monetization: "Free with premium analytics features"
  },
  {
    name: "Recipe Box",
    purpose: "Save and organize your favorite recipes in one place",
    target_audience: "Home cooks and food enthusiasts",
    main_features: "Recipe storage\nIngredient lists\nStep-by-step instructions\nCategory tags\nSearch functionality",
    design_notes: "Appetizing design with recipe card layout. Easy to read while cooking.",
    monetization: "Free with ads, premium for unlimited recipes"
  },
  {
    name: "Countdown Timer",
    purpose: "Create custom countdown timers for important events and deadlines",
    target_audience: "Anyone tracking special events, deadlines, or milestones",
    main_features: "Multiple countdowns\nCustom event names\nDate and time selection\nNotifications when timer expires\nWidget display",
    design_notes: "Bold, eye-catching design with large countdown display. Use exciting animations as time approaches zero.",
    monetization: "Free with ads, premium for unlimited countdowns"
  },
  {
    name: "Password Generator",
    purpose: "Generate strong, secure passwords with customizable options",
    target_audience: "Security-conscious users and IT professionals",
    main_features: "Adjustable password length\nCharacter type options\nCopy to clipboard\nPassword strength indicator\nSave generated passwords",
    design_notes: "Professional, secure-looking interface. Use green for strong passwords, red for weak ones.",
    monetization: "Free with option to upgrade for password manager features"
  },
  {
    name: "Study Flashcards",
    purpose: "Create and study digital flashcards for learning and memorization",
    target_audience: "Students and lifelong learners",
    main_features: "Create custom card decks\nFlip animations\nShuffle mode\nProgress tracking\nCategory organization",
    design_notes: "Clean, distraction-free interface with smooth card flip animations. Easy card navigation.",
    monetization: "Free basic version, premium for unlimited decks"
  },
  {
    name: "Gratitude Journal",
    purpose: "Daily gratitude journaling app to cultivate thankfulness and positivity",
    target_audience: "People focused on mindfulness and positive psychology",
    main_features: "Daily journal entries\nPrompts and suggestions\nCalendar view\nReflection history\nReminder notifications",
    design_notes: "Warm, inviting design with soft colors. Use calming background images and encouraging prompts.",
    monetization: "Free with optional premium prompts and themes"
  },
  {
    name: "Workout Timer",
    purpose: "Interval timer for HIIT workouts, circuit training, and exercise routines",
    target_audience: "Fitness enthusiasts and home workout fans",
    main_features: "Custom interval settings\nWork/rest periods\nRound counting\nAudio cues\nPreset workout templates",
    design_notes: "Energetic design with large, readable timers. Bold colors that motivate. Clear audio/visual cues.",
    monetization: "Free with premium workout template library"
  },
  {
    name: "Color Palette Generator",
    purpose: "Generate beautiful color palettes for designers and creators",
    target_audience: "Designers, artists, and creative professionals",
    main_features: "Random palette generation\nHex code display\nCopy to clipboard\nSave favorite palettes\nColor harmony rules",
    design_notes: "Visual, colorful interface showcasing palettes. Large color swatches with easy copying.",
    monetization: "Free with ads, premium for unlimited saved palettes"
  },
  {
    name: "Movie Night Picker",
    purpose: "Randomly select a movie from your watchlist when you can't decide what to watch",
    target_audience: "Movie lovers and indecisive viewers",
    main_features: "Custom movie list\nGenre filtering\nRandom selection\nWatched history\nRating system",
    design_notes: "Fun, cinema-themed design with movie reel graphics. Exciting reveal animation for selection.",
    monetization: "Free with option to remove ads"
  },
  {
    name: "Tip Calculator",
    purpose: "Quick and easy tip calculation with bill splitting features",
    target_audience: "Diners and anyone splitting restaurant bills",
    main_features: "Custom tip percentages\nBill splitting\nRound up option\nTax calculation\nCurrency support",
    design_notes: "Simple, calculator-like interface with large buttons. Clear display of totals and per-person amounts.",
    monetization: "Free with optional premium features"
  }
];

export function IdeaGenerator({ onUseIdea, userId }: IdeaGeneratorProps) {
  const [mode, setMode] = useState<'none' | 'instant' | 'conversational'>('none');
  const [generatedIdea, setGeneratedIdea] = useState<AppIdea | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [conversationStep, setConversationStep] = useState(0);

  const questions = [
    "What are your interests or hobbies? Tell me what you enjoy doing in your free time.",
    "What problems or frustrations do you encounter in your daily life?",
    "Is there something you're passionate about or would like to help others with?",
    "What type of project interests you most? (e.g., productivity tool, game, social app, utility)"
  ];

  const handleInstantGenerate = async () => {
    setLoading(true);
    setMode('instant');

    await new Promise(resolve => setTimeout(resolve, 800));

    const randomIdea = CURATED_IDEAS[Math.floor(Math.random() * CURATED_IDEAS.length)];

    const idea: AppIdea = {
      ...randomIdea,
      user_id: userId
    };

    setGeneratedIdea(idea);
    setLoading(false);
    toast.success('🎉 Here\'s your idea!');
  };

  const handleStartConversation = () => {
    setMode('conversational');
    setMessages([
      {
        role: 'assistant',
        content: questions[0]
      }
    ]);
    setConversationStep(0);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userInput }
    ];
    setMessages(newMessages);
    setUserInput('');

    if (conversationStep < questions.length - 1) {
      const nextStep = conversationStep + 1;
      setConversationStep(nextStep);
      setTimeout(() => {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: questions[nextStep] }
        ]);
      }, 500);
    } else {
      setLoading(true);
      try {
        const userResponses = newMessages
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .join('\n\n');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-idea`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              userResponses,
              mode: 'conversational'
            })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to generate idea');
        }

        const data = await response.json();

        setGeneratedIdea({
          ...data.idea,
          user_id: userId
        });

        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `Perfect! Based on what you've told me, I have the perfect idea for you. Check it out below! 🎉`
          }
        ]);

        toast.success('Your personalized idea is ready!');
      } catch (error) {
        console.error('Error generating idea:', error);
        toast.error('Failed to generate idea. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUseThisIdea = () => {
    if (generatedIdea) {
      onUseIdea(generatedIdea);
      toast.success('Idea loaded into form below!');
    }
  };

  const handleCopyIdea = () => {
    if (generatedIdea) {
      const ideaText = `App Name: ${generatedIdea.name}\n\nPurpose: ${generatedIdea.purpose}\n\nTarget Audience: ${generatedIdea.target_audience}\n\nMain Features:\n${generatedIdea.main_features}\n\nDesign Notes: ${generatedIdea.design_notes}\n\nMonetization: ${generatedIdea.monetization}`;
      navigator.clipboard.writeText(ideaText);
      setCopied(true);
      toast.success('Idea copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setMode('none');
    setGeneratedIdea(null);
    setMessages([]);
    setConversationStep(0);
    setUserInput('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl border border-brand-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 flex-shrink-0" />
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Need an Idea? (Optional step)
          </h2>
        </div>
        {mode !== 'none' && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Start Over
          </button>
        )}
      </div>

      {mode === 'none' && (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Stuck on what to build? Let us help you find the perfect project idea!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={handleInstantGenerate}
              disabled={loading}
              className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-brand-400 to-accent1-400 hover:from-brand-500 hover:to-accent1-500 text-white p-5 sm:p-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(247,138,140,0.5)] transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="text-center">
                <div className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1">Give Me My Idea</div>
                <div className="text-xs sm:text-sm opacity-90">Get a random app idea instantly</div>
              </div>
            </button>

            <button
              onClick={handleStartConversation}
              disabled={loading}
              className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 bg-gradient-to-br from-accent2-400 to-[#00F0FF] hover:from-accent2-500 hover:to-[#00d4e0] text-white p-5 sm:p-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(218,123,180,0.5)] transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110" />
              <div className="text-center">
                <div className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1">Help Me Find an Idea</div>
                <div className="text-xs sm:text-sm opacity-90">Answer a few questions for personalized suggestions</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {loading && mode === 'instant' && (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-12 h-12 text-brand-400 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            Cooking up something amazing...
          </p>
        </div>
      )}

      {mode === 'conversational' && !generatedIdea && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-brand-400 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                  <RefreshCw className="w-5 h-5 text-brand-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your answer..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !userInput.trim()}
              className="px-6 py-3 bg-brand-400 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {generatedIdea && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-gradient-to-br from-brand-50 to-neutral-light dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border-2 border-brand-200 dark:border-brand-700">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {generatedIdea.name}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyIdea}
                  className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-gray-700 dark:text-gray-200">
              <div>
                <span className="font-semibold">Purpose:</span> {generatedIdea.purpose}
              </div>
              <div>
                <span className="font-semibold">Target Audience:</span> {generatedIdea.target_audience}
              </div>
              <div>
                <span className="font-semibold">Main Features:</span>
                <ul className="list-disc list-inside mt-1 ml-2">
                  {generatedIdea.main_features.split('\n').map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold">Design Notes:</span> {generatedIdea.design_notes}
              </div>
              <div>
                <span className="font-semibold">Monetization:</span> {generatedIdea.monetization}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleUseThisIdea}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-400 hover:bg-brand-500 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              Use This Idea
            </button>
            <button
              onClick={mode === 'instant' ? handleInstantGenerate : handleReset}
              className="flex items-center justify-center gap-2 bg-neutral-dark hover:bg-neutral-dark/80 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              {mode === 'instant' ? 'Generate Another' : 'Start Over'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
