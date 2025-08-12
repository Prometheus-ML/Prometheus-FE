import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    '../../apps/*/app/**/*.{ts,tsx,js,jsx,mdx}',
    '../../apps/*/src/**/*.{ts,tsx,js,jsx,mdx}',
    '../../packages/**/*.{ts,tsx,js,jsx,mdx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;

