import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { ShieldCheck, Zap, Brain } from 'lucide-react';
import type { LoginFormData, FormErrors } from '@/types/auth.types';
import { validateEmail, validatePassword } from '@/lib/validation';
import { useAuthStore } from '@/stores/auth.store';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, error: storeError, isLoading: storeLoading } = useAuthStore();

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);

    const authError = storeError || '';
    const isLoading = storeLoading;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const newErrors: FormErrors = {};
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await login(formData);
            // Navigate to chat dashboard on success
            navigate('/chat');
        } catch (error) {
            // Error is handled by the store
            console.error('Login error:', error);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to continue your productivity journey"
            leftContent={{
                headline: 'Pick up where you left off',
                subheadline:
                    'Your AI assistant remembers your preferences and is ready to help you accomplish more.',
                features: [
                    {
                        icon: ShieldCheck,
                        text: 'Enterprise-grade security',
                    },
                    {
                        icon: Zap,
                        text: 'Instant access across devices',
                    },
                    {
                        icon: Brain,
                        text: 'Personalized AI that learns from you',
                    },
                ],
            }}
            navLink={{
                text: "Don't have an account?",
                linkText: 'Sign up free',
                href: '/signup',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Global Error Message */}
                {authError && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 p-4 pl-3 rounded-lg flex items-start gap-3 mb-6">
                        <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[14px] text-red-400">{authError}</p>
                    </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                    <label htmlFor="email" className="text-[14px] font-medium text-cream">
                        Email address
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40">
                            <Mail size={18} />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`h-[50px] w-full pl-11 pr-4 bg-navy/50 border rounded-xl text-cream text-[15px] placeholder:text-warm-gray/40 focus:outline-none focus:ring-2 transition-all duration-200 ${errors.email
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-white/15 focus:border-coral focus:ring-coral/20'
                                }`}
                            placeholder="you@example.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-[13px] text-red-400 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <label htmlFor="password" className="text-[14px] font-medium text-cream">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40">
                            <Lock size={18} />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            className={`h-[50px] w-full pl-11 pr-12 bg-navy/50 border rounded-xl text-cream text-[15px] placeholder:text-warm-gray/40 focus:outline-none focus:ring-2 transition-all duration-200 ${errors.password
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-white/15 focus:border-coral focus:ring-coral/20'
                                }`}
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40 hover:text-warm-gray hover:bg-white/5 rounded-lg p-1.5 transition-all"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-[13px] text-red-400 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mt-4 mb-6">
                    <div className="flex items-center gap-2">
                        <input
                            id="rememberMe"
                            name="rememberMe"
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-white/20 bg-navy/50 checked:bg-coral checked:border-coral focus:ring-2 focus:ring-coral/20 cursor-pointer"
                        />
                        <label
                            htmlFor="rememberMe"
                            className="text-[13px] text-warm-gray cursor-pointer"
                        >
                            Remember me
                        </label>
                    </div>

                    <Link
                        to="/forgot-password"
                        className="text-[13px] text-coral hover:text-coral/80 hover:underline font-medium transition-all"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[52px] bg-coral hover:bg-coral/90 text-navy text-[15px] font-semibold rounded-xl shadow-lg shadow-coral/20 hover:shadow-xl hover:shadow-coral/30 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-coral focus-visible:outline-offset-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Logging in...
                        </>
                    ) : (
                        'Log in'
                    )}
                </Button>

                {/* Sign Up Link */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center text-[14px] text-warm-gray">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-coral font-medium hover:underline transition-all"
                    >
                        Sign up free
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};
