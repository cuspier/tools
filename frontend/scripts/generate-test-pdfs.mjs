import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createPDF(filename, text) {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage([500, 500]);
  const { width, height } = page.getSize();
  const fontSize = 30;
  
  page.drawText(text, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0.53, 0.71),
  });

  // add another page for splitting testing
  const page2 = pdfDoc.addPage([500, 500]);
  page2.drawText(text + " - Page 2", {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0.71, 0, 0.53),
  });

  const pdfBytes = await pdfDoc.save();
  const outPath = path.join(process.cwd(), 'tests', 'fixtures', filename);
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Created ${outPath}`);
}

async function main() {
  await createPDF('sample1.pdf', 'Sample PDF File 1');
  await createPDF('sample2.pdf', 'Sample PDF File 2');
}

main().catch(console.error);
