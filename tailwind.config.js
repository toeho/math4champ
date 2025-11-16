export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom animations
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-bottom': 'slide-in-bottom 0.2s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'confetti': 'confetti 3s ease-out forwards',
        'draw-arc': 'draw-arc 1s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-delay': 'fade-in 0.5s ease-out 0.3s both',
        'fade-in-delay-2': 'fade-in 0.5s ease-out 0.6s both',
        'scale-in': 'scale-in 0.3s ease-out',
        'bounce-dots': 'bounce-dots 1.4s ease-in-out infinite',
        'gradient-slow': 'gradient-shift 8s ease infinite',
        'success-pop': 'success-pop 0.6s ease-out',
        'badge-unlock': 'badge-unlock 0.8s ease-out',
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
        'hint-pulse': 'hint-pulse 2s ease-in-out infinite',
        'emoji-bounce': 'emoji-bounce 1s ease-in-out',
        'sparkle-twinkle': 'sparkle-twinkle 1.5s ease-in-out infinite',
        'sound-wave': 'sound-wave 0.6s ease-out',
        'page-fade-in': 'page-fade-in 0.4s ease-out',
        'ambient-float': 'ambient-float 6s ease-in-out infinite',
        'streak-fire': 'streak-fire 1.5s ease-in-out infinite',
      },
      // Custom keyframes
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'slide-in-right': {
          from: {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'slide-in-left': {
          from: {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'slide-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in-bottom': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'bounce-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
          '70%': {
            transform: 'scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        confetti: {
          '0%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100vh) rotate(720deg)',
            opacity: '0',
          },
        },
        'count-up': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'draw-arc': {
          from: {
            strokeDashoffset: '282.6',
          },
          to: {
            strokeDashoffset: '0',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'fade-in': {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        'scale-in': {
          from: {
            opacity: '0',
            transform: 'scale(0.8)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'bounce-dots': {
          '0%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-10px)',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
        'success-pop': {
          '0%': {
            transform: 'scale(0) rotate(0deg)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.3) rotate(180deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(1) rotate(360deg)',
            opacity: '1',
          },
        },
        'badge-unlock': {
          '0%': {
            transform: 'scale(0) rotate(-180deg)',
            opacity: '0',
          },
          '60%': {
            transform: 'scale(1.2) rotate(10deg)',
          },
          '80%': {
            transform: 'scale(0.9) rotate(-5deg)',
          },
          '100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
        'gentle-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '1',
          },
        },
        'hint-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)',
          },
        },
        'emoji-bounce': {
          '0%, 100%': {
            transform: 'translateY(0) scale(1)',
          },
          '25%': {
            transform: 'translateY(-8px) scale(1.1)',
          },
          '50%': {
            transform: 'translateY(0) scale(1)',
          },
          '75%': {
            transform: 'translateY(-4px) scale(1.05)',
          },
        },
        'sparkle-twinkle': {
          '0%, 100%': {
            opacity: '0',
            transform: 'scale(0) rotate(0deg)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1) rotate(180deg)',
          },
        },
        'sound-wave': {
          '0%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'scale(1.5)',
            opacity: '0.4',
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        'page-fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'ambient-float': {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
          },
          '25%': {
            transform: 'translateY(-5px) translateX(3px)',
          },
          '50%': {
            transform: 'translateY(-8px) translateX(-3px)',
          },
          '75%': {
            transform: 'translateY(-3px) translateX(2px)',
          },
        },
        'streak-fire': {
          '0%, 100%': {
            transform: 'scale(1) rotate(-5deg)',
          },
          '50%': {
            transform: 'scale(1.15) rotate(5deg)',
          },
        },
      },
      // Custom timing functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Custom transition durations
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      // Extended color palette for child-friendly design
      colors: {
        // Keep existing Tailwind colors and add custom ones
        'glass': {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(255, 255, 255, 0.05)',
        },
      },
      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      // Custom box shadows for glow effects
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
      },
    },
  },
  plugins: [],
}
