import express from 'express'
import { upload } from "../configs/multer.js"
import { addProduct, changeStock, productDetailByID, productList} from "../controllers/productController.js"
import authSeller from "../middleware/authSeller.js"



const productRouter = express.Router()


productRouter.post("/add",upload.array(["images"]),authSeller,addProduct)
productRouter.get("/list",productList)
productRouter.get("/:id",productDetailByID)
productRouter.put("/stock",authSeller,changeStock)
// productRouter.get("/search",searchProduct)
// productRouter.get("/category/:category",productCategory)
// productRouter.get("/search/:query",searchProduct)
// productRouter.get("/category/:category/:query",searchProductByCategory)
export default productRouter