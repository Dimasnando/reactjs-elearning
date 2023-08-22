// LoginSchema;

const mongoose = require("mongoose");

const LoginSchema=new mongoose.Schema({

    idusers:{
        type:String,
        required:true
    }
    
});

module.exports=mongoose.model("Login",LoginSchema);
