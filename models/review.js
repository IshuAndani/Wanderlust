const { required, ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const formattedDate = () => {
    d = new Date();
    cd = num => num.toString().padStart(2, 0);
    return d.getFullYear() + "/" + cd(d.getMonth() + 1) + "/" + cd(d.getDate());
}

const reviewSchema = new Schema({
    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    comment : {
        type : String,
    },
    rating : {
        type : Number,
        required : true,
        max : [5, `Rating cannot be more than 5`],
        min : [1, `Rating cannot be less than 1`],
    },
    createdAt : {
        type : String,
        default : formattedDate(),
    },
})

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;