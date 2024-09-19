import mongoose from "mongoose"

const measurementSchema = mongoose.Schema(
  {
    ShirtLength: Number,
    AcrossBack: Number,
    Chest: Number,
    AroundArm: Number,
    SleeveLength: Number,
    TrouserLength: Number,
    Thighs: Number,
    Bust: Number,
    Waist: Number,
    Hips: Number,
    TopLength: Number,
    KabaLength: Number,
    SleetLength: Number,
  },
  { _id: false }
)

const userMeasurementSchema = mongoose.Schema({
  name: String,
  category: String,
  userMeasurement: measurementSchema,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    index: true,
  },
})
userMeasurementSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

userMeasurementSchema.set("toJSON", {
  virtuals: true,
})

export default mongoose.model("UserMeasurement", userMeasurementSchema)
