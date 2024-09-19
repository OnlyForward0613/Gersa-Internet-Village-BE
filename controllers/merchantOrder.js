import MerchantOrder from "../models/merchantOrder.js"
import { OrderItem } from "../models/orderItem.js"

export async function getMerchantOrders(req, res, next) {
  try {
    const { limit = 10, page = 1 } = req.query
    const orderList = await MerchantOrder.find({
      merchant: req.auth.merchantId,
    })
      .populate({
        path: "orderItem",
        populate: { path: "product", select: "name price" },
      })
      .select("-merchant")
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

export async function getMonthlySales(req, res, next) {
  try {
    const today = new Date()
    const mm = String(today.getMonth())
    const yyyy = String(today.getFullYear())
    const orderList = await getMerchantOrders(req.auth.merchantId)
    const orderItemList = []
    if (orderList) {
      for (const index in orderList) {
        const order = orderList[index]
        const orderId = orderList[index].orderItem._id
        const status = order.orderItem.status
        if (!"Complete".localeCompare(String(status))) {
          const orderItem = await OrderItem.find({
            _id: orderId,
            dateCreated: {
              $gte: new Date(yyyy, mm, 1),
              $lt: new Date(yyyy, mm + 1, 1),
            },
          }).select("quantity dateCreated")
          orderItemList.push(orderItem)
        }
      }
    }
    return res.json({ orderItemList })
  } catch (error) {
    next(error)
  }
}
