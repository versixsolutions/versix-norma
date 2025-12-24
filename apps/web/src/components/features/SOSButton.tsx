'use client';

import { useEffect, useRef, useState } from 'react';

export default function SOSButton() {
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
      className="group relative flex h-10 w-10 select-none items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm transition-all duration-300 active:scale-95"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Progress circle */}
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
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
        className={`material-symbols-outlined text-2xl font-bold text-red-500 transition-transform ${
          pressing ? 'scale-110' : ''
        }`}
      >
        e911_emergency
      </span>

      {/* Ping indicator */}
      {!pressing && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
      )}
    </button>
  );
}
