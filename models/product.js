import mongoose from "mongoose"

const optionsSchema = new mongoose.Schema(
  {
    color: String,
    colorName: String,
    sizes: [
      {
        size: String,
        quantity: Number,
      },
    ],
  },
  { _id: false }
)

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      //   required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    merchant: {
      type: String,
      ref: "Merchant",
      required: true,
      index: true,
    },
    sizes: [
      {
        type: String,
        select: false,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      ref: "Category",
      required: true,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    noOfRatings: {
      type: Number,
      default: 0,
    },
    customizable: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    options: [optionsSchema],
  },
  {
    timestamps: {
      createdAt: "dateCreated",
      updatedAt: "dateUpdated",
    },
  }
)

productSchema.index(
  { isFeatured: 1 },
  { partialFilterExpression: { isFeatured: true } }
)

productSchema.index({
  dateCreated: 1,
})
productSchema.virtual("id").get(function () {
  return this._id.toHexString()
})

productSchema.set("toJSON", {
  virtuals: true,
})
export const Options = mongoose.model("Options", optionsSchema)
export default mongoose.model("Product", productSchema)
