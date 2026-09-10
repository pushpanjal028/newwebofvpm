import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

import { generateCardPDF } from './backend/src/modules/member/cardGenerator.service.js';

async function test() {
  try {
    const memberData = {
      membershipId: 'vpmh-2026-1001',
      name: 'Test User',
      designation: 'Test Designation',
      organization: 'Test Org',
      city: 'Delhi',
      state: 'Delhi',
      phone: '9999999999',
      photoUrl: null,
      localPhotoPath: null,
      validFromStr: '01/01/2026',
      validUntilStr: '31/12/2026',
    };
    
    console.log("Starting generation...");
    const buffer = await generateCardPDF(memberData);
    console.log("Success, buffer size:", buffer.length);
  } catch (err) {
    console.error("Failed:", err);
  }
  process.exit(0);
}

test();
