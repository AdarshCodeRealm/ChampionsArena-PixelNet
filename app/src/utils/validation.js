/**
 * Email validation function
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation function
 * Checks if the password meets minimum requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param {string} password - The password to validate
 * @returns {boolean} - Whether the password meets the requirements
 */
export const validatePassword = (password) => {
  // At least 8 characters
  if (password.length < 8) {
    return false;
  }
  
  // Check for uppercase, lowercase, number, and special character
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

/**
 * Form validation utility that checks for required fields
 * @param {Object} formData - The form data to validate
 * @param {Array} requiredFields - List of required field names
 * @returns {Object} - Object containing field errors
 */
export const validateRequiredFields = (formData, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });
  
  return errors;
};

/**
 * Check if two passwords match
 * @param {string} password - The main password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} - Whether the passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
}; 