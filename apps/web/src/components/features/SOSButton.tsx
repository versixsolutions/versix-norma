'use client';

import { useState, useRef, useEffect } from 'react';

export function SOSButton() {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setPressing(true);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleSOS();
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };

  const endPress = () => {
    setPressing(false);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleSOS = () => {
    console.log('🆘 SOS Acionado!');
    // TODO: Integrar com backend - enviar alerta de emergência
    alert('🆘 Emergência acionada! Equipe de resposta notificada.');
    setPressing(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <button
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      className="relative group flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 transition-all duration-300 active:scale-95 backdrop-blur-sm select-none"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Progress circle */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-red-500 transition-all duration-75"
          strokeDasharray={`${progress}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          opacity={pressing ? 0.5 : 0}
        />
      </svg>

      {/* Icon */}
      <span
        className={`material-symbols-outlined text-red-500 text-2xl font-bold transition-transform ${
          pressing ? 'scale-110' : ''
        }`}
      >
        e911_emergency
      </span>

      {/* Ping indicator */}
      {!pressing && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
    </button>
  );
}
