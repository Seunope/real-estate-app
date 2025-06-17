const {
  validateAdd,
  validateView,
  validateIndex,
  validateDelete,
  validateDeleteMany,
} = require("./_validator");
const express = require("express");
const meeting = require("./meeting");
const auth = require("../../middelwares/auth");
const validator = require("../../middelwares/validator");

const router = express.Router();

// router.get("/", auth, validateIndex, validator, meeting.index);
// router.get("/view/:id", auth, validateView, validator, meeting.view);
console.log("Meeting routes initialized&&&&&&&&&&&&&");
router.post("/add", auth, validateAdd, validator, meeting.add);
router.delete(
  "/delete/:id",
  auth,
  validateDelete,
  validator,
  meeting.deleteData
);
router.delete(
  "/delete-many",
  auth,
  validateDeleteMany,
  validator,
  meeting.deleteMany
);

module.exports = router;
