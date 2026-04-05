const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{12,64}$/;

export const validatePasswordStrength = (password) => {
  if (!strongPasswordRegex.test(password)) {
    return {
      valid: false,
      message:
        "Password must be 12-64 characters and include upper, lower, number, and special character."
    };
  }

  return { valid: true };
};
