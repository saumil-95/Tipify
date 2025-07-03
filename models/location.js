const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
    {
        // country: {
        //     type: String,
        //     trim: true,
        // },
        state: {
            type: String,
          
            trim: true,
        },
        city: {
            type: String,
           
            trim: true,
        },
        address: {
            type: String,
           
            trim: true,
        },
        zipCode: {
            type: Number,
          
            trim: true,
            min:0
        },
        latitude: {
            type: Number,
            required: false,
        },
        longitude: {
            type: Number,
            required: false,
        },
        
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);


// Export the model
module.exports = mongoose.model('Location', locationSchema);
