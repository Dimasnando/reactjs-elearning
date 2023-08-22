//SelesaiQuisSchema;

const mongoose = require("mongoose");

const SelesaiQuisSchema=new mongoose.Schema({

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
    nama:{
        type:String,
        required:true
    },
    //soal
    idquis:{
        type:String,
        required:true
    }



});

module.exports=mongoose.model("Selesai_Quis",SelesaiQuisSchema);
