const mongoose = require("mongoose");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 6
  );
};

const validateBloodGroup = (bloodGroup) => {
  if (!bloodGroup) return true;

  return [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ].includes(bloodGroup);
};

module.exports = {
  isValidObjectId,
  validateEmail,
  validatePassword,
  validateBloodGroup,
};