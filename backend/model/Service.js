const mongoose = require("mongoose")

const serviceSchema = mongoose.Schema({
    name: {
        type:String,
        required : true
    },
    description: String,
    priceType :{
        type: String,
        enum: ["hourly" , "daily"],
        required : true
    },
    price :{
        type:Number,
        required:true
    },
    extraCost :{
        type:Number,
        required:true
    }
},
{timestamps:true}
);

module.exports = mongoose.model("Service",serviceSchema)