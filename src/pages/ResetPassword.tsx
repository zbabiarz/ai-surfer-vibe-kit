import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
      } finally {
        setChecking(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setChecking(false);
        setError(null);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Password updated successfully!');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-light dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-brand-400 dark:bg-brand-500 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-light dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-brand-400 dark:bg-brand-500 rounded-lg shadow-lg p-8 max-w-md w-full">
          <img
            src="https://storage.googleapis.com/msgsndr/QFjnAi2H2A9Cpxi7l0ri/media/699097ce772de9472c02c5ac.png"
            alt="The AI Surfer"
            className="h-32 object-contain mx-auto mb-6"
          />
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
            <h2 className="text-xl font-bold text-white">Reset Link Expired</h2>
          </div>
          <p className="text-white/90 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-light dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-brand-400 dark:bg-brand-500 rounded-lg shadow-lg p-8 max-w-md w-full">
          <img
            src="https://storage.googleapis.com/msgsndr/QFjnAi2H2A9Cpxi7l0ri/media/699097ce772de9472c02c5ac.png"
            alt="The AI Surfer"
            className="h-32 object-contain mx-auto mb-6"
          />
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
            <h2 className="text-xl font-bold text-white">Password Updated!</h2>
          </div>
          <p className="text-white/90 text-center mb-4">
            Your password has been successfully reset. You'll be redirected to sign in shortly.
          </p>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-brand-400 dark:bg-brand-500 rounded-lg shadow-lg p-8 max-w-md w-full">
        <img
          src="https://storage.googleapis.com/msgsndr/QFjnAi2H2A9Cpxi7l0ri/media/699097ce772de9472c02c5ac.png"
          alt="The AI Surfer"
          className="h-32 object-contain mx-auto mb-6"
        />

        <div className="flex items-center justify-center gap-3 mb-2">
          <Lock className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Create New Password</h2>
        </div>

        <p className="text-white/90 text-center text-sm mb-6">
          Enter your new password below. Make sure it's at least 6 characters.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-900"
            />
            <div className="mt-2 text-sm">
              <p className={password.length >= 6 ? 'text-green-200' : 'text-red-200'}>
                At least 6 characters
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white text-gray-900"
            />
            {confirmPassword && (
              <div className="mt-2 text-sm">
                <p className={password === confirmPassword ? 'text-green-200' : 'text-red-200'}>
                  {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 flex items-center justify-center gap-2 text-white/90 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
