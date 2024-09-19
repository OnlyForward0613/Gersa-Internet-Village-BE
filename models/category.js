import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: [true, "enter category name"],
	},
	requiredMeasurements: {
		type: [String],
		enum: {
			values: [
				"ShirtLength",
				"AcrossBack",
				"Chest",
				"AroundArm",
				"SleeveLength",
				"TrouserLength",
				"Thighs",
				"Bust",
				"Waist",
				"Hips",
				"TopLength",
				"KabaLength",
				"SleetLength",
			],
			message: "input correct options for measurement",
		},
	},
})
categorySchema.virtual("id").get(function () {
	return this._id.toHexString()
})

categorySchema.set("toJSON", {
	virtuals: true,
})

export default mongoose.model("Category", categorySchema)
