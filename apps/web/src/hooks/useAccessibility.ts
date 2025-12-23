import { useEffect, useState } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'normal' | 'large';
  dyslexiaFont: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 'normal',
  dyslexiaFont: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('accessibilitySettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    const body = document.body;
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    if (settings.fontSize === 'large') {
      body.classList.add('font-large');
    } else {
      body.classList.remove('font-large');
    }
    if (settings.dyslexiaFont) {
      body.classList.add('dyslexia-font');
    } else {
      body.classList.remove('dyslexia-font');
    }
    return () => {
      body.classList.remove('high-contrast', 'font-large', 'dyslexia-font');
    };
  }, [settings]);

  const setHighContrast = (value: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast: value }));
  };

  const setFontSize = (size: 'normal' | 'large') => {
    setSettings((prev) => ({ ...prev, fontSize: size }));
  };

  const setDyslexiaFont = (value: boolean) => {
    setSettings((prev) => ({ ...prev, dyslexiaFont: value }));
  };

  return {
    settings,
    setHighContrast,
    setFontSize,
    setDyslexiaFont,
  };
}
