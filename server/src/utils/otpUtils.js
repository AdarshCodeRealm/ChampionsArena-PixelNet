// Generate a 6-digit OTP with expiry time (10 minutes from now)
export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  return { otp, expiryTime };
};

// Send OTP to email
export const sendOTP = async (email, otp) => {
  // In a real application, you would implement email sending logic here
  // For testing purposes, we'll just log the OTP
  console.log(`OTP for ${email}: ${otp}`);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
};