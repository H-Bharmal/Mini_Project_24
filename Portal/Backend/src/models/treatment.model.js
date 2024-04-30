import mongoose from "mongoose"

const treatmentSchema = new mongoose.Schema({
    patient : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Patient",
        required : true
    },
    doctor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Doctor",
        required : true
    },
    status : {
        type : String,
        enum : ["Active", "Completed"],
        default : "Active"
    },
    remarks : {
        type : String,
    },
    image : {
        type : String,
    },

}, {timestamps: true});

export const Treatment = mongoose.model("Treatment", treatmentSchema);