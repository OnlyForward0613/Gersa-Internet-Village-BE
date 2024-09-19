import UserMeasurement from "../models/userMeasurement.js"
import mongoose from "mongoose"

export async function getUserMeasurement(req, res, next) {
  try {
    const userMeasurement = await UserMeasurement.find({
      user: req.auth.userId,
    }).select("-user")

    if (!userMeasurement) {
      return res.status(500).json({ success: false })
    }
    res.json({ userMeasurement })
  } catch (err) {
    next(err)
  }
}

export async function createUserMeasurement(req, res, next) {
  try {
    let userMeasurement = new UserMeasurement({
      name: req.body.name,
      category: req.body.category,
      userMeasurement: req.body.userMeasurement,
      user: req.auth.userId,
    })

    userMeasurement = await userMeasurement.save()
    if (!userMeasurement) {
      return res.status(500).json({ success: false })
    }
    return res.status(201).json({ success: true })
  } catch (err) {
    next(err)
  }
}

export async function updateUserMeasurement(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.measurementId)) {
      return res.status(400).json({ success: false, msg: "Invalid ID" })
    }
    const userMeasurement = await UserMeasurement.findById(
      req.params.measurementId
    )
    if (userMeasurement.user.toString() !== req.auth.userId) {
      return res.status(403).json({ success: false, message: "Not Authorized" })
    }

    let update = {
      name: req.body.name,
      category: req.body.category,
      userMeasurement: req.body.userMeasurement,
    }

    const userMeasurementUpdate = await UserMeasurement.findByIdAndUpdate(
      req.params.measurementId,
      {
        $set: update,
      },
      { new: true }
    )

    return res.json({ userMeasurementUpdate })
  } catch (err) {
    next(err)
  }
}

export async function deleteUserMeasurement(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.measurementId)) {
    return res.status(400).json({ success: false, msg: "Invalid ID" })
  }
  try {
    const userMeasurement = await UserMeasurement.findById(
      req.params.measurementId
    )
    if (userMeasurement.user.toString() !== req.auth.userId) {
      return res.status(403).json({ success: false, message: "Not Authorized" })
    }
    UserMeasurement.findByIdAndDelete(req.params.measurementId).then(() => {
      return res.json({ success: true })
    })
  } catch (err) {
    next(err)
  }
}
