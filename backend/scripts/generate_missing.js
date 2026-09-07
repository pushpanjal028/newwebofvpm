require('dotenv').config({ path: 'backend/.env' });
import('mongoose').then(async (m) => {
  await m.connect(process.env.MONGO_URI);
  const { generateCardPDF } = await import('./backend/src/modules/member/cardGenerator.service.js');
  const { uploadBufferToS3 } = await import('./backend/src/utils/s3.js');
  const MemberCard = (await import('./backend/src/models/MemberCard.js')).default;
  const User = m.connection.db.collection('users');
  const users = await User.find({ approvalStatus: 'approved', membershipId: { $exists: true } }).toArray();
  for (const u of users) {
    const hasCard = await MemberCard.findOne({ userId: u._id });
    if (!hasCard) {
      console.log('Generating for', u.name);
      const pdfBuf = await generateCardPDF({
        membershipId: u.membershipId,
        name: u.name,
        designation: u.designation,
        organization: u.organization,
        city: u.city,
        state: u.state,
        phone: u.phone,
        photoUrl: u.photo ? (u.photo.startsWith('http') ? u.photo : `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/view/${u.photo}`) : null,
        localPhotoPath: u.photo,
        validFromStr: u.issueDate ? new Date(u.issueDate).toLocaleDateString('en-IN') : 'N/A',
        validUntilStr: u.expiryDate ? new Date(u.expiryDate).toLocaleDateString('en-IN') : 'N/A'
      });
      const pdfUrl = 'uploads/member_card_' + u.membershipId + '_' + Date.now() + '.pdf';
      await uploadBufferToS3(pdfUrl, pdfBuf, 'application/pdf');
      await MemberCard.create({ userId: u._id, cardNumber: u.membershipId, validFrom: u.issueDate, validUntil: u.expiryDate, pdfUrl });
      console.log('Done for', u.name);
    }
  }
  console.log('All missing cards generated');
  process.exit(0);
}).catch(console.error);
