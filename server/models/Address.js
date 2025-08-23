import mongoose from "mongoose";


const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "User"
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
        phone: {
        type: String,
        required: true
    }
    
    ,
    address: { // Changed from 'street' to 'address'
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zip: { // Changed from 'zipCode' to 'zip' and type to String
        type: String,
        required: true
    },
    country: { // Added country field
        type: String,
        required: true
    }

});

const Address = mongoose.models.Address || mongoose.model("Address",addressSchema)
export {Address}
