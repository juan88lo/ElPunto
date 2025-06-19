// src/modules/reporting/generators/pdf.generator.js
const puppeteer = require('puppeteer');
const fs        = require('fs');
const hbs       = require('handlebars');

async function generatePdf(html, outPath) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page    = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outPath, format: 'A4', printBackground: true });
  await browser.close();
}

async function renderTemplate(templateName, data) {
  const tpl = fs.readFileSync(
    `${__dirname}/../templates/${templateName}.hbs`,
    'utf8'
  );
  const compile = hbs.compile(tpl);
  return compile(data);
}

module.exports = { generatePdf, renderTemplate };
