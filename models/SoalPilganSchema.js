//SoalPilganSchema.js

const mongoose = require("mongoose");

const SoalPilganSchema=new mongoose.Schema({

    //kelas
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
    },
    idguru:{
        type:String,
        required:true
    },
    //soal
    idquis:{
        type:String,
        required:true
    },
    nosoal:{
        type:String,
        required:true
    },
    soal:{
        type:String,
        required:true
    },
    A:{
        type:String,
        required:true
    },
    B:{
        type:String,
        required:true
    },
    C:{
        type:String,
        required:true
    },
    D:{
        type:String,
        required:true
    },
    E:{
        type:String,
        required:true
    },
    kunci:{
        type:String,
        required:true
    },



});

module.exports=mongoose.model("Soal_Pilgan",SoalPilganSchema);
