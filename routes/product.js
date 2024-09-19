import { Router } from "express"
import {
  createProduct,
  deleteProduct,
  getFeaturedProducts,
  getMerchantProducts,
  getNewArrivalProducts,
  getProductDetail,
  getProducts,
  rateProduct,
  stockProduct,
  updateProduct,
} from "../controllers/product.js"
import { merchantJwtAuth, userJwtAuth } from "../src/jwt.js"
import uploadOptions from "../src/multerStorage.js"

export const router = Router()

router
  .route("/")
  .get(getProducts)
  .post(
    merchantJwtAuth(),
    uploadOptions.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    createProduct
  )

router.route("/featured").get(getFeaturedProducts)
router.route("/rate").post(userJwtAuth(), rateProduct)
router.route("/merchantProduct").get(merchantJwtAuth(), getMerchantProducts)
router.route("/newArrival").get(getNewArrivalProducts)
router.route("/stock/:productId").post(merchantJwtAuth(), stockProduct)
router
  .route("/:productId")
  .get(getProductDetail)
  .delete(merchantJwtAuth(), deleteProduct)
  .patch(
    merchantJwtAuth(),
    uploadOptions.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    updateProduct
  )
