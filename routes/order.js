import { Router } from "express"
import {
  changeOrderStatus,
  createOrder,
  getUserOrderHistory,
  verifyOrder,
} from "../controllers/order.js"
import { merchantJwtAuth, userJwtAuth } from "../src/jwt.js"

export const router = Router()

router
  .route("/")
  .post(userJwtAuth(), createOrder)
  .patch(merchantJwtAuth(), changeOrderStatus)
router.route("/verify").post(userJwtAuth(), verifyOrder)
router.route("/userHistory").get(userJwtAuth(), getUserOrderHistory)
