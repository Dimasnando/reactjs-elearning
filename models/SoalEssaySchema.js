//SoalEssaySchema.js

const mongoose = require("mongoose");

const SoalEssaySchema=new mongoose.Schema({

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
    catatan:{
        type:String,
        required:true
    }



});

module.exports=mongoose.model("Soal_Essay",SoalEssaySchema);
