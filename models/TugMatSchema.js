// akun pendaftar

const mongoose = require("mongoose");

const TugMatSchema=new mongoose.Schema({
    //data siswa;
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
    //data materi;
    idmateri:{
        type:String,
        required:true
    },
    mapel:{
        type:String,
        required:true
    },
    tanggal:{
        type:String,
        required:true
    },
    namatugas:{
        type:String,
        required:true
    },
    keterangan:{
        type:String,
        required:true
    },
    guru:{
        type:String,
        required:true
    },
    //data tugas siswa;
    keterangansiswa:{
        type:String,
        required:true
    },
    destination:{
        type:String,
        required:true
    },
    encoding:{
        type:String,
        required:true
    },
    fieldname:{
        type:String,
        required:true
    },
    filename:{
        type:String,
        required:true
    },
    mimetype:{
        type:String,
        required:true
    },
    originalname:{
        type:String,
        required:true
    },
    path:{
        type:String,
        required:true
    },
    size:{
        type:String,
        required:true
    },
    //nilai;
    nilai:{
        type:Number,
        required:true
    },
    tanggalkumpul:{
        type:String,
        required:true
    },

    //idsiswa,namasiswa,kelas,jurusan,lokal;
    //idmateri,mapel,tanggal,namatugas,keterangan,guru;
    //keterangansiswa,destination,encoding,fieldname,filename,mimetype,originalname,path,size;
    //nilai,tanggalkumpul;
});

module.exports=mongoose.model("Tugas_Materi",TugMatSchema);
