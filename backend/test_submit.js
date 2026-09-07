import dns from 'dns';
dns.setServers(['8.8.8.8']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { submitPaymentReceiptService } from './src/modules/payment/payment.service.js';
import PaymentAttempt from './src/models/PaymentAttempt.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const attempt = await PaymentAttempt.create({ paymentAttemptId: 'test-123', keys: ['temp/payment/test-123/test.jpg'] });
    await submitPaymentReceiptService('7773008411', 'TXN999999', 'temp/payment/test-123/test.jpg', 'test-123');
    console.log('SUCCESS');
  } catch(e) {
    console.error('ERROR:', e.message);
  }
  process.exit(0);
});
