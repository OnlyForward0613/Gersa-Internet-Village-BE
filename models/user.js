import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
    },
    profile: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
      select: false,
    },
    city: {
      type: String,
    },
    region: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: {
      createdAt: "dateCreated",
      updatedAt: "dateUpdated",
    },
  }
)

userSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

userSchema.set("toJSON", {
  virtuals: true,
})

export default mongoose.model("User", userSchema)
