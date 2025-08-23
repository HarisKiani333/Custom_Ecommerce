import { Address } from "../models/Address.js";

// add address /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    
    console.log('Received userId:', userId); // Debug log
    console.log('Received address:', address); // Debug log
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User authentication required" 
      });
    }
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: "Address data is required" 
      });
    }
    
    // Updated validation to match Address model fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'];
    const missingFields = requiredFields.filter(field => !address[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    const newAddress = await Address.create({ ...address, userId });
    console.log('Address created successfully:', newAddress._id); // Debug log
    
    res.status(200).json({ 
      success: true, 
      message: "Address added successfully",
      addressId: newAddress._id 
    });
  } catch (error) {
    console.error('Address creation error:', error); // Enhanced error logging
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Validation failed: ${validationErrors.join(', ')}` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal server error" 
    });
  }
};

// get address /api/address/get
export const getAddress = async (req, res) => {
  try {
    const { userId } = req.body;
    const address = await Address.find({ userId });
    res.status(200).json({ success: true, address });
  } catch (error) {
    res.json(400).json({ success: false, message: "Address not added" });
  }
};
