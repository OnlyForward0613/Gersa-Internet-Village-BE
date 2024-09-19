import bycrypt from "bcryptjs"
import User from "../models/user.js"
import jwt from "jsonwebtoken"
import { startOtpVerification } from "./otp.js"

export async function createUser(req, res, next) {
  let user
  try {
    user = new User({
      phone: req.body.phone,
      passwordHash: bycrypt.hashSync(req.body.password, 10),
    })
    user = await user.save()
    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "User not Created" })
    }
    const accessToken = jwt.sign(
      {
        userId: user._id,
        verified: user.verified,
      },
      process.env.SECRET_USER,
      { expiresIn: "1d" }
    )
    const refreshToken = jwt.sign(
      {
        userId: user.id,
      },
      process.env.SECRET_REFRESH_TOKEN
    )
    const {
      passwordHash,
      verified,
      disabled,
      __v,
      dataCreated,
      dateUpdated,
      ...userData
    } = user._doc
    return res
      .status(201)
      .json({ success: true, token: accessToken, refreshToken, userData })
  } catch (error) {
    next(error)
  }
}

export async function loginUser(req, res, next) {
  try {
    const user = await User.findOne({
      $or: [{ phone: req.body.login }, { email: req.body.login }],
    }).select("+passwordHash +verified -dateCreated -dateUpdated")
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    if (user.disabled) {
      return res.status(403).json({
        success: false,
        message: "User account Disabled",
      })
    }
    if (user && bycrypt.compareSync(req.body.password, user.passwordHash)) {
      const accessToken = jwt.sign(
        {
          userId: user.id,
          verified: user.verified,
        },
        process.env.SECRET_USER,
        { expiresIn: "1d" }
      )
      const refreshToken = jwt.sign(
        {
          userId: user.id,
        },
        process.env.SECRET_REFRESH_TOKEN
      )
      const { passwordHash, __v, ...userData } = user._doc
      return res
        .status(200)
        .json({ token: accessToken, refreshToken, userData })
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" })
    }
  } catch (error) {
    next(error)
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({}).select(
      "-passwordHash +verified +disabled"
    )
    return res.json({ users })
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(req, res, next) {
  try {
    User.findByIdAndDelete(req.auth.userId).then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, msg: "Account Deleted Successfully" })
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not Found" })
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req, res, next) {
  try {
    const update = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      city: req.body.city,
      region: req.body.region,
    }
    let imagepath
    if (req.file) {
      const fileName = req.file.filename
      const basePath = `${req.protocol}://api.pricewards.com/`
      imagepath = `${basePath}${fileName}`
      update.profile = imagepath
    }

    const userUpdate = await User.findByIdAndUpdate(
      req.auth.userId,
      {
        $set: update,
      },
      { new: true }
    ).select("+verified -dateCreated -dateUpdated")

    if (!userUpdate) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to Update User" })
    }

    return res.json({ userUpdate })
  } catch (error) {
    next(error)
  }
}

export async function changeOldPassword(req, res, next) {
  const user = await User.findById(req.auth.userId).select("+passwordHash")
  if (!user) {
    return res.status(404).json({ success: false, msg: "User not found" })
  }
  try {
    if (bycrypt.compareSync(req.body.oldPassword, user.passwordHash)) {
      const userUpdate = await User.findByIdAndUpdate(req.auth.userId, {
        passwordHash: bycrypt.hashSync(req.body.newPassword, 10),
      })
      if (!userUpdate) {
        return res.status(500).json({ success: false })
      }
      return res
        .status(200)
        .json({ success: true, message: "Password Change Successful" })
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" })
    }
  } catch (error) {
    next(error)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ phone: req.body.login })
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    startOtpVerification(user.phone, "phone").then((otpId) => {
      return res.json({ otpId, userId: user._id })
    })
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const userUpdate = await User.findByIdAndUpdate(req.auth.userId, {
      passwordHash: bycrypt.hashSync(req.body.password, 10),
    })
    if (!userUpdate) {
      return res
        .status(500)
        .json({ success: false, message: "Unable Reset Password" })
    }
    return res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function verifyUser(req, res, next) {
  let user
  try {
    user = await User.findById(req.auth.userId)
    if (!user) {
      return res.status(500).json({ success: false })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false })
  }
  startOtpVerification(user.phone, "phone")
    .then((otpId) => {
      return res.json({ otpId })
    })
    .catch((error) => {
      next(error)
    })
}

export async function getUserDetail(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId).select(
      "+disabled +verified"
    )
    if (!user) {
      return res.status(404).json({ success: false })
    }
    return res.json({ user })
  } catch (error) {
    next(error)
  }
}

export async function renewAccessToken(req, res, next) {
  if (!req.body.refreshToken) {
    return res.status(400).json({ success: false, error: "no refresh token" })
  }
  try {
    const decoded = jwt.verify(
      req.body.refreshToken,
      process.env.SECRET_REFRESH_TOKEN
    )
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select("+verified")
      const accessToken = jwt.sign(
        { userId: user._id, verified: user.verified },
        process.env.SECRET_USER,
        { expiresIn: "1d" }
      )
      return res.json({ token: accessToken })
    }
  } catch (error) {
    next(error)
  }
}
