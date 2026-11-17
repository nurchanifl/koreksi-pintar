import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Save, 
  UserCheck, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  Award, 
  HelpCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Layers
} from 'lucide-react';
import ImageViewer from './ImageViewer';
import CameraCaptureModal from './CameraCaptureModal';
import { calculateExamScore } from '../utils/scoring';
import { scanExamSheetWithGemini } from '../utils/geminiScanner';

export default function CorrectionWorkspace({ 
  examConfig, 
  onSaveStudent, 
  settings, 
  onOpenSettings,
  editingStudent,
  onCancelEdit
}) {
  // Student Metadata
  const [studentName, setStudentName] = useState('');
  const [studentNis, setStudentNis] = useState('');
  const [studentClass, setStudentClass] = useState(examConfig?.classGrade || '');
  const [studentImage, setStudentImage] = useState(null);

  // Student Answers
  const [answers, setAnswers] = useState({
    pg: [],
    pgk: [],
    bs: [],
  });

  // UI state
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'pg' | 'pgk' | 'bs'
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [activePgIndex, setActivePgIndex] = useState(0); // active question for keyboard input

  // Initialize or reset answers based on exam config or editing student
  useEffect(() => {
    if (editingStudent) {
      setStudentName(editingStudent.name || '');
      setStudentNis(editingStudent.nis || '');
      setStudentClass(editingStudent.className || examConfig?.classGrade || '');
      setStudentImage(editingStudent.imageUri || null);
      setAnswers(editingStudent.answers || { pg: [], pgk: [], bs: [] });
      return;
    }

    const pgCount = examConfig?.counts?.pg || 20;
    const pgkCount = examConfig?.counts?.pgk || 5;
    const bsCount = examConfig?.counts?.bs || 5;

    setAnswers({
      pg: Array(pgCount).fill(''),
      pgk: Array.from({ length: pgkCount }, () => [false, false, false, false]),
      bs: Array.from({ length: bsCount }, () => ['', '', '', '']),
    });
    setStudentName('');
    setStudentNis('');
    setStudentClass(examConfig?.classGrade || '');
    setStudentImage(null);
  }, [examConfig, editingStudent]);

  // Global Keyboard Shortcuts for Rapid Entry
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      const pgCount = examConfig?.counts?.pg || 20;

      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        e.preventDefault();
        setAnswers(prev => {
          const newPg = [...prev.pg];
          newPg[activePgIndex] = key;
          return { ...prev, pg: newPg };
        });
        // Auto advance to next question
        setActivePgIndex(prev => Math.min(prev + 1, pgCount - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setActivePgIndex(prev => Math.min(prev + 1, pgCount - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePgIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        setAnswers(prev => {
          const newPg = [...prev.pg];
          newPg[activePgIndex] = '';
          return { ...prev, pg: newPg };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePgIndex, examConfig]);

  // Compute live score
  const scoreResult = calculateExamScore(examConfig, answers);

  // Handle PG single choice
  const handleSelectPg = (questionIndex, option) => {
    setAnswers(prev => {
      const newPg = [...prev.pg];
      // Toggle off if already selected, or select option
      newPg[questionIndex] = newPg[questionIndex] === option ? '' : option;
      return { ...prev, pg: newPg };
    });

    // Auto-advance to next question if setting is on
    if (settings?.autoAdvance && questionIndex < (examConfig?.counts?.pg || 20) - 1) {
      setActiveQuestionFocus(questionIndex + 1);
    }
  };

  // Handle PGK checkbox toggle (4 statements)
  const handleTogglePgk = (questionIndex, statementIndex) => {
    setAnswers(prev => {
      const newPgk = prev.pgk.map((qAnswers, qIdx) => {
        if (qIdx !== questionIndex) return qAnswers;
        const updated = [...qAnswers];
        updated[statementIndex] = !updated[statementIndex];
        return updated;
      });
      return { ...prev, pgk: newPgk };
    });
  };

  // Handle BS (Benar/Salah) toggle
  const handleSelectBs = (questionIndex, statementIndex, value) => {
    setAnswers(prev => {
      const newBs = prev.bs.map((qAnswers, qIdx) => {
        if (qIdx !== questionIndex) return qAnswers;
        const updated = [...qAnswers];
        // Toggle off if clicking the same value, else set
        updated[statementIndex] = updated[statementIndex] === value ? '' : value;
        return updated;
      });
      return { ...prev, bs: newBs };
    });
  };

  // Clear answers for next student
  const handleResetForNextStudent = () => {
    const pgCount = examConfig?.counts?.pg || 20;
    const pgkCount = examConfig?.counts?.pgk || 5;
    const bsCount = examConfig?.counts?.bs || 5;

    setAnswers({
      pg: Array(pgCount).fill(''),
      pgk: Array.from({ length: pgkCount }, () => [false, false, false, false]),
      bs: Array.from({ length: bsCount }, () => ['', '', '', '']),
    });
    setStudentName('');
    setStudentNis('');
    setStudentImage(null);
    setScanMessage(null);
    if (onCancelEdit) onCancelEdit();
  };

  // Save student correction
  const handleSaveStudent = () => {
    if (!studentName.trim()) {
      alert('Mohon masukkan Nama Siswa terlebih dahulu.');
      return;
    }

    const studentData = {
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      examId: examConfig.id,
      name: studentName.trim(),
      nis: studentNis.trim() || '-',
      className: studentClass.trim() || examConfig.classGrade,
      timestamp: editingStudent ? editingStudent.timestamp : new Date().toISOString(),
      imageUri: studentImage,
      answers: answers,
      finalScore: scoreResult.finalScore,
      isPassed: scoreResult.isPassed,
    };

    onSaveStudent(studentData);

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      if (!editingStudent) {
        handleResetForNextStudent();
      }
    }, 1200);
  };

  // Handle Gemini AI vision scanning
  const handleAiScan = async () => {
    if (!studentImage) {
      alert('Silakan unggah atau ambil foto lembar kerja terlebih dahulu sebelum memindai dengan AI.');
      return;
    }

    if (!settings?.geminiApiKey) {
      const confirmOpen = window.confirm(
        'API Key Gemini belum disetel. Ingin membuka menu Pengaturan untuk memasukkan API Key Gemini (gratis)?'
      );
      if (confirmOpen && onOpenSettings) {
        onOpenSettings();
      }
      return;
    }

    setIsScanning(true);
    setScanMessage(null);

    try {
      const result = await scanExamSheetWithGemini({
        base64Image: studentImage,
        apiKey: settings.geminiApiKey,
        examConfig,
      });

      if (result.student) {
        if (result.student.name) setStudentName(result.student.name);
        if (result.student.nis) setStudentNis(result.student.nis);
        if (result.student.className) setStudentClass(result.student.className);
      }

      if (result.answers) {
        const pgCount = examConfig?.counts?.pg || 20;
        const pgkCount = examConfig?.counts?.pgk || 5;
        const bsCount = examConfig?.counts?.bs || 5;

        setAnswers({
          pg: Array.isArray(result.answers.pg) 
            ? result.answers.pg.slice(0, pgCount) 
            : Array(pgCount).fill(''),
          pgk: Array.isArray(result.answers.pgk) 
            ? result.answers.pgk.slice(0, pgkCount) 
            : Array.from({ length: pgkCount }, () => [false, false, false, false]),
          bs: Array.isArray(result.answers.bs) 
            ? result.answers.bs.slice(0, bsCount) 
            : Array.from({ length: bsCount }, () => ['', '', '', '']),
        });
      }

      setScanMessage({
        type: 'success',
        text: 'Berhasil memindai lembar kerja! Silakan periksa kembali jawaban siswa di bawah ini.',
        notes: result.confidenceNotes,
      });
    } catch (err) {
      console.error('Scan error:', err);
      setScanMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat memproses gambar.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const pgCount = examConfig?.counts?.pg || 20;
  const pgkCount = examConfig?.counts?.pgk || 5;
  const bsCount = examConfig?.counts?.bs || 5;

  return (
    <div className="space-y-6">
      {/* Top Banner / Student Identity Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Contoh: Ahmad Faiz"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                NIS / No Peserta / No Absen
              </label>
              <input
                type="text"
                value={studentNis}
                onChange={(e) => setStudentNis(e.target.value)}
                placeholder="Contoh: 2026019"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Kelas
              </label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Contoh: 9 - A"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Quick Score Highlight Widget */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-3.5 rounded-2xl shadow-md min-w-[240px] justify-between">
            <div>
              <div className="text-[11px] font-medium text-indigo-300 uppercase tracking-wider">
                Skor Siswa
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight text-white">
                  {scoreResult.finalScore}
                </span>
                <span className="text-xs text-indigo-300 font-medium">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                scoreResult.isPassed 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {scoreResult.isPassed ? 'TUNTAS' : 'REMEDIAL'}
              </span>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                KKM: {scoreResult.kkm} | Predikat: {scoreResult.predicate}
              </div>
            </div>
          </div>
        </div>

        {/* Scan Message / Notice if any */}
        {scanMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2.5 ${
            scanMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{scanMessage.text}</p>
              {scanMessage.notes && <p className="mt-1 text-slate-600 italic">{scanMessage.notes}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Main Split Grid: Left = Photo Viewer, Right = Answer Input Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Photo of Answer Sheet (5 cols on large screens) */}
        <div className="lg:col-span-5 h-[680px]">
          <ImageViewer
            imageSrc={studentImage}
            onImageChange={setStudentImage}
            onOpenCamera={() => setIsCameraOpen(true)}
            onAiScan={handleAiScan}
            isScanning={isScanning}
            hasApiKey={!!settings?.geminiApiKey}
          />
        </div>

        {/* Right Column: Interactive Answer Sheet Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden h-[680px]">
          {/* Section Filter Tabs */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSection('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Semua Soal ({pgCount + pgkCount + bsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('pg')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === 'pg'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                1. Pilihan Ganda ({pgCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('pgk')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === 'pgk'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                2. PG Kompleks ({pgkCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('bs')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === 'bs'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                3. Benar / Salah ({bsCount})
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
              {scoreResult.pgResult.correctCount + scoreResult.pgkResult.fullCorrectCount + scoreResult.bsResult.fullCorrectCount} Benar
            </div>
          </div>

          {/* Scrollable Questions Form */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* ============================================================== */}
            {/* BAGIAN 1: PILIHAN GANDA (A - E) */}
            {/* ============================================================== */}
            {(activeSection === 'all' || activeSection === 'pg') && (
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      A
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">
                      Pilihan Ganda (A - E)
                    </h4>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Benar: <strong className="text-indigo-600">{scoreResult.pgResult.correctCount}</strong> / {pgCount}
                    <span className="ml-2 font-mono text-[11px] bg-slate-200/80 px-2 py-0.5 rounded">
                      Bobot: {examConfig.weights?.pg}%
                    </span>
                  </div>
                </div>

                {/* Grid of PG Questions */}
                <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between">
                  <span>Klik nomor soal atau gunakan keyboard langsung: tekan <strong>A, B, C, D, E</strong> untuk mengisi cepat.</span>
                  <span className="font-mono text-[10px] bg-slate-200/70 px-2 py-0.5 rounded">Aktif: Soal #{activePgIndex + 1}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {scoreResult.pgResult.details.map((item, idx) => {
                    const studentChoice = answers.pg[idx] || '';
                    const isKeyMatched = item.isCorrect;
                    const hasAnswer = studentChoice !== '';
                    const isActive = activePgIndex === idx;

                    return (
                      <div
                        key={`pg-${idx}`}
                        onClick={() => setActivePgIndex(idx)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                          isActive ? 'ring-2 ring-indigo-500 border-indigo-400 shadow-xs' : ''
                        } ${
                          hasAnswer
                            ? isKeyMatched
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : 'bg-rose-50/60 border-rose-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Question Number & Status Indicator */}
                        <div className="flex items-center gap-2 min-w-[58px]">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {hasAnswer && (
                            isKeyMatched ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <div className="flex items-center gap-0.5 text-[10px] font-bold text-rose-600" title={`Kunci: ${item.keyAnswer}`}>
                                <XCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-[10px] bg-rose-200/70 px-1 rounded">{item.keyAnswer}</span>
                              </div>
                            )
                          )}
                        </div>

                        {/* Options A - E Bubbles */}
                        <div className="flex items-center space-x-1">
                          {['A', 'B', 'C', 'D', 'E'].map(opt => {
                            const isSelected = studentChoice === opt;
                            const isKey = item.keyAnswer === opt;

                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelectPg(idx, opt)}
                                className={`w-7 h-7 rounded-full text-xs font-bold transition-all transform active:scale-90 flex items-center justify-center ${
                                  isSelected
                                    ? isKey
                                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
                                      : 'bg-rose-600 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-300'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:border-indigo-400'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* BAGIAN 2: PILIHAN GANDA KOMPLEKS (PGK) - 4 PERNYATAAN */}
            {/* ============================================================== */}
            {(activeSection === 'all' || activeSection === 'pgk') && (
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                      B
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Pilihan Ganda Kompleks (PGK)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        4 Pernyataan per soal (centang pernyataan yang dipilih siswa)
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Bobot: <span className="font-mono bg-slate-200/80 px-2 py-0.5 rounded">{examConfig.weights?.pgk}%</span>
                  </div>
                </div>

                {/* List of PGK Questions */}
                <div className="space-y-3">
                  {scoreResult.pgkResult.details.map((item, qIdx) => {
                    const studentChoices = answers.pgk[qIdx] || [false, false, false, false];

                    return (
                      <div
                        key={`pgk-${qIdx}`}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                              No {qIdx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              Pernyataan 1 - 4:
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                              item.isAllCorrect 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : item.matchCount > 0 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-rose-100 text-rose-700'
                            }`}>
                              Cocok: {item.matchCount} / 4 ({item.points} poin)
                            </span>
                          </div>
                        </div>

                        {/* 4 Statement Checkboxes */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[0, 1, 2, 3].map(sIdx => {
                            const isChecked = Boolean(studentChoices[sIdx]);
                            const isKeyChecked = Boolean(examConfig?.keys?.pgk?.[qIdx]?.[sIdx]);
                            const isMatch = isChecked === isKeyChecked;

                            return (
                              <button
                                key={`pgk-${qIdx}-s-${sIdx}`}
                                type="button"
                                onClick={() => handleTogglePgk(qIdx, sIdx)}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                                  isChecked
                                    ? isMatch
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                                      : 'bg-rose-50 border-rose-400 text-rose-900 font-semibold'
                                    : isKeyChecked
                                      ? 'bg-amber-50/50 border-amber-200 text-slate-700'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                                    P{sIdx + 1}
                                  </span>
                                  <span>{isChecked ? 'Dipilih' : 'Tidak'}</span>
                                </span>

                                <span className="text-[11px]">
                                  {isChecked ? (
                                    isMatch ? '✓' : '✗'
                                  ) : (
                                    isKeyChecked ? <span className="text-amber-600 font-mono text-[10px]">(Kunci ✓)</span> : '—'
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* BAGIAN 3: BENAR / SALAH (BS) - 4 PILIHAN */}
            {/* ============================================================== */}
            {(activeSection === 'all' || activeSection === 'bs') && (
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                      C
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Benar / Salah (BS)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        4 Pernyataan per soal (Pilih B untuk Benar atau S untuk Salah)
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Bobot: <span className="font-mono bg-slate-200/80 px-2 py-0.5 rounded">{examConfig.weights?.bs}%</span>
                  </div>
                </div>

                {/* List of BS Questions */}
                <div className="space-y-3">
                  {scoreResult.bsResult.details.map((item, qIdx) => {
                    const studentChoices = answers.bs[qIdx] || ['', '', '', ''];

                    return (
                      <div
                        key={`bs-${qIdx}`}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                              No {qIdx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              Pernyataan 1 - 4:
                            </span>
                          </div>

                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            item.isAllCorrect 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : item.matchCount > 0 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-rose-100 text-rose-700'
                          }`}>
                            Cocok: {item.matchCount} / 4 ({item.points} poin)
                          </span>
                        </div>

                        {/* 4 Statements B / S selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[0, 1, 2, 3].map(sIdx => {
                            const val = (studentChoices[sIdx] || '').toUpperCase();
                            const keyVal = (examConfig?.keys?.bs?.[qIdx]?.[sIdx] || '').toUpperCase();
                            const isMatch = val !== '' && val === keyVal;
                            const isWrong = val !== '' && val !== keyVal;

                            return (
                              <div
                                key={`bs-${qIdx}-s-${sIdx}`}
                                className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                                  isMatch 
                                    ? 'bg-emerald-50/70 border-emerald-300' 
                                    : isWrong 
                                      ? 'bg-rose-50/70 border-rose-300' 
                                      : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">
                                    P{sIdx + 1}
                                  </span>
                                  {isWrong && (
                                    <span className="text-[10px] text-rose-600 font-mono font-bold">
                                      (Kunci: {keyVal})
                                    </span>
                                  )}
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectBs(qIdx, sIdx, 'B')}
                                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all active:scale-95 ${
                                      val === 'B'
                                        ? keyVal === 'B'
                                          ? 'bg-emerald-600 text-white shadow-sm'
                                          : 'bg-rose-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    B (Benar)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectBs(qIdx, sIdx, 'S')}
                                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all active:scale-95 ${
                                      val === 'S'
                                        ? keyVal === 'S'
                                          ? 'bg-emerald-600 text-white shadow-sm'
                                          : 'bg-rose-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    S (Salah)
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetForNextStudent}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                title="Kosongkan form untuk memeriksa siswa baru"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{editingStudent ? 'Batal Edit' : 'Siswa Baru'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveStudent}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{editingStudent ? 'Simpan Perubahan' : 'Simpan Nilai Siswa'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(imgData) => {
          setStudentImage(imgData);
        }}
      />

      {/* Save Success Toast */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-bold">Nilai Siswa Berhasil Disimpan ke Rekap!</span>
        </div>
      )}
    </div>
  );
}
