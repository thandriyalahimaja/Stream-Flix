import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { validateLoginForm } from '@/utils/validators';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock } from 'lucide-react';

import { useToast } from '@/context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validation = validateLoginForm({ email, password: pwd });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const loggedInUser = await login(email, pwd);
      toast.success(`Logged in successfully! Welcome, ${loggedInUser.name || 'User'}`);
      navigate(ROUTES.HOME);
    } catch (err) {
      const errMsg = err.message || 'Login failed. Please try again.';
      setServerError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthLayout>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold" style={{ color: 'var(--cw-text)' }}>Welcome back</h1>
        <p style={{ color: 'var(--cw-text2)' }} className="mt-2 mb-8">
          Sign in to continue your watch.
        </p>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl text-sm text-red-500" style={{ background: 'color-mix(in srgb, red 10%, transparent)' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@StreamFlix.app"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            id="login-email"
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            error={errors.password}
            id="login-password"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2" style={{ color: 'var(--cw-text2)' }}>
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <a style={{ color: 'var(--cw-button)' }} className="cursor-pointer hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: 'var(--cw-text2)' }}>
          New here?{' '}
          <Link to={ROUTES.REGISTER} style={{ color: 'var(--cw-button)' }} className="font-medium hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
