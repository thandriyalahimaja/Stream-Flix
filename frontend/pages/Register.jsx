import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useAuth } from '@/context/AuthContext';
import { validateRegisterForm, getPasswordStrength } from '@/utils/validators';
import { ROUTES } from '@/constants/routes';
import { ONBOARDING_MOODS } from '@/constants/genres';
import { User, Mail, Lock } from 'lucide-react';

import { useToast } from '@/context/ToastContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', pwd: '' });
  const [picks, setPicks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const pwdStrength = getPasswordStrength(form.pwd);

  const handleStep1 = () => {
    const validation = validateRegisterForm({ name: form.name, email: form.email, password: form.pwd });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await register(form.name, form.email, form.pwd, picks);
      toast.success(`Registered successfully! Welcome, ${form.name}`);
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthLayout>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl"
      >
        <div
          className="rounded-3xl p-8 md:p-10 glass-strong"
          style={{
            boxShadow: '0 30px 80px -20px color-mix(in srgb, var(--cw-text) 30%, transparent)',
          }}
        >
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--cw-button)', fontSize: 12, letterSpacing: 2 }}>
            STEP {step} OF 2
          </div>
          {/* Progress indicator */}
          <Progress value={step} max={2} size="sm" className="mb-4" />

          <h1 className="text-2xl font-bold" style={{ color: 'var(--cw-text)' }}>
            {step === 1 ? 'Create your account' : 'Pick your moods'}
          </h1>
          <p className="mt-2 mb-8 text-sm" style={{ color: 'var(--cw-text2)' }}>
            {step === 1 ? 'Join StreamFlix in seconds.' : "We'll tune your recommendations to these."}
          </p>

          {step === 1 ? (
            <div className="space-y-4">
              <Input
                label="Full name"
                placeholder="Your name"
                icon={<User size={16} />}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
                id="register-name"
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@email.com"
                icon={<Mail size={16} />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                id="register-email"
                autoComplete="username"
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 chars, uppercase, lowercase, number"
                  icon={<Lock size={16} />}
                  value={form.pwd}
                  onChange={(e) => setForm({ ...form, pwd: e.target.value })}
                  error={errors.password}
                  id="register-password"
                  autoComplete="new-password"
                />
                {form.pwd && (
                  <div className="mt-3 space-y-2 rounded-2xl p-4 border" style={{ background: 'var(--cw-card)', borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(pwdStrength.score / 5) * 100}%`, background: pwdStrength.color }}
                        />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px]" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 6%, transparent)', color: 'var(--cw-text2)' }}>
                      <div className="flex items-center gap-1.5">
                        <span className={form.pwd.length >= 8 ? "text-emerald-400 font-bold" : "text-red-400"}>
                          {form.pwd.length >= 8 ? '✓' : '✗'}
                        </span>
                        <span>Min 8 characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={/[A-Z]/.test(form.pwd) ? "text-emerald-400 font-bold" : "text-red-400"}>
                          {/[A-Z]/.test(form.pwd) ? '✓' : '✗'}
                        </span>
                        <span>Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={/[a-z]/.test(form.pwd) ? "text-emerald-400 font-bold" : "text-red-400"}>
                          {/[a-z]/.test(form.pwd) ? '✓' : '✗'}
                        </span>
                        <span>Lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={/[0-9]/.test(form.pwd) ? "text-emerald-400 font-bold" : "text-red-400"}>
                          {/[0-9]/.test(form.pwd) ? '✓' : '✗'}
                        </span>
                        <span>One number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={handleStep1} className="w-full" size="lg">
                Continue
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2">
                {ONBOARDING_MOODS.map((m) => {
                  const on = picks.includes(m);
                  return (
                    <motion.button
                      key={m}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setPicks((p) => (on ? p.filter((x) => x !== m) : [...p, m]))
                      }
                      className="px-4 py-2 rounded-full text-sm transition-colors"
                      style={{
                        background: on ? 'var(--cw-button)' : 'var(--cw-bg)',
                        color: on ? 'white' : 'var(--cw-text)',
                      }}
                    >
                      {m}
                    </motion.button>
                  );
                })}
              </div>
              <Button onClick={handleFinish} className="w-full mt-8" size="lg" loading={loading}>
                Enter StreamFlix
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--cw-text2)' }}>
            Have an account?{' '}
            <Link to={ROUTES.LOGIN} style={{ color: 'var(--cw-button)' }} className="font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
