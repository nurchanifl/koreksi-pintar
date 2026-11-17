import { calculateExamScore } from './scoring';

export function exportGradesToCSV(examConfig, students) {
  if (!students || students.length === 0) {
    alert('Tidak ada data siswa untuk diekspor.');
    return;
  }

  const rows = [];
  
  // Header Info
  rows.push([`"REKAPITULASI HASIL KOREKSI UJIAN"`]);
  rows.push([`"Nama Ujian"`, `"${examConfig.title}"`]);
  rows.push([`"Mata Pelajaran"`, `"${examConfig.subject}"`]);
  rows.push([`"Kelas / Tingkat"`, `"${examConfig.classGrade}"`]);
  rows.push([`"Standar KKM"`, `"${examConfig.kkm}"`]);
  rows.push([`"Tanggal Unduh"`, `"${new Date().toLocaleDateString('id-ID')}"`]);
  rows.push([]); // blank line

  // Column Headers
  const headers = [
    'No',
    'NIS / No Peserta',
    'Nama Siswa',
    'Kelas',
    'Benar PG',
    'Skor PG',
    'Skor PGK',
    'Skor Benar-Salah',
    'Nilai Akhir',
    'Predikat',
    'Keterangan KKM',
    'Waktu Koreksi'
  ];
  rows.push(headers.map(h => `"${h}"`));

  students.forEach((std, idx) => {
    const score = calculateExamScore(examConfig, std.answers);
    const dateStr = std.timestamp ? new Date(std.timestamp).toLocaleString('id-ID') : '-';
    
    rows.push([
      idx + 1,
      `"${std.nis || '-'}"`,
      `"${std.name || 'Tanpa Nama'}"`,
      `"${std.className || examConfig.classGrade || '-'}"`,
      `${score.pgResult.correctCount} / ${score.pgResult.totalQuestions}`,
      `${score.pgResult.earned} / ${score.pgResult.max}`,
      `${score.pgResult ? score.pgkResult.earned : 0} / ${score.pgkResult.max}`,
      `${score.bsResult ? score.bsResult.earned : 0} / ${score.bsResult.max}`,
      score.finalScore,
      `"${score.predicate}"`,
      `"${score.isPassed ? 'TUNTAS' : 'REMEDIAL'}"`,
      `"${dateStr}"`
    ]);
  });

  // Summary Row
  rows.push([]);
  const scores = students.map(s => calculateExamScore(examConfig, s.answers).finalScore);
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const passed = students.filter(s => calculateExamScore(examConfig, s.answers).isPassed).length;
  const passPercent = ((passed / students.length) * 100).toFixed(1);

  rows.push([`"Rata-rata Kelas"`, `"${avg}"`]);
  rows.push([`"Nilai Tertinggi"`, `"${max}"`]);
  rows.push([`"Nilai Terendah"`, `"${min}"`]);
  rows.push([`"Tingkat Kelulusan"`, `"${passPercent}% (${passed} dari ${students.length} siswa)"`]);

  // Convert to CSV with UTF-8 BOM
  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const cleanTitle = (examConfig.title || 'Ujian').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Nilai_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
