import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, ArrowLeft, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { countryCodes, CountryCode } from '../data/countryCodes';

type AuthView = 'signin' | 'signup' | 'forgot-password';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [view, setView] = useState<AuthView>('signin');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return ['at least 6 characters'];
    }
    return [];
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 6 && digits.length <= 15;
  };

  const formatPhoneForStorage = (phone: string, country: CountryCode) => {
    const digits = phone.replace(/\D/g, '');
    return `${country.dialCode} ${digits}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 15) {
      setPhone(digits);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail) {
      toast.error('Email address is required');
      return;
    }

    if (!password) {
      toast.error('Password is required');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address (e.g., user@example.com)');
      return;
    }

    if (view === 'signup') {
      if (!trimmedName) {
        toast.error('Full name is required');
        return;
      }

      if (!trimmedPhone) {
        toast.error('Phone number is required');
        return;
      }

      if (!validatePhone(trimmedPhone)) {
        toast.error('Please enter a valid phone number (6-15 digits)');
        return;
      }

      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        toast.error(`Password must contain ${passwordErrors.join(', ')}`);
        return;
      }

      if (!agreedToTerms) {
        toast.error('Please agree to the terms and conditions to create an account');
        return;
      }
    }

    try {
      setLoading(true);

      if (view === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          } else {
            throw new Error('Unable to create account. Please try again.');
          }
        }

        if (data?.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name: trimmedName,
              phone: formatPhoneForStorage(trimmedPhone, selectedCountry),
              email: trimmedEmail,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            toast.error('Account created but profile setup incomplete. Please contact support.');
            return;
          }
        }

        if (data?.user) {
          toast.success('Account created! You can now sign in');
          setView('signin');
          setEmail('');
          setPassword('');
          setName('');
          setPhone('');
          setAgreedToTerms(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        if (error) {
          if (error.message === 'Invalid login credentials') {
            toast.error('Invalid email or password. Please check your credentials and try again.', {
              duration: 5000,
            });
            return;
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Please confirm your email address before signing in. Check your inbox for the confirmation link.', {
              duration: 5000,
            });
            return;
          } else {
            throw new Error('Unable to sign in. Please try again later.');
          }
        }

        toast.success('Successfully signed in!');
      }
    } catch (error) {
      toast.error((error as Error).message, {
        duration: 4000
      });
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setEmail('');
    setPassword('');
    setResetEmailSent(false);
  };

  if (view === 'forgot-password') {
    return (
      <div className="min-h-screen w-full bg-brand-400 dark:bg-brand-500 flex items-center justify-center p-4 transition-colors">
        <div className="flex flex-col items-center justify-center p-8 bg-brand-400 dark:bg-brand-500 rounded-lg shadow-lg max-w-md w-full transition-colors">
        <img
          src="https://assets.cdn.filesafe.space/QFjnAi2H2A9Cpxi7l0ri/media/69a1f6a06e50d655f82ba763.jpg"
          alt="Welcome to The AI Surfer"
          className="h-48 object-contain mb-6"
        />

        <button
          onClick={() => switchView('signin')}
          className="self-start flex items-center gap-2 text-white hover:text-white/80 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Reset Your Password</h2>

        {resetEmailSent ? (
          <div className="text-center">
            <div className="bg-white/20 rounded-lg p-6 mb-4">
              <p className="text-white mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-white/80 text-sm">
                Check your inbox and click the link to reset your password. The link will expire in 1 hour.
              </p>
            </div>
            <button
              onClick={() => {
                setResetEmailSent(false);
                setEmail('');
              }}
              className="text-white underline hover:text-white/80 text-sm"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <>
            <p className="text-white/90 mb-6 text-center text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-900"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-brand-400 dark:bg-brand-500 flex items-center justify-center p-4 transition-colors">
      <div className="flex flex-col items-center justify-center p-8 bg-brand-400 dark:bg-brand-500 rounded-lg shadow-lg max-w-md w-full transition-colors">
      <img
        src="https://assets.cdn.filesafe.space/QFjnAi2H2A9Cpxi7l0ri/media/69a1f6a06e50d655f82ba763.jpg"
        alt="Welcome to The AI Surfer"
        className="h-48 object-contain mb-6"
      />
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => switchView('signin')}
          className={`px-6 py-2 rounded-lg transition-colors border-2 font-medium ${
            view === 'signin'
              ? 'bg-white text-black border-white'
              : 'bg-black text-white border-black hover:bg-gray-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchView('signup')}
          className={`px-6 py-2 rounded-lg transition-colors border-2 font-medium ${
            view === 'signup'
              ? 'bg-white text-black border-white'
              : 'bg-black text-white border-black hover:bg-gray-800'
          }`}
        >
          Create Account
        </button>
      </div>
      <p className="text-white dark:text-white mb-6 text-center transition-colors">
        {view === 'signup' ? 'Create a new account to get started' : 'Welcome back! Sign in to continue'}
      </p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {view === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-1 transition-colors">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter full name here"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={view === 'signup'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>
        )}
        {view === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-1 transition-colors">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 min-w-[100px] justify-between"
                >
                  <span className="text-sm">{selectedCountry.dialCode}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex justify-between items-center ${
                          selectedCountry.code === country.code ? 'bg-brand-100 dark:bg-brand-900/30' : ''
                        }`}
                      >
                        <span className="text-gray-900 dark:text-gray-100">{country.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">{country.dialCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={handlePhoneChange}
                required={view === 'signup'}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              />
            </div>
            <p className="mt-1 text-xs text-white/80 dark:text-white/80">
              Select your country and enter your phone number
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-white dark:text-white mb-1 transition-colors">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white dark:text-white mb-1 transition-colors">
            Password *
          </label>
          <input
            type="password"
            placeholder={view === 'signup' ? "Create a strong password" : "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={view === 'signup' ? "new-password" : "current-password"}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          />
          {view === 'signup' && (
            <div className="mt-2 text-sm text-white transition-colors">
              <p className={password.length >= 6 ? 'text-green-800' : 'text-red-800'}>
                  At least 6 characters
              </p>
            </div>
          )}
        </div>

        {view === 'signin' && (
          <button
            type="button"
            onClick={() => switchView('forgot-password')}
            className="text-white/90 hover:text-white text-sm underline transition-colors"
          >
            Forgot your password?
          </button>
        )}

        <button
          type="submit"
          className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : (view === 'signup' ? 'Create Account' : 'Sign In')}
        </button>
        {view === 'signup' && (
          <div className="flex items-start gap-2 mt-3">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 text-brand-400 focus:ring-brand-400 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-[10px] leading-tight text-white/90 dark:text-white/90 cursor-pointer">
              By submitting this form, I agree to receive calls, text messages, and emails from The AI Surfer regarding my inquiry, appointments, and related services. Message frequency may vary. Msg & data rates may apply. I can opt out at any time. View our Privacy Policy and Terms & Conditions.
            </label>
          </div>
        )}
      </form>
      </div>
    </div>
  );
}
