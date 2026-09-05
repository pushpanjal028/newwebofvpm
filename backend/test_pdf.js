import { generateCardPDF } from './src/modules/member/cardGenerator.service.js';
import fs from 'fs';

async function test() {
  try {
    const pdfBuffer = await generateCardPDF({
      membershipId: "VPMH-2026-1001",
      name: "Test User",
      designation: "Test Desig",
      organization: "Test Org",
      city: "Test City",
      state: "Test State",
      phone: "1234567890",
      photoUrl: "",
      localPhotoPath: "",
      validFromStr: "01/01/2026",
      validUntilStr: "31/12/2026"
    });
    fs.writeFileSync('test_card.pdf', pdfBuffer);
    console.log('PDF generated successfully');
  } catch (err) {
    console.error('PDF generation failed:', err);
  }
}

test();
