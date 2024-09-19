import { Router } from "express"
import {
	otpPasswordReset,
	otpVerifyMerchant,
	otpVerifyUser,
} from "../controllers/otp.js"
import { userJwtAuth } from "../src/jwt.js"

export const router = Router()

router.route("/verifyUser").post(userJwtAuth(), otpVerifyUser)
router.route("/verifyMerchant").post(otpVerifyMerchant)
router.route("/forgotPassword").post(otpPasswordReset)
