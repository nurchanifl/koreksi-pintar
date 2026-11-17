import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  Edit3, 
  Award, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Printer, 
  TrendingUp, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { calculateExamScore } from '../utils/scoring';
import { exportGradesToCSV } from '../utils/exportUtils';

export default function Gradebook({ 
  examConfig, 
  students, 
  onDeleteStudent, 
  onEditStudent,
  onClearAll 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('table'); // 'table' | 'analysis'

  // Calculate scores for all students
  const studentsWithScores = students.map(std => {
    const scoreResult = calculateExamScore(examConfig, std.answers);
    return {
      ...std,
      scoreResult,
    };
  });

  // Filter students
  const filteredStudents = studentsWithScores.filter(std => {
    const matchName = std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (std.nis && std.nis.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchName) return false;
    if (statusFilter === 'passed') return std.scoreResult.isPassed;
    if (statusFilter === 'failed') return !std.scoreResult.isPassed;
    return true;
  });

  // Stats
  const totalStudents = students.length;
  const scores = studentsWithScores.map(s => s.scoreResult.finalScore);
  const avgScore = totalStudents > 0 
    ? (scores.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1) 
    : 0;
  const maxScore = totalStudents > 0 ? Math.max(...scores) : 0;
  const minScore = totalStudents > 0 ? Math.min(...scores) : 0;
  const passedStudents = studentsWithScores.filter(s => s.scoreResult.isPassed).length;
  const passRate = totalStudents > 0 
    ? ((passedStudents / totalStudents) * 100).toFixed(1) 
    : 0;

  // Question Item Analysis
  const pgCount = examConfig?.counts?.pg || 20;
  const pgAccuracy = Array.from({ length: pgCount }, (_, idx) => {
    if (totalStudents === 0) return 0;
    const correctCount = studentsWithScores.filter(s => {
      const studentAns = (s.answers?.pg?.[idx] || '').toUpperCase();
      const keyAns = (examConfig?.keys?.pg?.[idx] || '').toUpperCase();
      return studentAns !== '' && studentAns === keyAns;
    }).length;
    return Math.round((correctCount / totalStudents) * 100);
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              Daftar Rekap Nilai Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {examConfig.title} — Standar KKM: <span className="font-bold text-slate-700">{examConfig.kkm}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => exportGradesToCSV(examConfig, students)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all transform active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor ke Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>

          {students.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
              title="Hapus semua data siswa ujian ini"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Siswa</div>
            <div className="text-2xl font-black text-slate-800">{totalStudents}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Rata-rata Kelas</div>
            <div className="text-2xl font-black text-slate-800">{avgScore}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Tertinggi / Terendah</div>
            <div className="text-xl font-black text-slate-800">
              {maxScore} <span className="text-xs text-slate-400 font-normal">/ {minScore}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
            passRate >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Ketuntasan (KKM)</div>
            <div className="text-2xl font-black text-slate-800">
              {passRate}%
              <span className="text-xs text-slate-500 font-normal ml-1">({passedStudents}/{totalStudents})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Table vs Item Difficulty Analysis */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'table'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tabel Nilai Siswa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analysis')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'analysis'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analisis Tingkat Kesulitan Soal</span>
        </button>
      </div>

      {/* Tab 1: Table of Students */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Semua ({totalStudents})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('passed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === 'passed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Tuntas ({passedStudents})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('failed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === 'failed'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Remedial ({totalStudents - passedStudents})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">NIS / No Peserta</th>
                  <th className="py-3 px-4 text-center">PG ({examConfig.counts.pg})</th>
                  <th className="py-3 px-4 text-center">PGK ({examConfig.counts.pgk})</th>
                  <th className="py-3 px-4 text-center">B/S ({examConfig.counts.bs})</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Tidak ada data siswa yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std, idx) => {
                    const { scoreResult } = std;
                    return (
                      <tr key={std.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-500 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{std.name}</div>
                          <div className="text-[11px] text-slate-400">{std.className || examConfig.classGrade}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {std.nis || '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          <span className="text-emerald-700 font-bold">{scoreResult.pgResult.correctCount}</span>
                          <span className="text-slate-400">/{scoreResult.pgResult.totalQuestions}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-medium font-mono">
                          {scoreResult.pgkResult.earned}
                        </td>
                        <td className="py-3 px-4 text-center font-medium font-mono">
                          {scoreResult.bsResult.earned}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-base font-black text-slate-800">
                            {scoreResult.finalScore}
                          </span>
                          <span className="ml-1 text-[11px] font-bold text-indigo-600">
                            ({scoreResult.predicate})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            scoreResult.isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {scoreResult.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForDetail(std)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Lihat Detail Hasil"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditStudent(std)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Koreksi Ulang / Edit Jawaban"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Hapus data nilai siswa "${std.name}"?`)) {
                                  onDeleteStudent(std.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Item Difficulty Analysis */}
      {activeTab === 'analysis' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Analisis Butir Soal Pilihan Ganda (Tingkat Ketepatan Jawaban Siswa)
            </h3>
            <p className="text-xs text-slate-500">
              Melihat persentase siswa yang menjawab benar pada tiap nomor soal. Soal dengan persentase rendah (&lt; 50%) menandakan materi yang perlu pengulangan/remedial kelas.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {pgAccuracy.map((accuracy, idx) => {
              const isDifficult = accuracy < 50;
              const isMastered = accuracy >= 80;

              return (
                <div
                  key={`acc-${idx}`}
                  className={`p-3 rounded-xl border transition-all ${
                    isDifficult 
                      ? 'bg-rose-50/50 border-rose-300' 
                      : isMastered 
                        ? 'bg-emerald-50/50 border-emerald-300' 
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-700">
                      Soal No {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      Kunci: {examConfig?.keys?.pg?.[idx] || '-'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-black text-slate-800">
                      {accuracy}%
                    </span>
                    <span className="text-[10px] text-slate-500">Benar</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isDifficult ? 'bg-rose-500' : isMastered ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>

                  {isDifficult && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-rose-600 font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Sulit / Remedial</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Detail Hasil Lembar Siswa: {selectedStudentForDetail.name}
                </h3>
                <p className="text-xs text-slate-500">
                  NIS: {selectedStudentForDetail.nis || '-'} | Kelas: {selectedStudentForDetail.className}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Score Highlight Box */}
              <div className="bg-indigo-900 text-white p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-indigo-200 font-semibold">NILAI AKHIR</div>
                  <div className="text-4xl font-black">{selectedStudentForDetail.scoreResult.finalScore} / 100</div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-xl font-bold text-xs ${
                    selectedStudentForDetail.scoreResult.isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {selectedStudentForDetail.scoreResult.isPassed ? 'LULUS / TUNTAS' : 'REMEDIAL'}
                  </span>
                  <div className="text-xs text-indigo-300 mt-1">
                    Predikat: {selectedStudentForDetail.scoreResult.predicate} ({selectedStudentForDetail.scoreResult.predicateLabel})
                  </div>
                </div>
              </div>

              {/* Student Photo if available */}
              {selectedStudentForDetail.imageUri && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase">
                    Foto Lembar Jawaban Siswa
                  </h4>
                  <div className="bg-slate-950 p-2 rounded-2xl flex justify-center max-h-60 overflow-hidden">
                    <img
                      src={selectedStudentForDetail.imageUri}
                      alt="Lembar Ujian"
                      className="max-h-56 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* PG Answers Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase">
                  1. Pilihan Ganda (Benar: {selectedStudentForDetail.scoreResult.pgResult.correctCount} / {selectedStudentForDetail.scoreResult.pgResult.totalQuestions})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedStudentForDetail.scoreResult.pgResult.details.map((d, i) => (
                    <div
                      key={`det-pg-${i}`}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                        d.isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                      }`}
                    >
                      <span className="font-bold">No {d.questionNumber}</span>
                      <span className="font-mono">
                        Jwb: <strong className={d.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{d.studentAnswer || '—'}</strong>
                        {!d.isCorrect && <span className="text-slate-500 ml-1">(K: {d.keyAnswer})</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
