import React, { useState } from 'react';
import { 
  Key, 
  Settings, 
  Save, 
  RotateCcw, 
  Shuffle, 
  CheckCircle, 
  Sliders, 
  HelpCircle,
  Hash,
  Layers,
  Sparkles
} from 'lucide-react';

export default function KeyEditor({ examConfig, onSaveExamConfig }) {
  const [formData, setFormData] = useState({ ...examConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'structure'

  // Update question counts and adjust array lengths accordingly
  const handleCountChange = (type, newCount) => {
    const count = Math.max(1, Math.min(100, parseInt(newCount) || 1));
    setFormData(prev => {
      const updatedCounts = { ...prev.counts, [type]: count };
      const updatedKeys = { ...prev.keys };

      if (type === 'pg') {
        const currentArr = updatedKeys.pg || [];
        if (count > currentArr.length) {
          const added = Array(count - currentArr.length).fill('A');
          updatedKeys.pg = [...currentArr, ...added];
        } else {
          updatedKeys.pg = currentArr.slice(0, count);
        }
      } else if (type === 'pgk') {
        const currentArr = updatedKeys.pgk || [];
        if (count > currentArr.length) {
          const added = Array.from({ length: count - currentArr.length }, () => [true, false, true, false]);
          updatedKeys.pgk = [...currentArr, ...added];
        } else {
          updatedKeys.pgk = currentArr.slice(0, count);
        }
      } else if (type === 'bs') {
        const currentArr = updatedKeys.bs || [];
        if (count > currentArr.length) {
          const added = Array.from({ length: count - currentArr.length }, () => ['B', 'S', 'B', 'S']);
          updatedKeys.bs = [...currentArr, ...added];
        } else {
          updatedKeys.bs = currentArr.slice(0, count);
        }
      }

      return {
        ...prev,
        counts: updatedCounts,
        keys: updatedKeys,
      };
    });
  };

  // Change PG key
  const handlePgKeyChange = (index, option) => {
    setFormData(prev => {
      const newPg = [...prev.keys.pg];
      newPg[index] = option;
      return {
        ...prev,
        keys: { ...prev.keys, pg: newPg }
      };
    });
  };

  // Change PGK key (4 statements boolean)
  const handlePgkKeyToggle = (questionIndex, statementIndex) => {
    setFormData(prev => {
      const newPgk = prev.keys.pgk.map((arr, qIdx) => {
        if (qIdx !== questionIndex) return arr;
        const copy = [...arr];
        copy[statementIndex] = !copy[statementIndex];
        return copy;
      });
      return {
        ...prev,
        keys: { ...prev.keys, pgk: newPgk }
      };
    });
  };

  // Change BS key (4 statements 'B' or 'S')
  const handleBsKeyChange = (questionIndex, statementIndex, value) => {
    setFormData(prev => {
      const newBs = prev.keys.bs.map((arr, qIdx) => {
        if (qIdx !== questionIndex) return arr;
        const copy = [...arr];
        copy[statementIndex] = value;
        return copy;
      });
      return {
        ...prev,
        keys: { ...prev.keys, bs: newBs }
      };
    });
  };

  // Randomize keys for testing
  const handleRandomizeKeys = () => {
    if (!window.confirm('Apakah Anda yakin ingin mengisi kunci secara acak untuk pengujian?')) return;
    const options = ['A', 'B', 'C', 'D', 'E'];
    const pgCount = formData.counts.pg;
    const pgkCount = formData.counts.pgk;
    const bsCount = formData.counts.bs;

    const randomPg = Array.from({ length: pgCount }, () => options[Math.floor(Math.random() * options.length)]);
    const randomPgk = Array.from({ length: pgkCount }, () => [
      Math.random() > 0.5,
      Math.random() > 0.5,
      Math.random() > 0.5,
      Math.random() > 0.5,
    ]);
    const randomBs = Array.from({ length: bsCount }, () => [
      Math.random() > 0.5 ? 'B' : 'S',
      Math.random() > 0.5 ? 'B' : 'S',
      Math.random() > 0.5 ? 'B' : 'S',
      Math.random() > 0.5 ? 'B' : 'S',
    ]);

    setFormData(prev => ({
      ...prev,
      keys: {
        pg: randomPg,
        pgk: randomPgk,
        bs: randomBs,
      }
    }));
  };

  const handleSave = () => {
    onSaveExamConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Key className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              Pengaturan Kunci Jawaban & Bobot
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Atur kunci jawaban untuk Pilihan Ganda (A-E), PG Kompleks (4 Pernyataan), dan Benar-Salah (4 Pilihan).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomizeKeys}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Isi kunci acak untuk pengujian cepat"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Isi Acak (Demo)</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Kunci Jawaban</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('keys')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'keys'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Matriks Kunci Jawaban</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('structure')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'structure'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Informasi Ujian, Bobot & Skoring</span>
        </button>
      </div>

      {/* Tab Content 1: Key Matrix */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          {/* Section 1: Pilihan Ganda A - E */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Kunci Pilihan Ganda (A - E)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih 1 opsi benar untuk masing-masing {formData.counts.pg} butir soal
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
                Total: {formData.counts.pg} Soal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {formData.keys.pg.map((currentKey, idx) => (
                <div
                  key={`k-pg-${idx}`}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>

                  <div className="flex items-center space-x-1">
                    {['A', 'B', 'C', 'D', 'E'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handlePgKeyChange(idx, opt)}
                        className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                          currentKey === opt
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-300'
                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Pilihan Ganda Kompleks (PGK) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Kunci Pilihan Ganda Kompleks (PGK)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Centang pernyataan yang benar (P1, P2, P3, P4) untuk setiap nomor soal
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold">
                Total: {formData.counts.pgk} Soal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.keys.pgk.map((statements, qIdx) => (
                <div
                  key={`k-pgk-${qIdx}`}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-md bg-purple-600 text-white text-xs flex items-center justify-center">
                        {qIdx + 1}
                      </span>
                      <span>Soal Nomor {qIdx + 1}</span>
                    </span>
                    <span className="text-xs text-slate-500">
                      Dipilih: {statements.filter(Boolean).length} dari 4 pernyataan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map(sIdx => {
                      const isChecked = Boolean(statements[sIdx]);
                      return (
                        <button
                          key={`k-pgk-${qIdx}-s-${sIdx}`}
                          type="button"
                          onClick={() => handlePgkKeyToggle(qIdx, sIdx)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            isChecked
                              ? 'bg-purple-600 border-purple-600 text-white font-bold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>Pernyataan {sIdx + 1}</span>
                          <span>{isChecked ? '✓ Benar' : '—'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Benar / Salah (BS) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Kunci Benar / Salah (BS)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih B (Benar) atau S (Salah) untuk ke-4 butir pernyataan di setiap soal
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold">
                Total: {formData.counts.bs} Soal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.keys.bs.map((statements, qIdx) => (
                <div
                  key={`k-bs-${qIdx}`}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs flex items-center justify-center">
                        {qIdx + 1}
                      </span>
                      <span>Soal Nomor {qIdx + 1}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map(sIdx => {
                      const val = statements[sIdx] || 'B';
                      return (
                        <div
                          key={`k-bs-${qIdx}-s-${sIdx}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                        >
                          <span className="font-semibold text-slate-700">
                            Pernyataan {sIdx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleBsKeyChange(qIdx, sIdx, 'B')}
                              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                                val === 'B'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBsKeyChange(qIdx, sIdx, 'S')}
                              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                                val === 'S'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              S
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Exam Structure & Weights */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: General Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Informasi Umum Ujian
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Judul Ujian / Asesmen
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kelas / Tingkat
                </label>
                <input
                  type="text"
                  value={formData.classGrade}
                  onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Standar Kelulusan (KKM)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.kkm}
                  onChange={(e) => setFormData({ ...formData, kkm: parseInt(e.target.value) || 75 })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={formData.academicYear || '2026/2027'}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Question Counts & Bobot */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Jumlah Butir Soal & Bobot Nilai (%)
            </h3>

            {/* Counts */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Jumlah Soal PG (A - E)</span>
                  <span className="font-mono">{formData.counts.pg} Butir</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.counts.pg}
                  onChange={(e) => handleCountChange('pg', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Jumlah Soal PG Kompleks (4 Pernyataan)</span>
                  <span className="font-mono">{formData.counts.pgk} Butir</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.counts.pgk}
                  onChange={(e) => handleCountChange('pgk', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Jumlah Soal Benar / Salah (4 Pilihan)</span>
                  <span className="font-mono">{formData.counts.bs} Butir</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.counts.bs}
                  onChange={(e) => handleCountChange('bs', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Points per Question & Total Score Simulator */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Poin per Butir Soal (Berapa Skor Tiap Soal)
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                  <span className="text-[11px] font-semibold text-indigo-950 block">Poin / Soal PG</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.scoringRules?.pg?.pointsPerQuestion ?? 2}
                    onChange={(e) => setFormData({
                      ...formData,
                      scoringRules: {
                        ...formData.scoringRules,
                        pg: { ...formData.scoringRules?.pg, pointsPerQuestion: parseFloat(e.target.value) || 1 }
                      }
                    })}
                    className="w-full mt-1 px-2 py-1 text-sm bg-white border border-indigo-300 rounded-lg font-bold text-indigo-700 text-center"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-0.5">
                    Subtotal: {(formData.counts.pg * (formData.scoringRules?.pg?.pointsPerQuestion ?? 2)).toFixed(0)} poin
                  </span>
                </div>

                <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-200">
                  <span className="text-[11px] font-semibold text-purple-950 block">Poin / Soal PGK</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.scoringRules?.pgk?.pointsPerQuestion ?? 4}
                    onChange={(e) => setFormData({
                      ...formData,
                      scoringRules: {
                        ...formData.scoringRules,
                        pgk: { ...formData.scoringRules?.pgk, pointsPerQuestion: parseFloat(e.target.value) || 4 }
                      }
                    })}
                    className="w-full mt-1 px-2 py-1 text-sm bg-white border border-purple-300 rounded-lg font-bold text-purple-700 text-center"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-0.5">
                    Subtotal: {(formData.counts.pgk * (formData.scoringRules?.pgk?.pointsPerQuestion ?? 4)).toFixed(0)} poin
                  </span>
                </div>

                <div className="p-2.5 bg-teal-50/70 rounded-xl border border-teal-200">
                  <span className="text-[11px] font-semibold text-teal-950 block">Poin / Soal B/S</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.scoringRules?.bs?.pointsPerQuestion ?? 4}
                    onChange={(e) => setFormData({
                      ...formData,
                      scoringRules: {
                        ...formData.scoringRules,
                        bs: { ...formData.scoringRules?.bs, pointsPerQuestion: parseFloat(e.target.value) || 4 }
                      }
                    })}
                    className="w-full mt-1 px-2 py-1 text-sm bg-white border border-teal-300 rounded-lg font-bold text-teal-700 text-center"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-0.5">
                    Subtotal: {(formData.counts.bs * (formData.scoringRules?.bs?.pointsPerQuestion ?? 4)).toFixed(0)} poin
                  </span>
                </div>
              </div>

              {/* Total points summary card */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Total Poin Maksimal Ujian:</span>
                <span className="font-black text-indigo-700 font-mono text-sm">
                  {(
                    (formData.counts.pg * (formData.scoringRules?.pg?.pointsPerQuestion ?? 2)) +
                    (formData.counts.pgk * (formData.scoringRules?.pgk?.pointsPerQuestion ?? 4)) +
                    (formData.counts.bs * (formData.scoringRules?.bs?.pointsPerQuestion ?? 4))
                  ).toFixed(0)} Poin
                </span>
              </div>
            </div>

            {/* Metode Penilaian Akhir */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Format Nilai Akhir Siswa
              </label>
              <select
                value={formData.scoringMethod || 'scale100'}
                onChange={(e) => setFormData({ ...formData, scoringMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="scale100">
                  Skala 0 – 100 (Rekomendasi Rapor: Otomatis dikonversi ke nilai 100 secara proporsional)
                </option>
                <option value="weighted">
                  Berdasarkan Bobot Persentase (%) Kategori Soal (PG % + PGK % + BS %)
                </option>
                <option value="rawPoints">
                  Total Akumulasi Poin Murni (Nilai siswa = Jumlah poin yang diperoleh)
                </option>
              </select>
            </div>

            {/* Bobot % (if weighted is chosen) */}
            {formData.scoringMethod === 'weighted' && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Distribusi Bobot Nilai (%) (Total: {formData.weights.pg + formData.weights.pgk + formData.weights.bs}%)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                    <span className="text-[11px] font-semibold text-indigo-900 block">Bobot PG</span>
                    <input
                      type="number"
                      value={formData.weights.pg}
                      onChange={(e) => setFormData({
                        ...formData,
                        weights: { ...formData.weights, pg: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full mt-1 px-2 py-1 text-sm bg-white border border-indigo-300 rounded-lg font-bold text-indigo-700 text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-200">
                    <span className="text-[11px] font-semibold text-purple-900 block">Bobot PGK</span>
                    <input
                      type="number"
                      value={formData.weights.pgk}
                      onChange={(e) => setFormData({
                        ...formData,
                        weights: { ...formData.weights, pgk: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full mt-1 px-2 py-1 text-sm bg-white border border-purple-300 rounded-lg font-bold text-purple-700 text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-teal-50/70 rounded-xl border border-teal-200">
                    <span className="text-[11px] font-semibold text-teal-900 block">Bobot B/S</span>
                    <input
                      type="number"
                      value={formData.weights.bs}
                      onChange={(e) => setFormData({
                        ...formData,
                        weights: { ...formData.weights, bs: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full mt-1 px-2 py-1 text-sm bg-white border border-teal-300 rounded-lg font-bold text-teal-700 text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Skoring Mode */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Metode Penilaian PGK & Benar-Salah
              </label>
              <select
                value={formData.scoringRules?.pgk?.scoringMode || 'proportional'}
                onChange={(e) => setFormData({
                  ...formData,
                  scoringRules: {
                    ...formData.scoringRules,
                    pgk: { ...formData.scoringRules.pgk, scoringMode: e.target.value },
                    bs: { ...formData.scoringRules.bs, scoringMode: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="proportional">
                  Proporsional (Siswa dapat poin per pernyataan yang cocok, misal 3 dari 4 = 75% poin)
                </option>
                <option value="allOrNothing">
                  Utuh / All-or-Nothing (Harus semua 4 pernyataan cocok untuk mendapat poin penuh)
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-indigo-200" />
          <span className="text-sm font-bold">Pengaturan Kunci Ujian Berhasil Disimpan!</span>
        </div>
      )}
    </div>
  );
}
