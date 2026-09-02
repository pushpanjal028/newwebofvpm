import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getBase64Image = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).replace('.', '') || 'png';
      const base64 = fs.readFileSync(filePath, 'base64');
      return `data:image/${ext};base64,${base64}`;
    }
  } catch (e) {
    console.error('Error reading image for base64:', e);
  }
  return '';
};

export const generateCardPDF = async (memberData) => {
  // Load Logo
  const logoPath = path.join(__dirname, '../../../../frontend/src/assets/logo perfect.png');
  const logoBase64 = getBase64Image(logoPath);
  
  // Load Photo
  let photoBase64 = '';
  if (memberData.localPhotoPath && !memberData.localPhotoPath.startsWith('http')) {
    // Fix leading slashes or /uploads/ paths which break path.join
    const cleanPath = memberData.localPhotoPath.replace(/^[\/\\]?uploads[\/\\]/, '').replace(/^[\/\\]/, '');
    const photoPath = path.join(__dirname, '../../../../backend/uploads', cleanPath);
    console.log("Looking for photo at:", photoPath);
    photoBase64 = getBase64Image(photoPath);
  } else if (memberData.photoUrl && memberData.photoUrl.startsWith('data:')) {
    photoBase64 = memberData.photoUrl; 
  }
  
  // Load Signature Image
  const sigPath = path.join(__dirname, '../../../../frontend/src/assets/signatures.png');
  const sigBase64 = getBase64Image(sigPath);
  
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        * {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff;
          width: 550px;
          height: 850px;
        }
        
        .card-wrapper {
          background-color: white;
          border: 1px solid #000;
          width: 530px;
          height: 800px;
          position: relative;
          overflow: hidden;
          margin: auto;
        }

        /* Top Left Quarter Circle for PRESS */
        .press-corner {
          position: absolute;
          top: 0;
          left: 0;
          width: 130px;
          height: 130px;
          background-color: #d12222; /* Deep red matching VPMH */
          border-radius: 0 0 100% 0;
          z-index: 5;
        }
        
        .press-text {
          position: absolute;
          top: 50px;
          left: 20px;
          color: #fde047; /* Yellow */
          font-weight: 900;
          font-size: 22px;
          transform: rotate(-45deg);
          letter-spacing: 0.15em;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
        }

        /* Top Right R.No. */
        .r-no {
          position: absolute;
          top: 15px;
          right: 15px;
          color: #d12222;
          font-size: 10px;
          font-weight: 800;
        }

        /* Header Content */
        .header-content {
          text-align: center;
          padding-top: 15px;
          padding-left: 100px; /* Shift entire block right to clear corner and center visually */
          padding-right: 20px;
          position: relative;
          z-index: 10;
        }

        .header-top-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .logo-img {
          width: 55px;
          height: auto;
        }

        .main-title {
          font-size: 34px; /* Slightly larger to match reference */
          font-weight: bold;
          color: #d12222;
          margin: 0;
          font-family: 'Tiro Devanagari Hindi', serif;
        }

        .sub-title {
          font-size: 14px;
          font-weight: bold;
          color: #0d226a; /* Darker Blue */
          margin: -2px 0 0 0; /* Pass pass me kro */
          line-height: 1.1;
          font-family: 'Tiro Devanagari Hindi', serif;
        }

        .tertiary-title {
          font-size: 21px;
          font-weight: bold;
          color: #d12222;
          margin: 2px 0 0 0; /* Pass pass me kro */
          line-height: 1.1;
          font-family: 'Tiro Devanagari Hindi', serif;
        }

        .contact-info {
          font-size: 10px;
          color: #444; /* Greyish */
          font-weight: normal;
          margin: 2px 0 0 0;
        }

        /* Faint curved borders in background */
        .bg-curve-top {
          position: absolute;
          top: 150px;
          left: -50px;
          right: -50px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 -2px 0 0 rgba(209, 34, 34, 0.4);
          z-index: 1;
        }

        /* Central Body */
        .body-section {
          position: relative;
          z-index: 10;
          display: flex;
          margin-top: 50px;
          padding: 0 40px;
          gap: 25px;
          align-items: flex-start;
          min-height: 160px;
        }

        .watermark {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: auto;
          opacity: 0.12;
          z-index: -1;
        }

        .photo-box {
          width: 100px;
          height: 125px;
          border: 1px solid #d12222;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex-shrink: 0;
        }
        
        .photo-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-unavailable {
          font-size: 13px;
          color: #666;
          font-weight: bold;
        }

        .info-list {
          flex: 1;
          padding-top: 5px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 12px;
          font-size: 15px;
        }
        
        .info-label {
          width: 95px;
          color: #d12222;
          font-weight: bold;
          font-family: 'Tiro Devanagari Hindi', serif;
        }
        
        .info-colon {
          color: #d12222;
          font-weight: bold;
          margin-right: 12px;
        }
        
        .info-value {
          font-weight: bold;
          color: #000;
          flex: 1;
          border-bottom: 1.5px dotted #3b82f6; /* Blue dotted line */
          padding-bottom: 2px;
        }

        /* Signatures */
        .signatures-wrapper {
          margin-top: 15px;
          padding: 0 60px; /* Brings the image inward, pulling signatures closer together */
          position: relative;
          z-index: 10;
        }

        .signatures-area {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .signatures-img {
          width: 100%;
          height: auto;
        }

        .signatures-titles {
          display: flex;
          justify-content: space-between;
          padding: 0 15px; /* Align text perfectly under the stamps/signatures */
          margin-top: -5px; /* Pull text close to the signatures */
        }

        .sig-title {
          font-size: 13px;
          color: #000;
          font-weight: bold;
          font-family: 'Tiro Devanagari Hindi', serif;
        }

        .hr-line {
          border-top: 2px solid #000;
          margin: 15px 30px;
          position: relative;
          z-index: 10;
        }

        /* Registration Text */
        .registration-text {
          text-align: center;
          font-family: 'Tiro Devanagari Hindi', serif;
          font-size: 15px;
          color: #1e3a8a;
          font-weight: bold;
          margin: 10px 20px;
          line-height: 1.6;
          position: relative;
          z-index: 10;
        }

        .registration-text .bold-blue {
          text-decoration: underline;
        }

        /* Validity Badge */
        .validity-container {
          text-align: center;
          margin: 15px 0;
          position: relative;
          z-index: 10;
        }
        
        .validity-badge {
          display: inline-block;
          border: 1.5px solid #d12222;
          border-radius: 20px;
          padding: 4px 25px;
          color: #d12222;
          font-weight: bold;
          font-size: 14px;
          background: #fff;
        }

        /* Terms and Conditions */
        .terms-section {
          padding: 0 30px;
          position: relative;
          z-index: 10;
        }
        
        .terms-title {
          text-align: center;
          color: #d12222;
          font-size: 18px;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 10px;
          font-family: 'Tiro Devanagari Hindi', serif;
        }
        
        .terms-list {
          font-family: 'Tiro Devanagari Hindi', serif;
          font-size: 12px;
          color: #000;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .terms-list ol {
          margin: 0;
          padding-left: 15px;
        }
        
        .terms-list li {
          margin-bottom: 6px;
        }

        /* Footer Contacts */
        .footer-hr {
          border-top: 1px solid #d1d5db;
          margin: 15px 30px 10px 30px;
          position: relative;
          z-index: 10;
        }
        
        .footer-contacts {
          display: flex;
          justify-content: space-between;
          padding: 0 30px;
          font-size: 10px;
          font-weight: bold;
          color: #000;
          margin-bottom: 10px;
          position: relative;
          z-index: 10;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .icon-red { color: #d12222; font-size: 12px; }
        .icon-blue { color: #1e3a8a; font-size: 12px; }
        .icon-lb { color: #3b82f6; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="card-wrapper">
        <div class="press-corner">
          <span class="press-text">PRESS</span>
        </div>
        
        <div class="r-no">R.No.: 547/06T</div>
        
        <div class="header-content">
          <div class="header-top-row">
            ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo-img" />` : ''}
            <h1 class="main-title">विश्व पत्रकार महासंघ</h1>
          </div>
          <p class="sub-title">(पत्रकारों का वैश्विक पंजीकृत संगठन) का उपक्रम</p>
          <h2 class="tertiary-title">वरिष्ठ नागरिक अधिकार मंच</h2>
          <p class="contact-info">E-mail: info.vpm2006@gmail.com | WebSite: vpmh.org</p>
          <p class="contact-info">Office No.: 7084250799, 6393287185</p>
        </div>
        
        <div class="bg-curve-top"></div>
        
        <div class="body-section">
          ${logoBase64 ? `<img src="${logoBase64}" class="watermark" />` : ''}
          
          <div class="photo-box">
            ${photoBase64 
              ? `<img src="${photoBase64}" alt="Photo" />` 
              : `<div class="photo-unavailable">Photo<br/>unavailable</div>`
            }
          </div>
          
          <div class="info-list">
            <div class="info-row">
              <div class="info-label">आई कार्ड संख्या</div>
              <div class="info-colon">:</div>
              <div class="info-value">${memberData.membershipId || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">नाम</div>
              <div class="info-colon">:</div>
              <div class="info-value">${memberData.name || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">पद</div>
              <div class="info-colon">:</div>
              <div class="info-value">${memberData.designation || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">कार्यक्षेत्र</div>
              <div class="info-colon">:</div>
              <div class="info-value">${memberData.organization || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">पता</div>
              <div class="info-colon">:</div>
              <div class="info-value">${memberData.city || ''}${memberData.state ? ', ' + memberData.state : ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">मो. नं</div>
              <div class="info-colon">:</div>
              <div class="info-value">${memberData.phone || ''}</div>
            </div>
          </div>
        </div>
        
        <div class="signatures-wrapper">
          <div class="signatures-area">
            <img src="${sigBase64}" class="signatures-img" alt="Signatures and Stamps" />
          </div>
          <div class="signatures-titles">
            <div class="sig-title">हस्ता० राष्ट्रीय महासचिव/ट्रस्टी</div>
            <div class="sig-title">हस्ता० राष्ट्रीय अध्यक्ष/संस्थापक</div>
          </div>
        </div>
        
        <div class="hr-line"></div>
        
        <div class="registration-text">
          आज दिनांक <span class="bold-blue">30/11/2006</span> को वही स. <span class="bold-blue">4</span> जिल्द स. <span class="bold-blue">281</span><br/>
          पृष्ठ स. <span class="bold-blue">95</span> से <span class="bold-blue">122</span> पर क्रमांक <span class="bold-blue">547</span> रजिस्ट्रीकृत किया गया है।
        </div>
        
        <div class="validity-container">
          <div class="validity-badge">
            card valid from ${memberData.validFromStr || '01/01/2026'} to ${memberData.validUntilStr || '31/12/2026'}
          </div>
        </div>
        
        <div class="terms-section">
          <div class="terms-title">Term & Condition</div>
          <div class="terms-list">
            <ol>
              <li>यदि विश्व पत्रकार महासंघ के सदस्य एवं पदाधिकारी हेतु राष्ट्र/समाज व विश्वपत्रकार महासंघ के संविधान के विपरीत एवं अन्य असंवैधानिक कार्यों में लिप्त पाए जाते हैं तो उनकी सदस्यता एवं पद तत्काल स्वतः समाप्त मानी जायेगी। और विश्व पत्रकार महासंघ उचित कार्य करने के लिए अधिकृत मान्य होगा।</li>
              <li>विश्व पत्रकार महासंघ के द्वारा जारी किए गए परिचय पत्र का दुरुपयोग किसी भी स्तर पर नहीं करना होगा। ना ही करने दिया जाएगा।</li>
              <li>कार्ड खो जाने की स्थिति में कार्यालय या नजदीकी पुलिस स्टेशन में सूचित करें।</li>
            </ol>
          </div>
        </div>
        
        <div class="footer-hr"></div>
        <div class="footer-contacts">
          <div class="contact-item"><span class="icon-red">📞</span> 6393287185</div>
          <div class="contact-item"><span class="icon-lb">💬</span> @Vmahasangh</div>
          <div class="contact-item"><span class="icon-blue">🟦</span> Vishwapatrakarmahasangh</div>
          <div class="contact-item"><span class="icon-blue">▶️</span> Vishwapatrakarmahasangh</div>
        </div>
        
      </div>
    </body>
  </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      width: '550px',
      height: '850px',
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF with Puppeteer:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
