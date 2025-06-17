const { validationResult } = require("express-validator");

const validator = (req, res, next) => {
  try {
    const errors = validationResult(req);

    // console.log("Validation errors:", errors.array());
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array({ onlyFirstError: true });

    return res.status(400).json({
      message: "Validation failed. Please ensure you fill all fields correctly",
      errors: extractedErrors,
    });
  } catch (e) {
    console.error("Validator middleware error:", e);
    next(e);
  }
};

module.exports = validator;
