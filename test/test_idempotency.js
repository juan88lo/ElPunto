// test/test_idempotency.js
// Usage: node test/test_idempotency.js [GRAPHQL_URL]
// Default URL: http://localhost:3000/graphql

const http = require('http');
const https = require('https');
const { randomBytes } = require('crypto');

const url = process.argv[2] || process.env.GRAPHQL_URL || 'http://localhost:3000/graphql';
const parsed = new URL(url);
const client = parsed.protocol === 'https:' ? https : http;

function postGraphQL(query, variables) {
  const payload = JSON.stringify({ query, variables });
  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + (parsed.search || ''),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  const idempotencyKey = randomBytes(16).toString('hex');
  console.log('Using idempotencyKey:', idempotencyKey);

  // Adjust this mutation to match your FacturaInput required fields and sample product
  const mutation = `mutation CrearFactura($input: FacturaInput!) {\n  crearFactura(input: $input) {\n    id\n    consecutivo\n    total\n    idempotencyKey\n  }\n}`;

  // Example input - MODIFY as needed to match your DB (cajaId, usuarioId and product codes must exist)
  const variables = {
    input: {
      cajaId: 1,
      usuarioId: 1,
      formaPago: 'EFECTIVO',
      productos: [
        { codigoBarras: 'TEST-0001', cantidad: 1 }
      ],
      idempotencyKey
    }
  };

  console.log('\nSending first request...');
  const r1 = await postGraphQL(mutation, variables);
  console.log('First response status:', r1.statusCode);
  console.log(JSON.stringify(r1.body, null, 2));

  console.log('\nSending second request with same idempotencyKey...');
  const r2 = await postGraphQL(mutation, variables);
  console.log('Second response status:', r2.statusCode);
  console.log(JSON.stringify(r2.body, null, 2));

  console.log('\nCompare the `id` fields above. They should be the same (no duplicate created).');
})();
