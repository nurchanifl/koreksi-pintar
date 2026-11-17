import React, { useState } from 'react';
import { 
  CheckSquare, 
  Key, 
  Printer, 
  Users, 
  Settings, 
  HelpCircle, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  examConfig, 
  onOpenSettings,
  studentCount = 0
}) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Active Exam Indicator */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                    Koreksi<span className="text-indigo-600">Pintar</span>
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline-block">
                    OMR & AI Vision
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[220px] sm:max-w-xs">
                  {examConfig.title} ({examConfig.subject})
                </p>
              </div>
            </div>

            {/* Middle: Navigation Pills */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTab('correction')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'correction'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/40'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Koreksi Lembar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('keys')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'keys'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/40'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Kunci & Bobot</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('print')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'print'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/40'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Cetak LJK</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('grades')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'grades'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/40'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Rekap Nilai</span>
                {studentCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] rounded-full font-mono">
                    {studentCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Right: Quick Settings & Help */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Petunjuk Penggunaan"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
                title="Pengaturan Aplikasi & AI"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Pengaturan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 px-2 py-1.5 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('correction')}
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              activeTab === 'correction' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Koreksi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              activeTab === 'keys' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Kunci</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('print')}
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              activeTab === 'print' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Cetak LJK</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className={`flex flex-col items-center py-1 text-[10px] font-bold ${
              activeTab === 'grades' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nilai ({studentCount})</span>
          </button>
        </div>
      </header>

      {/* Quick Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Panduan Cara Mengoreksi Ujian
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <h4 className="font-bold text-indigo-950 mb-1 text-sm">
                  Langkah-Langkah Praktis:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 font-medium text-indigo-900">
                  <li><strong>Atur Kunci Jawaban</strong>: Buka menu <em>Kunci & Bobot</em> untuk mengatur kunci jawaban PG (A-E), PGK (4 pernyataan), dan Benar-Salah (4 pilihan).</li>
                  <li><strong>Cetak LJK (Opsional)</strong>: Buka menu <em>Cetak LJK</em> jika ingin membagikan lembar jawaban fisik berstandar ke siswa.</li>
                  <li><strong>Foto Lembar Ujian Siswa</strong>: Masuk ke menu <em>Koreksi Lembar</em>, unggah foto lembar kerja atau gunakan kamera HP/laptop langsung.</li>
                  <li><strong>Periksa & Masukkan Jawaban</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li><strong>Manual Cepat</strong>: Foto tampil di sebelah kiri (bisa di-zoom, putar, dan dipertajam). Anda tinggal klik opsi A-E, centang pernyataan PGK, atau toggle B/S di sebelah kanan.</li>
                      <li><strong>Scan Otomatis AI (Gemini)</strong>: Klik tombol <em>"Scan Otomatis dengan AI"</em>, dan AI akan membaca nama serta jawaban siswa langsung dari foto!</li>
                    </ul>
                  </li>
                  <li><strong>Simpan Nilai</strong>: Klik <em>Simpan Nilai Siswa</em>. Nilai otomatis terakumulasi di menu <em>Rekap Nilai</em> dan dapat diekspor langsung ke Excel!</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  Format Soal yang Didukung:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li><strong>Pilihan Ganda (A - E)</strong>: 5 opsi pilihan tunggal per nomor soal.</li>
                  <li><strong>Pilihan Ganda Kompleks (PGK)</strong>: 4 butir pernyataan per nomor soal (siswa dapat memilih lebih dari satu pernyataan yang benar).</li>
                  <li><strong>Benar / Salah (BS)</strong>: 4 butir pernyataan per nomor soal (masing-masing pernyataan dipilih Benar atau Salah).</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
