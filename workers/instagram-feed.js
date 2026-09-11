/* Cloudflare Worker — Dotyk Slov tagged Instagram UGC proxy
   Purpose: return media where people TAG @dotykslov on Instagram.

   Secrets / vars:
   IG_ACCESS_TOKEN = Meta / Instagram Graph API access token
   IG_USER_ID      = Instagram professional account ID for @dotykslov
   ALLOWED_ORIGIN  = https://www.dotykslov.sk (optional)
   IG_API_BASE     = https://graph.facebook.com/v23.0 (optional)

   Response:
   { items:[{id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username}] }
*/
export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const headers = {
      'content-type': 'application/json; charset=UTF-8',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,OPTIONS',
      'cache-control': 'public, max-age=300, s-maxage=900'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'GET') return new Response(JSON.stringify({ items: [], error: 'Method not allowed' }), { status: 405, headers });
    if (!env.IG_ACCESS_TOKEN || !env.IG_USER_ID) {
      return new Response(JSON.stringify({ items: [], error: 'Missing IG_ACCESS_TOKEN or IG_USER_ID' }), { status: 500, headers });
    }

    const base = (env.IG_API_BASE || 'https://graph.facebook.com/v23.0').replace(/\/$/, '');
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username';
    const url = `${base}/${encodeURIComponent(env.IG_USER_ID)}/tags?fields=${encodeURIComponent(fields)}&limit=18&access_token=${encodeURIComponent(env.IG_ACCESS_TOKEN)}`;

    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok) return new Response(JSON.stringify({ items: [], error: data }), { status: res.status, headers });

      const items = Array.isArray(data.data) ? data.data.filter(item => item && item.permalink && (item.media_url || item.thumbnail_url)) : [];
      return new Response(JSON.stringify({ items }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ items: [], error: String(error) }), { status: 502, headers });
    }
  }
};
