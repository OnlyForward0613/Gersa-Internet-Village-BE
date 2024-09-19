import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { sendMail } from "../src/mail.js"
import Merchant from "../models/merchant.js"
import Product from "../models/product.js"
import MerchantOrder from "../models/merchantOrder.js"
import mongoose from "mongoose"
import User from "../models/user.js"
import Order from "../models/order.js"
import { sendSms } from "./otp.js"
dotenv.config("../")

export async function loginAdmin(req, res, next) {
  try {
    if (bcrypt.compareSync(req.body.password, process.env.ADMIN_PASSWORD)) {
      const accessToken = jwt.sign(
        {
          admin: true,
        },
        process.env.SECRET_ADMIN,
        { expiresIn: "1d" }
      )
      const refreshToken = jwt.sign(
        {
          admin: true,
        },
        process.env.SECRET_REFRESH_TOKEN,
        { expiresIn: "3d" }
      )
      return res
        .status(200)
        .json({ success: true, token: accessToken, refreshToken })
    } else {
      res.status(400).json({ success: false, message: "Incorrect password" })
    }
  } catch (err) {
    next(err)
  }
}

export async function changeProductDisable(req, res, next) {
  try {
    if (typeof req.body.disableStatus === "undefined") {
      return res
        .status(400)
        .json({ success: false, error: "disableStatus required" })
    }

    const productUpdate = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        $set: {
          disabled: req.body.disableStatus,
        },
      },
      { new: true }
    )

    if (productUpdate) {
      if (productUpdate.disabled) {
        const merchant = await Merchant.findById(productUpdate.merchant)
        if (merchant) {
          const message = `Dear Pricewards Merchant your product has been disabled from our platform for not complying with our product policy. \n Reason : ${req.body.reason}`
          await sendMail(merchant.email, "Product Disabled", message)
        }
      }
    }
    return res.status(200).json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function toogleProductIsFeatured(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).json({ success: false, msg: "Invalid Product ID" })
    }
    Product.findByIdAndUpdate(
      req.params.productId,
      [
        {
          $set: {
            isFeatured: { $not: "$isFeatured" },
          },
        },
      ],
      { new: true }
    ).then((product) => {
      if (product) {
        return res.json({
          isFeatured: product.isFeatured,
          success: true,
        })
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

export async function getAllProducts(req, res, next) {
  let filter = { isAvailable: true }
  try {
    const { limit = 10, page = 1 } = req.query
    if (req.query.categories) {
      filter.category = { $in: req.query.categories.split(",") }
    }
    if (req.query.sizes) {
      filter.sizes = { $in: req.query.sizes.split(",") }
    }
    if (req.query.colors) {
      filter.colors = { $in: req.query.colors.split(",") }
    }
    const productList = await Product.find(filter)
      .select(
        "id name image images price category isAvailable isFeatured disabled"
      )
      .populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Product.count()
    if (!productList) {
      return res.status(500).json({ success: false })
    }
    return res.json({
      productList,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllUserOrders(req, res, next) {
  try {
    const { limit = 10, page = 1 } = req.query
    const orderList = await Order.find()
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          select: "merchant price",
          populate: {
            path: "merchant",
            select: "brandName phone email",
          },
        },
      })
      .populate({ path: "user", select: "phone firstName lastName" })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await MerchantOrder.count()
    return res.json({
      orderList,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllMerchantOrders(req, res, next) {
  try {
    const { limit = 10, page = 1 } = req.query
    const orderList = await MerchantOrder.find({})
      .populate({
        path: "orderItem",
        populate: { path: "product", select: "name price" },
      })
      .populate({ path: "merchant", select: "email phone brandName" })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await MerchantOrder.count()
    return res.json({
      orderList,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    next(error)
  }
}

export async function renewAccessToken(req, res, next) {
  if (!req.body.refreshToken) {
    return res.status(401).json({ success: false, error: "no refresh token" })
  }
  try {
    const decoded = jwt.verify(
      req.body.refreshToken,
      process.env.SECRET_REFRESH_TOKEN
    )
    if (decoded.admin) {
      const accessToken = jwt.sign(
        { admin: decoded.admin },
        process.env.SECRET_ADMIN,
        { expiresIn: "1d" }
      )
      return res.json({ token: accessToken })
    }
  } catch (error) {
    next(error)
  }
}

export async function disableUser(req, res, next) {
  try {
    if (typeof req.body.disableStatus === "undefined") {
      return res
        .status(400)
        .json({ success: false, error: "disableStatus required" })
    }

    const userUpdate = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          disabled: req.body.disableStatus,
        },
      },
      { new: true }
    )
    if (userUpdate.disabled) {
      const message = `Dear Pricewards Customer your account has been disabled for not complying with our policy. Reason: ${req.body.reason}`
      await sendSms(userUpdate.phone, message)
    }
    return res.status(200).json({ success: true })
  } catch (error) {
    next(error)
  }
}
export async function disableMerchant(req, res, next) {
  try {
    if (typeof req.body.disableStatus === "undefined") {
      return res
        .status(400)
        .json({ success: false, error: "disableStatus required" })
    }

    const merchantUpdate = await Merchant.findByIdAndUpdate(
      req.params.merchantId,
      {
        $set: { disabled: req.body.disableStatus },
      },
      { new: true }
    )
    if (merchantUpdate.disabled) {
      const message = `Dear Pricewards Customer your account has been disabled for not complying with our policy. Reason: ${req.body.reason}`
      await sendMail(merchantUpdate.email, "Account Disabled", message)
    }
    return res.status(200).json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function adminGetNewArrivalProducts(req, res, next) {
  try {
    const today = new Date()
    const dd = String(today.getDate())
    const mm = String(today.getMonth())
    const yyyy = String(today.getFullYear())

    const newArrivalProductList = await Product.find({
      dateCreated: { $gte: new Date(yyyy, mm, dd) },
    })
      .select(
        "id name image images price category isAvailable isFeatured disabled"
      )
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
export async function adminGetUserDetail(req, res, next) {
  try {
    const user = await User.findById(req.params.userId).select(
      "+disabled +verified"
    )
    if (!user) {
      return res.status(404).json({ success: false })
    }
    return res.json({ user })
  } catch (error) {
    next(error)
  }
}
export async function adminGetMerchantDetail(req, res, next) {
  try {
    const merchant = await Merchant.findById(req.params.merchantId).select(
      "+disabled"
    )

    if (!merchant) {
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" })
    }

    return res.json({ merchant })
  } catch (error) {
    next(error)
  }
}

export async function markOrderComplete(req, res, next) {
  try {
    const order = await Order.updateOne(
      { _id: req.params.orderId },
      { complete: true }
    )
    return res.status(201).json({ success: true })
  } catch (error) {
    next(error)
  }
}

//Generate passwordHash
// console.log(bcrypt.hashSync("IamAdmin@pricewards"))
// bcrypt.compareSync("IamAdmin@pricewards", process.env.ADMIN_PASSWORD)
