import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ["1rem", { lineHeight: "1.5rem" }], // 16px minimum for minor annotations
        sm: ["1.125rem", { lineHeight: "1.625rem" }], // 18px minimum
        base: ["1.25rem", { lineHeight: "1.875rem" }], // 20px base elderly font
        lg: ["1.375rem", { lineHeight: "2rem" }], // 22px
        xl: ["1.5rem", { lineHeight: "2.125rem" }], // 24px
        "2xl": ["1.75rem", { lineHeight: "2.375rem" }], // 28px
        "3xl": ["2rem", { lineHeight: "2.5rem" }], // 32px
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
      },
    },
  },
  plugins: [],
};

export default config;
