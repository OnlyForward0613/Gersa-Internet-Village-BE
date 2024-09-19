import dotenv from "dotenv"
import { expressjwt as jwt } from "express-jwt"

dotenv.config()

export const userJwtAuth = (req, res) => {
	return jwt({ secret: process.env.SECRET_USER, algorithms: ["HS256"] })
}

export const merchantJwtAuth = (req, res) => {
	return jwt({ secret: process.env.SECRET_MERCHANT, algorithms: ["HS256"] })
}

export const adminJwtAuth = (req, res) => {
	return jwt({ secret: process.env.SECRET_ADMIN, algorithms: ["HS256"] })
}
