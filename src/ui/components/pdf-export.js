// ============================================================
// RashAi, PDF Export (jsPDF + html2canvas for chart capture)
// Generates a professional Kundali report PDF
// ============================================================

import { jsPDF } from 'jspdf';
import { NOTO_SANS_DEVANAGARI } from './fonts.js';
import { renderSouthIndianChart } from './chart-south.js';
import { renderNorthIndianChart } from './chart-north.js';

// Page layout constants (A4 in mm)
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CENTER_X = PAGE_W / 2;

// Color palette
const COL = {
  dark:      [20, 15, 45],
  darkAlt:   [30, 25, 55],
  gold:      [218, 175, 32],
  goldLight: [255, 245, 200],
  white:     [255, 255, 255],
  offWhite:  [248, 246, 255],
  muted:     [140, 130, 160],
  text:      [50, 45, 70],
  textLight: [100, 90, 120],
  teal:      [16, 185, 129],
  tealBg:    [236, 253, 245],
  rose:      [225, 29, 72],
  roseBg:    [255, 241, 242],
  border:    [220, 215, 235],
  cardBg:    [250, 248, 255],
};

async function loadLogoDataUrl() {
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

/**
 * Export the full Kundali report as a PDF
 */
export async function exportKundaliPDF(birthData, results) {
  const { chart, report, doshas, moonSign, sunSign, lagna, birthNakshatra } = results;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Register Devanagari font, only as 'normal' (no fake bold)
  doc.addFileToVFS('NotoSansDevanagari.ttf', NOTO_SANS_DEVANAGARI);
  doc.addFont('NotoSansDevanagari.ttf', 'noto', 'normal');

  let y = 0;

  // ════════════════════════════════════════════
  // PAGE 1, Header, Key Info, Chart, Planets
  // ════════════════════════════════════════════

  // ── Dark header band ──
  const HEADER_H = 56;
  doc.setFillColor(...COL.dark);
  doc.rect(0, 0, PAGE_W, HEADER_H, 'F');

  // Gold accent line at bottom of header
  doc.setFillColor(...COL.gold);
  doc.rect(0, HEADER_H, PAGE_W, 0.8, 'F');

  // Logo (left side)
  const logoDataUrl = await loadLogoDataUrl();
  const logoSize = 22;
  const logoX = MARGIN;
  const logoY = (HEADER_H - logoSize) / 2;

  if (logoDataUrl) {
    // White circle behind logo to look clean on dark bg
    doc.setFillColor(...COL.white);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 0.5, 'F');
    doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize);
    // Gold ring around logo
    doc.setDrawColor(...COL.gold);
    doc.setLineWidth(0.5);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 'D');
  }

  const textLeftX = logoDataUrl ? MARGIN + logoSize + 6 : MARGIN;

  // Brand name — big and prominent
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COL.gold);
  doc.text('RashAI', textLeftX, 16);

  // Sub-brand
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COL.muted);
  doc.text('by Akshay Shiwarkar', textLeftX, 21);

  // Kundali title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COL.white);
  const title = birthData.name ? `${birthData.name}'s Kundali` : 'Kundali Report';
  doc.text(title, textLeftX, 33);

  // Birth info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 195, 215);
  const placeName = birthData.place?.split(',')[0] || birthData.place;
  doc.text(`Born on ${formatDate(birthData.date)} at ${birthData.time} in ${placeName}`, textLeftX, 41);

  // Generated date (right side)
  doc.setFontSize(7);
  doc.setTextColor(...COL.muted);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Generated on ${dateStr}`, PAGE_W - MARGIN, 50, { align: 'right' });

  y = HEADER_H + 8;

  // ── Key Indicators (2x2 grid) ──
  y = drawSectionHeader(doc, 'Key Indicators', y);
  y += 3;

  const indicators = [
    { label: 'Moon Sign (Rashi)', value: moonSign.name, hindi: moonSign.hindi, detail: `Lord: ${moonSign.lord}`, symbol: moonSign.symbol },
    { label: 'Sun Sign', value: sunSign.name, hindi: sunSign.hindi, detail: sunSign.element, symbol: sunSign.symbol },
    { label: 'Ascendant (Lagna)', value: lagna.name, hindi: lagna.hindi, detail: `Lord: ${lagna.lord}`, symbol: lagna.symbol },
    { label: 'Birth Nakshatra', value: birthNakshatra.name, hindi: birthNakshatra.hindi, detail: `Pada ${birthNakshatra.pada} | Lord: ${birthNakshatra.lord}`, symbol: '' },
  ];

  const boxW = (CONTENT_W - 5) / 2;
  const boxH = 22;

  indicators.forEach((ind, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = MARGIN + col * (boxW + 5);
    const by = y + row * (boxH + 4);

    // Card background
    doc.setFillColor(...COL.cardBg);
    doc.setDrawColor(...COL.border);
    doc.roundedRect(bx, by, boxW, boxH, 1.5, 1.5, 'FD');

    // Gold left accent
    doc.setFillColor(...COL.gold);
    doc.rect(bx, by + 2, 1, boxH - 4, 'F');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COL.muted);
    doc.text(ind.label.toUpperCase(), bx + 5, by + 5.5);

    // English name (bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COL.dark);
    doc.text(ind.value, bx + 5, by + 12.5);

    // Hindi name inline (Noto font, normal)
    const engWidth = doc.getTextWidth(ind.value);
    doc.setFont('noto', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COL.textLight);
    doc.text(`  ${ind.hindi}`, bx + 5 + engWidth, by + 12.5);

    // Detail
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COL.muted);
    doc.text(ind.detail, bx + 5, by + 18.5);
  });

  y += 2 * (boxH + 4) + 6;

  // ── Birth Charts (both South & North Indian) ──
  y = drawSectionHeader(doc, 'Birth Charts', y);
  y += 2;

  try {
    const southSvg = renderSouthIndianChart(chart.houses, chart.lagnaRashi, 'pdf-south');
    const northSvg = renderNorthIndianChart(chart.houses, chart.lagnaRashi, 'pdf-north');

    const [southPng, northPng] = await Promise.all([
      svgToPng(parseSvg(southSvg)),
      svgToPng(parseSvg(northSvg)),
    ]);

    const chartSize = 82;
    const gap = 6;
    const leftX = CENTER_X - chartSize - gap / 2;
    const rightX = CENTER_X + gap / 2;

    // South Indian chart
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COL.muted);
    doc.text('South Indian', leftX + chartSize / 2, y, { align: 'center' });
    y += 3;

    doc.setDrawColor(...COL.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(leftX - 1, y - 1, chartSize + 2, chartSize + 2, 1.5, 1.5, 'D');
    doc.addImage(southPng, 'PNG', leftX, y, chartSize, chartSize);

    // North Indian chart
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COL.muted);
    doc.text('North Indian', rightX + chartSize / 2, y - 3, { align: 'center' });

    doc.setDrawColor(...COL.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(rightX - 1, y - 1, chartSize + 2, chartSize + 2, 1.5, 1.5, 'D');
    doc.addImage(northPng, 'PNG', rightX, y, chartSize, chartSize);

    y += chartSize + 6;
  } catch (e) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...COL.muted);
    doc.text('(Chart images could not be rendered)', CENTER_X, y + 8, { align: 'center' });
    y += 18;
  }

  // ── Planetary Positions Table ──
  y = drawSectionHeader(doc, 'Planetary Positions', y);
  y += 2;

  // Column layout
  const cols = [
    { header: 'Planet',    w: 36, x: MARGIN },
    { header: 'Sign',      w: 36, x: MARGIN + 36 },
    { header: 'Degree',    w: 20, x: MARGIN + 72 },
    { header: 'Nakshatra', w: 52, x: MARGIN + 92 },
    { header: 'House',     w: CONTENT_W - 144, x: MARGIN + 144 },
  ];

  // Table header row
  const headerH = 7;
  doc.setFillColor(...COL.dark);
  doc.roundedRect(MARGIN, y, CONTENT_W, headerH, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COL.gold);
  cols.forEach(c => doc.text(c.header.toUpperCase(), c.x + 3, y + 5));
  y += headerH;

  // Table rows
  const planetOrder = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const rowH = 6.5;

  planetOrder.forEach((planetId, idx) => {
    const data = report[planetId];
    if (!data) return;

    if (y > PAGE_H - 25) {
      drawFooter(doc);
      doc.addPage();
      y = MARGIN;
    }

    // Alternate row background
    if (idx % 2 === 0) {
      doc.setFillColor(...COL.offWhite);
      doc.rect(MARGIN, y, CONTENT_W, rowH, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COL.text);

    const retro = data.isRetrograde ? ' (R)' : '';
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.planet.name}${retro}`, cols[0].x + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.rashi.name, cols[1].x + 3, y + 4.5);
    doc.text(`${(data.degree ?? data.rashi?.degreeInSign ?? 0).toFixed(2)}°`, cols[2].x + 3, y + 4.5);
    doc.text(`${data.nakshatra.name} (P${data.nakshatra.pada})`, cols[3].x + 3, y + 4.5);
    doc.text(`${data.house || '-'}`, cols[4].x + 3, y + 4.5);
    y += rowH;
  });

  // Bottom border for table
  doc.setDrawColor(...COL.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);

  // Page 1 footer
  drawFooter(doc);

  // ════════════════════════════════════════════
  // PAGE 2, Doshas + Baby Naming
  // ════════════════════════════════════════════
  doc.addPage();
  y = MARGIN;

  // ── Dosha Analysis ──
  y = drawSectionHeader(doc, 'Dosha Analysis', y);
  y += 4;

  const doshaList = [
    { title: 'Mangal Dosha', hindi: 'मंगल दोष', data: doshas.mangalDosha },
    { title: 'Kaal Sarp Dosha', hindi: 'काल सर्प दोष', data: doshas.kaalSarpDosha },
    { title: 'Pitra Dosha', hindi: 'पितृ दोष', data: doshas.pitraDosha },
  ];

  doshaList.forEach(({ title: dTitle, hindi, data }) => {
    if (y > PAGE_H - 50) {
      drawFooter(doc);
      doc.addPage();
      y = MARGIN;
    }

    const isPresent = data.isPresent || data.partialKaalSarp;
    const severity = !isPresent ? 'Not Present' : (data.severity || 'Present');

    // Card
    const cardBg = isPresent ? COL.roseBg : COL.tealBg;
    const accentColor = isPresent ? COL.rose : COL.teal;

    doc.setFillColor(...cardBg);
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN, y, CONTENT_W, 10, 1.5, 1.5, 'FD');

    // Left accent bar
    doc.setFillColor(...accentColor);
    doc.rect(MARGIN, y + 1.5, 1.2, 7, 'F');

    // Title with Hindi
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COL.dark);
    doc.text(dTitle, MARGIN + 5, y + 5);

    // Hindi in Noto
    const titleW = doc.getTextWidth(dTitle);
    doc.setFont('noto', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COL.textLight);
    doc.text(` (${hindi})`, MARGIN + 5 + titleW, y + 5);

    // Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...accentColor);
    doc.text(severity, PAGE_W - MARGIN - 4, y + 5.5, { align: 'right' });

    y += 13;

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COL.text);
    const descLines = doc.splitTextToSize(data.description || '', CONTENT_W - 10);
    doc.text(descLines, MARGIN + 5, y);
    y += descLines.length * 3.5 + 2;

    // Cancellation reasons
    if (data.cancellationReasons?.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(...COL.muted);
      data.cancellationReasons.forEach(reason => {
        const lines = doc.splitTextToSize(`   ${reason}`, CONTENT_W - 16);
        doc.text(lines, MARGIN + 8, y);
        y += lines.length * 3;
      });
    }

    y += 8;
  });

  // ── Baby Naming Guide ──
  if (y > PAGE_H - 65) {
    drawFooter(doc);
    doc.addPage();
    y = MARGIN;
  }

  y = drawSectionHeader(doc, 'Baby Naming Guide', y);
  y += 4;

  // Nakshatra info line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COL.text);
  doc.text(`Based on `, MARGIN + 4, y);
  const baseW = doc.getTextWidth('Based on ');
  doc.setFont('helvetica', 'bold');
  doc.text(birthNakshatra.name, MARGIN + 4 + baseW, y);
  const nameW = doc.getTextWidth(birthNakshatra.name);
  doc.setFont('noto', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COL.textLight);
  doc.text(` (${birthNakshatra.hindi})`, MARGIN + 4 + baseW + nameW, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COL.text);
  const hindiPartW = doc.getTextWidth(` (${birthNakshatra.hindi})`);
  doc.text(` Nakshatra, Pada ${birthNakshatra.pada}`, MARGIN + 4 + baseW + nameW + hindiPartW, y);

  y += 10;

  // Pada syllable boxes
  const padaSyllables = birthNakshatra.syllables || [];
  const padaBoxW = 28;
  const padaGap = 5;
  const totalPadaW = padaSyllables.length * padaBoxW + (padaSyllables.length - 1) * padaGap;
  const padaStartX = (PAGE_W - totalPadaW) / 2;

  padaSyllables.forEach((syl, i) => {
    const px = padaStartX + i * (padaBoxW + padaGap);
    const isActive = i === birthNakshatra.pada - 1;

    if (isActive) {
      doc.setFillColor(...COL.goldLight);
      doc.setDrawColor(...COL.gold);
      doc.setLineWidth(0.6);
    } else {
      doc.setFillColor(...COL.offWhite);
      doc.setDrawColor(...COL.border);
      doc.setLineWidth(0.3);
    }
    doc.roundedRect(px, y, padaBoxW, 22, 2, 2, 'FD');

    // Pada label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...COL.muted);
    doc.text(`PADA ${i + 1}`, px + padaBoxW / 2, y + 5, { align: 'center' });

    // Syllable (use Noto for Devanagari)
    doc.setFont('noto', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(...(isActive ? COL.gold : COL.dark));
    doc.text(syl, px + padaBoxW / 2, y + 16, { align: 'center' });

    if (isActive) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.5);
      doc.setTextColor(...COL.gold);
      doc.text('BIRTH PADA', px + padaBoxW / 2, y + 20, { align: 'center' });
    }
  });

  y += 30;

  // Highlighted recommended syllable
  const activeSyllable = padaSyllables[birthNakshatra.pada - 1] || '';
  if (activeSyllable) {
    doc.setFillColor(...COL.goldLight);
    doc.setDrawColor(...COL.gold);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN + 30, y, CONTENT_W - 60, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COL.textLight);
    doc.text('Name should start with', CENTER_X, y + 5, { align: 'center' });

    doc.setFont('noto', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(...COL.gold);
    doc.text(activeSyllable, CENTER_X, y + 13.5, { align: 'center' });
  }

  // Page 2 footer
  drawFooter(doc);

  // ════════════════════════════════════════════
  // PAGE 3 (optional), AI Insights if present
  // ════════════════════════════════════════════
  const aiOutput = document.getElementById('ai-insights-output');
  if (aiOutput && aiOutput.children.length > 0) {
    doc.addPage();
    y = MARGIN;

    y = drawSectionHeader(doc, 'AI Chart Reading', y);
    y += 4;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...COL.muted);
    doc.text('Vedic interpretation generated by AI. Tendencies and influences, not certainties.', MARGIN, y);
    y += 8;

    const sectionDefs = [
      { label: 'PERSONALITY', icon: '', color: [128, 90, 213] },
      { label: 'CAREER', icon: '', color: [218, 175, 32] },
      { label: 'RELATIONSHIPS', icon: '', color: [225, 29, 72] },
      { label: 'STRENGTHS', icon: '', color: [16, 185, 129] },
      { label: 'CHALLENGES', icon: '', color: [245, 158, 11] },
    ];

    // Extract text from rendered AI output divs
    const aiDivs = aiOutput.querySelectorAll('div[style*="margin-bottom"]');
    aiDivs.forEach((div, idx) => {
      if (y > PAGE_H - 35) {
        drawFooter(doc);
        doc.addPage();
        y = MARGIN;
      }

      const def = sectionDefs[idx] || sectionDefs[0];
      const paragraph = div.querySelector('p');
      const titleEl = div.querySelector('div');
      const sectionTitle = titleEl?.textContent?.trim() || def.label;
      const sectionText = paragraph?.textContent?.trim() || '';

      if (!sectionText) return;

      // Section title with colored accent
      doc.setFillColor(...def.color);
      doc.rect(MARGIN, y, CONTENT_W, 0.6, 'F');
      y += 3;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...def.color);
      doc.text(sectionTitle, MARGIN, y);
      y += 5;

      // Section body
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COL.text);
      const lines = doc.splitTextToSize(sectionText, CONTENT_W - 4);
      doc.text(lines, MARGIN + 2, y);
      y += lines.length * 3.5 + 8;
    });

    drawFooter(doc);
  }

  // ── Save ──
  const fileName = birthData.name
    ? `${birthData.name.replace(/\s+/g, '_')}_Kundali.pdf`
    : 'Kundali_Report.pdf';
  doc.save(fileName);
}

// ════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════

/**
 * Parse an SVG string into a DOM SVGElement.
 */
function parseSvg(svgString) {
  const div = document.createElement('div');
  div.innerHTML = svgString;
  return div.querySelector('svg');
}

/**
 * Convert an inline SVG element to a PNG data URL via canvas.
 */
function svgToPng(svgEl) {
  return new Promise((resolve, reject) => {
    const clone = svgEl.cloneNode(true);
    const viewBox = clone.getAttribute('viewBox') || `0 0 ${svgEl.clientWidth} ${svgEl.clientHeight}`;
    const [,, vbW, vbH] = viewBox.split(/\s+/).map(Number);

    // Ensure xmlns so it's valid standalone SVG
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // Inline a dark background so the chart isn't transparent
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', '#110d2b');
    clone.insertBefore(bg, clone.firstChild);

    const svgData = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    const scale = 3;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = vbW * scale;
      canvas.height = vbH * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG render failed'));
    };
    img.src = url;
  });
}

function drawSectionHeader(doc, text, y) {
  // Section header background strip
  doc.setFillColor(245, 242, 255);
  doc.roundedRect(MARGIN, y - 2, CONTENT_W, 10, 1.5, 1.5, 'F');

  // Gold left accent
  doc.setFillColor(...COL.gold);
  doc.roundedRect(MARGIN, y - 2, 3, 10, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COL.dark);
  doc.text(text, MARGIN + 7, y + 5);

  return y + 12;
}

function drawFooter(doc) {
  const footerY = PAGE_H - 12;
  const pageNum = doc.internal.getCurrentPageInfo().pageNumber;

  // Footer background strip
  doc.setFillColor(248, 246, 255);
  doc.rect(0, footerY - 2, PAGE_W, 14, 'F');

  // Gold top accent line
  doc.setFillColor(...COL.gold);
  doc.rect(MARGIN + 30, footerY - 2, CONTENT_W - 60, 0.4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COL.muted);
  doc.text('Hobby project by Akshay Shiwarkar', CENTER_X, footerY + 2.5, { align: 'center' });

  doc.setFontSize(5.8);
  doc.setTextColor(170, 160, 190);
  doc.text('linkedin.com/in/akshay-shiwarkar  |  akshayshiwarkar.co.uk  |  github.com/Akshay-S-PY', CENTER_X, footerY + 6.5, { align: 'center' });

  // Page number
  doc.setFontSize(6);
  doc.setTextColor(...COL.muted);
  doc.text(`${pageNum}`, PAGE_W - MARGIN, footerY + 4, { align: 'right' });
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}
