const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50, 
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
        },
        
        qrCode : {
            url: {
                type: String,
                default: '/images/default.png',  
              },
              filename: {
                type: String,
                default: 'default.png', 
              },
        },
        locationID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
        managerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
            required: true,
        },

    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('Hotel', hotelSchema);
