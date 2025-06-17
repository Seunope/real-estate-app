import { check, param, query, body } from "express-validator";

export const validateAdd = [
  body("agenda").notEmpty().withMessage("Agenda is required"),
  body("attendees")
    .optional()
    .isArray()
    .withMessage("Attendees must be an array of valid ObjectIds")
    .custom((value) => {
      return value.every((id) => /^[0-9a-fA-F]{24}$/.test(id));
    })
    .withMessage("All attendees must be valid ObjectIds"),
  body("attendeesLead")
    .optional()
    .isArray()
    .withMessage("AttendeesLead must be an array of valid ObjectIds")
    .custom((value) => {
      return value.every((id) => /^[0-9a-fA-F]{24}$/.test(id));
    })
    .withMessage("All attendeesLead must be valid ObjectIds"),
  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string"),
  body("related").optional().isString().withMessage("Related must be a string"),
  body("dateTime")
    .optional()
    .isString()
    .withMessage("DateTime must be a string"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
  body("createBy")
    .notEmpty()
    .withMessage("CreateBy is required")
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage("CreateBy must be a valid ObjectId"),
];

export const validateView = [
  param("id")
    .notEmpty()
    .withMessage("Meeting ID is required")
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage("Meeting ID must be a valid ObjectId"),
];

export const validateIndex = [
  query("createBy")
    .optional()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage("CreateBy must be a valid ObjectId"),
];

export const validateDelete = [
  param("id")
    .notEmpty()
    .withMessage("Meeting ID is required")
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage("Meeting ID must be a valid ObjectId"),
];

export const validateDeleteMany = [
  body("ids")
    .notEmpty()
    .withMessage("IDs array is required")
    .isArray()
    .withMessage("IDs must be an array")
    .custom((value) => {
      return value.every((id) => /^[0-9a-fA-F]{24}$/.test(id));
    })
    .withMessage("All IDs must be valid ObjectIds"),
];
