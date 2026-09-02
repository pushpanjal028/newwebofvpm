import transporter from "../../config/mailer.js";
import fs from "fs";

export const sendCardEmail = async (memberEmail, memberName, pdfBuffer) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || "info.vpm2006@gmail.com",
      to: memberEmail,
      subject: "VPMH Member I-Card",
      text: `Dear ${memberName},\n\nYour Vishwa Patrakar Mahasangh Member I-Card has been generated successfully.\n\nPlease find your official Member I-Card attached to this email.\n\nRegards,\nVishwa Patrakar Mahasangh`,
      attachments: [
        {
          filename: `VPMH_Member_ICard.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("❌ Error sending I-Card email:", error);
    throw error;
  }
};
