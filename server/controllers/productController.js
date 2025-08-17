// to add products in database <--> shown in productList on frontend
//path /api/product/add
import Product from "../models/Product.js";
import { v2 } from "cloudinary";

export const addProduct = async (req, res) => {
  try {
    productData = JSON.parse(req.body.productData);

    const images = req.files;
    let imagesUrl = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path, {
          resource_type: "image",
        });
        return result.secure.url;
      })
    );

    await Product.create({
      ...productData,
      images: imagesUrl,
    });
    res.json({ success: true, message: "Product added successfully" });
  } catch (error) {
    res.json({ success: false, message: "Product not added" });
    console.log(error);
  }
};

//path /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
    console.log(products);
    if (products.length === 0) {
      return res.json({ success: false, message: "No products found" });
    }
  } catch (error) {
    res.json({ success: false, message: "Product not added" });
    console.log(error);
  }
};

//path /api/product/:id
export const productDetailByID = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.json({ success: false, message: "Product not found" });
    console.log(error);
  }
};

// to change stock of product in databse
//path /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock updated" });
  } catch (error) {
    res.json({ success: false, message: "Stock not updated" });
    console.log(error);
  }
};
