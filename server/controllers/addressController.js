import { Address } from "../models/Address.js";

// add address /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    await Address.create({ ...address, userId });
    res.status(200).json({ message: "Address added successfully" });
  } catch (error) {
    res.json(400).json({ success: false, message: "Address not added" });
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
