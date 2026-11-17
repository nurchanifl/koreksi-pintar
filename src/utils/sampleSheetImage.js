/**
 * Generates an authentic canvas-drawn sample exam answer sheet image
 * so users can test the image viewer and grading workspace immediately.
 */

export function generateSampleSheetDataUrl() {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');

  // Background Paper (Off-white / cream paper tone)
  ctx.fillStyle = '#fbfbfa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper grain / border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Corner OMR Alignment Markers
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(40, 40, 36, 36);
  ctx.fillRect(canvas.width - 76, 40, 36, 36);
  ctx.fillRect(40, canvas.height - 76, 36, 36);
  ctx.fillRect(canvas.width - 76, canvas.height - 76, 36, 36);

  // Header Title
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('SMP / SMA NEGERI 1 NUSANTARA', canvas.width / 2, 75);
  ctx.font = '900 32px sans-serif';
  ctx.fillText('LEMBAR JAWABAN UJIAN (LJK)', canvas.width / 2, 118);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Penilaian Akhir Semester (PAS) — Bahasa Indonesia & Literasi', canvas.width / 2, 146);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(80, 165);
  ctx.lineTo(canvas.width - 80, 165);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();

  // Student Identity Box
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('NAMA LENGKAP :   Ahmad Faiz Al-Ghifari', 100, 205);
  ctx.fillText('NIS / ABSEN         :   2026001', 100, 238);
  ctx.fillText('KELAS / MAPEL    :   9 - A  |  Bahasa Indonesia', 100, 271);

  // Instructions Box
  ctx.font = 'italic 14px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('* Hitamkan bulatan jawaban secara penuh menggunakan pensil atau pulpen.', 100, 305);

  // Section 1: Pilihan Ganda (A - E)
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('I. PILIHAN GANDA (A - E)', 100, 360);

  const options = ['A', 'B', 'C', 'D', 'E'];
  const samplePgAnswers = [
    'A', 'B', 'C', 'D', 'E',
    'A', 'B', 'C', 'D', 'B',
    'A', 'B', 'C', 'D', 'E',
    'A', 'B', 'A', 'D', 'E'
  ];

  // Draw 20 PG questions in 2 columns of 10
  for (let i = 0; i < 20; i++) {
    const col = i < 10 ? 0 : 1;
    const row = i % 10;
    const xBase = col === 0 ? 100 : 620;
    const yBase = 410 + row * 44;

    // Question number
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${(i + 1).toString().padStart(2, ' ')}.`, xBase, yBase + 16);

    // Options A - E bubbles
    options.forEach((opt, optIdx) => {
      const bubbleX = xBase + 45 + optIdx * 45;
      const bubbleY = yBase + 10;
      const isChosen = samplePgAnswers[i] === opt;

      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, 14, 0, Math.PI * 2);

      if (isChosen) {
        // Shaded pencil bubble (dark charcoal with texture)
        ctx.fillStyle = '#262626';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(opt, bubbleX, bubbleY + 4);
        ctx.textAlign = 'left';
      } else {
        // Unshaded bubble
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.fillText(opt, bubbleX, bubbleY + 4);
        ctx.textAlign = 'left';
      }
    });
  }

  // Section 2: Pilihan Ganda Kompleks (PGK) - 4 Pernyataan
  const pgkY = 890;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('II. PILIHAN GANDA KOMPLEKS (4 Pernyataan per soal)', 100, pgkY);

  const samplePgk = [
    [true, false, true, false],
    [true, true, false, false],
    [false, true, true, true],
    [true, false, false, true],
    [true, true, true, false]
  ];

  samplePgk.forEach((statements, qIdx) => {
    const yPos = pgkY + 40 + qIdx * 40;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`Soal ${qIdx + 1}:`, 100, yPos + 16);

    for (let s = 0; s < 4; s++) {
      const boxX = 200 + s * 95;
      const isChecked = statements[s];

      // Checkbox
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, yPos, 22, 22);

      if (isChecked) {
        // Draw Checkmark
        ctx.beginPath();
        ctx.moveTo(boxX + 4, yPos + 11);
        ctx.lineTo(boxX + 9, yPos + 18);
        ctx.lineTo(boxX + 19, yPos + 5);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(`P${s + 1}`, boxX + 28, yPos + 16);
    }
  });

  // Section 3: Benar / Salah (BS) - 4 Pernyataan
  const bsY = 1170;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('III. BENAR / SALAH (4 Pernyataan per soal)', 100, bsY);

  const sampleBs = [
    ['B', 'S', 'B', 'S'],
    ['B', 'B', 'S', 'S'],
    ['S', 'B', 'B', 'S'],
    ['B', 'S', 'S', 'B'],
    ['S', 'B', 'B', 'B']
  ];

  sampleBs.forEach((statements, qIdx) => {
    const yPos = bsY + 40 + qIdx * 40;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`Soal ${qIdx + 1}:`, 100, yPos + 16);

    for (let s = 0; s < 4; s++) {
      const baseX = 200 + s * 110;
      const val = statements[s];

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`P${s + 1}:`, baseX, yPos + 16);

      // 'B' bubble
      const bX = baseX + 34;
      const bY = yPos + 12;
      ctx.beginPath();
      ctx.arc(bX, bY, 12, 0, Math.PI * 2);
      if (val === 'B') {
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.stroke();
        ctx.fillStyle = '#64748b';
      }
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('B', bX, bY + 4);

      // 'S' bubble
      const sX = baseX + 62;
      const sY = yPos + 12;
      ctx.beginPath();
      ctx.arc(sX, sY, 12, 0, Math.PI * 2);
      if (val === 'S') {
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.stroke();
        ctx.fillStyle = '#64748b';
      }
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('S', sX, sY + 4);
      ctx.textAlign = 'left';
    }
  });

  // Footer Note
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('Dibuat & Diverifikasi dengan Sistem Koreksi Lembar Ujian KoreksiPintar', canvas.width / 2, 1540);

  return canvas.toDataURL('image/jpeg', 0.92);
}
