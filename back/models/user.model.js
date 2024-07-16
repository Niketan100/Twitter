import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true,
        unique : true
    },
    fullName: {
        type : String,
        requried : true,

    },
    password:{
        type : String,
        required : true,
        minLength: 6,
    },
    email:{
        type : String, 
        required : true,
        unique : true,
    },
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[],
        }
    ],
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[],
        }
    ],
    profilePic:{
        type: String,
        default : "",
    },
    coverPic:{
        type: String,
        default: "",
    },
    Bio:{
        type : String,
        default: "",
    },
    link:{
        type: String,
        default: "",
    }

}, {timestamps : true}
);

const User = mongoose.model("User", userSchema);

export default User;