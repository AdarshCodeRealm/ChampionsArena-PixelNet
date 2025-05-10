// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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