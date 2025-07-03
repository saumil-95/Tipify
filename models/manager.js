const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");


const managerSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required:true,
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
        // hotelID: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Hotel',
        // },
        
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

managerSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('Manager', managerSchema);
