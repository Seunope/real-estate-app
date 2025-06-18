const logger = require("../../logger");
const MeetingHistory = require("../../model/schema/meeting");
const User = require("../../model/schema/user");
const mongoose = require("mongoose");

const add = async (req, res) => {
  try {
    const {
      agenda,
      attendees,
      attendeesLead,
      location,
      related,
      dateTime,
      notes,
      createBy,
    } = req.body;

    // Validate ObjectId fields
    if (createBy && !mongoose.Types.ObjectId.isValid(createBy)) {
      return res.status(400).json({ error: "Invalid createBy value" });
    }
    if (
      attendees &&
      attendees.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      return res.status(400).json({ error: "Invalid attendees value" });
    }
    if (
      attendeesLead &&
      attendeesLead.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      return res.status(400).json({ error: "Invalid attendeesLead value" });
    }
    let attendesLead = [...attendeesLead];
    let attendes = [...attendees];

    if (related == "Contact") {
      attendesLead = [];
    } else {
      attendes = [];
    }
    const meeting = {
      notes,
      related,
      agenda,
      location,
      dateTime,
      createBy,
      attendes,
      attendesLead,
    };

    const result = new MeetingHistory(meeting);
    await result.save();
    res.status(200).json({ result });
  } catch (err) {
    console.error("Failed to create meeting:", err);
    res.status(400).json({ err, error: "Failed to create meeting" });
  }
};

const index = async (req, res) => {
  try {
    const query = req.query;
    if (query.createBy) {
      query.createBy = new mongoose.Types.ObjectId(query.createBy);
    }
    query.deleted = false; // Ensure only non-deleted records are returned

    let result = await MeetingHistory.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "Contacts",
          localField: "attendees",
          foreignField: "_id",
          as: "attendeesContact",
        },
      },
      {
        $lookup: {
          from: "Leads",
          localField: "attendeesLead",
          foreignField: "_id",
          as: "attendeesLeadRef",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "createBy",
          foreignField: "_id",
          as: "users",
        },
      },
      { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          createdByName: {
            $concat: ["$users.firstName", " ", "$users.lastName"],
          },
          attendeesNames: {
            $map: {
              input: "$attendeesContact",
              as: "contact",
              in: {
                $concat: [
                  "$$contact.title",
                  " ",
                  "$$contact.firstName",
                  " ",
                  "$$contact.lastName",
                ],
              },
            },
          },
          attendeesLeadNames: {
            $map: {
              input: "$attendeesLeadRef",
              as: "lead",
              in: "$$lead.leadName",
            },
          },
        },
      },
      { $project: { attendeesContact: 0, attendeesLeadRef: 0, creator: 0 } },
    ]);

    res.status(200).json(result);
  } catch (err) {
    // console.error("Failed to fetch meetings:", err);
    res.status(400).json({ err, error: "Failed to fetch meetings" });
  }
};

const view = async (req, res) => {
  try {
    const result = await MeetingHistory.findOne({
      _id: req.params.id,
      deleted: false,
    });

    if (!result) {
      return res.status(404).json({ message: "No meeting found" });
    }

    let response = await MeetingHistory.aggregate([
      { $match: { _id: result._id, deleted: false } },
      {
        $lookup: {
          from: "Contacts",
          localField: "attendes",
          foreignField: "_id",
          as: "attendeesContact",
        },
      },
      {
        $lookup: {
          from: "Leads",
          localField: "attendesLead",
          foreignField: "_id",
          as: "attendeesLead",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "createBy",
          foreignField: "_id",
          as: "users",
        },
      },
      { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          createdByName: {
            $concat: ["$users.firstName", " ", "$users.lastName"],
          },
          attendes: {
            $map: {
              input: "$attendeesContact",
              as: "contact",
              in: {
                fullName: "$$contact.fullName",
                _id: "$$contact._id",
              },
            },
          },
          attendesLead: {
            $map: {
              input: "$attendeesLead",
              as: "lead",
              in: { leadName: "$$lead.leadName", _id: "$$lead._id" },
            },
          },
        },
      },
      { $project: { attendeesContact: 0, attendeesLeadRef: 0, creator: 0 } },
    ]);

    res.status(200).json(response[0]);
  } catch (err) {
    console.error("Failed to fetch meeting:", err);
    res.status(400).json({ err, error: "Failed to fetch meeting" });
  }
};

const deleteData = async (req, res) => {
  try {
    const result = await MeetingHistory.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "No meeting found" });
    }

    res.status(200).json({ message: "Meeting marked as deleted", result });
  } catch (err) {
    logger.error("Failed to delete meeting:", err);
    return res.status(400).json({ err, error: "Failed to delete meeting" });
  }
};

const deleteMany = async (req, res) => {
  try {
    const { ids } = req.body;

    if (
      !ids ||
      !Array.isArray(ids) ||
      ids.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      return res.status(400).json({ error: "Invalid or missing IDs" });
    }

    const result = await MeetingHistory.updateMany(
      { _id: { $in: ids }, deleted: false },
      { deleted: true }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "No meetings found to delete" });
    }

    res
      .status(200)
      .json({ message: `${result.nModified} meetings marked as deleted` });
  } catch (err) {
    console.error("Failed to delete meetings:", err);
    res.status(400).json({ err, error: "Failed to delete meetings" });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };
