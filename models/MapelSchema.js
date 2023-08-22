// akun pendaftar

const mongoose = require("mongoose");

const MapelSchema=new mongoose.Schema({

    hari:{
        type:String,
        required:true
    },
    jam:{
        type:String,
        required:true
    },
    guru:{
        type:String,
        required:true
    },
    kelas:{
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
    mapel:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model("Mapel",MapelSchema);
