import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  RefreshCw, 
  Upload, 
  Camera, 
  Sun, 
  Contrast, 
  Eye, 
  Sparkles,
  Maximize2,
  FileCheck2
} from 'lucide-react';
import { generateSampleSheetDataUrl } from '../utils/sampleSheetImage';

export default function ImageViewer({ 
  imageSrc, 
  onImageChange, 
  onOpenCamera,
  onAiScan,
  isScanning,
  hasApiKey
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterMode, setFilterMode] = useState('normal'); // 'normal' | 'contrast' | 'grayscale' | 'pencil-boost'
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotateCw = () => setRotation(prev => (prev + 90) % 360);
  const handleRotateCcw = () => setRotation(prev => (prev - 90 + 360) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setFilterMode('normal');
  };

  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e) => {
    if (!imageSrc) return;
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 4));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageChange(reader.result);
        handleReset();
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop file to container
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageChange(reader.result);
        handleReset();
      };
      reader.readAsDataURL(file);
    }
  };

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'contrast':
        return 'contrast-150 brightness-105';
      case 'grayscale':
        return 'grayscale contrast-200 brightness-110';
      case 'pencil-boost':
        return 'contrast-200 brightness-95 saturate-150';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 backdrop-blur border-b border-slate-700/60 text-slate-200">
        <div className="flex items-center space-x-1.5 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Foto Lembar Ujian</span>
        </div>

        {imageSrc && (
          <div className="flex items-center space-x-1">
            {/* Filter Selector */}
            <div className="flex items-center bg-slate-700/70 rounded-lg p-0.5 text-xs mr-2">
              <button
                type="button"
                onClick={() => setFilterMode('normal')}
                className={`px-2 py-1 rounded transition-colors ${filterMode === 'normal' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
                title="Tampilan Normal"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('pencil-boost')}
                className={`px-2 py-1 rounded transition-colors ${filterMode === 'pencil-boost' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
                title="Pertajam Coretan Pensil / Pulpen"
              >
                Pertajam Pensil
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('grayscale')}
                className={`px-2 py-1 rounded transition-colors ${filterMode === 'grayscale' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
                title="Kontras Tinggi (B/W)"
              >
                B/W
              </button>
            </div>

            {/* Zoom & Rotate Controls */}
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1 text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={handleRotateCcw}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Putar Berlawanan Jarum Jam (-90°)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRotateCw}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Putar Searah Jarum Jam (+90°)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset Tampilan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Image Viewport */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative flex-1 overflow-hidden flex items-center justify-center bg-slate-950 ${
          imageSrc ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
        style={{ minHeight: '420px' }}
      >
        {imageSrc ? (
          <div
            className="transition-transform duration-75 select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={imageSrc}
              alt="Lembar Jawaban Siswa"
              draggable={false}
              className={`max-w-none max-h-[75vh] object-contain rounded shadow-2xl transition-all duration-200 ${getFilterStyle()}`}
            />
          </div>
        ) : (
          /* Empty / Upload State */
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <Camera className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-slate-200 mb-1">
              Unggah atau Foto Lembar Ujian
            </h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Tarik & lepas foto lembar kerja ke sini, ambil foto langsung dengan kamera, atau pilih file dari komputer.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full mb-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Foto File</span>
              </button>
              
              <button
                type="button"
                onClick={onOpenCamera}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Buka Kamera</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const sampleImg = generateSampleSheetDataUrl();
                onImageChange(sampleImg);
                handleReset();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 hover:text-white text-xs font-medium rounded-xl border border-indigo-800/60 transition-all"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gunakan Contoh Lembar Jawaban (Demo)</span>
            </button>
          </div>
        )}

        {/* Floating AI Scan Quick Button */}
        {imageSrc && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-900/80 backdrop-blur hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700/80 shadow-lg flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto</span>
              </button>
              <button
                type="button"
                onClick={onOpenCamera}
                className="px-3 py-1.5 bg-slate-900/80 backdrop-blur hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700/80 shadow-lg flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Foto Ulang</span>
              </button>
            </div>

            <div className="pointer-events-auto">
              <button
                type="button"
                onClick={onAiScan}
                disabled={isScanning}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 ${
                  isScanning 
                    ? 'bg-slate-700 text-slate-400 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-indigo-500/25'
                }`}
                title={hasApiKey ? 'Ekstrak jawaban secara otomatis dengan Gemini Vision' : 'Klik untuk memindai otomatis (atur API Key di Pengaturan)'}
              >
                <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : 'animate-bounce'}`} />
                <span>{isScanning ? 'Memindai Lembar...' : 'Scan Otomatis dengan AI'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
