const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const employeeSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address!`,
            },
        },
        phone: {
           type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ['waiter', 'chef', 'receptionist', 'housekeeping', 'manager', 'bartender', 'other'],
            required: true,
        },
        upiID: {
            type: String,
            required: true,
            trim: true,
        },
        photo: {
            url: {
                type: String,
                default: 'F:\Tipping\public\images\default.png',  // Replace with actual default path
            },
            filename: {
                type: String,
                default: 'default.jpg',
            },
        },
        isActive: {
            type: Boolean,
            default: true
        },
        hotelID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel',
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

employeeSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Employee', employeeSchema);
