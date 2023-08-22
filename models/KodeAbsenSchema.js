//kodeAbsenSchema;

const mongoose = require("mongoose");

const kodeAbsenSchema=new mongoose.Schema({

    tanggal:{
        type:String,
        required:true
    },
    judul:{
        type:String,
        required:true
    },
    deskripsi:{
        type:String,
        required:true
    },
    kode:{
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

module.exports=mongoose.model("Kode_Absen",kodeAbsenSchema);
