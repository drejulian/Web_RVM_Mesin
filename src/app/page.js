'use client';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '@/hooks/use-socket-client';
import { getWebRvmUrl } from '@/lib/web-rvm-url';

export default function MesinDisplayPage() {
  const [realtimeData, setRealtimeData] = useState(null);
  const [newDetectionAlert, setNewDetectionAlert] = useState(false);
  const [bottleCount, setBottleCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('waiting');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionReadyTimeoutId, setSessionReadyTimeoutId] = useState(null);

  const webRvmUrl = getWebRvmUrl();
  const deviceId = process.env.NEXT_PUBLIC_DEVICE_ID || 'RVM-DEFAULT';
  const bottleinUrl = webRvmUrl ? `${webRvmUrl}/bottlein?deviceId=${deviceId}` : '';

  const {
    isConnected,
    sessionActive,
    lastMessage,
    error: socketError,
  } = useSocket(webRvmUrl, {
    onConnect: (socket) => {
      console.log('✅ Socket.IO connected to web_rvm');

      setConnectionStatus('waiting');

      if (sessionReadyTimeoutId) {
        clearTimeout(sessionReadyTimeoutId);
        setSessionReadyTimeoutId(null);
      }
    },

    onDisconnect: (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      if (connectionStatus === 'connected') {
        setConnectionStatus('waiting');
      }
    },

    onMessage: (message) => {
      console.log('📡 Socket.IO message received:', message);

      if (message.type === 'bottle_detected') {
        setRealtimeData(message.data);
        const newCount = message.data?.totalUnclaimedBottles || 0;
        setBottleCount(newCount);

        setNewDetectionAlert(true);
        setTimeout(() => setNewDetectionAlert(false), 3000);

        playNotificationSound();
      } else if (message.type === 'bottles_claimed') {
        console.log('📡 Bottles claimed - resetting counter');
        setBottleCount(0);
        setRealtimeData(null);
        setNewDetectionAlert(false);
      }
    },

    onConnectedEvent: (message) => {
      console.log('📡 Socket.IO connected (not user session):', message);

      if (sessionReadyTimeoutId) {
        clearTimeout(sessionReadyTimeoutId);
        setSessionReadyTimeoutId(null);
      }
    },

    onSessionStarted: (message) => {
      console.log('📡 User opened /bottlein page:', message);
      setConnectionStatus('connected');
    },

    onSessionEnded: (message) => {
      console.log('📡 User left /bottlein page:', message);
      setConnectionStatus('waiting');
    },

    onError: (error) => {
      console.error('❌ Socket.IO error:', error);
    },
  });

  useEffect(() => {
    return () => {
      if (sessionReadyTimeoutId) {
        clearTimeout(sessionReadyTimeoutId);
      }
    };
  }, [sessionReadyTimeoutId]);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio notification not available:', e);
    }
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

  const estimatedPoints = bottleCount * 50;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {!webRvmUrl && (
          <div className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-50 px-5 py-4 text-yellow-900">
            <strong className="font-semibold">URL deploy belum diset.</strong>{' '}
            Atur <span className="font-mono">NEXT_PUBLIC_WEB_RVM_URL</span> ke URL web user yang sudah deploy.
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Mesin RVM
          </h1>
          <p className="text-xl text-blue-100">
            Scan QR Code untuk Memulai
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Scan QR Code
            </h2>
            <div className="flex justify-center items-center bg-gray-50 rounded-2xl p-8">
              {bottleinUrl ? (
                <QRCodeSVG
                  value={bottleinUrl}
                  size={280}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white text-center text-sm text-gray-500">
                  QR code akan muncul setelah URL deploy diatur
                </div>
              )}
            </div>
            <p className="text-center text-gray-600 mt-6 text-sm">
              Arahkan kamera ke QR code untuk mengakses halaman bottle-in
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-center text-gray-500 break-all">
                {bottleinUrl}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Status Mesin
              </h2>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                connectionStatus === 'connected' 
                  ? 'bg-green-100 text-green-700' 
                  : connectionStatus === 'waiting'
                  ? 'bg-blue-100 text-blue-700'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-500 animate-pulse' 
                    : connectionStatus === 'waiting'
                    ? 'bg-blue-500 animate-pulse'
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500'
                }`}></div>
                {connectionStatus === 'connected' ? 'Aktif' : 
                 connectionStatus === 'waiting' ? 'Menunggu User' :
                 connectionStatus === 'connecting' ? 'Menghubungkan...' : 
                 'Terputus'}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 relative">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Botol Terdeteksi (Sesi Aktif)
                </p>
                <div className="flex items-center justify-center">
                  <h3
                    className={`text-8xl font-bold transition-all duration-500 ${
                      newDetectionAlert
                        ? 'text-green-600 scale-110 animate-pulse'
                        : 'text-blue-600'
                    }`}
                  >
                    {bottleCount}
                  </h3>
                </div>
                <p className="text-center text-gray-600 mt-2">Botol</p>

                {newDetectionAlert && (
                  <div className="absolute inset-0 bg-green-200 opacity-30 animate-ping rounded-2xl pointer-events-none"></div>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Estimasi Poin
                </p>
                <div className="flex items-center justify-center">
                  <h3
                    className={`text-6xl font-bold transition-all duration-500 ${
                      newDetectionAlert
                        ? 'text-green-700 scale-110'
                        : 'text-green-600'
                    }`}
                  >
                    +{estimatedPoints}
                  </h3>
                </div>
                <p className="text-center text-gray-600 mt-2">Poin</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3 text-center">
                  Cara Menggunakan:
                </h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-[20px]">1.</span>
                    <span>Scan QR code dengan kamera smartphone Anda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-[20px]">2.</span>
                    <span>Masukkan botol ke dalam mesin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-[20px]">3.</span>
                    <span>Lihat jumlah botol bertambah di layar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 min-w-[20px]">4.</span>
                    <span>Klik tombol "Klaim" di smartphone untuk mendapatkan poin</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {socketError && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl text-center">
            <strong className="font-bold">Error Koneksi: </strong>
            <span>{socketError}</span>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-white text-sm opacity-75">
            Mesin RVM - Sistem Penukaran Botol Otomatis
          </p>
          <p className="text-white text-xs opacity-50 mt-2">
            Terhubung ke: {webRvmUrl}
          </p>
        </div>
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
