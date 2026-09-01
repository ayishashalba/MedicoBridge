const mongoose = require("mongoose");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id)).toString() === id;
};

const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

module.exports = {
  isValidObjectId,
  validateEmail,
};
