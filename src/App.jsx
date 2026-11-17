import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CorrectionWorkspace from './components/CorrectionWorkspace';
import KeyEditor from './components/KeyEditor';
import PrintableLJK from './components/PrintableLJK';
import Gradebook from './components/Gradebook';
import SettingsModal from './components/SettingsModal';
import { storage } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('correction'); // 'correction' | 'keys' | 'print' | 'grades'
  const [examConfig, setExamConfig] = useState(() => storage.getActiveExam());
  const [students, setStudents] = useState(() => storage.getStudents(storage.getActiveExamId()));
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Sync students whenever examConfig changes
  useEffect(() => {
    if (examConfig?.id) {
      setStudents(storage.getStudents(examConfig.id));
    }
  }, [examConfig?.id]);

  const handleSaveStudent = (studentData) => {
    const updatedList = storage.addOrUpdateStudent(studentData);
    setStudents(updatedList.filter(s => s.examId === examConfig.id));
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId) => {
    const updatedList = storage.deleteStudent(studentId);
    setStudents(updatedList.filter(s => s.examId === examConfig.id));
  };

  const handleClearAllStudents = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA data nilai siswa untuk ujian ini?')) {
      const updatedList = storage.clearAllStudents(examConfig.id);
      setStudents(updatedList.filter(s => s.examId === examConfig.id));
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setActiveTab('correction');
  };

  const handleSaveExamConfig = (newConfig) => {
    storage.saveActiveExam(newConfig);
    setExamConfig(newConfig);
  };

  const handleSaveSettings = (newSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleDataReset = () => {
    setExamConfig(storage.getActiveExam());
    setStudents(storage.getStudents(storage.getActiveExamId()));
    setSettings(storage.getSettings());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        examConfig={examConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        studentCount={students.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'correction' && (
          <CorrectionWorkspace
            examConfig={examConfig}
            onSaveStudent={handleSaveStudent}
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            editingStudent={editingStudent}
            onCancelEdit={() => setEditingStudent(null)}
          />
        )}

        {activeTab === 'keys' && (
          <KeyEditor
            examConfig={examConfig}
            onSaveExamConfig={handleSaveExamConfig}
          />
        )}

        {activeTab === 'print' && (
          <PrintableLJK
            examConfig={examConfig}
          />
        )}

        {activeTab === 'grades' && (
          <Gradebook
            examConfig={examConfig}
            students={students}
            onDeleteStudent={handleDeleteStudent}
            onEditStudent={handleEditStudent}
            onClearAll={handleClearAllStudents}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onDataReset={handleDataReset}
      />

      {/* Footer */}
      <footer className="no-print border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        <p>
          KoreksiPintar — Aplikasi Penilaian & Koreksi Lembar Jawaban Ujian (PG A-E, PG Kompleks 4 Pernyataan, Benar/Salah 4 Pilihan)
        </p>
      </footer>
    </div>
  );
}
