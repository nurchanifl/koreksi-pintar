/**
 * Utility functions for calculating exam scores across:
 * - Pilihan Ganda (PG) A - E
 * - Pilihan Ganda Kompleks (PGK) 4 Pernyataan
 * - Benar / Salah (BS) 4 Pernyataan
 */

export function calculateExamScore(examConfig = {}, studentAnswers = {}) {
  const keys = examConfig?.keys || { pg: [], pgk: [], bs: [] };
  const weights = examConfig?.weights || { pg: 50, pgk: 25, bs: 25 };
  const scoringRules = examConfig?.scoringRules || {
    pg: { pointsPerQuestion: 2 },
    pgk: { scoringMode: 'proportional', pointsPerQuestion: 4 },
    bs: { scoringMode: 'proportional', pointsPerQuestion: 4 },
  };
  const counts = examConfig?.counts || { pg: 20, pgk: 5, bs: 5 };

  const pgCount = counts?.pg ?? 0;
  const pgkCount = counts?.pgk ?? 0;
  const bsCount = counts?.bs ?? 0;

  // 1. Pilihan Ganda (PG)
  let pgEarned = 0;
  const pgPointsPerQ = scoringRules?.pg?.pointsPerQuestion || 1;
  const pgMax = pgCount * pgPointsPerQ;
  const pgDetails = [];

  for (let i = 0; i < pgCount; i++) {
    const studentAns = studentAnswers?.pg?.[i] || '';
    const keyAns = keys?.pg?.[i] || '';
    const isCorrect = studentAns !== '' && studentAns.toUpperCase() === keyAns.toUpperCase();
    const points = isCorrect ? pgPointsPerQ : 0;
    pgEarned += points;

    pgDetails.push({
      questionNumber: i + 1,
      studentAnswer: studentAns,
      keyAnswer: keyAns,
      isCorrect,
      points,
      maxPoints: pgPointsPerQ,
    });
  }

  // 2. Pilihan Ganda Kompleks (PGK) - 4 Pernyataan
  let pgkEarned = 0;
  const pgkPointsPerQ = scoringRules?.pgk?.pointsPerQuestion || 4;
  const pgkMode = scoringRules?.pgk?.scoringMode || 'proportional';
  const pgkMax = pgkCount * pgkPointsPerQ;
  const pgkDetails = [];

  for (let i = 0; i < pgkCount; i++) {
    const studentChoices = studentAnswers?.pgk?.[i] || [false, false, false, false];
    const keyChoices = keys?.pgk?.[i] || [false, false, false, false];

    let matchCount = 0;
    const statementsComparison = [];

    for (let s = 0; s < 4; s++) {
      const sAns = Boolean(studentChoices[s]);
      const kAns = Boolean(keyChoices[s]);
      const matched = sAns === kAns;
      if (matched) matchCount++;

      statementsComparison.push({
        statementIndex: s + 1,
        studentValue: sAns,
        keyValue: kAns,
        matched,
      });
    }

    let points = 0;
    const isAllCorrect = matchCount === 4;

    if (pgkMode === 'allOrNothing') {
      points = isAllCorrect ? pgkPointsPerQ : 0;
    } else {
      // Proportional: 0.25 per match
      points = Number(((matchCount / 4) * pgkPointsPerQ).toFixed(2));
    }

    pgkEarned += points;
    pgkDetails.push({
      questionNumber: i + 1,
      studentAnswers: studentChoices,
      keyAnswers: keyChoices,
      statementsComparison,
      matchCount,
      isAllCorrect,
      points,
      maxPoints: pgkPointsPerQ,
    });
  }

  // 3. Benar / Salah (BS) - 4 Pernyataan
  let bsEarned = 0;
  const bsPointsPerQ = scoringRules?.bs?.pointsPerQuestion || 4;
  const bsMode = scoringRules?.bs?.scoringMode || 'proportional';
  const bsMax = bsCount * bsPointsPerQ;
  const bsDetails = [];

  for (let i = 0; i < bsCount; i++) {
    const studentChoices = studentAnswers?.bs?.[i] || ['', '', '', ''];
    const keyChoices = keys?.bs?.[i] || ['B', 'S', 'B', 'S'];

    let matchCount = 0;
    const statementsComparison = [];

    for (let s = 0; s < 4; s++) {
      const sAns = (studentChoices[s] || '').toUpperCase();
      const kAns = (keyChoices[s] || '').toUpperCase();
      const matched = sAns !== '' && sAns === kAns;
      if (matched) matchCount++;

      statementsComparison.push({
        statementIndex: s + 1,
        studentValue: sAns,
        keyValue: kAns,
        matched,
      });
    }

    let points = 0;
    const isAllCorrect = matchCount === 4;

    if (bsMode === 'allOrNothing') {
      points = isAllCorrect ? bsPointsPerQ : 0;
    } else {
      // Proportional: 0.25 per match
      points = Number(((matchCount / 4) * bsPointsPerQ).toFixed(2));
    }

    bsEarned += points;
    bsDetails.push({
      questionNumber: i + 1,
      studentAnswers: studentChoices,
      keyAnswers: keyChoices,
      statementsComparison,
      matchCount,
      isAllCorrect,
      points,
      maxPoints: bsPointsPerQ,
    });
  }

  // Kalkulasi Skor Akhir
  const scoringMethod = examConfig.scoringMethod || 'scale100'; // 'scale100' | 'weighted' | 'rawPoints'
  const totalEarnedPoints = Number((pgEarned + pgkEarned + bsEarned).toFixed(2));
  const totalMaxPoints = pgMax + pgkMax + bsMax;

  // Persentase capaian per bagian
  const pgPercent = pgMax > 0 ? (pgEarned / pgMax) : 0;
  const pgkPercent = pgkMax > 0 ? (pgkEarned / pgkMax) : 0;
  const bsPercent = bsMax > 0 ? (bsEarned / bsMax) : 0;

  let finalScore = 0;

  if (scoringMethod === 'rawPoints') {
    // Skor Murni = Jumlah Poin yang diperoleh
    finalScore = totalEarnedPoints;
  } else if (scoringMethod === 'weighted') {
    // Berdasarkan Bobot Persentase (%)
    const weightPg = weights?.pg ?? 50;
    const weightPgk = weights?.pgk ?? 25;
    const weightBs = weights?.bs ?? 25;
    const totalWeight = (weightPg + weightPgk + weightBs) || 100;

    let weighted = (
      (pgPercent * weightPg) +
      (pgkPercent * weightPgk) +
      (bsPercent * weightBs)
    ) * (100 / totalWeight);

    finalScore = Math.min(100, Math.max(0, Number(weighted.toFixed(1))));
  } else {
    // Default 'scale100': Proporsional Poin ke Skala 100
    if (totalMaxPoints > 0) {
      finalScore = Math.min(100, Math.max(0, Number(((totalEarnedPoints / totalMaxPoints) * 100).toFixed(1))));
    } else {
      finalScore = 0;
    }
  }

  const kkm = examConfig.kkm || 75;
  const isPassed = finalScore >= kkm;

  let predicate = 'D';
  let predicateLabel = 'Perlu Remedial';
  const effectivePercentage = scoringMethod === 'rawPoints' 
    ? (totalMaxPoints > 0 ? (finalScore / totalMaxPoints) * 100 : 0)
    : finalScore;

  if (effectivePercentage >= 90) {
    predicate = 'A';
    predicateLabel = 'Sangat Baik';
  } else if (effectivePercentage >= 80) {
    predicate = 'B';
    predicateLabel = 'Baik';
  } else if (finalScore >= kkm) {
    predicate = 'C';
    predicateLabel = 'Cukup / Tuntas';
  }

  return {
    finalScore,
    totalEarnedPoints,
    totalMaxPoints,
    scoringMethod,
    isPassed,
    kkm,
    predicate,
    predicateLabel,
    pgResult: {
      earned: Number(pgEarned.toFixed(2)),
      max: pgMax,
      percentage: Number((pgPercent * 100).toFixed(1)),
      correctCount: pgDetails.filter(d => d.isCorrect).length,
      totalQuestions: pgCount,
      details: pgDetails,
    },
    pgkResult: {
      earned: Number(pgkEarned.toFixed(2)),
      max: pgkMax,
      percentage: Number((pgkPercent * 100).toFixed(1)),
      fullCorrectCount: pgkDetails.filter(d => d.isAllCorrect).length,
      totalQuestions: pgkCount,
      details: pgkDetails,
    },
    bsResult: {
      earned: Number(bsEarned.toFixed(2)),
      max: bsMax,
      percentage: Number((bsPercent * 100).toFixed(1)),
      fullCorrectCount: bsDetails.filter(d => d.isAllCorrect).length,
      totalQuestions: bsCount,
      details: bsDetails,
    },
  };
}
