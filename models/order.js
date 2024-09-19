import mongoose from "mongoose"

const orderSchema = mongoose.Schema(
  {
    orderItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    payment: {
      type: String,
      required: true,
    },
    complete: {
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

orderSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

orderSchema.set("toJSON", {
  virtuals: true,
})

export default mongoose.model("Order", orderSchema)
