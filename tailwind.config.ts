import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // `hover:` only applies on hover-capable pointers, so a tap never leaves a stuck hover state.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Segoe UI Variable Text"',
          '"Segoe UI"',
          "Inter",
          "Roboto",
          '"Noto Sans"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Noto Sans Tamil"',
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["1rem", { lineHeight: "1.5rem" }], // 16px minimum for minor annotations
        sm: ["1.125rem", { lineHeight: "1.625rem" }], // 18px minimum
        base: ["1.25rem", { lineHeight: "1.875rem" }], // 20px base elderly font
        lg: ["1.375rem", { lineHeight: "2rem" }], // 22px
        xl: ["1.5rem", { lineHeight: "2.125rem", letterSpacing: "-0.01em" }], // 24px
        "2xl": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.015em" }], // 28px
        "3xl": ["2rem", { lineHeight: "2.375rem", letterSpacing: "-0.02em" }], // 32px
        "4xl": ["2.5rem", { lineHeight: "2.875rem", letterSpacing: "-0.022em" }], // 40px desktop large title
      },
      minHeight: {
        tap: "48px",
      },
      minWidth: {
        tap: "48px",
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
        },
        // Apple-style neutrals: a soft gray canvas with near-black ink.
        canvas: "#f5f5f7",
        ink: {
          DEFAULT: "#1d1d1f",
          secondary: "#424245",
          tertiary: "#6e6e73", // 4.9:1 on white; only for >= 18px text
        },
        // Single accent. #0066cc is 5.6:1 on white.
        accent: {
          DEFAULT: "#0066cc",
          hover: "#0058b0",
          pressed: "#004c99",
          ink: "#004c99",
          soft: "#e8f1fc",
        },
      },
      boxShadow: {
        card: "0 0 0 1px rgb(0 0 0 / 0.05), 0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px -2px rgb(0 0 0 / 0.05)",
        "card-hover":
          "0 0 0 1px rgb(0 0 0 / 0.06), 0 2px 4px rgb(0 0 0 / 0.05), 0 12px 28px -6px rgb(0 0 0 / 0.12)",
        float: "0 0 0 1px rgb(0 0 0 / 0.06), 0 8px 24px -4px rgb(0 0 0 / 0.12), 0 32px 64px -16px rgb(0 0 0 / 0.24)",
        button: "inset 0 1px 0 rgb(255 255 255 / 0.18), 0 1px 2px rgb(0 0 0 / 0.12)",
      },
      transitionTimingFunction: {
        // Apple-like critically damped feel for CSS transitions.
        fluid: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
