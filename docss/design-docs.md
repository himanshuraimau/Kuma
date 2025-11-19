# Frontend Design Documentation

## 1. Design Philosophy
The design aims for a **premium, dynamic, and responsive** user experience. It leverages a high-contrast dark mode by default, with vibrant accent colors to create a modern, "robot companion" aesthetic.

-   **Visual Style**: Clean, modern, and high-contrast.
-   **Interaction**: Smooth transitions, hover effects, and micro-animations.
-   **Responsiveness**: Mobile-first approach using Tailwind CSS.

## 2. Color Palette

The application uses a sophisticated color palette defined in CSS variables.

### Primary Colors
| Color Name | Hex/RGB | Usage |
| :--- | :--- | :--- |
| **Coral** | `rgb(255, 107, 74)` | Primary actions, highlights, brand color |
| **Navy** | `rgb(26, 29, 46)` | Main background, deep contrast |
| **Cream** | `rgb(255, 245, 238)` | Primary text, high readability on dark backgrounds |

### Secondary & Accent Colors
| Color Name | Hex/RGB | Usage |
| :--- | :--- | :--- |
| **Copper** | `rgb(184, 115, 51)` | Secondary actions, borders |
| **Teal** | `rgb(88, 243, 212)` | Success states, links, refreshing accents |
| **Amber** | `rgb(255, 179, 71)` | Warnings, attention-grabbing elements |
| **Charcoal** | `rgb(42, 45, 58)` | Cards, sidebars, muted backgrounds |
| **Warm Gray** | `rgb(229, 224, 219)` | Muted text, borders, subtle details |

### Semantic Colors (Tailwind/Shadcn Mappings)
-   **Background**: `var(--background)` (Navy)
-   **Foreground**: `var(--foreground)` (Cream)
-   **Card**: `var(--card)` (Charcoal)
-   **Primary**: `var(--primary)` (Coral)
-   **Secondary**: `var(--secondary)` (Copper)
-   **Accent**: `var(--accent)` (Amber)
-   **Destructive**: `oklch(...)` (Red variant)

## 3. Typography

### Font Families
-   **Headings**: `Space Grotesk`, `Inter`, system-ui, sans-serif
    -   Used for `h1` through `h6`.
    -   Gives a technical, futuristic yet readable feel.
-   **Body**: `Inter`, system-ui, -apple-system, sans-serif
    -   Used for paragraphs, inputs, and general UI text.
    -   Ensures high legibility and a clean look.

### Type Scale
Standard Tailwind CSS type scale is used (e.g., `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).

## 4. Components & UI System

### Framework
-   **Library**: [shadcn/ui](https://ui.shadcn.com/)
-   **Style**: "New York"
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Animations**: `tw-animate-css` and custom keyframes (e.g., `shimmer`).

### Core Components
-   **Buttons**: Rounded corners (`--radius: 0.625rem`), solid primary colors for main actions, ghost/outline for secondary.
-   **Cards**: Charcoal background with subtle borders, often used for grouping content.
-   **Inputs**: Muted backgrounds with clear focus rings (`ring-coral`).
-   **Dialogs/Modals**: Overlay with blur effect, centered content.

## 5. Layout & Spacing

-   **Grid System**: CSS Grid and Flexbox are used for layout.
-   **Spacing**: Standard Tailwind spacing scale (4px increments).
-   **Container**: Centered containers with responsive max-widths.
-   **Radius**: Slightly rounded corners (`0.625rem`) for a friendly yet modern feel.

## 6. Effects & Animations

-   **Hover**: Subtle brightness or opacity changes on interactive elements.
-   **Transitions**: Smooth transitions (e.g., `transition-all duration-200`) for state changes.
-   **Special Effects**:
    -   `animate-shimmer`: Used for loading states or highlighting special elements.
    -   Glassmorphism: Used in overlays and sticky headers.
