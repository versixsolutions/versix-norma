// ============================================================
// VERSIX NORMA - ACCESSIBILITY HOOKS
// Preferências de acessibilidade e suporte a WCAG 2.1 AA
// ============================================================

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// ============================================
// TYPES
// ============================================
export interface AccessibilitySettings {
  // Tamanho de fonte
  fontSize: 'normal' | 'large' | 'extra-large';
  
  // Contraste
  highContrast: boolean;
  
  // Movimento
  reducedMotion: boolean;
  
  // Leitura
  lineHeight: 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'normal' | 'wide';
  
  // Focus
  enhancedFocus: boolean;
  
  // Cores
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  lineHeight: 'normal',
  letterSpacing: 'normal',
  enhancedFocus: false,
  colorBlindMode: 'none',
};

// ============================================
// CONTEXT
// ============================================
interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

// ============================================
// PROVIDER
// ============================================
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Carregar configurações salvas e preferências do sistema
  useEffect(() => {
    // Carregar do localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch {
        // Ignorar erro de parse
      }
    }

    // Detectar preferências do sistema
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    setSettings(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion || prev.reducedMotion,
      highContrast: prefersHighContrast || prev.highContrast,
    }));
  }, []);

  // Aplicar estilos CSS
  useEffect(() => {
    const root = document.documentElement;

    // Font Size
    const fontSizeMap = {
      'normal': '16px',
      'large': '18px',
      'extra-large': '20px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // Line Height
    const lineHeightMap = {
      'normal': '1.5',
      'relaxed': '1.75',
      'loose': '2',
    };
    root.style.setProperty('--line-height', lineHeightMap[settings.lineHeight]);

    // Letter Spacing
    const letterSpacingMap = {
      'normal': '0',
      'wide': '0.05em',
    };
    root.style.setProperty('--letter-spacing', letterSpacingMap[settings.letterSpacing]);

    // Classes no body
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('reduced-motion', settings.reducedMotion);
    document.body.classList.toggle('enhanced-focus', settings.enhancedFocus);
    document.body.classList.toggle(`colorblind-${settings.colorBlindMode}`, settings.colorBlindMode !== 'none');

    // Salvar no localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  
  return context;
}

// ============================================
// useReducedMotion
// ============================================
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

// ============================================
// useHighContrast
// ============================================
export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return highContrast;
}

// ============================================
// useFocusTrap
// ============================================
export function useFocusTrap(ref: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, isActive]);
}

// ============================================
// useAnnounce (Screen Reader)
// ============================================
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  return announce;
}

// ============================================
// useKeyboardNavigation
// ============================================
export function useKeyboardNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  options?: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
  }
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { loop = true, orientation = 'vertical' } = options || {};

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const prevKeys = orientation === 'horizontal' ? ['ArrowLeft'] : ['ArrowUp'];
    const nextKeys = orientation === 'horizontal' ? ['ArrowRight'] : ['ArrowDown'];
    
    if (orientation === 'both') {
      prevKeys.push('ArrowUp', 'ArrowLeft');
      nextKeys.push('ArrowDown', 'ArrowRight');
    }

    if (prevKeys.includes(e.key)) {
      e.preventDefault();
      setActiveIndex(prev => {
        if (prev === 0) return loop ? itemCount - 1 : 0;
        return prev - 1;
      });
    }

    if (nextKeys.includes(e.key)) {
      e.preventDefault();
      setActiveIndex(prev => {
        if (prev === itemCount - 1) return loop ? 0 : itemCount - 1;
        return prev + 1;
      });
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(activeIndex);
    }

    if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    }

    if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(itemCount - 1);
    }
  }, [activeIndex, itemCount, loop, onSelect, orientation]);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}

// ============================================
// useSkipLink
// ============================================
export function useSkipLink(targetId: string) {
  const skipToContent = useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [targetId]);

  return skipToContent;
}

// ============================================
// CSS UTILITIES (adicionar ao global.css)
// ============================================
export const accessibilityCSS = `
/* Base font size */
html {
  font-size: var(--base-font-size, 16px);
}

body {
  line-height: var(--line-height, 1.5);
  letter-spacing: var(--letter-spacing, 0);
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Enhanced focus */
.enhanced-focus *:focus {
  outline: 3px solid #1E40AF !important;
  outline-offset: 2px !important;
}

/* High contrast */
.high-contrast {
  --bg-primary: #000;
  --text-primary: #fff;
  --border-color: #fff;
}

.high-contrast button,
.high-contrast a {
  border: 2px solid currentColor !important;
}

/* Reduced motion */
.reduced-motion * {
  animation-duration: 0.001ms !important;
  transition-duration: 0.001ms !important;
}

/* Color blind modes */
.colorblind-protanopia {
  filter: url('#protanopia-filter');
}

.colorblind-deuteranopia {
  filter: url('#deuteranopia-filter');
}

.colorblind-tritanopia {
  filter: url('#tritanopia-filter');
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #1E40AF;
  color: white;
  padding: 8px 16px;
  z-index: 9999;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}
`;
