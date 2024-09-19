import { Router } from "express"
import {
	getMonthlySales,
	getMerchantOrders,
} from "../controllers/merchantOrder.js"
import { merchantJwtAuth } from "../src/jwt.js"

export const router = Router()

router.route("/").get(merchantJwtAuth(), getMerchantOrders)
router.route("/monthly").get(merchantJwtAuth(), getMonthlySales)
