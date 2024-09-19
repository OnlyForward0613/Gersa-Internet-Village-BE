import bycrypt from "bcryptjs"
import Merchant from "../models/merchant.js"
import jwt from "jsonwebtoken"
import { startOtpVerification } from "./otp.js"

export async function createMerchant(req, res, next) {
  let merchant
  try {
    merchant = new Merchant({
      email: req.body.email,
      passwordHash: bycrypt.hashSync(req.body.password, 10),
    })
    merchant = await merchant.save()
    if (!merchant) {
      return res
        .status(500)
        .json({ success: false, message: "User not created" })
    }
    startOtpVerification(merchant.email)
      .then((otpId) => {
        return res.status(201).json({ merchantId: merchant._id, otpId })
      })
      .catch((error) => next(error))
  } catch (error) {
    next(error)
  }
}

export async function loginMerchant(req, res, next) {
  try {
    const merchant = await Merchant.findOne({
      $or: [{ phone: req.body.login }, { email: req.body.login }],
    })
    if (!merchant) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    if (!merchant.verified) {
      return res.status(401).json({
        merchantId: merchant.id,
        success: false,
        message: "User not Verified",
      })
    }
    if (merchant.disabled) {
      return res.status(403).json({
        success: false,
        message: "User account disabled",
      })
    }
    if (
      merchant &&
      bycrypt.compareSync(req.body.password, merchant.passwordHash)
    ) {
      const accessToken = jwt.sign(
        {
          merchantId: merchant.id,
        },
        process.env.SECRET_MERCHANT,
        { expiresIn: "1d" }
      )
      const refreshToken = jwt.sign(
        {
          merchantId: merchant.id,
        },
        process.env.SECRET_REFRESH_TOKEN,
        { expiresIn: "3d" }
      )
      return res
        .status(200)
        .json({ merchantId: merchant._id, token: accessToken, refreshToken })
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" })
    }
  } catch (error) {
    next(error)
  }
}

export async function getAllMerchants(req, res, next) {
  try {
    const merchants = await Merchant.find({}).select("-passwordHash")
    if (!merchants) {
      return res.status(500).json({ success: false })
    }
    return res.json({ merchants })
  } catch (error) {
    next(error)
  }
}

export async function updateMerchant(req, res, next) {
  try {
    const update = {
      brandName: req.body.brandName,
      city: req.body.city,
      region: req.body.region,
      bio: req.body.bio,
      phone: req.body.phone,
    }

    const file = req.file
    let imagepath

    if (file) {
      const fileName = req.file.filename
      const basePath = `${req.protocol}://api.pricewards.com/`
      imagepath = `${basePath}${fileName}`
      update.profile = imagepath
    }
    const merchantUpdate = await Merchant.findByIdAndUpdate(
      req.auth.merchantId,
      {
        $set: update,
      },
      { new: true }
    )

    if (!merchantUpdate) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to Update Merchant" })
    }

    return res.json({ merchantUpdate })
  } catch (error) {
    next(error)
  }
}

export async function getMerchantDetail(req, res, next) {
  try {
    const merchant = await Merchant.findById(req.auth.merchantId).select(
      "email phone brandName city bio profile"
    )

    if (!merchant) {
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" })
    }

    return res.json({ merchant })
  } catch (error) {
    next(error)
  }
}

export async function deleteMerchant(req, res, next) {
  try {
    Merchant.findByIdAndDelete(req.auth.merchantId).then((merchant) => {
      if (merchant) {
        return res
          .status(200)
          .json({ success: true, msg: "Account Deleted Successfully" })
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Merchant not Found" })
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function changeOldPassword(req, res, next) {
  const merchant = await Merchant.findById(req.auth.merchantId)
  if (!merchant) {
    return res.status(404).json({ success: false, msg: "Merchant not found" })
  }
  try {
    if (bycrypt.compareSync(req.body.oldPassword, merchant.passwordHash)) {
      const merchantUpdate = await Merchant.findByIdAndUpdate(
        req.auth.merchantId,
        {
          passwordHash: bycrypt.hashSync(req.body.newPassword, 10),
        }
      )
      if (!merchantUpdate) {
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
    const merchant = await Merchant.findOne({ email: req.body.login })
    if (!merchant) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    const method = req.body.method
    const contact = merchant.email
    startOtpVerification(contact, method)
      .then((otpId) => {
        return res.json({ otpId, merchantId: merchant._id })
      })
      .catch((error) => next(error))
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const merchantUpdate = await Merchant.findByIdAndUpdate(
      req.auth.merchantId,
      {
        passwordHash: bycrypt.hashSync(req.body.password, 10),
      }
    )
    console.log(merchantUpdate)
    if (!merchantUpdate) {
      return res
        .status(500)
        .json({ success: false, message: "Unable Reset Password" })
    }
    return res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function resendVerificationToken(req, res, next) {
  try {
    const merchant = await Merchant.findById(req.body.merchantId)

    if (!merchant) {
      res.status(404).json({ success: false, message: "User not found" })
    }
    startOtpVerification(merchant.email)
      .then((otpId) => {
        return res.status(200).json({ merchantId: merchant._id, otpId })
      })
      .catch((error) => next(error))
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
    if (decoded.merchantId) {
      const accessToken = jwt.sign(
        { merchantId: decoded.merchantId },
        process.env.SECRET_MERCHANT,
        { expiresIn: "1d" }
      )
      return res.json({ token: accessToken })
    }
  } catch (error) {
    next(error)
  }
}
