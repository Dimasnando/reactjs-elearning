// akun pendaftar

const mongoose = require("mongoose");

const AbsensiSchema=new mongoose.Schema({

    idabsensi:{
        type:String,
        required:true
    },
    idsiswa:{
        type:String,
        required:true
    },
    namasiswa:{
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
    },
    kode:{
        type:String,
        required:true
    },
    tanggalkumpul:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model("Absensi_Kehadiran",AbsensiSchema);
