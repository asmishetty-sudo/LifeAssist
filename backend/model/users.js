const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    isSuspended:{
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum: ["family", "caregiver", "admin"],
        default: "family"
    }
},
{
    timestamps :true
}
);

module.exports = mongoose.model("users",userSchema)