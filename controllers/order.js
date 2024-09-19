import MerchantOrder from "../models/merchantOrder.js"
import Order from "../models/order.js"
import { OrderItem, OrderMeasurement } from "../models/orderItem.js"
import Product from "../models/product.js"

export async function createOrder(req, res, next) {
  try {
    const orderItemsList = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let orderMeasurements
        if (orderItem.size === "custom") {
          orderMeasurements = new OrderMeasurement({
            ShirtLength: orderItem.measurements.ShirtLength,
            AcrossBack: orderItem.measurements.AcrossBack,
            Chest: orderItem.measurements.Chest,
            AroundArm: orderItem.measurements.AroundArm,
            SleeveLength: orderItem.measurements.SleeveLength,
            TrouserLength: orderItem.measurements.TrouserLength,
            Thighs: orderItem.measurements.Thighs,
            Bust: orderItem.measurements.Bust,
            Waist: orderItem.measurements.Waist,
            Hips: orderItem.measurements.Hips,
            TopLength: orderItem.measurements.TopLength,
            KabaLength: orderItem.measurements.KabaLength,
            SleetLength: orderItem.measurements.SleetLength,
          })
        }
        let newOrderItem = new OrderItem({
          product: orderItem.product,
          quantity: orderItem.quantity,
          size: orderItem.size,
          color: orderItem.color,
          measurements: orderMeasurements,
        })
        newOrderItem = await newOrderItem.save()

        return newOrderItem._id
      })
    )

    const resolvedOrderItemsList = await orderItemsList

    const totalPrices = await Promise.all(
      resolvedOrderItemsList.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          "product",
          "price merchant"
        )

        let merchantOrder = new MerchantOrder({
          orderItem: orderItemId,
          merchant: orderItem.product.merchant,
        })

        merchantOrder = await merchantOrder.save()

        const totalPrice = orderItem.product.price * orderItem.quantity
        reduceProductQuantity(
          orderItem.product.id,
          orderItem.quantity,
          orderItem.color,
          orderItem.size
        )
        return totalPrice
      })
    )

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)
    let order = new Order({
      orderItems: resolvedOrderItemsList,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.auth.userId,
      payment: req.body.payment,
    })

    order = await order.save()

    if (!order) {
      return res
        .status(500)
        .json({ success: false, message: "Order could not be created" })
    }
    return res.json({
      order,
    })
  } catch (error) {
    next(error)
  }
}

async function reduceProductQuantity(productId, _quantity, color, size) {
  try {
    const quantity = Number(_quantity)
    const product = await Product.findById(productId)
    let options = product.options

    if (options.length === 1) {
      const sizes = options[0].sizes
      for (let j in sizes) {
        if (sizes[j].size === size) {
          sizes[j].quantity -= quantity
        }
      }
    } else {
      for (let i in options) {
        if (options[i].color === color) {
          const sizes = options[i].sizes
          for (let j in sizes) {
            if (sizes[j].size === size) {
              sizes[j].quantity -= quantity
            }
          }
        }
      }
    }

    const productUpdate = await Product.findByIdAndUpdate(productId, {
      options,
    })
    if (!productUpdate) {
      return
    }
  } catch (error) {
    throw error
  }
}

export async function getUserOrderHistory(req, res, next) {
  try {
    const orderHistory = await Order.find({ user: req.auth.userId })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          model: "Product",
        },
      })
      .select("-user -payment")

    if (!orderHistory) {
      return res.status(500).json({ success: false })
    }
    return res.json({ orderHistory })
  } catch (error) {
    next(error)
  }
}

export async function changeOrderStatus(req, res, next) {
  try {
    const orderItemUpdate = await OrderItem.findByIdAndUpdate(
      req.body.orderItemId,
      {
        $set: { status: req.body.status },
      },
      { new: true }
    )
    if (!orderItemUpdate) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to Update User" })
    }
    return res.json({ orderItemUpdate })
  } catch (error) {
    next(error)
  }
}

export async function verifyOrder(req, res, next) {
  try {
    let totalPrice = 0
    let orderStatus = []
    if (!req.auth.verified) {
      return res
        .status(401)
        .json({ success: false, message: "User Account not Verified" })
    }
    const { orderItems } = req.body

    for (let i in orderItems) {
      let sizeAvailability = false
      let quantityAvailability = false
      let colorAvailability = false
      let availabilityCheck = false
      const { size, quantity, color } = orderItems[i]

      const product = await Product.findById(orderItems[i].product)

      const { options } = product

      if (product.customizable) {
        sizeAvailability = true
        quantityAvailability = true

        for (let j in options) {
          if (options[j].color === color) {
            colorAvailability = true
          }
        }
      } else {
        if (options.length === 1) {
          colorAvailability = true
          const sizes = options[0].sizes
          for (let j in sizes) {
            if (sizes[j].size === size) {
              sizeAvailability = true
              if (sizes[j].quantity >= quantity) {
                quantityAvailability = true
              }
            }
          }
        } else {
          for (let j in options) {
            if (options[j].color === color) {
              colorAvailability = true
              const sizes = options[j].sizes
              for (let k in sizes) {
                if (sizes[k].size === size) {
                  sizeAvailability = true
                  if (sizes[k].quantity >= quantity) {
                    quantityAvailability = true
                  }
                }
              }
            }
          }
        }
      }
      let singleOrderStatus = { product: orderItems[i].product }
      if (!colorAvailability) {
        singleOrderStatus.color = "N/A"
      }
      if (!sizeAvailability) {
        singleOrderStatus.size = "N/A"
      }
      if (!quantityAvailability) {
        singleOrderStatus.quantity = "N/A"
      }
      if (sizeAvailability && colorAvailability && quantityAvailability) {
        availabilityCheck = true
      } else {
        orderStatus.push(singleOrderStatus)
      }

      if (availabilityCheck) {
        let orderItemPrice = quantity * product.price
        totalPrice += orderItemPrice
      }
    }
    if (orderStatus.length > 0) {
      return res.status(400).json({ orderStatus, totalPrice })
    } else {
      return res.json({ orderStatus, totalPrice })
    }
  } catch (error) {
    next(error)
  }
}
