export const QUESTION_TYPES = {
  PG: 'pg',     // Pilihan Ganda A - E
  PGK: 'pgk',   // Pilihan Ganda Kompleks (4 pernyataan)
  BS: 'bs',     // Benar / Salah (4 pernyataan)
};

export const DEFAULT_EXAM_CONFIG = {
  id: 'exam-default-1',
  title: 'Penilaian Sumatif Akhir Jenjang (PSAJ)',
  subject: 'Bahasa Indonesia & Literasi Sains',
  classGrade: 'Kelas 9 - A',
  teacher: 'Bapak / Ibu Guru',
  academicYear: '2026/2027',
  kkm: 75,
  weights: {
    pg: 50,    // 50%
    pgk: 25,   // 25%
    bs: 25,    // 25%
  },
  scoringRules: {
    pg: { pointsPerQuestion: 1 },
    // 'proportional': bobot dibagi per pernyataan benar (misal 3 dari 4 = 75%)
    // 'allOrNothing': harus semua 4 pernyataan tepat untuk dapat poin
    pgk: { scoringMode: 'proportional', pointsPerQuestion: 4 },
    bs: { scoringMode: 'proportional', pointsPerQuestion: 4 },
  },
  counts: {
    pg: 20,
    pgk: 5,
    bs: 5,
  },
  // Default sample answer key
  keys: {
    pg: [
      'A', 'B', 'C', 'D', 'E',
      'A', 'B', 'C', 'D', 'E',
      'A', 'B', 'C', 'D', 'E',
      'A', 'B', 'C', 'D', 'E'
    ],
    // 5 Soal PGK, masing-masing 4 pernyataan (true = dicentang/benar)
    pgk: [
      [true, false, true, false],
      [true, true, false, false],
      [false, true, true, false],
      [true, false, false, true],
      [true, true, true, false]
    ],
    // 5 Soal Benar/Salah, masing-masing 4 pernyataan ('B' = Benar, 'S' = Salah)
    bs: [
      ['B', 'S', 'B', 'S'],
      ['B', 'B', 'S', 'S'],
      ['S', 'B', 'B', 'S'],
      ['B', 'S', 'S', 'B'],
      ['S', 'S', 'B', 'B']
    ]
  }
};

export const SAMPLE_STUDENTS = [
  {
    id: 'std-1',
    examId: 'exam-default-1',
    name: 'Ahmad Faiz Al-Ghifari',
    nis: '2026001',
    className: '9 - A',
    timestamp: new Date().toISOString(),
    imageUri: null,
    answers: {
      pg: [
        'A', 'B', 'C', 'D', 'E',
        'A', 'B', 'C', 'D', 'B', // No 10 salah
        'A', 'B', 'C', 'D', 'E',
        'A', 'B', 'A', 'D', 'E'  // No 18 salah
      ],
      pgk: [
        [true, false, true, false], // 4/4
        [true, true, false, false],  // 4/4
        [false, true, true, true],   // 3/4
        [true, false, false, true],  // 4/4
        [true, true, true, false]   // 4/4
      ],
      bs: [
        ['B', 'S', 'B', 'S'], // 4/4
        ['B', 'B', 'S', 'S'], // 4/4
        ['S', 'B', 'B', 'S'], // 4/4
        ['B', 'S', 'S', 'B'], // 4/4
        ['S', 'B', 'B', 'B']  // 3/4
      ]
    }
  },
  {
    id: 'std-2',
    examId: 'exam-default-1',
    name: 'Citra Kirana Lestari',
    nis: '2026002',
    className: '9 - A',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    imageUri: null,
    answers: {
      pg: [
        'A', 'B', 'C', 'D', 'E',
        'A', 'B', 'C', 'D', 'E',
        'A', 'B', 'C', 'D', 'E',
        'A', 'B', 'C', 'D', 'E'
      ],
      pgk: [
        [true, false, true, false],
        [true, true, false, false],
        [false, true, true, false],
        [true, false, false, true],
        [true, true, true, false]
      ],
      bs: [
        ['B', 'S', 'B', 'S'],
        ['B', 'B', 'S', 'S'],
        ['S', 'B', 'B', 'S'],
        ['B', 'S', 'S', 'B'],
        ['S', 'S', 'B', 'B']
      ]
    }
  }
];
