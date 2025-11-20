import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
    User,
    X,
    Check,
} from 'lucide-react';
import { Sparkles, ShieldCheck, Users } from 'lucide-react';
import type { SignupFormData, FormErrors, PasswordStrength } from '@/types/auth.types';
import {
    validateEmail,
    validatePassword,
    validateFullName,
    validatePasswordMatch,
} from '@/lib/validation';
import {
    calculatePasswordStrength,
    checkPasswordRequirements,
    getPasswordStrengthColor,
} from '@/lib/password';
import { useAuthStore } from '@/stores/auth.store';

export const SignupPage = () => {
    const navigate = useNavigate();
    const { signup, error: storeError, isLoading: storeLoading } = useAuthStore();

    const [formData, setFormData] = useState<SignupFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false,
        marketingOptIn: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');

    const authError = storeError || '';
    const isLoading = storeLoading;

    const passwordRequirements = checkPasswordRequirements(formData.password);

    useEffect(() => {
        if (formData.password) {
            setPasswordStrength(calculatePasswordStrength(formData.password));
        }
    }, [formData.password]);

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
        const nameError = validateFullName(formData.fullName);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validatePasswordMatch(
            formData.password,
            formData.confirmPassword
        );

        if (nameError) newErrors.fullName = nameError;
        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

        // Check if all password requirements are met
        const allRequirementsMet = passwordRequirements.every((req) => req.met);
        if (!allRequirementsMet) {
            newErrors.password = 'Password does not meet all requirements';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await signup({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
            });
            // Navigate to home/dashboard on success
            navigate('/');
        } catch (error) {
            // Error is handled by the store
            console.error('Signup error:', error);
        }
    };

    const strengthColor = getPasswordStrengthColor(passwordStrength);

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start working smarter with your AI assistant"
            leftContent={{
                headline: 'Your intelligent workspace awaits',
                subheadline:
                    'Join thousands of professionals using AI to enhance their productivity and streamline their workflow.',
                features: [
                    {
                        icon: Sparkles,
                        text: 'Free 14-day trial, no credit card',
                    },
                    {
                        icon: ShieldCheck,
                        text: 'Bank-level encryption & privacy',
                    },
                    {
                        icon: Users,
                        text: 'Join 10,000+ active users',
                    },
                ],
            }}
            navLink={{
                text: 'Already have an account?',
                linkText: 'Log in',
                href: '/login',
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

                {/* Full Name Field */}
                <div className="space-y-2">
                    <label htmlFor="fullName" className="text-[14px] font-medium text-cream">
                        Full name
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40">
                            <User size={18} />
                        </div>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`h-[50px] w-full pl-11 pr-4 bg-navy/50 border rounded-xl text-cream text-[15px] placeholder:text-warm-gray/40 focus:outline-none focus:ring-2 transition-all duration-200 ${errors.fullName
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-white/15 focus:border-coral focus:ring-coral/20'
                                }`}
                            placeholder="John Doe"
                        />
                    </div>
                    {errors.fullName && (
                        <p className="text-[13px] text-red-400 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {errors.fullName}
                        </p>
                    )}
                </div>

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
                            placeholder="Create a strong password"
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

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="mt-3 space-y-2">
                            {/* Strength Bar */}
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${strengthColor.bg} transition-all duration-300 ${strengthColor.width}`}
                                />
                            </div>
                            <p className={`text-[12px] ${strengthColor.text}`}>
                                Password strength: <span className="font-medium capitalize">{passwordStrength}</span>
                            </p>
                        </div>
                    )}

                    {/* Password Requirements Checklist */}
                    {formData.password && (
                        <div className="mt-3 space-y-1.5 bg-navy/30 border border-white/10 rounded-lg p-3">
                            {passwordRequirements.map((requirement) => (
                                <div key={requirement.id} className="flex items-center gap-2">
                                    {requirement.met ? (
                                        <Check size={14} className="text-green-400" />
                                    ) : (
                                        <X size={14} className="text-warm-gray/30" />
                                    )}
                                    <span
                                        className={`text-[12px] transition-colors ${requirement.met ? 'text-warm-gray' : 'text-warm-gray/60'
                                            }`}
                                    >
                                        {requirement.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.password && (
                        <p className="text-[13px] text-red-400 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <label
                        htmlFor="confirmPassword"
                        className="text-[14px] font-medium text-cream"
                    >
                        Confirm password
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40">
                            <Lock size={18} />
                        </div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`h-[50px] w-full pl-11 pr-12 bg-navy/50 border rounded-xl text-cream text-[15px] placeholder:text-warm-gray/40 focus:outline-none focus:ring-2 transition-all duration-200 ${errors.confirmPassword
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : formData.confirmPassword &&
                                    formData.password === formData.confirmPassword
                                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                                    : 'border-white/15 focus:border-coral focus:ring-coral/20'
                                }`}
                            placeholder="Re-enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40 hover:text-warm-gray hover:bg-white/5 rounded-lg p-1.5 transition-all"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-[13px] text-red-400 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[52px] bg-coral hover:bg-coral/90 text-navy text-[15px] font-semibold rounded-xl shadow-lg shadow-coral/20 hover:shadow-xl hover:shadow-coral/30 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-coral focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Creating account...
                        </>
                    ) : (
                        'Create account'
                    )}
                </Button>

                {/* Login Link */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center text-[14px] text-warm-gray">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-coral font-medium hover:underline transition-all"
                    >
                        Log in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};
