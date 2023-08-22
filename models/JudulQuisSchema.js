//namaquis,tanggalmulai,bulanmulai,tahunmulai,tanggalakhir,bulanakhir,tahunakhir,jenissoal,jam,menit;

// akun pendaftar

const mongoose = require("mongoose");

const JudulQuisSchema=new mongoose.Schema({

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

    namaquis:{
        type:String,
        required:true
    },

    tanggalmulai:{
        type:String,
        required:true
    },
    bulanmulai:{
        type:String,
        required:true
    },
    tahunmulai:{
        type:String,
        required:true
    },

    tanggalakhir:{
        type:String,
        required:true
    },
    bulanakhir:{
        type:String,
        required:true
    },
    tahunakhir:{
        type:String,
        required:true
    },

    jenissoal:{
        type:String,
        required:true
    },
    jam:{
        type:String,
        required:true
    },
    menit:{
        type:String,
        required:true
    },

    status:{
        type:String,
        required:true
    },

});

module.exports=mongoose.model("Judul_Quis",JudulQuisSchema);
