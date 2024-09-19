import mongoose from "mongoose"

const otpSchema = new mongoose.Schema({
	otp: {
		type: String,
		required: true,
	},
	expirationTime: {
		type: Date,
		required: true,
	},
	dateCreated: {
		type: Date,
		expires: 1200,
		default: Date.now,
	},
})

otpSchema.virtual("id").get(function () {
	return this._id.toHexString()
})

otpSchema.set("toJSON", {
	virtuals: true,
})

export default mongoose.model("Otp", otpSchema)
