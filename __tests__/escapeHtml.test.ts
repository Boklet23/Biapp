import { esc } from '@/utils/escapeHtml';

describe('esc (HTML-escaping for PDF-rapporten)', () => {
  it('escaper alle fem spesialtegn', () => {
    expect(esc(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('erstatter alle forekomster, ikke bare den første', () => {
    expect(esc('a&b&c')).toBe('a&amp;b&amp;c');
    expect(esc('<i><b>')).toBe('&lt;i&gt;&lt;b&gt;');
  });

  it('dobbel-escaper ikke (&-regelen kjører først)', () => {
    // Hadde &-erstatningen kjørt sist, ville &lt; blitt &amp;lt;
    expect(esc('<')).toBe('&lt;');
    expect(esc('&lt;')).toBe('&amp;lt;'); // allerede-escapet input skal escapes som rå tekst
  });

  it('returnerer tom streng for null/undefined/tom', () => {
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
    expect(esc('')).toBe('');
  });

  it('lar vanlig norsk tekst passere urørt', () => {
    expect(esc('Bigård ved Mjøsa – rolige bier')).toBe('Bigård ved Mjøsa – rolige bier');
  });

  it('håndterer apostrof i produktnavn (realistisk notatfelt)', () => {
    expect(esc("Oksalsyre 3,2% 'dryppmetode'")).toBe('Oksalsyre 3,2% &#39;dryppmetode&#39;');
  });

  it('nøytraliserer et script-injiseringsforsøk', () => {
    expect(esc('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
