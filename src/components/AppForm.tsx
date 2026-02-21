import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Trash2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { IdeaValidator } from './IdeaValidator';

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

interface AppFormProps {
  userId: string;
  onGeneratePrompt?: (prompt: string) => void;
  selectedIdea?: AppIdea | null;
}

export function AppForm({ userId, onGeneratePrompt, selectedIdea }: AppFormProps) {
  const [formData, setFormData] = useState<AppIdea>({
    name: '',
    purpose: '',
    target_audience: '',
    main_features: '',
    design_notes: '',
    monetization: '',
    user_id: userId,
  });

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingName, setGeneratingName] = useState(false);

  useEffect(() => {
    if (selectedIdea) {
      setFormData({
        ...selectedIdea,
        user_id: userId,
      });
      toast.success('Idea loaded into form');
    }
  }, [selectedIdea, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveData = async () => {
    try {
      setSaving(true);

      const dataToSave = {
        name: formData.name,
        purpose: formData.purpose,
        target_audience: formData.target_audience,
        main_features: formData.main_features,
        design_notes: formData.design_notes,
        monetization: formData.monetization,
        user_id: userId,
      };

      let error;

      if (selectedIdea?.id) {
        const { error: updateError } = await supabase
          .from('app_ideas')
          .update(dataToSave)
          .eq('id', selectedIdea.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('app_ideas')
          .insert(dataToSave);
        error = insertError;
      }

      if (error) throw error;

      setFormData({
        name: '',
        purpose: '',
        target_audience: '',
        main_features: '',
        design_notes: '',
        monetization: '',
        user_id: userId,
      });

      toast.success(selectedIdea?.id ? 'Idea updated!' : 'New idea saved!');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const generatePrompt = async () => {
    if (!formData.name && !formData.purpose) {
      toast.error('Please fill in the App Name or the "What does your app do?" field first.');
      return;
    }

    const currentData = { ...formData };

    try {
      setGenerating(true);

      await saveData();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnonKey;

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-prompt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          name: currentData.name || '',
          purpose: currentData.purpose || '',
          target_audience: currentData.target_audience || '',
          main_features: currentData.main_features || '',
          design_notes: currentData.design_notes || '',
          monetization: currentData.monetization || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Edge Function returned a non-2xx status code (${res.status})`);
      }

      const data = await res.json();

      if (!data?.prompt) {
        throw new Error('No prompt received from the server');
      }

      if (onGeneratePrompt) {
        onGeneratePrompt(data.prompt);
      }
      toast.success('Prompt generated successfully!');
    } catch (error) {
      console.error('Error generating prompt:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to generate prompt. Please try again.';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setGenerating(false);
    }
  };

  const generateAppName = async () => {
    if (!formData.purpose || formData.purpose.trim().length === 0) {
      toast.error('Describe what your app does first', { duration: 3000 });
      return;
    }

    try {
      setGeneratingName(true);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnonKey;

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-app-name`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          purpose: formData.purpose,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to generate name (${res.status})`);
      }

      const data = await res.json();

      if (!data?.name) {
        throw new Error('No name received from the server');
      }

      setFormData(prev => ({ ...prev, name: data.name }));
      toast.success('App name generated!');
    } catch (error) {
      console.error('Error generating app name:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to generate app name. Please try again.';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setGeneratingName(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-brand-50/30 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl shadow-xl border border-brand-200/50 dark:border-gray-700/50 app-form transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-extrabold uppercase bg-gradient-to-r from-brand-400 to-accent1-400 dark:from-brand-400 dark:to-accent1-400 bg-clip-text text-transparent">Plan Your App Idea</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={saveData}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving ? 'Saving...' : selectedIdea?.id ? 'Update Idea' : 'Save New Idea'}
            </span>
          </button>
          <button
            onClick={() => setFormData({
              name: '',
              purpose: '',
              target_audience: '',
              main_features: '',
              design_notes: '',
              monetization: '',
              user_id: userId,
            })}
            className="flex items-center gap-2 bg-neutral-dark hover:bg-neutral-dark/80 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm font-medium whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Form</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors group-hover:text-brand-400 dark:group-hover:text-brand-400">
              App (or Web App) Name
            </label>
            <button
              type="button"
              onClick={generateAppName}
              disabled={generatingName}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generatingName ? 'Generating...' : 'Generate random name'}</span>
            </button>
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-brand-400 shadow-sm"
            placeholder="What's your app called?"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-hover:text-brand-400 dark:group-hover:text-brand-400">
            What does your app do?
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-brand-400 shadow-sm resize-y min-h-[80px]"
            placeholder="Describe the main purpose of your app..."
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              'Manage tasks and to-dos',
              'Track time and habits',
              'Organize projects',
              'Connect people with similar interests',
              'Share photos and videos',
              'Schedule appointments',
              'Manage inventory',
              'Track sales and revenue',
              'Generate invoices',
              'Track workouts and fitness',
              'Monitor health metrics',
              'Plan meals and nutrition',
              'Learn new skills',
              'Practice languages',
              'Play games',
              'Stream content',
              'Track expenses and budgets',
              'Manage investments',
              'Split bills with friends',
              'Find recipes',
              'Plan travel',
              'Track collections',
              'Compare prices',
              'Create shopping lists',
              'Edit photos',
              'Create designs',
              'Write and journal',
              'Book services',
              'Rate and review',
              'Find local events'
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const currentValue = formData.purpose;
                  const newValue = currentValue
                    ? `${currentValue}\n${suggestion}`
                    : suggestion;
                  setFormData(prev => ({ ...prev, purpose: newValue }));
                }}
                className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100 font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/70 transition-colors border border-blue-300 dark:border-blue-700 hover:scale-105 transform duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-hover:text-brand-400 dark:group-hover:text-brand-400">
            Target Audience
          </label>
          <textarea
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-brand-400 shadow-sm resize-y min-h-[60px]"
            placeholder="Who is this app for?"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              'Business owners',
              'Small businesses',
              'Enterprise companies',
              'Dentists',
              'Healthcare professionals',
              'Home services',
              'Restaurants',
              'Retail stores',
              'Freelancers',
              'Students',
              'Teachers',
              'Parents',
              'Children',
              'Teenagers',
              'Adults',
              'Elderly',
              'Seniors',
              'Young professionals',
              'Developers',
              'Designers',
              'Marketers',
              'Fitness enthusiasts',
              'Gamers',
              'Pet owners',
              'Homeowners',
              'Renters',
              'Remote workers',
              'Event planners'
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const currentValue = formData.target_audience;
                  const newValue = currentValue
                    ? `${currentValue}\n${suggestion}`
                    : suggestion;
                  setFormData(prev => ({ ...prev, target_audience: newValue }));
                }}
                className="px-3 py-1.5 text-sm bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-100 font-medium rounded-full hover:bg-teal-200 dark:hover:bg-teal-800/70 transition-colors border border-teal-300 dark:border-teal-700 hover:scale-105 transform duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-hover:text-brand-400 dark:group-hover:text-brand-400">
            Main Features
          </label>
          <textarea
            name="main_features"
            value={formData.main_features}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-brand-400 shadow-sm resize-y min-h-[100px]"
            placeholder="List the key features of your app..."
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              'Ability to upload a photo',
              'Add a timer',
              'Settings option',
              'User authentication',
              'Search functionality',
              'Push notifications',
              'Social media sharing',
              'Save favorites',
              'Export data',
              'Dark mode toggle',
              'Filter and sort options',
              'Real-time updates',
              'Offline mode support',
              'Chat or messaging',
              'Payment integration'
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const currentValue = formData.main_features;
                  const newValue = currentValue
                    ? `${currentValue}\n${suggestion}`
                    : suggestion;
                  setFormData(prev => ({ ...prev, main_features: newValue }));
                }}
                className="px-3 py-1.5 text-sm bg-brand-100 dark:bg-brand-900/50 text-brand-800 dark:text-brand-100 font-medium rounded-full hover:bg-brand-200 dark:hover:bg-brand-800/70 transition-colors border border-brand-300 dark:border-brand-700 hover:scale-105 transform duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-hover:text-brand-400 dark:group-hover:text-brand-400">
            Design Notes
          </label>
          <textarea
            name="design_notes"
            value={formData.design_notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-brand-400 shadow-sm resize-y min-h-[80px]"
            placeholder="Notes about the app's design, UI/UX ideas..."
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              'Clean design',
              'Mobile friendly',
              'Simple UI/UX',
              'Use basic colors: black, white, and gray',
              'Minimalist layout',
              'Dark mode support',
              'Modern and professional',
              'Intuitive navigation',
              'Accessible design',
              'Responsive across all devices',
              'Fast loading animations',
              'Card-based layout'
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const currentValue = formData.design_notes;
                  const newValue = currentValue
                    ? `${currentValue}\n${suggestion}`
                    : suggestion;
                  setFormData(prev => ({ ...prev, design_notes: newValue }));
                }}
                className="px-3 py-1.5 text-sm bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-100 font-medium rounded-full hover:bg-pink-200 dark:hover:bg-pink-800/70 transition-colors border border-pink-300 dark:border-pink-700 hover:scale-105 transform duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-hover:text-brand-400 dark:group-hover:text-brand-400">
            Monetization Strategy
          </label>
          <textarea
            name="monetization"
            value={formData.monetization}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-brand-400 shadow-sm resize-y min-h-[60px]"
            placeholder="How will the app make money?"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              'Ad space for ad revenue',
              'Free to use with upsells built in',
              'Credit system',
              'Free to use',
              'Subscription model',
              'One-time purchase',
              'Freemium model',
              'In-app purchases',
              'Sponsored content',
              'Affiliate marketing',
              'Premium features',
              'Pay per use',
              'White label licensing',
              'Enterprise tier'
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const currentValue = formData.monetization;
                  const newValue = currentValue
                    ? `${currentValue}\n${suggestion}`
                    : suggestion;
                  setFormData(prev => ({ ...prev, monetization: newValue }));
                }}
                className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100 font-medium rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/70 transition-colors border border-purple-300 dark:border-purple-700 hover:scale-105 transform duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <IdeaValidator formData={formData} />
            <div className="flex justify-end">
              <button
                onClick={generatePrompt}
                disabled={generating}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-400 to-accent1-400 hover:from-brand-500 hover:to-accent1-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base whitespace-nowrap"
                style={{ boxShadow: '0 4px 20px rgba(247, 138, 140, 0.4)' }}
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {generating ? 'Generating...' : 'Generate Prompt'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}