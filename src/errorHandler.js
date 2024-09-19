import util from "util"

export const errorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ success: false, message: "Invalid Token" })
  }
  if (err.name === "ValidationError") {
    const errorDetails = Object.values(err.errors)[0].properties
    return res.status(400).json({
      success: false,
      error: `${errorDetails.path} ${errorDetails.type}`,
    })
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" })
  }
  if (err.name === "MongoServerError") {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: `${Object.keys(err.keyPattern)[0]} already exists`,
      })
    }
  } else {
    req.error = err
    // console.log(err)
    return res.status(500).json({ success: false })
  }
}
