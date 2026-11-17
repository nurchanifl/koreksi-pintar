import { DEFAULT_EXAM_CONFIG, SAMPLE_STUDENTS } from '../constants/examDefaults';

const STORAGE_KEYS = {
  EXAMS: 'koreksi_exams_v1',
  ACTIVE_EXAM_ID: 'koreksi_active_exam_id_v1',
  STUDENTS: 'koreksi_students_v1',
  SETTINGS: 'koreksi_settings_v1',
};

export const storage = {
  getExams() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
      if (!data) {
        this.saveExams([DEFAULT_EXAM_CONFIG]);
        return [DEFAULT_EXAM_CONFIG];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get exams:', e);
      return [DEFAULT_EXAM_CONFIG];
    }
  },

  saveExams(exams) {
    try {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    } catch (e) {
      console.error('Failed to save exams:', e);
    }
  },

  getActiveExamId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EXAM_ID) || DEFAULT_EXAM_CONFIG.id;
  },

  setActiveExamId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EXAM_ID, id);
  },

  getActiveExam() {
    try {
      const exams = this.getExams();
      const activeId = this.getActiveExamId();
      const raw = exams.find(e => e.id === activeId) || exams[0] || DEFAULT_EXAM_CONFIG;
      
      // Ensure all fields have safe defaults
      return {
        ...DEFAULT_EXAM_CONFIG,
        ...raw,
        counts: { ...DEFAULT_EXAM_CONFIG.counts, ...(raw.counts || {}) },
        weights: { ...DEFAULT_EXAM_CONFIG.weights, ...(raw.weights || {}) },
        scoringRules: { ...DEFAULT_EXAM_CONFIG.scoringRules, ...(raw.scoringRules || {}) },
        keys: {
          pg: raw.keys?.pg || DEFAULT_EXAM_CONFIG.keys.pg,
          pgk: raw.keys?.pgk || DEFAULT_EXAM_CONFIG.keys.pgk,
          bs: raw.keys?.bs || DEFAULT_EXAM_CONFIG.keys.bs,
        }
      };
    } catch (e) {
      console.error('Error getting active exam, falling back to default:', e);
      return DEFAULT_EXAM_CONFIG;
    }
  },

  saveActiveExam(updatedExam) {
    const exams = this.getExams();
    const index = exams.findIndex(e => e.id === updatedExam.id);
    if (index >= 0) {
      exams[index] = updatedExam;
    } else {
      exams.push(updatedExam);
    }
    this.saveExams(exams);
  },

  getStudents(examId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!data) {
        // Initial sample data
        this.saveStudents(SAMPLE_STUDENTS);
        return examId ? SAMPLE_STUDENTS.filter(s => s.examId === examId) : SAMPLE_STUDENTS;
      }
      const students = JSON.parse(data);
      return examId ? students.filter(s => s.examId === examId) : students;
    } catch (e) {
      console.error('Failed to get students:', e);
      return [];
    }
  },

  saveStudents(students) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students:', e);
    }
  },

  addOrUpdateStudent(student) {
    const allStudents = this.getStudents();
    const index = allStudents.findIndex(s => s.id === student.id);
    if (index >= 0) {
      allStudents[index] = student;
    } else {
      allStudents.unshift(student); // newest first
    }
    this.saveStudents(allStudents);
    return allStudents;
  },

  deleteStudent(id) {
    const allStudents = this.getStudents();
    const filtered = allStudents.filter(s => s.id !== id);
    this.saveStudents(filtered);
    return filtered;
  },

  clearAllStudents(examId) {
    const allStudents = this.getStudents();
    const filtered = examId ? allStudents.filter(s => s.examId !== examId) : [];
    this.saveStudents(filtered);
    return filtered;
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        geminiApiKey: '',
        geminiModel: 'gemini-2.5-flash',
        soundEffects: true,
        autoAdvance: true
      };
    } catch (e) {
      return { geminiApiKey: '', geminiModel: 'gemini-2.5-flash', soundEffects: true, autoAdvance: true };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  exportAllData() {
    return {
      exams: this.getExams(),
      students: this.getStudents(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
  },

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.exams) this.saveExams(parsed.exams);
      if (parsed.students) this.saveStudents(parsed.students);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }
};
