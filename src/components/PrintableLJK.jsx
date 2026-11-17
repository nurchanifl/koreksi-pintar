import React, { useState } from 'react';
import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';

export default function PrintableLJK({ examConfig }) {
  const [schoolName, setSchoolName] = useState('SMP / SMA NEGERI 1 NUSANTARA');
  const [instructions, setInstructions] = useState('1. Hitamkan atau silang (X) bulatan/kotak jawaban menggunakan pensil 2B atau pulpen hitam.\n2. Pastikan tanda jelas dan tidak keluar garis.\n3. Jangan melipat atau merobek lembar jawaban ini.');

  const pgCount = examConfig?.counts?.pg || 20;
  const pgkCount = examConfig?.counts?.pgk || 5;
  const bsCount = examConfig?.counts?.bs || 5;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control (Hidden when printing) */}
      <div className="no-print bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              Cetak Lembar Jawaban Ujian (LJK)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Cetak lembar jawaban standar ini untuk dibagikan kepada siswa, diisi, lalu difoto untuk dikoreksi otomatis di aplikasi ini.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all transform active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Lembar (Print / Simpan PDF)</span>
        </button>
      </div>

      {/* Customizable Options Box (Hidden when printing) */}
      <div className="no-print bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Nama Sekolah / Instansi (Kop Lembar)
          </label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Petunjuk Pengisian Siswa
          </label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* THE PRINTABLE SHEET (A4 Standard Container) */}
      {/* ============================================================== */}
      <div className="bg-white mx-auto p-8 rounded-2xl shadow-xl border border-slate-200 max-w-[850px] text-slate-900 font-sans print:shadow-none print:border-none print:p-4 print:max-w-none relative">
        {/* OMR Fiducial Alignment Markers on Corners */}
        <div className="absolute top-4 left-4 w-5 h-5 bg-black"></div>
        <div className="absolute top-4 right-4 w-5 h-5 bg-black"></div>
        <div className="absolute bottom-4 left-4 w-5 h-5 bg-black"></div>
        <div className="absolute bottom-4 right-4 w-5 h-5 bg-black"></div>

        {/* Header / Kop */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h2 className="text-base font-black uppercase tracking-wider">
            {schoolName}
          </h2>
          <h1 className="text-xl font-extrabold uppercase tracking-tight my-0.5">
            LEMBAR JAWABAN UJIAN (LJK)
          </h1>
          <p className="text-xs font-semibold text-slate-700">
            {examConfig.title} — Tahun Ajaran {examConfig.academicYear || '2026/2027'}
          </p>
        </div>

        {/* Identity & Instructions Block */}
        <div className="grid grid-cols-12 gap-4 mb-5 pb-4 border-b border-black">
          {/* Left: Identity Fields for Student */}
          <div className="col-span-8 space-y-2 text-xs">
            <div className="flex items-center">
              <span className="w-28 font-bold">NAMA LENGKAP</span>
              <span className="mr-2">:</span>
              <div className="flex-1 border-b border-dashed border-slate-600 pb-0.5 min-h-[22px]"></div>
            </div>
            <div className="flex items-center">
              <span className="w-28 font-bold">NIS / NO PESERTA</span>
              <span className="mr-2">:</span>
              <div className="flex-1 border-b border-dashed border-slate-600 pb-0.5 min-h-[22px]"></div>
            </div>
            <div className="flex items-center">
              <span className="w-28 font-bold">MATA PELAJARAN</span>
              <span className="mr-2">:</span>
              <span className="font-semibold">{examConfig.subject}</span>
              <span className="mx-4 font-bold">KELAS:</span>
              <span className="font-semibold">{examConfig.classGrade}</span>
            </div>
          </div>

          {/* Right: Signature & Date Box */}
          <div className="col-span-4 border border-black rounded-lg p-2 flex flex-col justify-between text-center text-[10px]">
            <span className="font-bold">TANDA TANGAN PESERTA</span>
            <div className="h-10"></div>
            <span className="border-t border-dashed border-slate-400 pt-0.5">
              (...........................................)
            </span>
          </div>
        </div>

        {/* Section 1: Pilihan Ganda (A - E) */}
        <div className="mb-5">
          <div className="bg-slate-100 border border-black px-2.5 py-1 mb-2.5 flex items-center justify-between text-xs font-bold">
            <span>I. PILIHAN GANDA (A - E)</span>
            <span className="text-[10px] font-normal italic">
              Hitamkan bulatan pilihan yang tepat
            </span>
          </div>

          {/* Grid of PG: 4 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            {Array.from({ length: pgCount }).map((_, idx) => (
              <div
                key={`print-pg-${idx}`}
                className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100"
              >
                <span className="w-5 font-bold text-right mr-1.5">{idx + 1}.</span>
                <div className="flex items-center space-x-1.5">
                  {['A', 'B', 'C', 'D', 'E'].map(opt => (
                    <div
                      key={opt}
                      className="w-5 h-5 rounded-full border border-black flex items-center justify-center font-bold text-[10px]"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Pilihan Ganda Kompleks (PGK) */}
        <div className="mb-5">
          <div className="bg-slate-100 border border-black px-2.5 py-1 mb-2.5 flex items-center justify-between text-xs font-bold">
            <span>II. PILIHAN GANDA KOMPLEKS (PGK)</span>
            <span className="text-[10px] font-normal italic">
              Centang [✓] pada kotak pernyataan yang benar (Pernyataan 1 - 4)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: pgkCount }).map((_, qIdx) => (
              <div
                key={`print-pgk-${qIdx}`}
                className="border border-slate-300 rounded p-2 text-xs flex items-center justify-between"
              >
                <span className="font-bold mr-2">No {qIdx + 1}:</span>
                <div className="flex items-center space-x-3">
                  {[1, 2, 3, 4].map(sNum => (
                    <div key={sNum} className="flex items-center space-x-1">
                      <div className="w-4 h-4 border border-black rounded-xs"></div>
                      <span className="text-[10px] font-semibold">P{sNum}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Benar / Salah (BS) */}
        <div className="mb-4">
          <div className="bg-slate-100 border border-black px-2.5 py-1 mb-2.5 flex items-center justify-between text-xs font-bold">
            <span>III. BENAR / SALAH (BS)</span>
            <span className="text-[10px] font-normal italic">
              Silang [X] atau lingkari huruf B jika Benar, S jika Salah untuk setiap pernyataan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: bsCount }).map((_, qIdx) => (
              <div
                key={`print-bs-${qIdx}`}
                className="border border-slate-300 rounded p-2 text-xs"
              >
                <div className="font-bold mb-1">Soal Nomor {qIdx + 1}:</div>
                <div className="grid grid-cols-4 gap-1 text-[11px]">
                  {[1, 2, 3, 4].map(sNum => (
                    <div key={sNum} className="flex items-center justify-center space-x-1 bg-slate-50 p-1 rounded border border-slate-200">
                      <span className="text-[10px] font-bold">P{sNum}:</span>
                      <span className="w-4 h-4 rounded-full border border-black text-[9px] flex items-center justify-center font-bold">
                        B
                      </span>
                      <span className="w-4 h-4 rounded-full border border-black text-[9px] flex items-center justify-center font-bold">
                        S
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="border-t border-black pt-2 flex items-center justify-between text-[10px] text-slate-600">
          <span>* Lembar Ujian Resmi Terverifikasi KoreksiPintar OMR Scanner</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>
    </div>
  );
}
