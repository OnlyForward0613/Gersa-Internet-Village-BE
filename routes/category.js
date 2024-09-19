import { Router } from "express"
import { getAllCategories } from "../controllers/category.js"

export const router = Router()

router.route("/").get(getAllCategories)
