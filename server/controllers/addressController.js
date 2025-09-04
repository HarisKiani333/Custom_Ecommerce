import { Address } from "../models/Address.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/errorLogger.js";

// add address /api/address/add
export const addAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { address } = req.body || {};

    if (!userId) {
      return sendErrorResponse(res, "User authentication required", 401);
    }

    if (!address) {
      return sendErrorResponse(res, "Address data is required", 400);
    }

    // Updated validation to match Address model fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zip",
      "country",
    ];
    const missingFields = requiredFields.filter((field) => !address[field]);

    if (missingFields.length > 0) {
      return sendErrorResponse(res, `Missing required fields: ${missingFields.join(", ")}`, 400);
    }

    const newAddress = await Address.create({ ...address, userId });

    return sendSuccessResponse(res, {
      addressId: newAddress._id,
    }, "Address added successfully");
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return sendErrorResponse(res, `Validation failed: ${validationErrors.join(", ")}`, 400);
    }

    return sendErrorResponse(res, error.message || "Internal server error", 500);
  }
};

// get address /api/address/get
export const getAddress = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return sendErrorResponse(res, "User authentication required", 401);
    }
    
    const address = await Address.find({ userId });
    
    return sendSuccessResponse(res, { address }, "Addresses retrieved successfully");
  } catch (error) {
    return sendErrorResponse(res, error.message || "Failed to retrieve addresses", 500);
  }
};
