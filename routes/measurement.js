import express from "express"
import {
	createUserMeasurement,
	deleteUserMeasurement,
	getUserMeasurement,
	updateUserMeasurement,
} from "../controllers/measurement.js"

export const router = express.Router()

import { userJwtAuth } from "../src/jwt.js"

router
	.route("/")
	.get(userJwtAuth(), getUserMeasurement)
	.post(userJwtAuth(), createUserMeasurement)
router
	.route("/:measurementId")
	.patch(userJwtAuth(), updateUserMeasurement)
	.delete(userJwtAuth(), deleteUserMeasurement)
