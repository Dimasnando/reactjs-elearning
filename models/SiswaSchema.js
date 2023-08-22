// akun pendaftar

const mongoose = require("mongoose");

const SiswaSchema=new mongoose.Schema({

    ndepan:{
        type:String,
        required:true
    },
    nbelakang:{
        type:String,
        required:true
    },
    nis:{
        type:String,
        required:true
    },
    angkatan:{
        type:String,
        required:true
    },
    jurusan:{
        type:String,
        required:true
    },
    lokal:{
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
    },
});

module.exports=mongoose.model("Siswa",SiswaSchema);
