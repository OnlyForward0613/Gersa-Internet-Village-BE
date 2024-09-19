import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"

//router imports
import { router as userRoutes } from "./routes/user.js"
import { router as merchantRoutes } from "./routes/merchant.js"
import { router as categoryRoutes } from "./routes/category.js"
import { router as productRoutes } from "./routes/product.js"
import { router as orderRoutes } from "./routes/order.js"
import { router as merchantOrderRoutes } from "./routes/merchantOrder.js"
import { router as otpRoutes } from "./routes/otp.js"
import { router as measurementRoutes } from "./routes/measurement.js"
import { router as adminRoutes } from "./routes/admin.js"

//other imports
import { errorHandler } from "./src/errorHandler.js"
import { errorLogger } from "./src/logger.js"

dotenv.config()
const app = express()

//middlewares
app.use(cors())
app.use(bodyParser.json())
app.use("/", express.static("./public/uploads"))

//loggers
app.use(errorLogger)

//routes
app.use("/otp", otpRoutes)
app.use("/product", productRoutes)
app.use("/user", userRoutes)
app.use("/merchant", merchantRoutes)
app.use("/category", categoryRoutes)
app.use("/order", orderRoutes)
app.use("/merchantOrder", merchantOrderRoutes)
app.use("/measurement", measurementRoutes)
app.use("/admin", adminRoutes)

//errorHandler
app.use(errorHandler)

export default app
