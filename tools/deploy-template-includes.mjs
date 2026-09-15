const token = process.env.SHOPTET_PRIVATE_API_TOKEN;
const assetBase = (process.env.SHOPTET_ASSET_BASE || 'https://matuasiak.github.io/dotyk-slov-assets/dist').replace(/\/$/, '');
const version = process.env.SHOPTET_BUILD_VERSION || String(Date.now());
const dryRun = process.env.SHOPTET_DRY_RUN === '1' || process.env.SHOPTET_DRY_RUN === 'true';

if (!token && !dryRun) {
  throw new Error('Missing SHOPTET_PRIVATE_API_TOKEN. Use SHOPTET_DRY_RUN=1 to preview the payload without calling Shoptet.');
}

const payload = {
  data: {
    snippets: [
      {
        location: 'common-header',
        html: `<link rel="stylesheet" href="${assetBase}/dotyk-slov.css?v=${version}">`,
      },
      {
        location: 'common-footer',
        html: `<script defer src="${assetBase}/dotyk-slov.js?v=${version}"></script>`,
      },
    ],
  },
};

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const response = await fetch('https://api.myshoptet.com/api/template-include', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Shoptet-Private-API-Token': token,
  },
  body: JSON.stringify(payload),
});

let body;
try {
  body = await response.json();
} catch (error) {
  body = null;
}

if (!response.ok || (body && Array.isArray(body.errors) && body.errors.length)) {
  console.error(body || `HTTP ${response.status}`);
  process.exit(1);
}

console.log(`Shoptet includes updated to build ${version}.`);
console.log(`CSS: ${assetBase}/dotyk-slov.css?v=${version}`);
console.log(`JS:  ${assetBase}/dotyk-slov.js?v=${version}`);
