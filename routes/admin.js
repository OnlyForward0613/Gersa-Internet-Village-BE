import express from "express"
import {
  createCategory,
  deleteCategory,
  getCategoryDetails,
  updateCategory,
} from "../controllers/category.js"
import {
  toogleProductIsFeatured,
  changeProductDisable,
  loginAdmin,
  getAllProducts,
  renewAccessToken,
  getAllMerchantOrders,
  disableUser,
  disableMerchant,
  adminGetNewArrivalProducts,
  adminGetMerchantDetail,
  adminGetUserDetail,
  getAllUserOrders,
  markOrderComplete,
} from "../controllers/admin.js"
import { adminJwtAuth } from "../src/jwt.js"
import { getAllUsers } from "../controllers/user.js"
import { getAllMerchants } from "../controllers/merchant.js"

export const router = express.Router()

router.route("/login").post(loginAdmin)
router.route("/token").post(renewAccessToken)
router.route("/category").post(adminJwtAuth(), createCategory)

router
  .route("/category/:categoryId")
  .patch(adminJwtAuth(), updateCategory)
  .get(adminJwtAuth(), getCategoryDetails)
router
  .route("/disableProduct/:productId")
  .post(adminJwtAuth(), changeProductDisable)
router
  .route("/featureProduct/:productId")
  .get(adminJwtAuth(), toogleProductIsFeatured)
router.route("/userOrder").get(adminJwtAuth(), getAllUserOrders)
router.route("/merchantOrder").get(adminJwtAuth(), getAllMerchantOrders)
router.route("/user").get(adminJwtAuth(), getAllUsers)
router.route("/merchant").get(adminJwtAuth(), getAllMerchants)
router.route("/product").get(adminJwtAuth(), getAllProducts)
router.route("/product/new").get(adminJwtAuth(), adminGetNewArrivalProducts)
router.route("/disableUser/:userId").post(adminJwtAuth(), disableUser)
router
  .route("/disableMerchant/:merchantId")
  .post(adminJwtAuth(), disableMerchant)
router.route("/user/:userId").get(adminJwtAuth(), adminGetUserDetail)
router
  .route("/merchant/:merchantId")
  .get(adminJwtAuth(), adminGetMerchantDetail)
router.route("/order/:orderId").patch(adminJwtAuth(), markOrderComplete)
