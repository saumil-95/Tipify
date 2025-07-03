const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema(
    {
        employeeID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        hotelID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['stripe_card', 'stripe_upi', 'upi'], 
            required: true,
        },
        stripeChargeID: {
            type: String,
            trim: true,
        },
        paymentStatus: {
            type: String,
            enum: ['succeeded', 'failed' , 'pending'],
            required: true,
        },
        currency: {
            type: String,
            default: 'INR',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Tip', tipSchema);
