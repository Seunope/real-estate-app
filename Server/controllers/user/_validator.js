import { check, param, query, body } from "express-validator";

export const validateLogin = [
  check("username").notEmpty(),
  check("password")
    .notEmpty()
    .isString()
    .isLength({ min: 6 })
    .withMessage("Your password must be 6+ characters"),
];
