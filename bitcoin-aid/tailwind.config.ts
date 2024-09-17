import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/componentes/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // Alterar o valor do breakpoint 'md'
        'lg': '1200px',

        // Adicionar um breakpoint personalizado chamado 'xl2'
        'xl2': '1400px',
      },
      fontFamily: {
        Agency: ['Agency', 'sans-serif'],
      },
      animation:{
        'slide-down': 'slideDown 0.3s ease-out forwards',
      },
      keyframes:{
        slideDown: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
