# Authentication Pages Documentation (Web App Version)

## Overview
The authentication system consists of two main pages (Login and Signup) that share a common layout component (`AuthLayout`). Both pages feature a split-screen design with animated hero content on the left and a form card on the right, optimized for a web-based AI assistant experience.

---

## Shared Layout: AuthLayout

**File**: `AuthLayout.tsx`

### Layout Structure
```
AuthLayout
├── Header (fixed navigation)
│   ├── Logo (left)
│   └── Nav link (right)
└── Main Content (split-screen)
    ├── Left Side (hero content) - hidden on mobile
    │   ├── Animated background effects
    │   ├── Headline
    │   ├── Subheadline
    │   ├── Features list
    │   └── Browser mockup preview
    └── Right Side (form container)
        └── Form card
            ├── Title
            ├── Subtitle
            └── Form content (children)
```

### Header Navigation
**Styling**:
- Fixed position: `fixed inset-x-0 top-0 z-40`
- Max width: 1200px, centered
- Height: 80px (h-20)
- Background: `bg-[#0F1221]/80` with `backdrop-blur-xl`
- Border: `border-white/10`, rounded-xl
- Box shadow: `0 10px 30px rgba(0,0,0,0.25)`
- Padding: `px-6 lg:px-8`

**Content**:
- Logo (left): Kuma icon + text (`text-[20px]`, cream)
- Nav link (right): Contextual link styled as button
  - Ghost style: `text-warm-gray hover:text-cream`
  - Font size: `text-[14px]`
  - Transition: smooth color change

### Left Side (Hero Content)
**Visibility**: Hidden on mobile (`hidden lg:flex`), visible on desktop (`lg:w-1/2`)

**Background Effects**:
- Animated gradient orbs:
  - Coral orb: `rgba(255, 107, 74, 0.12)` - top-left, slow pulse
  - Amber orb: `rgba(255, 179, 71, 0.08)` - bottom-right, slower pulse
  - Blur: `blur(80px)`
  - Animation: `scale-[1.2]` to `scale-[0.8]` loop
- Grid pattern: 40px × 40px, `rgba(255,255,255,0.02)`, opacity 4%

**Content Structure**:
- Container padding: `px-12 py-16`
- Max width: `max-w-lg`

**Headline**:
- Font size: `text-[44px]`
- Font weight: `font-bold`
- Line height: `leading-[1.1]`
- Color: cream
- Animation: `animate-in fade-in slide-in-from-left-8 duration-700`

**Subheadline**:
- Font size: `text-[16px]`
- Color: warm-gray
- Line height: `leading-relaxed`
- Max width: `max-w-md`
- Margin: `mt-4 mb-8`
- Animation: `fade-in duration-700 delay-200`

**Features List**:
- Spacing: `space-y-3`
- Animation: `fade-in duration-700 delay-300`
- Each feature:
  - Flex layout: `flex items-center gap-3`
  - Icon container:
    - Size: `w-9 h-9`
    - Background: `bg-coral/10`
    - Border: `border border-coral/20`
    - Rounded: `rounded-lg`
    - Icon size: 16px, coral color
  - Text: `text-[14px]`, warm-gray/90

**Browser Mockup Preview** (NEW):
- Position: `mt-12`
- Animation: `fade-in duration-700 delay-500`
- Mini browser window showing chat interface:
  - Width: 300px
  - Height: 180px
  - Background: `bg-navy/40`
  - Border: `border border-white/10`
  - Rounded: `rounded-lg`
  - Contains: 2-3 chat bubbles with subtle animation
  - Typing indicator with pulse effect
- Shadow: `0 10px 40px rgba(255,107,74,0.15)`
- Hover: subtle scale `hover:scale-[1.02]`

### Right Side (Form Container)
**Layout**:
- Width: Full on mobile, `lg:w-1/2` on desktop
- Background: `bg-charcoal/30`
- Centered content with flex
- Padding: `px-6 py-12 lg:px-16 lg:py-20`
- Min height: `min-h-screen`
- Justify content: center

**Form Card**:
- Max width: 480px
- Width: full
- Rounded: `rounded-2xl`
- Border: `border border-white/15`
- Background: `bg-charcoal/80` with `backdrop-blur-2xl`
- Padding: `p-8 md:p-10`
- Box shadow: `0 20px 60px rgba(0,0,0,0.4)`
- Animation: `animate-in fade-in zoom-in-95 duration-500 delay-200`

**Card Header**:
- Title: `text-[30px]`, semibold, cream
- Subtitle: `text-[15px]`, warm-gray/80, `leading-relaxed`
- Margin bottom: `mb-8`
- Border bottom: `border-b border-white/10`, `pb-6`

**Mobile Footer** (NEW):
- Only visible on mobile: `lg:hidden`
- Margin top: `mt-8`
- Padding top: `pt-8`
- Border top: `border-t border-white/10`
- Content: Trust badges
  - Grid: `grid-cols-3 gap-4`
  - Icons: Lock, Zap, Globe
  - Text: "Secure", "Fast", "Private"
  - Font size: `text-[11px]`, warm-gray/60
  - Centered alignment

---

## Login Page

**File**: `LoginPage.tsx`

### Props Passed to AuthLayout
```typescript
title: "Welcome back"
subtitle: "Log in to continue your productivity journey"
leftContent: {
  headline: "Pick up where you left off"
  subheadline: "Your AI assistant remembers your preferences and is ready to help you accomplish more."
  features: [
    { 
      icon: ShieldCheck, 
      text: "Enterprise-grade security" 
    },
    { 
      icon: Zap, 
      text: "Instant access across devices" 
    },
    { 
      icon: Brain, 
      text: "Personalized AI that learns from you" 
    }
  ]
}
navLink: {
  text: "Don't have an account?"
  linkText: "Sign up free"
  href: "/signup"
}
```

### Form Structure

**1. Global Error Message** (conditional)
- Background: `bg-red-500/10`
- Border: `border-l-4 border-red-500`
- Text: `text-red-400`, `text-[14px]`
- Icon: AlertCircle (left), 16px
- Padding: `p-4 pl-3`, rounded-lg
- Flex layout with icon
- Margin bottom: `mb-6`

**2. Email/Username Field**
- Label: `text-[14px]`, cream, font-medium, `mb-2`
- Input container: relative positioning
- Icon (left): Mail icon, `left-3.5`, warm-gray/40, 18px
- Input:
  - Height: `h-[50px]`
  - Padding: `pl-11 pr-4`
  - Background: `bg-navy/50`
  - Border: `border border-white/15`
  - Text: cream color, `text-[15px]`
  - Placeholder: warm-gray/40, "you@example.com"
  - Focus: `border-coral`, `ring-2 ring-coral/20`, outline-none
  - Error state: `border-red-500`, `ring-red-500/20`
  - Rounded: `rounded-xl`
  - Transition: all 200ms
- Error message: 
  - Font size: `text-[13px]`, red-400
  - Margin top: `mt-2`
  - Icon: dot indicator, 6px

**3. Password Field**
- Label: same as email field
- Input container: relative positioning
- Icon (left): Lock icon, `left-3.5`, warm-gray/40, 18px
- Input:
  - Height: `h-[50px]`
  - Padding: `pl-11 pr-12`
  - Type: toggleable (text/password)
  - Same styling as email field
  - Placeholder: "Enter your password"
- Toggle button (right):
  - Position: `absolute right-3.5 top-1/2 -translate-y-1/2`
  - Icon: Eye / EyeOff (alternating), 18px
  - Color: warm-gray/40
  - Hover: `text-warm-gray`, `bg-white/5`, `rounded-lg`
  - Padding: `p-1.5`
  - Transition: smooth
- Error message: same as email

**4. Remember Me & Forgot Password Row**
- Flex layout: `flex items-center justify-between`
- Margin: `mt-4 mb-6`

**Remember Me Checkbox**:
- Container: `flex items-center gap-2`
- Checkbox:
  - Size: `h-4 w-4`
  - Border: `border-white/20`
  - Background: `bg-navy/50`
  - Checked: `bg-coral border-coral`
  - Rounded: `rounded`
  - Focus ring: `focus:ring-2 focus:ring-coral/20`
- Label: `text-[13px]`, warm-gray, cursor-pointer

**Forgot Password Link**:
- Text: `text-[13px]`, coral color
- Hover: `hover:text-coral/80`, `hover:underline`
- Font weight: `font-medium`
- Transition: smooth

**5. Submit Button**
- Width: full
- Height: `h-[52px]`
- Background: `bg-coral`
- Hover: `hover:bg-coral/90`, `hover:-translate-y-0.5`
- Text: `text-[15px]`, navy color, font-semibold
- Shadow: `shadow-lg shadow-coral/20`
- Hover shadow: `shadow-xl shadow-coral/30`
- Rounded: `rounded-xl`
- Transition: all 200ms
- Loading state: 
  - Spinner icon (18px) + "Logging in..." text
  - Disabled with `opacity-90`
- Focus: `focus-visible:outline-2 focus-visible:outline-coral focus-visible:outline-offset-2`

**6. Divider**
- Container: relative, margin `my-8`
- Border top: `border-t border-white/10`
- Center text: "or continue with"
  - Position: absolute, centered
  - Background: `bg-charcoal/80`
  - Padding: `px-4`
  - Font size: `text-[12px]`, warm-gray/60
  - Uppercase, tracking wider

**7. Social Login Buttons** (Optional)
- Grid: `grid-cols-2 gap-3`
- Each button:
  - Height: `h-11`
  - Background: `bg-navy/50`
  - Border: `border border-white/15`
  - Hover: `hover:bg-navy/70`, `hover:border-white/25`
  - Rounded: `rounded-xl`
  - Icon + text layout
  - Icons: Google, GitHub (20px)
  - Text: `text-[14px]`, warm-gray
  - Transition: smooth

**8. Sign Up Link**
- Margin top: `mt-6`
- Padding top: `pt-6`
- Border top: `border-t border-white/10`
- Text: `text-[14px]`, warm-gray, centered
- Link: coral color, font-medium, hover underline
- Format: "Don't have an account? **Sign up free**"

### Form Validation
- Client-side validation for empty fields
- Email format validation (basic)
- Error messages appear below inputs with icons
- Errors clear when user starts typing (onChange)
- Real-time feedback with 200ms debounce
- API error handling with dismissible global error banner

### State Management
- `formData`: email/username, password
- `errors`: field-level error messages
- `authError`: global API error message
- `isLoading`: loading state for button
- `showPassword`: password visibility toggle
- `rememberMe`: checkbox state

---

## Signup Page

**File**: `SignupPage.tsx`

### Props Passed to AuthLayout
```typescript
title: "Create your account"
subtitle: "Start working smarter with your AI assistant"
leftContent: {
  headline: "Your intelligent workspace awaits"
  subheadline: "Join thousands of professionals using AI to enhance their productivity and streamline their workflow."
  features: [
    { 
      icon: Sparkles, 
      text: "Free 14-day trial, no credit card" 
    },
    { 
      icon: ShieldCheck, 
      text: "Bank-level encryption & privacy" 
    },
    { 
      icon: Users, 
      text: "Join 10,000+ active users" 
    }
  ]
}
navLink: {
  text: "Already have an account?"
  linkText: "Log in"
  href: "/login"
}
```

### Form Structure

**1. Global Error Message** (same as login)

**2. Full Name Field** (NEW)
- Label: "Full name", `text-[14px]`, cream, font-medium
- Icon: User icon, left side
- Input:
  - Same styling as login inputs
  - Placeholder: "John Doe"
  - Height: `h-[50px]`
- Validation: Required, min 2 characters
- Error message: same pattern as other fields

**3. Email Field**
- Label: "Email address"
- Icon: Mail icon
- Same structure as login email field
- Placeholder: "you@example.com"
- Additional validation:
  - Valid email format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Real-time validation feedback

**4. Password Field**
- Label: "Password"
- Icon: Lock icon
- Same base structure as login
- Placeholder: "Create a strong password"
- **Password Strength Indicator** (NEW):
  - Shows below input when password has value
  - Container: `mt-3 space-y-2`
  - Strength bar:
    - Height: `h-1.5`
    - Background: `bg-white/10`
    - Rounded: full
    - Progress bar colors:
      - Weak (< 8 chars): `bg-red-500`, width 33%
      - Medium (8+ chars, 1 condition): `bg-amber-500`, width 66%
      - Strong (8+ chars, all conditions): `bg-green-500`, width 100%
    - Animation: smooth width transition
  - Strength text: 
    - Font size: `text-[12px]`
    - Colors match bar: red-400, amber-400, green-400
    - Format: "Password strength: **Weak/Medium/Strong**"

**Password Requirements Checklist**:
- Container: `mt-3 space-y-1.5`
- Background: `bg-navy/30`
- Border: `border border-white/10`
- Rounded: `rounded-lg`
- Padding: `p-3`
- Each requirement:
  - Flex layout: `flex items-center gap-2`
  - Icon: X / Check, 14px
  - Icon colors: 
    - Unmet: `text-warm-gray/30`
    - Met: `text-green-400`
  - Text: `text-[12px]`
  - Text colors:
    - Unmet: `text-warm-gray/60`
    - Met: `text-warm-gray`
  - Transition: smooth color change
- Requirements:
  1. "At least 8 characters"
  2. "One uppercase letter (A-Z)"
  3. "One lowercase letter (a-z)"
  4. "One number (0-9)"
  5. "One special character (!@#$%)"

**5. Confirm Password Field**
- Label: "Confirm password"
- Icon: Lock icon (with check overlay when matched)
- Same structure as password field
- Placeholder: "Re-enter your password"
- Separate visibility toggle (`showConfirmPassword`)
- Real-time match validation
- Success indicator when matches (green border, check icon)
- Error indicator when doesn't match (after blur)

**6. Terms & Marketing Checkboxes**
- Container: `space-y-3`, margin: `mt-6 mb-6`

**Terms Checkbox** (Required):
- Flex layout: `flex items-start gap-3`
- Checkbox:
  - Size: `h-4 w-4`
  - Position: `mt-0.5` (aligns with first line)
  - Border: `border-white/20`
  - Background: `bg-navy/50`
  - Checked: `bg-coral border-coral`
  - Rounded: `rounded`
  - Focus ring: `focus:ring-2 focus:ring-coral/20`
- Label:
  - Font size: `text-[13px]`, warm-gray/90
  - Line height: `leading-relaxed`
  - Links: "Terms of Service" and "Privacy Policy"
  - Links styled: coral with underline on hover
  - Format: "I agree to the **Terms of Service** and **Privacy Policy**"
- Error message: 
  - Margin left: `ml-7` (indented)
  - Red-400 color

**Marketing Checkbox** (Optional):
- Same structure as terms
- Label: "Send me product updates and tips"
- No error state (optional)
- Default: unchecked

**7. Submit Button**
- Same styling as login button
- Text: "Create account"
- Loading text: "Creating account..."
- Disabled when: loading OR terms not checked
- Margin top: `mt-2`

**8. Divider** (same as login)

**9. Social Signup Buttons** (optional, same as login)

**10. Login Link**
- Same structure as signup link in login page
- Text: "Already have an account? **Log in**"
- Margin top: `mt-6`
- Padding top: `pt-6`
- Border top: `border-t border-white/10`

### Form Validation

**Client-side validation**:
- Full name: Required, min 2 chars, max 50 chars
- Email: Required, valid email format
- Password: Required, meets strength requirements (all 5 conditions)
- Confirm password: Required, matches password
- Terms: Must be checked

**Real-time feedback**:
- Password strength updates as user types
- Password requirements update with color indicators
- Confirm password shows match status
- Email format validation on blur
- All errors clear when user starts typing

**Validation timing**:
- On blur: Email format, password match
- On change: Password requirements, confirm password match
- On submit: All fields

### State Management
- `formData`: fullName, email, password, confirmPassword
- `errors`: field-level error messages object
- `authError`: global API error message
- `isLoading`: loading state
- `showPassword`, `showConfirmPassword`: visibility toggles
- `agreedToTerms`: required checkbox state
- `marketingOptIn`: optional checkbox state
- `passwordStrength`: calculated strength ('weak' | 'medium' | 'strong')
- `passwordRequirements`: array of requirement objects with `met` boolean

---

## Common Design Patterns

### Input Field Pattern
```tsx
<div className="space-y-2">
  <label className="text-[14px] font-medium text-cream">
    Field Name
  </label>
  <div className="relative">
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40">
      <Icon size={18} />
    </div>
    <input 
      className="h-[50px] w-full pl-11 pr-4 bg-navy/50 border border-white/15 
                 rounded-xl text-cream text-[15px] placeholder:text-warm-gray/40
                 focus:border-coral focus:ring-2 focus:ring-coral/20 
                 transition-all duration-200"
      placeholder="..."
    />
  </div>
  {error && (
    <p className="text-[13px] text-red-400 mt-2 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      {error}
    </p>
  )}
</div>
```

### Color Scheme
- Background: Navy `#1A1D2E` / `rgb(26, 29, 46)`
- Card: Charcoal/80 `rgba(42, 45, 58, 0.8)`
- Input bg: Navy/50 `rgba(26, 29, 46, 0.5)`
- Text: Cream `#FFF5EE` / `rgb(255, 245, 238)`
- Muted text: Warm Gray `#E5E0DB` / `rgb(229, 224, 219)`
- Primary action: Coral `#FF6B4A` / `rgb(255, 107, 74)`
- Links: Coral with hover `coral/80`
- Errors: Red-400 `#f87171`
- Success: Green-400 `#4ade80`
- Warning: Amber-500 `#f59e0b`
- Borders: White/10, White/15, White/20
- Focus ring: Coral/20

### Typography
- Page title: `text-[30px]`, semibold, `leading-tight`
- Subtitle: `text-[15px]`, `leading-relaxed`
- Labels: `text-[14px]`, font-medium
- Input text: `text-[15px]`
- Button text: `text-[15px]`, font-semibold
- Error text: `text-[13px]`
- Helper text: `text-[12px]`
- Link text: `text-[14px]`
- Hero headline: `text-[44px]`, bold, `leading-[1.1]`
- Hero subheadline: `text-[16px]`, `leading-relaxed`

### Spacing
- Form field spacing: `space-y-5`
- Field internal spacing: `space-y-2`
- Card padding: `p-8 md:p-10`
- Input height: `h-[50px]`
- Button height: `h-[52px]`
- Header margin bottom: `mb-8` with `pb-6` border
- Section margins: `mt-6`, `mb-6`
- Divider margin: `my-8`

### Icons
- Library: lucide-react
- Input field icons: 18px
- Feature icons: 16px
- Loading spinner: 18px with `animate-spin`
- Password requirements icons: 14px
- Error/success indicators: 6px dots or 14-16px icons

### Animations & Transitions
- Input focus: `transition-all duration-200`
- Button hover: `transition-all duration-200`
  - Transform: `-translate-y-0.5`
  - Shadow: increased intensity
- Loading state: spinning icon with smooth rotation
- Hero content: staggered fade-in (delay-200, delay-300, delay-500)
- Form card: `zoom-in-95 + fade-in` on mount (delay-200)
- Password requirements: `transition-colors duration-200`
- Password strength bar: smooth width transition
- Gradient orbs: slow pulse animation (8-10s duration)

### Accessibility
- Proper label associations (`htmlFor` with matching `id`)
- Focus visible states: `focus-visible:outline-2 focus-visible:outline-coral`
- Disabled states during loading with visual feedback
- Semantic HTML (header, nav, main, form, label, input)
- ARIA labels for icon-only buttons
- ARIA-describedby for error messages
- ARIA-invalid for error states
- Keyboard navigation fully supported
- Visible focus indicators on all interactive elements
- Error messages announced to screen readers
- Password visibility toggle has ARIA label
- Form validation messages are descriptive

### Responsive Behavior
- Mobile (< 1024px): 
  - Single column, form only
  - Full-width card with reduced padding
  - Simplified navigation
  - Trust badges in footer
- Desktop (≥ 1024px): 
  - Split-screen 50/50
  - Hero content visible
  - Increased padding and spacing
  - Browser mockup preview
- Breakpoint: `lg:` at 1024px
- Form card adapts: `p-8 md:p-10`
- Container padding: `px-6 lg:px-16`

---

## API Integration

### Login Flow
1. Form submission: `e.preventDefault()`
2. Client-side validation:
   - Email/username: required, valid format
   - Password: required
3. Set `isLoading` to true
4. Call `authApi.login({ email, password, rememberMe })`
5. On success:
   - Store auth token
   - Store user data
   - Navigate to `/app` or `/dashboard`
6. On error:
   - Display error in global banner
   - Set `isLoading` to false
   - Focus first error field
7. Clear errors on field change

### Signup Flow
1. Form submission: `e.preventDefault()`
2. Client-side validation:
   - Full name: required, min 2 chars
   - Email: required, valid format
   - Password: required, meets all 5 requirements
   - Confirm password: required, matches password
   - Terms: must be checked
3. Set `isLoading` to true
4. Call `authApi.register({ fullName, email, password, marketingOptIn })`
5. On success:
   - Store auth token
   - Store user data
   - Navigate to `/onboarding` or `/app`
   - Optional: Show welcome message
6. On error:
   - Display error in global banner
   - Set `isLoading` to false
   - Focus first error field
7. Clear errors on field change

### Error Handling
- API errors: Displayed in dismissible banner at top of form
- Network errors: "Unable to connect. Please try again."
- Validation errors: Shown below respective fields with icons
- Rate limiting: "Too many attempts. Please try again later."
- Duplicate email: "An account with this email already exists."
- All errors clear when user interacts with field
- Loading state disables all inputs and buttons
- Error banner has close button with smooth fade-out

### Password Strength Calculation
```typescript
const calculateStrength = (password: string) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const metCount = Object.values(requirements).filter(Boolean).length;
  
  if (metCount < 3) return 'weak';
  if (metCount < 5) return 'medium';
  return 'strong';
};
```

---

## Security Features
- Password visibility toggle (never sends to server in plain text)
- Client-side validation before API calls
- HTTPS-only in production
- Secure cookie storage for tokens
- XSS protection with proper escaping
- CSRF protection on API endpoints
- Rate limiting on authentication endpoints
- Password requirements enforce strong passwords
- Remember me uses secure tokens
- Session timeout after inactivity

---

## Performance Optimizations
- Debounced validation (200ms) to reduce re-renders
- Lazy loading for social auth buttons
- Optimized re-renders with React.memo where appropriate
- CSS transitions use GPU-accelerated properties
- Form state updates are batched
- Animated elements use transform/opacity only
- Background gradients use CSS instead of images
- Icon components are tree-shakeable from lucide-react