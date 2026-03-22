import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️ Razorpay keys are not fully configured. Payment APIs may fail.');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const getRazorpayMode = () => {
  const key = process.env.RAZORPAY_KEY_ID || '';
  if (key.startsWith('rzp_test_')) return 'test';
  if (key.startsWith('rzp_live_')) return 'live';
  return 'unknown';
};

export default razorpay;
