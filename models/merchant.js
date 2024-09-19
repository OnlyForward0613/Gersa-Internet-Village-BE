import mongoose from "mongoose"

const merchantSchema = new mongoose.Schema(
	{
		brandName: {
			type: String,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		passwordHash: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		profile: {
			type: String,
		},
		city: {
			type: String,
		},
		region: {
			type: String,
		},
		bio: {
			type: String,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: {
			createdAt: "dateCreated",
			updatedAt: "dateUpdated",
		},
	}
)

merchantSchema.virtual("id").get(function () {
	return this._id.toHexString()
})

merchantSchema.set("toJSON", {
	virtuals: true,
})

export default mongoose.model("Merchant", merchantSchema)
