/**
 * Gemini Vision Scanner for Exam Worksheets
 * Uses Gemini Flash Multimodal model to scan student name and answers
 * directly from the uploaded photo of the answer sheet.
 */

export async function scanExamSheetWithGemini({
  base64Image,
  mimeType = 'image/jpeg',
  apiKey,
  examConfig,
}) {
  if (!apiKey) {
    throw new Error('API Key Gemini belum dimasukkan. Silakan atur di menu Pengaturan.');
  }

  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const pgCount = examConfig?.counts?.pg || 20;
  const pgkCount = examConfig?.counts?.pgk || 5;
  const bsCount = examConfig?.counts?.bs || 5;

  const prompt = `
Anda adalah asisten pemeriksa lembar jawaban ujian siswa (LJK / lembar kerja).
Analisis foto lembar jawaban ini dengan sangat teliti dan akurat.

Petunjuk Ekstraksi:
1. Identitas Siswa:
   - "name": Nama lengkap siswa (jika terbaca, atau kosong jika tidak ada)
   - "nis": Nomor Induk Siswa / No Peserta / No Absen (jika terbaca)
   - "className": Kelas siswa (jika terbaca)

2. Jawaban Soal:
   A. Pilihan Ganda (PG) sebanyak ${pgCount} nomor:
      - Deteksi pilihan yang dilingkari/disilang/dihitamkan (A, B, C, D, atau E).
      - Kembalikan array sepanjang ${pgCount} elemen berupa string huruf kapital ("A", "B", "C", "D", "E") atau "" jika kosong/tidak dijawab.
   
   B. Pilihan Ganda Kompleks (PGK) sebanyak ${pgkCount} nomor:
      - Setiap nomor soal terdiri dari 4 pernyataan (P1, P2, P3, P4).
      - Deteksi tanda centang (v) / silang / bulatan yang dipilih siswa untuk masing-masing pernyataan.
      - Kembalikan array sepanjang ${pgkCount} elemen, di mana tiap elemen adalah array 4 boolean [true/false, true/false, true/false, true/false]. True berarti pernyataan tersebut dipilih/dicentang oleh siswa.
   
   C. Benar / Salah (BS) sebanyak ${bsCount} nomor:
      - Setiap nomor soal terdiri dari 4 pernyataan (P1, P2, P3, P4).
      - Deteksi apakah siswa memilih "B" (Benar) atau "S" (Salah) untuk tiap pernyataan.
      - Kembalikan array sepanjang ${bsCount} elemen, di mana tiap elemen adalah array 4 string [ "B"|"S"|"", "B"|"S"|"", "B"|"S"|"", "B"|"S"|"" ].

Kembalikan HANYA format JSON valid sesuai schema berikut:
{
  "student": {
    "name": "string",
    "nis": "string",
    "className": "string"
  },
  "answers": {
    "pg": ["A", "B", ...],
    "pgk": [
      [true, false, true, false],
      ...
    ],
    "bs": [
      ["B", "S", "B", "B"],
      ...
    ]
  },
  "confidenceNotes": "string catatan singkat mengenai kejelasan foto atau tulisan yang ragu-ragu"
}
`;

  // Clean base64 string if it contains data URI prefix
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.1,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Gagal memproses gambar dengan Gemini: ${message}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini tidak memberikan respons teks atau format jawaban tidak terbaca.');
  }

  try {
    const parsed = JSON.parse(rawText);
    return parsed;
  } catch (err) {
    console.error('Raw Gemini Response was not valid JSON:', rawText);
    throw new Error('Format balasan Gemini tidak dapat dibaca sebagai JSON.');
  }
}
