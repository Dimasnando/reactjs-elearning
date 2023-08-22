//JawabPilganSchema;

const mongoose = require("mongoose");

const JawabPilganSchema=new mongoose.Schema({

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
    idsiswa:{
        type:String,
        required:true
    },
    //soal
    idquis:{
        type:String,
        required:true
    },
    idsoal:{
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
    jawaban:{
        type:String,
        required:true
    },
    point:{
        type:String,
        required:true
    }



});

module.exports=mongoose.model("Jawab_Pilgan",JawabPilganSchema);
