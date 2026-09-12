import { Company, BuyBox, ScoreBreakdown } from '@/types';

export function calculateBoringBizScore(company: Company, buyBox?: BuyBox): ScoreBreakdown {
  const breakdown: Record<string, { score: number; max: number; label: string }> = {};

  // ─── Business Quality (40 pts) ────────────────────────────────────────────
  // Cash flow / margins (0-10)
  let marginScore = 0;
  const ebitdaMargin = company.ebitda / company.revenue;
  if (ebitdaMargin >= 0.25) marginScore = 10;
  else if (ebitdaMargin >= 0.20) marginScore = 8;
  else if (ebitdaMargin >= 0.15) marginScore = 6;
  else if (ebitdaMargin >= 0.10) marginScore = 4;
  else marginScore = 2;
  breakdown.margins = { score: marginScore, max: 10, label: 'Cash flow & margins' };

  // Years operating (0-8)
  let yearsScore = 0;
  if (company.yearsOperating >= 25) yearsScore = 8;
  else if (company.yearsOperating >= 15) yearsScore = 6;
  else if (company.yearsOperating >= 10) yearsScore = 5;
  else if (company.yearsOperating >= 5) yearsScore = 3;
  else yearsScore = 1;
  breakdown.years = { score: yearsScore, max: 8, label: 'Years operating' };

  // Google rating (0-8)
  let ratingScore = 0;
  if (company.googleRating >= 4.8) ratingScore = 8;
  else if (company.googleRating >= 4.5) ratingScore = 6;
  else if (company.googleRating >= 4.0) ratingScore = 4;
  else if (company.googleRating >= 3.5) ratingScore = 2;
  else ratingScore = 0;
  breakdown.rating = { score: ratingScore, max: 8, label: 'Google rating' };

  // Review volume (0-6)
  let reviewScore = 0;
  if (company.reviewCount >= 300) reviewScore = 6;
  else if (company.reviewCount >= 150) reviewScore = 5;
  else if (company.reviewCount >= 75) reviewScore = 4;
  else if (company.reviewCount >= 25) reviewScore = 2;
  else reviewScore = 1;
  breakdown.reviews = { score: reviewScore, max: 6, label: 'Review volume' };

  // Revenue / stability (0-8)
  let revenueScore = 0;
  if (company.revenue >= 3000000) revenueScore = 8;
  else if (company.revenue >= 2000000) revenueScore = 7;
  else if (company.revenue >= 1000000) revenueScore = 5;
  else if (company.revenue >= 500000) revenueScore = 3;
  else revenueScore = 1;
  breakdown.revenue = { score: revenueScore, max: 8, label: 'Revenue scale' };

  const businessQuality = marginScore + yearsScore + ratingScore + reviewScore + revenueScore;

  // ─── Acquisition Fit (25 pts) ─────────────────────────────────────────────
  let industryMatch = 5; // default neutral
  let dealSizeMatch = 5;
  let sellerSignalScore = 0;
  let geoMatch = 3;

  if (buyBox) {
    // Industry match (0-8)
    if (buyBox.targetIndustries.includes(company.industry)) industryMatch = 8;
    else if (buyBox.maybeIndustries.includes(company.industry)) industryMatch = 4;
    else if (buyBox.avoidIndustries.includes(company.industry)) industryMatch = 0;
    else industryMatch = 5;

    // Deal size match (0-8)
    const estPrice = company.askingPrice ?? company.valuationEstimate;
    if (estPrice >= buyBox.minPrice && estPrice <= buyBox.maxPrice) dealSizeMatch = 8;
    else if (estPrice < buyBox.minPrice * 0.7 || estPrice > buyBox.maxPrice * 1.3) dealSizeMatch = 2;
    else dealSizeMatch = 5;

    // Geography (0-4)
    if (buyBox.targetStates.includes(company.state)) geoMatch = 4;
    else geoMatch = 2;
  } else {
    industryMatch = 6;
    dealSizeMatch = 6;
    geoMatch = 3;
  }

  breakdown.industry = { score: industryMatch, max: 8, label: 'Industry match' };
  breakdown.dealSize = { score: dealSizeMatch, max: 8, label: 'Deal size match' };

  // Seller signals (0-5)
  const strongSignals = ['Retirement', 'Aging owner', 'Health motivation', 'Founder-owned 35 years',
    'Motivated timeline', 'No successor', 'Clean books'];
  const signalMatches = company.sellerSignals.filter(s =>
    strongSignals.some(strong => s.toLowerCase().includes(strong.toLowerCase()))
  ).length;
  sellerSignalScore = Math.min(5, signalMatches * 2);
  breakdown.sellerSignals = { score: sellerSignalScore, max: 5, label: 'Seller situation' };
  breakdown.geography = { score: geoMatch, max: 4, label: 'Geography match' };

  const acquisitionFit = industryMatch + dealSizeMatch + sellerSignalScore + geoMatch;

  // ─── Untapped Upside (35 pts) ─────────────────────────────────────────────
  // Website quality gap — worse site = more upside (0-10)
  const websiteGapScore = (6 - company.websiteQuality) * 2;
  breakdown.websiteGap = { score: websiteGapScore, max: 10, label: 'Website improvement opportunity' };

  // Missing online booking (0-5)
  const bookingScore = company.hasOnlineBooking ? 0 : 5;
  breakdown.booking = { score: bookingScore, max: 5, label: 'Online booking gap' };

  // Missing CRM (0-4)
  const crmScore = company.hasCRM ? 0 : 4;
  breakdown.crm = { score: crmScore, max: 4, label: 'CRM gap' };

  // SEO/social/paid gap (0-8)
  let digitalGap = 0;
  if (!company.hasActiveSEO) digitalGap += 3;
  if (!company.hasSocialMedia) digitalGap += 2;
  if (!company.hasPaidAds) digitalGap += 3;
  breakdown.digital = { score: digitalGap, max: 8, label: 'Digital marketing gap' };

  // AI automation opportunity (0-8) — based on employee count and manual tasks
  let aiScore = 0;
  if (company.employees >= 20) aiScore = 8;
  else if (company.employees >= 10) aiScore = 6;
  else if (company.employees >= 5) aiScore = 4;
  else aiScore = 2;
  if (company.hasCRM) aiScore = Math.max(0, aiScore - 2);
  breakdown.aiOpportunity = { score: aiScore, max: 8, label: 'AI automation opportunity' };

  const untappedUpside = websiteGapScore + bookingScore + crmScore + digitalGap + aiScore;

  const total = Math.min(100, businessQuality + acquisitionFit + untappedUpside);

  return {
    total,
    businessQuality,
    acquisitionFit,
    untappedUpside,
    breakdown,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-accent';
  if (score >= 65) return 'text-warning';
  return 'text-text-secondary';
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Prime';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Moderate';
  if (score >= 45) return 'Weak';
  return 'Pass';
}
