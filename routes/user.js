import express from "express"

export const router = express.Router()

import {
  changeOldPassword,
  createUser,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUserDetail,
  loginUser,
  renewAccessToken,
  resetPassword,
  updateUser,
  verifyUser,
} from "../controllers/user.js"
import { userJwtAuth } from "../src/jwt.js"
import uploadOptions from "../src/multerStorage.js"

router
  .route("/")
  .post(createUser)
  .delete(userJwtAuth(), deleteUser)
  .patch(userJwtAuth(), uploadOptions.single("profile"), updateUser)
router.route("/login").post(loginUser)
router.route("/token").post(renewAccessToken)
router.route("/changeOldPassword").post(userJwtAuth(), changeOldPassword)
router.route("/forgotPassword").post(forgotPassword)
router.route("/resetPassword").post(userJwtAuth(), resetPassword)
router.route("/verify").get(userJwtAuth(), verifyUser)
router.route("/:userId").get(userJwtAuth(), getUserDetail)
