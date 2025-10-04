

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const storeUserData = (userData) => {
  localStorage.setItem('foodDonationUser', JSON.stringify(userData));
};

export const getUserData = () => {
  const userData = localStorage.getItem('foodDonationUser');
  return userData ? JSON.parse(userData) : null;
};

export const clearUserData = () => {
  localStorage.removeItem('foodDonationUser');
};
