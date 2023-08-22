// akun pendaftar

const mongoose = require("mongoose");

const GuruSchema=new mongoose.Schema({

    nama:{
        type:String,
        required:true
    },
    gelar:{
        type:String,
        required:true
    },
    nip:{
        type:String,
        required:true
    },
    hp:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model("Guru",GuruSchema);
