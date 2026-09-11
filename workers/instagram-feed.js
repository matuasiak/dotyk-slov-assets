/* Cloudflare Worker — Dotyk Slov Instagram feed proxy
   Secrets / vars:
   IG_ACCESS_TOKEN = Instagram API access token
   ALLOWED_ORIGIN = https://www.dotykslov.sk (optional)
   IG_API_BASE = https://graph.instagram.com (optional)
*/
export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const headers = {
      'content-type': 'application/json; charset=UTF-8',
      'access-control-allow-origin': origin,
      'cache-control': 'public, max-age=300, s-maxage=900'
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (!env.IG_ACCESS_TOKEN) return new Response(JSON.stringify({ items: [], error: 'Missing IG_ACCESS_TOKEN' }), { status: 500, headers });

    const base = (env.IG_API_BASE || 'https://graph.instagram.com').replace(/\/$/, '');
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const url = `${base}/me/media?fields=${encodeURIComponent(fields)}&limit=12&access_token=${encodeURIComponent(env.IG_ACCESS_TOKEN)}`;

    try {
      const res = await fetch(url, { headers: { 'accept': 'application/json' } });
      const data = await res.json();
      if (!res.ok) return new Response(JSON.stringify({ items: [], error: data }), { status: res.status, headers });
      return new Response(JSON.stringify({ items: Array.isArray(data.data) ? data.data : [] }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ items: [], error: String(error) }), { status: 502, headers });
    }
  }
};
