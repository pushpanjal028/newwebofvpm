import { generateCardPDF } from './src/modules/member/cardGenerator.service.js';
import fs from 'fs';

async function test() {
  try {
    console.log('Generating card...');
    const buffer = await generateCardPDF({
      membershipId: 'TEST-001',
      name: 'John Doe',
      designation: 'Reporter',
      city: 'Delhi',
      state: 'Delhi',
      phone: '9999999999',
      localPhotoPath: 'uploads/testphoto.png',
      validFromStr: '01/01/2026',
      validUntilStr: '31/12/2026'
    });
    fs.writeFileSync('test_card.pdf', buffer);
    console.log('Card generated successfully.');
  } catch (err) {
    console.error('Error generating card:', err);
  }
}

test();
