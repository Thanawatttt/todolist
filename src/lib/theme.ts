import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

const lightTheme = {
  background: '#f8fafc',
  cardBackground: 'rgba(255, 255, 255, 0.95)',
  cardBorder: 'rgba(203, 213, 225, 0.5)',
  text: '#1e293b',
  textSecondary: '#4b5563',
  textLight: '#ffffff',
  textLightSecondary: 'rgba(255, 255, 255, 0.8)',
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  secondary: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  sidebar: 'rgba(255, 255, 255, 0.95)',
  bottomNav: 'rgba(255, 255, 255, 0.98)',
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
  shadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  glass: 'rgba(255, 255, 255, 0.7)',
  cardShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  navShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
  navBorder: 'rgba(203, 213, 225, 0.8)'
};

const darkTheme = {
  background: '#0f172a',
  cardBackground: 'rgba(30, 41, 59, 0.8)',
  cardBorder: 'rgba(71, 85, 105, 0.5)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textLight: '#ffffff',
  textLightSecondary: 'rgba(203, 213, 225, 0.8)',
  primary: '#818cf8',
  primaryDark: '#6366f1',
  secondary: '#a78bfa',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  sidebar: 'rgba(15, 23, 42, 0.95)',
  bottomNav: 'rgba(15, 23, 42, 0.98)',
  inputBg: '#1e293b',
  inputBorder: '#334155',
  shadow: '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
  glass: 'rgba(15, 23, 42, 0.5)',
  cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  navShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
  navBorder: 'rgba(71, 85, 105, 0.8)'
};

function createThemeStore() {
  const { subscribe, set, update } = writable<{ theme: Theme; colors: typeof lightTheme }>({
    theme: 'light',
    colors: lightTheme,
  });

  // Load theme from localStorage on init
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      set({
        theme: savedTheme,
        colors: savedTheme === 'light' ? lightTheme : darkTheme,
      });
    }
  }

  return {
    subscribe,
    toggle: () => {
      update(current => {
        const newTheme = current.theme === 'light' ? 'dark' : 'light';
        const newColors = newTheme === 'light' ? lightTheme : darkTheme;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', newTheme);
        }
        
        return { theme: newTheme, colors: newColors };
      });
    },
    set: (theme: Theme) => {
      const colors = theme === 'light' ? lightTheme : darkTheme;
      set({ theme, colors });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
    },
  };
}

export const themeStore = createThemeStore();
