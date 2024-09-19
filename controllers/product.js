import mongoose from "mongoose"
import Category from "../models/category.js"
import Product, { Options } from "../models/product.js"
import { deleteImage } from "../src/fileSystem.js"

export async function createProduct(req, res, next) {
  if (!mongoose.isValidObjectId(req.body.category)) {
    return res.status(400).json({ success: false, message: "Invalid category" })
  }
  const category = await Category.findById(req.body.category)
  if (!category) {
    return res.status(400).json({ success: false, message: "Invalid category" })
  }
  const mainImageFile = req.files["image"]
  if (!mainImageFile)
    return res
      .status(400)
      .json({ success: false, message: "Main image is required" })

  const mainImage = mainImageFile[0].filename

  const basePath = `${req.protocol}://api.pricewards.com/`

  const imageGalleryFiles = req.files["images"]
  let imagePaths = []
  if (imageGalleryFiles) {
    imageGalleryFiles.map((file) => {
      imagePaths.push(`${basePath}${file.filename}`)
    })
  }
  try {
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      image: `${basePath}${mainImage}`,
      images: imagePaths,
      merchant: req.auth.merchantId,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
      customizable: req.body.customizable,
    })
    product = await product.save()
    if (!product) {
      return res.status(500).json({ success: false })
    }
    return res.status(201).json({ product })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export async function getProducts(req, res, next) {
  let filter = { isAvailable: true }
  filter.disabled = false
  try {
    if (req.query.categories) {
      filter.category = { $in: req.query.categories.split(",") }
    }
    if (req.query.sizes) {
      filter.sizes = { $in: req.query.sizes.split(",") }
    }
    const productList = await Product.find(filter)
      .select("id name image images price category isAvailable isFeatured")
      .populate("category")

    if (!productList) {
      return res.status(500).json({ success: false })
    }
    return res.json({ productList })
  } catch (error) {
    next(error)
  }
}

export async function getProductDetail(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).json({ success: false, msg: "Invalid Product ID" })
    }

    const product = await Product.findById(req.params.productId)
      .select("-isAvailable -dateCreated -merchant")
      .populate("category")

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" })
    }

    return res.json({ product })
  } catch (error) {
    next(error)
  }
}

export async function getFeaturedProducts(req, res, next) {
  try {
    const featuredProductList = await Product.find({
      isFeatured: true,
      disabled: false,
    })
      .select("id name image images price category isAvailable isFeatured")
      .populate("category")

    if (!featuredProductList) {
      return res.status(500).json({ success: false })
    }
    return res.json({ featuredProductList })
  } catch (error) {
    next(error)
  }
}

export async function getNewArrivalProducts(req, res, next) {
  try {
    const today = new Date()
    const dd = String(today.getDate())
    const mm = String(today.getMonth())
    const yyyy = String(today.getFullYear())

    const newArrivalProductList = await Product.find({
      dateCreated: { $gte: new Date(yyyy, mm, dd) },
    })
      .select("id name image images price category")
      .populate("category")
      .sort({ dateCreated: -1 })

    if (!newArrivalProductList) {
      return res.status(404).json({ success: false })
    }
    return res.json({ newArrivalProductList })
  } catch (error) {
    next(error)
  }
}

export async function getMerchantProducts(req, res, next) {
  try {
    const merchantProductList = await Product.find({
      merchant: req.auth.merchantId,
    })
      .select("id image name price quantity colors sizes isAvailable")
      .sort({ dateCreated: -1 })

    if (!merchantProductList) {
      return res.status(500).json({ success: false })
    }

    return res.json({ merchantProductList })
  } catch (error) {
    next(error)
  }
}

export async function deleteProduct(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.status(400).json({ success: false, msg: "Invalid Product ID" })
  }
  try {
    const product = await Product.findById(req.params.productId)

    if (product.merchant.toString() !== req.auth.merchantId) {
      return res.status(403).json({ success: false, message: "Not Authorized" })
    }
    Product.findByIdAndDelete(req.params.productId).then((product) => {
      if (product) {
        const images = product.images
        images.push(product.image)
        images.map((image) => {
          const filePath = image.split("/")
          deleteImage(filePath.pop())
        })
        return res
          .status(200)
          .json({ success: true, msg: "Product Deleted Successfully" })
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Product not Found" })
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function updateProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).json({ success: false, msg: "Invalid Product ID" })
    }

    const product = await Product.findById(req.params.productId)

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product does not exists" })
    }

    if (product.merchant.toString() !== req.auth.merchantId) {
      return res.status(403).json({ success: false, message: "Not Authorized" })
    }

    if (req.body.category) {
      if (!mongoose.isValidObjectId(req.body.category)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" })
      }
      const category = await Category.findById(req.body.category)
      if (!category) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" })
      }
    }
    let update = {
      name: req.body.name,
      description: req.body.description,
      merchant: req.auth.merchantId,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
      isAvailable: req.body.isAvailable,
      customizable: req.body.customizable,
    }
    let imagePaths = []
    let mainImage
    const basePath = `${req.protocol}://api.pricewards.com/`
    if (req.files) {
      let mainImageFile
      if (req.files["image"]) {
        mainImageFile = req.files["image"]
      }
      if (mainImageFile) {
        mainImage = mainImageFile[0].filename
        update.image = `${basePath}${mainImage}`
      }
      let imageGalleryFiles
      if (req.files["images"]) {
        imageGalleryFiles = req.files["images"]
      }
      if (imageGalleryFiles) {
        imageGalleryFiles.map((file) => {
          imagePaths.push(`${basePath}${file.filename}`)
        })
        update.images = imagePaths
      }
    }

    const productUpdate = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        $set: update,
      }
    )

    if (update.image) {
      const oldImage = productUpdate.image
      const oldImageFilePath = oldImage.split("/")
      deleteImage(oldImageFilePath.pop())
    }
    if (update.images) {
      const oldImageGallery = productUpdate.images
      const updateImageGallery = update.images
      oldImageGallery.map((oldImage) => {
        if (!updateImageGallery.includes(oldImage)) {
          const oldImageFilePath = oldImage.split("/")
          deleteImage(oldImageFilePath.pop())
        }
      })
    }

    return res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function rateProduct(req, res, next) {
  try {
    const ratedProduct = await Product.findByIdAndUpdate(req.body.productId, {
      $inc: { noOfRatings: 1, rating: req.body.rating },
    })
    if (!ratedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not Found" })
    }
    return res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function stockProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.productId)

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product does not exists" })
    }

    if (product.merchant.toString() !== req.auth.merchantId) {
      return res.status(403).json({ success: false, message: "Not Authorized" })
    }

    if (product.customizable) {
      return res.status(400).json({ success: false })
    }

    let { options } = req.body

    let productSizes = new Set()

    for (let i in options) {
      let size, sizeQuantity
      const sizes = options[i].sizes

      for (let j in sizes) {
        size = sizes[j].size
        sizeQuantity = sizes[j].quantity
        if (!size || !sizeQuantity) {
          return res.status(400).json({ success: false, msg: "this" })
        }
        productSizes.add(size)
      }
    }
    const productUpdate = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        sizes: [...productSizes],
        options,
      },
      { new: true }
    )
    res.json({ options: productUpdate.options })
  } catch (error) {
    next(error)
  }
}
