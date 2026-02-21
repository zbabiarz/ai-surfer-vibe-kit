import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    return digits.length === 10;
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const digits = value.replace(/\D/g, '');

    if (digits.length > 10) {
      return;
    }

    let formattedPhone = digits;
    if (digits.length >= 6) {
      formattedPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      formattedPhone = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }

    setPhone(formattedPhone);
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

    if (isSignUp) {
      if (!trimmedName) {
        toast.error('Full name is required');
        return;
      }

      if (!trimmedPhone) {
        toast.error('Phone number is required');
        return;
      }

      if (!validatePhone(trimmedPhone)) {
        toast.error('Please enter exactly 10 digits for your US phone number');
        return;
      }
    }


    if (isSignUp) {
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

      if (isSignUp) {
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
              phone: formatPhone(trimmedPhone),
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
          setIsSignUp(false);
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
              icon: '⚠️'
            });
            return;
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Please confirm your email address before signing in. Check your inbox for the confirmation link.', {
              duration: 5000,
              icon: '📧'
            });
            return;
          } else {
            throw new Error('Unable to sign in. Please try again later.');
          }
        }

        toast.success('Successfully signed in!');
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 4000
      });
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-brand-400 dark:bg-brand-500 rounded-lg shadow-lg max-w-md mx-auto transition-colors">
      <img
        src="https://storage.googleapis.com/msgsndr/QFjnAi2H2A9Cpxi7l0ri/media/699097ce772de9472c02c5ac.png"
        alt="Welcome to The AI Surfer"
        className="h-48 object-contain mb-6"
      />
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setEmail('');
            setPassword('');
          }}
          className={`px-6 py-2 rounded-lg transition-colors border-2 font-medium ${
            !isSignUp
              ? 'bg-white text-black border-white'
              : 'bg-black text-white border-black hover:bg-gray-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setEmail('');
            setPassword('');
          }}
          className={`px-6 py-2 rounded-lg transition-colors border-2 font-medium ${
            isSignUp
              ? 'bg-white text-black border-white'
              : 'bg-black text-white border-black hover:bg-gray-800'
          }`}
        >
          Create Account
        </button>
      </div>
      <p className="text-white dark:text-white mb-6 text-center transition-colors">
        {isSignUp ? 'Create a new account to get started' : 'Welcome back! Sign in to continue'}
      </p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-1 transition-colors">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter full name here"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={isSignUp}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>
        )}
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-white dark:text-white mb-1 transition-colors">
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="Enter valid phone number here"
              value={phone}
              onChange={handlePhoneChange}
              required={isSignUp}
              maxLength={14}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
            />
            <p className="mt-1 text-xs text-white/80 dark:text-white/80">
              Enter exactly 10 digits for your US phone number
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
            placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          />
          {isSignUp && (
            <div className="mt-2 text-sm text-white transition-colors">
              <p className={password.length >= 6 ? 'text-green-800' : 'text-red-800'}>
                  At least 6 characters
              </p>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
        {isSignUp && (
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
  );
}
