import express from "express"
import uploadOptions from "../src/multerStorage.js"

export const router = express.Router()

import {
  changeOldPassword,
  createMerchant,
  deleteMerchant,
  forgotPassword,
  getAllMerchants,
  getMerchantDetail,
  loginMerchant,
  renewAccessToken,
  resendVerificationToken,
  resetPassword,
  updateMerchant,
} from "../controllers/merchant.js"
import { merchantJwtAuth } from "../src/jwt.js"

router
  .route("/")
  .post(createMerchant)
  .delete(merchantJwtAuth(), deleteMerchant)
  .patch(merchantJwtAuth(), uploadOptions.single("profile"), updateMerchant)
router.route("/login").post(loginMerchant)
router.route("/:merchantId").get(merchantJwtAuth(), getMerchantDetail)
router.route("/changeOldPassword").post(merchantJwtAuth(), changeOldPassword)
router.route("/forgotPassword").post(forgotPassword)
router.route("/resetPassword").post(merchantJwtAuth(), resetPassword)
router.route("/resendOtp").post(resendVerificationToken)
router.route("/token").post(renewAccessToken)
