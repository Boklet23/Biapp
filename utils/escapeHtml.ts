/**
 * HTML-escaping for brukerstyrt tekst som interpoleres inn i generert HTML
 * (PDF-rapporten). Eneste barriere mot markup-injeksjon i Print-weben —
 * hold den ren og uten avhengigheter så den kan enhetstestes direkte.
 */
export function esc(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
