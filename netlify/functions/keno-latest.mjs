// Fonction Netlify : récupère les 50 derniers tirages Keno depuis tirage-gagnant.com
// Endpoint : /.netlify/functions/keno-latest

export default async (req) => {
  try {
    const res = await fetch('https://tirage-gagnant.com/keno/resultats-keno/50-derniers-resultats/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KenoStatsPWA/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) throw new Error('Source HTTP ' + res.status);
    const html = await res.text();

    const draws = parseHtml(html);
    if (draws.length === 0) throw new Error('Parsing : aucun tirage trouvé');

    return new Response(
      JSON.stringify({
        draws,
        count: draws.length,
        source: 'tirage-gagnant.com',
        updated: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=1800, max-age=900, stale-while-revalidate=3600',
        },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e.message || e), updated: new Date().toISOString() }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
        },
      },
    );
  }
};

// Chaque ligne : "Keno du JJ/MM/AA" + 16 numéros séparés par <br> + multiplicateur "x{N}".
function parseHtml(html) {
  const draws = [];
  const rowRegex = /Keno du (\d{2})\/(\d{2})\/(\d{2})[\s\S]*?<\/tr>/g;
  let m;
  while ((m = rowRegex.exec(html)) !== null) {
    const [whole, dd, mm, yy] = m;
    const nums = [];
    const numRegex = />\s*(\d+)\s*</g;
    let nm;
    while ((nm = numRegex.exec(whole)) !== null) {
      const n = parseInt(nm[1], 10);
      if (n >= 1 && n <= 70) nums.push(n);
    }
    if (nums.length >= 16) {
      const sorted = [...new Set(nums)].slice(0, 16).sort((a, b) => a - b);
      if (sorted.length === 16) {
        const draw = { date: `${dd}/${mm}/${yy}`, nums: sorted };
        const multMatch = whole.match(/>\s*[x\u00d7]\s*(\d+)\s*</i);
        if (multMatch) {
          const mult = parseInt(multMatch[1], 10);
          if ([2, 3, 5].includes(mult)) draw.mult = mult;
        }
        draws.push(draw);
      }
    }
  }
  return draws;
}
