'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function OnboardingPage() {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleStart = () => {
    router.push('/scan');
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 md:space-y-10 max-w-md w-full">
        <div className="animate-bounce-slow">
          <Image
            src="/image-splash.svg"
            alt="Plastic-In Logo"
            width={200}
            height={200}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56"
            priority
          />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center">
          Plastic-In
        </h1>

        <button
          onClick={handleStart}
          className="bg-white hover:bg-gray-100 text-blue-600 font-bold text-lg sm:text-xl md:text-2xl px-8 sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Mulai
        </button>
      </div>

      <button
        onClick={toggleFullscreen}
        className="fixed bottom-6 right-6 bg-white hover:bg-gray-100 text-gray-800 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 group"
        title={isFullscreen ? 'Keluar dari Fullscreen (ESC)' : 'Masuk Fullscreen (F11)'}
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isFullscreen ? 'Keluar Fullscreen' : 'Mode Fullscreen'}
        </span>
      </button>
    </div>
  );
}
