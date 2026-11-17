import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    // List available cameras
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devs => {
        const videoDevs = devs.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
        if (videoDevs.length > 0 && !selectedDeviceId) {
          // Prefer back camera if found on phones
          const backCam = videoDevs.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('belakang'));
          setSelectedDeviceId(backCam ? backCam.deviceId : videoDevs[0].deviceId);
        }
      }).catch(console.error);
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, selectedDeviceId]);

  const startCamera = async () => {
    setError(null);
    stopCamera();

    try {
      const constraints = {
        video: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Ambil Foto Lembar Ujian</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative bg-black flex items-center justify-center min-h-[380px] overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-red-400 max-w-md">
              <AlertCircle className="w-12 h-12 mb-3 text-red-500" />
              <p className="text-sm font-medium mb-4">{error}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto max-h-[60vh] object-contain"
              />

              {/* Viewfinder Overlay Frame */}
              <div className="absolute inset-8 border-2 border-dashed border-indigo-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                <span className="text-[11px] font-mono text-indigo-300 bg-slate-950/70 px-2 py-0.5 rounded self-start">
                  Posisikan Lembar Kerja di Dalam Kotak
                </span>
                <span className="text-[10px] text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded self-end">
                  Pastikan pencahayaan terang & tidak berbayang
                </span>
              </div>
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-t border-slate-700">
          {/* Camera Switcher */}
          {devices.length > 1 ? (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-slate-700 text-white text-xs px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {devices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Kamera ${i + 1}`}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-slate-400">Kamera Siap</div>
          )}

          {/* Shutter Button */}
          <button
            type="button"
            disabled={!!error || !stream}
            onClick={takeSnapshot}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-500/25 transition-all transform active:scale-90"
          >
            <Camera className="w-5 h-5" />
            <span>Ambil Foto</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-2"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
