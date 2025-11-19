import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export const SignupPage = () => {
    const [formData, setFormData] = useState<SignupFormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false,
        marketingOptIn: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [authError, setAuthError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');

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
        if (authError) {
            setAuthError('');
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

        if (!formData.agreedToTerms) {
            newErrors.agreedToTerms = 'You must agree to the terms and conditions';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // TODO: API integration
        setIsLoading(true);
        console.log('Signup form submitted:', formData);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Navigate to onboarding or show error
        }, 1500);
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

                {/* Terms & Marketing Checkboxes */}
                <div className="space-y-3 mt-6 mb-6">
                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3">
                        <input
                            id="agreedToTerms"
                            name="agreedToTerms"
                            type="checkbox"
                            checked={formData.agreedToTerms}
                            onChange={handleChange}
                            className="h-4 w-4 mt-0.5 rounded border-white/20 bg-navy/50 checked:bg-coral checked:border-coral focus:ring-2 focus:ring-coral/20 cursor-pointer"
                        />
                        <label
                            htmlFor="agreedToTerms"
                            className="text-[13px] text-warm-gray/90 leading-relaxed cursor-pointer"
                        >
                            I agree to the{' '}
                            <Link to="/terms" className="text-coral hover:underline">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-coral hover:underline">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>
                    {errors.agreedToTerms && (
                        <p className="text-[13px] text-red-400 ml-7 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {errors.agreedToTerms}
                        </p>
                    )}

                    {/* Marketing Checkbox */}
                    <div className="flex items-start gap-3">
                        <input
                            id="marketingOptIn"
                            name="marketingOptIn"
                            type="checkbox"
                            checked={formData.marketingOptIn}
                            onChange={handleChange}
                            className="h-4 w-4 mt-0.5 rounded border-white/20 bg-navy/50 checked:bg-coral checked:border-coral focus:ring-2 focus:ring-coral/20 cursor-pointer"
                        />
                        <label
                            htmlFor="marketingOptIn"
                            className="text-[13px] text-warm-gray/90 leading-relaxed cursor-pointer"
                        >
                            Send me product updates and tips
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isLoading || !formData.agreedToTerms}
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

                {/* Divider */}
                <div className="relative my-8">
                    <div className="border-t border-white/10" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-charcoal/80 px-4 text-[12px] text-warm-gray/60 uppercase tracking-wider">
                        or continue with
                    </span>
                </div>

                {/* Social Signup Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        className="h-11 bg-navy/50 border border-white/15 hover:bg-navy/70 hover:border-white/25 rounded-xl flex items-center justify-center gap-2 text-[14px] text-warm-gray transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </button>
                    <button
                        type="button"
                        className="h-11 bg-navy/50 border border-white/15 hover:bg-navy/70 hover:border-white/25 rounded-xl flex items-center justify-center gap-2 text-[14px] text-warm-gray transition-all"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                    </button>
                </div>

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
