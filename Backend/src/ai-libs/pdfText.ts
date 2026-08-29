export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy().catch(() => {});
    if (result?.text && result.text.trim().length > 0) {
      return result.text;
    }
  } catch (e) {
    console.warn('pdf-parse v2 failed, falling back to pdfjs legacy:', (e as Error)?.message ?? e);
  }

  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const task = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      isEvalSupported: false,
      disableFontFace: true,
    });
    const doc = await task.promise;
    let text = '';
    const total = doc.numPages;
    for (let i = 1; i <= total; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ');
      text += pageText + '\n';
      page.cleanup();
    }
    await doc.destroy();
    return text;
  } catch (e) {
    console.warn('pdfjs legacy also failed:', (e as Error)?.message ?? e);
    throw new Error('Gagal membaca isi PDF: ' + ((e as Error)?.message ?? e));
  }
}
