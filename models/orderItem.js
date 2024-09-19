import mongoose from "mongoose"

const orderMeasurementSchema = mongoose.Schema(
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

const orderItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["In Progress", "Shipped", "Complete"],
        message: "input Valid Status",
      },
      default: "In Progress",
    },
    measurements: orderMeasurementSchema,
  },
  {
    timestamps: {
      createdAt: "dateCreated",
      updatedAt: "dateUpdated",
    },
  }
)

orderItemSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

orderItemSchema.set("toJSON", {
  virtuals: true,
})

export const OrderItem = mongoose.model("OrderItem", orderItemSchema)
export const OrderMeasurement = mongoose.model(
  "OrderMeasurement",
  orderMeasurementSchema
)
