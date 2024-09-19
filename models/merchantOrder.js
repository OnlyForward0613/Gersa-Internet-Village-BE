import mongoose from "mongoose"

const merchantOrderSchema = new mongoose.Schema({
	orderItem: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "OrderItem",
		required: true,
	},
	merchant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Merchant",
		required: true,
	},
})

merchantOrderSchema.virtual("id").get(function () {
	return this._id.toHexString()
})

merchantOrderSchema.set("toJSON", {
	virtuals: true,
})

export default mongoose.model("MerchantOrder", merchantOrderSchema)
