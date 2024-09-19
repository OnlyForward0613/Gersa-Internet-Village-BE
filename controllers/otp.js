import axios from "axios"
import otpGenerator from "otp-generator"
import Otp from "../models/otp.js"
import User from "../models/user.js"
import Merchant from "../models/merchant.js"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { sendMail } from "../src/mail.js"
dotenv.config({ path: "../.env" })

function generateOtp() {
  let OTP = {}
  OTP.otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  })
  let expirationTime = new Date()
  expirationTime.setMinutes(expirationTime.getMinutes() + 10)
  OTP.expirationTime = expirationTime
  return OTP
}

export async function startOtpVerification(contact, method = "email") {
  try {
    const oneTimePassword = generateOtp()
    let otp = new Otp({
      otp: oneTimePassword.otp,
      expirationTime: oneTimePassword.expirationTime,
    })

    otp = await otp.save()
    const message = `Otp Code: ${otp.otp}`
    if (!otp) {
      return Promise.reject("Unable to Generate Otp")
    }
    if (method === "email") {
      await sendMail(contact, "OTP VERIFICATION", message).catch((error) =>
        console.log(error)
      )
    }
    if (method === "phone") {
      await sendSms(contact, message).catch((error) => console.log(error))
    }
    return Promise.resolve(otp._id)
  } catch (error) {
    console.log(error)
    return Promise.reject()
  }
}

export async function otpVerifyUser(req, res, next) {
  try {
    const verification = await Otp.findById(req.body.otpId)
    if (!verification) {
      return res.status(400).json({ success: false, message: "Invalid ID" })
    }
    if (verification.expirationTime > new Date()) {
      if (req.body.otp === verification.otp) {
        const userUpdate = await User.findByIdAndUpdate(
          req.auth.userId,
          { verified: true },
          { new: true }
        )

        if (!userUpdate) {
          return res
            .status(500)
            .json({ success: false, message: "Unable to Verify" })
        }
        const accessToken = jwt.sign(
          {
            userId: userUpdate._id,
            verified: userUpdate.verified,
          },
          process.env.SECRET_USER,
          { expiresIn: "1d" }
        )
        return res.json({
          success: true,
          message: "Verification Successful",
          token: accessToken,
        })
      } else {
        res.status(400).json({ success: false, message: "Incorrect OTP" })
      }
    } else {
      res.status(400).json({ success: false, message: "OTP Expired" })
    }
  } catch (error) {
    next(error)
  }
}
export async function otpVerifyMerchant(req, res, next) {
  try {
    const verification = await Otp.findById(req.body.otpId)
    if (!verification) {
      return res.status(400).json({ success: false, message: "Invalid ID" })
    }
    if (verification.expirationTime > new Date()) {
      if (req.body.otp === verification.otp) {
        const merchantUpdate = await Merchant.findByIdAndUpdate(
          req.body.merchantId,
          { verified: true },
          { new: true }
        )

        if (!merchantUpdate) {
          return res
            .status(500)
            .json({ success: false, message: "Unable to Verify" })
        }
        const accessToken = jwt.sign(
          {
            merchantId: merchantUpdate._id,
          },
          process.env.SECRET_MERCHANT,
          { expiresIn: "1d" }
        )
        const refreshToken = jwt.sign(
          {
            merchantId: merchantUpdate._id,
          },
          process.env.SECRET_REFRESH_TOKEN,
          { expiresIn: "3d" }
        )
        return res.json({
          success: true,
          message: "Verification Successful",
          token: accessToken,
          refreshToken,
        })
      } else {
        res.status(400).json({ success: false, message: "Incorrect OTP" })
      }
    } else {
      res.status(400).json({ success: false, message: "OTP Expired" })
    }
  } catch (error) {
    next(error)
  }
}

export async function otpPasswordReset(req, res, next) {
  try {
    let token
    const verification = await Otp.findById(req.body.otpId)
    if (!verification) {
      return res.status(400).json({ success: false, message: "Invalid ID" })
    }
    if (verification.expirationTime > new Date()) {
      if (req.body.otp === verification.otp) {
        if (req.body.type === "user") {
          token = jwt.sign(
            {
              userId: req.body.userId,
            },
            process.env.SECRET_USER,
            { expiresIn: "30m" }
          )
        }
        if (req.body.type === "merchant") {
          token = jwt.sign(
            {
              merchantId: req.body.merchantId,
            },
            process.env.SECRET_MERCHANT,
            { expiresIn: "30m" }
          )
        }
        return res.json({
          token,
        })
      } else {
        res.status(400).json({ success: false, message: "Incorrect OTP" })
      }
    } else {
      res.status(400).json({ success: false, message: "OTP Expired" })
    }
  } catch (error) {
    next(error)
  }
}

export async function sendSms(recepient, message) {
  const data = {
    sender: "Pricewards",
    message: message,
    recipients: [recepient],
  }
  const config = {
    method: "post",
    url: "https://sms.arkesel.com/api/v2/sms/send",
    headers: {
      "api-key": process.env.ARKESEL_KEY,
    },
    data: data,
  }

  axios(config).catch((error) => {
    throw error
  })
}
