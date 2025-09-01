import express from "express";
import {
  submitContactForm,
  subscribeNewsletter,
} from "../controllers/contactController.js";

const contactRouter = express.Router();

// Contact form submission
contactRouter.post("/submit", submitContactForm);

// Newsletter subscription
contactRouter.post("/newsletter", subscribeNewsletter);

export default contactRouter;