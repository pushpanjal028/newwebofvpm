import { generateCardPDF } from "./src/modules/member/cardGenerator.service.js";

const test = async () => {
  try {
    const pdfBuffer = await generateCardPDF({
      membershipId: "vpmh-2026-1001",
      name: "Test User",
      designation: "Manager",
      organization: "Test Org",
      city: "Test City",
      state: "Test State",
      phone: "1234567890",
      photoUrl: null,
      localPhotoPath: "",
      validFromStr: "01/01/2026",
      validUntilStr: "31/12/2026",
    });
    console.log("PDF generated successfully, size:", pdfBuffer.length);
  } catch (err) {
    console.error("Test script error:", err);
  }
};

test();
