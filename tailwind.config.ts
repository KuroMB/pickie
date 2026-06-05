import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF8F5',
          100: '#FAECE7',
          200: '#F5C4B3',
          300: '#E89080',
          400: '#D85A30',
          500: '#C44A20',
          600: '#A83810',
        },
        amber: {
          warm: '#F5A623',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
      maxWidth: {
        mobile: '390px',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
export default config
