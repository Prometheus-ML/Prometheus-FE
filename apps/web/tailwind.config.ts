import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        'pretendard': ['Pretendard', 'sans-serif'],
        'kimm-bold': ['KIMM-Bold', 'sans-serif'],
        'kimm-light': ['KIMM-Light', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;


