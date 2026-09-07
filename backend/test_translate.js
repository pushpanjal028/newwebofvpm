import translate from 'google-translate-api-x';

async function test() {
  try {
    const res = await translate('Munni bai', { to: 'hi' });
    console.log("Translation success:", res.text);
  } catch (err) {
    console.error("Translation failed:", err);
  }
}
test();
