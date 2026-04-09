import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Hive, Inspection, HarvestRecord, Treatment, HiveWeight } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Escaper HTML-spesialtegn for å forhindre injeksjon i PDF-mal. */
function esc(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface ReportData {
  year: number;
  hives: Hive[];
  inspections: Inspection[];
  harvests: HarvestRecord[];
  treatments: Treatment[];
  weights: HiveWeight[];
  displayName: string | null;
}

function buildHtml(data: ReportData): string {
  const { year, hives, inspections, harvests, treatments, weights, displayName } = data;

  const totalHoneyKg = Math.round(
    harvests.filter((h) => h.harvestedAt.startsWith(String(year))).reduce((s, h) => s + h.quantityKg, 0) * 10
  ) / 10;

  const yearInspections = inspections.filter((i) => i.inspectedAt.startsWith(String(year)));
  const yearTreatments = treatments.filter((t) => t.treatedAt.startsWith(String(year)));
  const activeHives = hives.filter((h) => h.isActive);

  const hiveRows = activeHives.map((hive) => {
    const hiveInspections = yearInspections.filter((i) => i.hiveId === hive.id);
    const hiveTreatments = yearTreatments.filter((t) => t.hiveId === hive.id);
    const hiveHarvests = harvests.filter((h) => h.hiveId === hive.id && h.harvestedAt.startsWith(String(year)));
    const hiveWeights = (weights ?? []).filter((w) => w.hiveId === hive.id && w.weighedAt.startsWith(String(year)));
    const totalKg = hiveHarvests.reduce((s, h) => s + h.quantityKg, 0);

    const inspectionRows = hiveInspections.map((insp) => `
      <tr>
        <td>${formatDateShort(insp.inspectedAt)}</td>
        <td>${insp.queenSeen ? '✓' : '–'}</td>
        <td>${insp.queenCellsFound ? '⚠️' : '–'}</td>
        <td>${insp.varroaCount ?? '–'}</td>
        <td>${insp.numFramesBrood ?? '–'}</td>
        <td>${insp.numFramesHoney ?? '–'}</td>
        <td>${insp.treatmentApplied ? esc(insp.treatmentProduct) || 'Ja' : '–'}</td>
      </tr>`).join('');

    const treatmentRows = hiveTreatments.map((t) => `
      <tr>
        <td>${formatDateShort(t.treatedAt)}</td>
        <td><strong>${esc(t.product)}</strong></td>
        <td>${esc(t.dose) || '–'}</td>
        <td>${esc(t.method) || '–'}</td>
        <td>${esc(t.notes) || '–'}</td>
      </tr>`).join('');

    const harvestRows = hiveHarvests.map((h) => `
      <tr>
        <td>${formatDateShort(h.harvestedAt)}</td>
        <td><strong>${h.quantityKg} kg</strong></td>
        <td>${esc(h.notes) || '–'}</td>
      </tr>`).join('');

    return `
      <div class="hive-section">
        <h2>🐝 ${esc(hive.name)}</h2>
        <div class="hive-meta">
          <span>Type: ${esc(hive.type)}</span>
          ${hive.locationName ? `<span>Sted: ${esc(hive.locationName)}</span>` : ''}
          <span>Inspeksjoner: ${hiveInspections.length}</span>
          <span>Honning: ${totalKg > 0 ? totalKg + ' kg' : '–'}</span>
        </div>

        ${hiveInspections.length > 0 ? `
        <h3>Inspeksjonslogg</h3>
        <table>
          <thead><tr>
            <th>Dato</th><th>Dronning</th><th>Celler</th>
            <th>Varroa</th><th>Yngel</th><th>Honning</th><th>Behandling</th>
          </tr></thead>
          <tbody>${inspectionRows}</tbody>
        </table>` : '<p class="empty">Ingen inspeksjoner dette året.</p>'}

        ${hiveTreatments.length > 0 ? `
        <h3>Behandlingslogg</h3>
        <table>
          <thead><tr><th>Dato</th><th>Preparat</th><th>Dose</th><th>Metode</th><th>Notater</th></tr></thead>
          <tbody>${treatmentRows}</tbody>
        </table>` : ''}

        ${hiveHarvests.length > 0 ? `
        <h3>Høstlogg</h3>
        <table>
          <thead><tr><th>Dato</th><th>Mengde</th><th>Notater</th></tr></thead>
          <tbody>${harvestRows}</tbody>
        </table>` : ''}

        ${hiveWeights.length > 0 ? `
        <h3>Vektlogg</h3>
        <table>
          <thead><tr><th>Dato</th><th>Vekt (kg)</th><th>Notater</th></tr></thead>
          <tbody>${hiveWeights.map((w) => `
            <tr>
              <td>${formatDateShort(w.weighedAt)}</td>
              <td><strong>${w.weightKg} kg</strong></td>
              <td>${esc(w.notes) || '–'}</td>
            </tr>`).join('')}</tbody>
        </table>` : ''}
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BiVokter — Årsrapport ${year}</title>
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1A1A2E; padding: 32px; max-width: 900px; margin: 0 auto; font-size: 13px; }
  h1 { color: #F5A623; font-size: 28px; margin-bottom: 4px; }
  h2 { color: #1A1A2E; font-size: 18px; margin-top: 32px; border-bottom: 2px solid #F5A623; padding-bottom: 6px; }
  h3 { color: #4A4A6A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 20px; margin-bottom: 8px; }
  .subtitle { color: #4A4A6A; font-size: 14px; margin-bottom: 8px; }
  .summary { display: flex; gap: 24px; background: #FFF3DC; border-radius: 12px; padding: 20px; margin: 20px 0; flex-wrap: wrap; }
  .summary-item { text-align: center; }
  .summary-value { font-size: 28px; font-weight: 800; color: #F5A623; }
  .summary-label { font-size: 11px; color: #4A4A6A; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #F8F4EF; text-align: left; padding: 7px 10px; font-size: 11px; text-transform: uppercase; color: #4A4A6A; letter-spacing: 0.5px; }
  td { padding: 7px 10px; border-bottom: 1px solid #4A4A6A15; }
  tr:last-child td { border-bottom: none; }
  .hive-section { break-inside: avoid; }
  .hive-meta { display: flex; gap: 20px; color: #4A4A6A; font-size: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .empty { color: #4A4A6A; font-style: italic; }
  .footer { margin-top: 40px; border-top: 1px solid #4A4A6A20; padding-top: 16px; color: #4A4A6A; font-size: 11px; }
</style>
</head>
<body>
  <h1>BiVokter</h1>
  <div class="subtitle">Årsrapport ${year}${displayName ? ` · ${esc(displayName)}` : ''}</div>
  <div class="subtitle">Generert ${formatDate(new Date().toISOString())}</div>

  <div class="summary">
    <div class="summary-item">
      <div class="summary-value">${activeHives.length}</div>
      <div class="summary-label">Aktive kuber</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${yearInspections.length}</div>
      <div class="summary-label">Inspeksjoner</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${totalHoneyKg > 0 ? totalHoneyKg + ' kg' : '–'}</div>
      <div class="summary-label">Honning høstet</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${yearTreatments.length}</div>
      <div class="summary-label">Behandlinger</div>
    </div>
  </div>

  ${hiveRows}

  <div class="footer">
    Rapporten er generert av BiVokter-appen og inneholder data for perioden 1. januar – 31. desember ${year}.
    Behandlingsjournalen oppfyller kravene til dokumentasjon etter Forskrift om hold av honningbier.
  </div>
</body>
</html>`;
}

export async function generateAndShareReport(data: ReportData): Promise<void> {
  const html = buildHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `BiVokter årsrapport ${data.year}`,
      UTI: 'com.adobe.pdf',
    });
  } else {
    await Print.printAsync({ uri });
  }
}
