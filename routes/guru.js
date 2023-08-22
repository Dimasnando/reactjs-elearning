var express = require('express');
var multer=require('multer');
var path=require('path');
var router = express.Router();
var Gurus = require('../models/GuruSchema');
var Siswas = require('../models/SiswaSchema');
var Mapels = require('../models/MapelSchema');
var Materis = require('../models/MateriSchema');
var Tugass = require('../models/TugasSchema');
var TugasMateris = require('../models/TugMatSchema');
var KodeAbsens = require('../models/KodeAbsenSchema');
var Absensiswa=require('../models/AbsensiSchema');
var Logins = require('../models/LoginSchema');

var JudulQuis=require('../models/JudulQuisSchema');
var Soal_Pilgans = require('../models/SoalPilganSchema');
var Soal_Essays = require('../models/SoalEssaySchema');

var Nilai_Siswas = require('../models/NilaiSiswaSchema');

var Jawab_Pilgans=require('../models/JawabPilganSchema');
var Jawab_Essays=require('../models/JawabEssaySchema');

var xl = require('excel4node');

//==================================================================================
var storage=multer.diskStorage({
  destination:function(req,file,cb){
      cb(null,'./public/strong');//<<=== posisi folder tempat menyimpan foto;
  },
  filename:function(req,file,cb){
      cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
  }
})

const fileFilter=function(req,file,cb){
  if(file.mimetype){
      cb(null,true);
  }else{
      cb(null,false);
  }
}

var upload =multer({
  storage:storage,
  fileFilter:fileFilter
});

//==================================================================================
//halaman login guru;
router.get('/login', function(req, res, next) {
  //tampilkan halaman berdasarkan posisi file;
  res.render('gurus/login', { 
    title: 'Login Guru'
  });
});

//action login guru;
router.post('/login',function(req,res,next){
  //cek nilai masuk;
  console.log(req.body);
  //masukan nilai dalam variabel;
  const {email,password}=req.body;

  //variabel penampung;
  let errors=[];

  //jika kosong;
  if(!email||!password){
    console.log('Lengkapi semua data guru');
    errors.push({msg:'Lengkapi semua data guru'});
  }

  //logika;
  if(errors.length>0){
    //jika ada errors;
    //tampilkan halaman berdasarkan posisi file;
    res.render('gurus/login',{
      title:'Login Guru Gagal',
      errors
    });
  }else{
    //jika tidak ada errors;

    //cek email dalam database guru;
    Gurus.findOne({email:email}).then(guru=>{
      if(guru){
        //jika email ada;

        //cek password;
        if(password==guru.password){
          //jika password benar;

          //simpan loginnya;
          const newLogins=Logins({
            idusers:guru.id
          });
          newLogins.save().then(login=>{
              //jika berhasil;

              //lempar kehalaman dashboard guru;
              res.redirect('/guru/dashboard/'+guru.id);
          });

        }else{
          //jika password salah;
          console.log('password guru salah');
          errors.push({msg:'password guru salah'});
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/login',{
            title:'Password guru salah',
            errors
          });
        }
      }else{
        //jika email tidak ada;
        console.log('Email guru tidak terdaftar');
        errors.push({msg:'Email guru tidak terdaftar'});
        //tampilkan halaman berdasarkan posisi file;
        res.render('gurus/login',{
          title:'Email guru salah',
          errors
        });
      }
    });
  }
});

//===========================Dashboard Guru(pilih kelas)===================================
//halaman dashboard guru;
router.get('/dashboard/:idguru',function(req,res,next){
  //dari parameter id guru cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //cek semua login guru;
      Logins.find({idusers:guru.id}).then(login=>{
        if(login.length==0){
            //jika tidak ada, Lempar keluar;
            res.redirect('/');
        }
      });

      //variabel penampung;
      let ListMapels=[];

      var pemateri=guru.nama+' '+guru.gelar;
      console.log(pemateri);
      //cari semua mapel yg diajarkan guru ini;
      Mapels.find({guru:pemateri}).then(mapels=>{
        if(mapels){
          //jika mapels ada;

          //ambil nilainya secara spesifik
          for(data of mapels){
            ListMapels.push({
              id:data.id,
              hari:data.hari,
              jam:data.jam,
              guru:data.guru,
              kelas:data.kelas,
              jurusan:data.jurusan,
              lokal:data.lokal,
              mapel:data.mapel
            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/dashboardguru',{
            title:'Dashboard Guru',
            guru,
            ListMapels
          });
        }else{
          //jika mapels tidak ada;
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/dashboardguru',{
            title:'Dashboard Guru',
            guru,
            ListMapels
          });
        }
      });
      
    }
  });
});

//===========================Kelas Guru(ruang kelas)===================================
//halaman kelas guru;
router.get('/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //cek semua login guru;
  Logins.find({idusers:req.params.idguru}).then(login=>{
    if(login.length==0){
        //jika tidak ada, Lempar keluar;
        res.redirect('/');
    }
  });

  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  
  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListMateris=[];
      var video='';
      var gambar='';
      var document='';

      //cari semua materi kelas ini;
      Materis.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(materis=>{
        if(materis){
          //jika materi ada;

          //ambil nilainya secara spesifik;
          for(data of materis){
            //cek format file;
            if(data.mimetype=='image/jpeg'||data.mimetype=='image/png'){
              //jika gambar
              gambar='aktif';
              video='nonaktif';
              document='nonaktif';
            }else if(data.mimetype=='video/mp4'||data.mimetype=='video/x-matroska'){
              //jika video
              gambar='nonaktif';
              video='aktif';
              document='nonaktif';
            }else{
              //jika document
              gambar='nonaktif';
              video='nonaktif';
              document='aktif';
            }
            ListMateris.push({
              id:data.id,
              kelas:data.kelas,
              jurusan:data.jurusan,
              lokal:data.lokal,
              mapel:data.mapel,
              tanggal:data.tanggal,
              namatugas:data.namatugas,
              keterangan:data.keterangan,
              guru:data.guru,
              destination:data.destination,
              encoding:data.encoding,
              fieldname:data.fieldname,
              filename:data.filename,
              mimetype:data.mimetype,
              originalname:data.originalname,
              path:data.path,
              size:data.size,
              tampilkan:data.tampilkan,

              video,
              gambar,
              document,
            });
          }
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/kelas',{
            title:'Kelas '+req.params.kelas+' '+req.params.lokal+' | '+req.params.mapel,
            guru,
            kelas,
            jurusan,
            lokal,
            mapel,

            ListMateris
          });
        }else{
          //jika materi tidak ada;
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/kelas',{
            title:'Kelas '+req.params.kelas+' '+req.params.lokal+' | '+req.params.mapel,
            guru,
            kelas,
            jurusan,
            lokal,
            mapel,

            ListMateris
          });
        }
      });

    }
  });
});

//===========================Upload Materi==================================
//halaman upload materi;
router.get('/upload/materi/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  
  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //tampilkan halaman berdasarkan posisi file;
      res.render('gurus/uploadmateri',{
        title:'Upload materi '+mapel,
        guru,
        kelas,
        jurusan,
        lokal,
        mapel
      });
    }
  });
});

//action upload materi;
router.post('/upload/materi/:kelas/:jurusan/:lokal/:mapel/:idguru',upload.single('file'),function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //cek nilai masuk;
      console.log(req.body);
      console.log(req.file);
      //masukan dalam variabel
      const{tanggal,namatugas,keterangan}=req.body;
      const{destination,encoding,fieldname,filename,mimetype,originalname,path,size}=req.file;

      //variabel penampung;
      let errors=[];

      //jika kosong;
      if(!tanggal||!namatugas||!keterangan||!mimetype){
        //kirim pesan ke variabel errors;
        console.log('Lengkapi semua data materi');
        errors.push({msg:'Lengkapi semua data materi'});
      }

      //logika;
      if(errors.length>0){
        //jika ada errors, tetap dihalaman upload materi;

        //tampilkan halaman berdasarkan posisi file;
        res.render('gurus/uploadmateri',{
          title:'Upload materi '+mapel,
          guru,
          kelas,
          jurusan,
          lokal,
          mapel,
          errors
        });
      }else{
        //jika tidak ada errors;

        //simpan materi
        const newMateri=Materis({
          //kelas
          kelas,
          jurusan,
          lokal,
          mapel,
          //materi
          tanggal,
          namatugas,
          keterangan,
          guru:guru.nama+' '+guru.gelar,
          //file
          destination,
          encoding,
          fieldname,
          filename,
          mimetype,
          originalname,
          path,
          size,
          tampilkan:'Belum'
        });
        newMateri.save().then(materis=>{
          //jika berhasil tersimpan;
          //tampilkan halaman beserta pesannya;
          console.log('Materi berhasil di kirim');
          errors.push({msg:'Materi berhasil di kirim'});
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/uploadmateri',{
            title:'Upload materi '+mapel,
            guru,
            kelas,
            jurusan,
            lokal,
            mapel,
            errors
          });
        });


      }


    }
  });
});

//halaman edit materi;
router.get('/edit/tugas/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri',function(req,res,next){
    //variabel penampung;
    var kelas=req.params.kelas;
    var jurusan=req.params.jurusan;
    var lokal=req.params.lokal;
    var mapel=req.params.mapel;
    var idmateri=req.params.idmateri;
  
    //dari parameter id guru, cari datanya;
    Gurus.findById(req.params.idguru,function(err,guru){
      if(guru){
        //jika ada;

        //dari params id materi, cari datanya;
        Materis.findById(idmateri,function(err,materi){
          if(materi){
            //jika ada;

            //tampilkan halaman berdasarkan posisi file;
            res.render('gurus/editmateri', { 
              title: 'Edit materi',
              guru,
              materi,

              kelas,
              jurusan,
              lokal,
              mapel
            });

          }
        });

      }
    });
    
});

//action edit materi;
router.post('/edit/tugas/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri',upload.single('file'),function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id materi, cari datanya;
      Materis.findById(idmateri,function(err,materi){
        if(materi){
          //jika ada;

          //cek nilai masuk;
          console.log(req.body);
          console.log(req.file);
          //masukan nilai dalam variabel;
          const{tanggal,namatugas,keterangan}=req.body;
          const{destination,encoding,fieldname,filename,mimetype,originalname,path,size}=req.file;

          //variabel penampung;
          let errors=[];

          //jika kosong;
          if(!tanggal||!namatugas||!keterangan||!mimetype){
            //kirim pesan ke variabel errors;
            console.log('Lengkapi semua data materi');
            errors.push({msg:'Lengkapi semua data materi'});
          }

          //logika;
          if(errors.length>0){
            //jika ada errors, tetap dihalaman dan tampilkan pesan;

            //tampilkan halaman berdasarkan posisi file;
            res.render('gurus/editmateri', { 
              title: 'Edit materi',
              guru,
              materi,

              kelas,
              jurusan,
              lokal,
              mapel,

              errors
            });
          }else{
            //jika tidak ada errors;

            //update materinya;
            Materis.findByIdAndUpdate(req.params.idmateri,{
              tanggal,
              namatugas,
              keterangan,

              destination,
              encoding,
              fieldname,
              filename,
              mimetype,
              originalname,
              path,
              size
            },function(err){
              if(err){
                //jika ada err
                console.log(err);
              }else{
                materi.tanggal=tanggal;
                materi.namatugas=namatugas;
                materi.keterangan=keterangan;
                //jika tidak ada masalah, berhasil;
                console.log('Update berhasil');
                errors.push({msg:'Update berhasil'});
                
                //tampilkan halaman berdasarkan posisi file;
                res.render('gurus/editmateri', { 
                  title: 'Edit materi',
                  guru,
                  materi,

                  kelas,
                  jurusan,
                  lokal,
                  mapel,

                  errors
                });
              }
            });
          }

        }
      });

    }
  });
});

//action delete materi;
router.get('/hapus/tugas/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari parameter id materi, hapus datanya;
      Materis.findByIdAndDelete(req.params.idmateri,function(){
        //lempar ke halaman kelas guru;
        res.redirect('/guru/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+guru.id);
      });
    }
  });
});

//==================================Posting Materi======================================
//Posting Materi;
router.get('/posting/materi/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri',function(req,res,next){
  //variabel penamung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;
  var tampilkan='';

  //dari params idguru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,gurus){
    if(gurus){
      //jika ada;

      //cari params id materi, cari datanya;
      Materis.findById(idmateri,function(err,materis){
        if(materis){
          //jika ada;

          if(materis.tampilkan=='Belum'){
            tampilkan='Sudah';
          }else{
            tampilkan='Belum';
          }

          //berdasarkan id materi yg didapat, update datanya;
          Materis.findByIdAndUpdate(materis.id,{
            tampilkan:tampilkan
          },function(err){
            if(err){
              console.log(err);
            }else{
              //lempar ke halaman kelas guru;
              res.redirect('/guru/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+gurus.id+'/');
            }
          });
        }
      });
    }
  });
});

//=====================================Upload Tugas====================================================
//halaman semua tugas;=
router.get('/lihat/tugas/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  
  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListTugas=[];
      var video='';
      var gambar='';
      var document='';

      //cari semua materi kelas ini;
      Tugass.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(materis=>{
        if(materis){
          //jika materi ada;

          //ambil nilainya secara spesifik;
          for(data of materis){
            //cek format file;
            if(data.mimetype=='image/jpeg'||data.mimetype=='image/png'){
              //jika gambar
              gambar='aktif';
              video='nonaktif';
              document='nonaktif';
            }else if(data.mimetype=='video/mp4'||data.mimetype=='video/x-matroska'){
              //jika video
              gambar='nonaktif';
              video='aktif';
              document='nonaktif';
            }else{
              //jika document
              gambar='nonaktif';
              video='nonaktif';
              document='aktif';
            }
            ListTugas.push({
              id:data.id,
              kelas:data.kelas,
              jurusan:data.jurusan,
              lokal:data.lokal,
              mapel:data.mapel,
              tanggal:data.tanggal,
              tanggalakhir:data.tanggalakhir,
              namatugas:data.namatugas,
              keterangan:data.keterangan,
              guru:data.guru,
              destination:data.destination,
              encoding:data.encoding,
              fieldname:data.fieldname,
              filename:data.filename,
              mimetype:data.mimetype,
              originalname:data.originalname,
              path:data.path,
              size:data.size,
              tampilkan:data.tampilkan,

              video,
              gambar,
              document,
            });
          }
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/lihattugas',{
            title:'Tugas Kelas '+req.params.kelas+' '+req.params.lokal+' | '+req.params.mapel,
            guru,
            kelas,
            jurusan,
            lokal,
            mapel,

            ListTugas
          });
        }else{
          //jika materi tidak ada;
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/lihattugas',{
            title:'Kelas '+req.params.kelas+' '+req.params.lokal+' | '+req.params.mapel,
            guru,
            kelas,
            jurusan,
            lokal,
            mapel,

            ListTugas
          });
        }
      });

    }
  });
});

//halaman upload tugas;
router.get('/upload/tugas/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  
  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //tampilkan halaman berdasarkan posisi file;
      res.render('gurus/uploadtugas',{
        title:'Upload Tugas '+mapel,
        guru,
        kelas,
        jurusan,
        lokal,
        mapel
      });
    }
  });
});

//action upload tugas;=
router.post('/upload/tugas/:kelas/:jurusan/:lokal/:mapel/:idguru',upload.single('file'),function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //cek nilai masuk;
      console.log(req.body);
      console.log(req.file);
      //masukan dalam variabel
      const{tanggal,tanggalakhir,namatugas,keterangan}=req.body;
      const{destination,encoding,fieldname,filename,mimetype,originalname,path,size}=req.file;

      //variabel penampung;
      let errors=[];

      //jika kosong;
      if(!tanggal||!namatugas||!keterangan||!mimetype){
        //kirim pesan ke variabel errors;
        console.log('Lengkapi semua data materi');
        errors.push({msg:'Lengkapi semua data materi'});
      }

      //logika;
      if(errors.length>0){
        //jika ada errors, tetap dihalaman upload materi;

        //tampilkan halaman berdasarkan posisi file;
        res.render('gurus/uploadtugas',{
          title:'Upload Tugas '+mapel,
          guru,
          kelas,
          jurusan,
          lokal,
          mapel,
          errors
        });
      }else{
        //jika tidak ada errors;

        //simpan Tugas;
        const newTugas=Tugass({
          //kelas
          kelas,
          jurusan,
          lokal,
          mapel,
          //materi
          tanggal,
          tanggalakhir,
          namatugas,
          keterangan,
          guru:guru.nama+' '+guru.gelar,
          //file
          destination,
          encoding,
          fieldname,
          filename,
          mimetype,
          originalname,
          path,
          size,
          tampilkan:'Belum'
        });
        newTugas.save().then(materis=>{
          //jika berhasil tersimpan;
          //tampilkan halaman beserta pesannya;
          console.log('Tugas berhasil di kirim');
          errors.push({msg:'Tugas berhasil di kirim'});
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/uploadtugas',{
            title:'Upload Tugas '+mapel,
            guru,
            kelas,
            jurusan,
            lokal,
            mapel,
            errors
          });
        });


      }


    }
  });
});

//halaman edit tugas;
router.get('/edit/tugass/:kelas/:jurusan/:lokal/:mapel/:idguru/:idtugas',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idtugas=req.params.idtugas;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id tugas, cari datanya;
      Tugass.findById(idtugas,function(err,materi){
        if(materi){
          //jika ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/edittugas', { 
            title: 'Edit Tugas',
            guru,
            materi,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }
      });

    }
  });
  
});

//action edit tugas;=
router.post('/edit/tugass/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri',upload.single('file'),function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id tugas, cari datanya;
      Tugass.findById(idmateri,function(err,materi){
        if(materi){
          //jika ada;

          //cek nilai masuk;
          console.log(req.body);
          console.log(req.file);
          //masukan nilai dalam variabel;
          const{tanggal,tanggalakhir,namatugas,keterangan}=req.body;
          const{destination,encoding,fieldname,filename,mimetype,originalname,path,size}=req.file;

          //variabel penampung;
          let errors=[];

          //jika kosong;
          if(!tanggal||!namatugas||!keterangan||!mimetype){
            //kirim pesan ke variabel errors;
            console.log('Lengkapi semua data tugas');
            errors.push({msg:'Lengkapi semua data tugas'});
          }

          //logika;
          if(errors.length>0){
            //jika ada errors, tetap dihalaman dan tampilkan pesan;

            //tampilkan halaman berdasarkan posisi file;
            res.render('gurus/edittugas', { 
              title: 'Edit tugas',
              guru,
              materi,

              kelas,
              jurusan,
              lokal,
              mapel,

              errors
            });
          }else{
            //jika tidak ada errors;

            //update tugasnya;
            Tugass.findByIdAndUpdate(req.params.idmateri,{
              tanggal,
              tanggalakhir,
              namatugas,
              keterangan,

              destination,
              encoding,
              fieldname,
              filename,
              mimetype,
              originalname,
              path,
              size
            },function(err){
              if(err){
                //jika ada err
                console.log(err);
              }else{
                materi.tanggal=tanggal;
                materi.namatugas=namatugas;
                materi.keterangan=keterangan;
                //jika tidak ada masalah, berhasil;
                console.log('Update berhasil');
                errors.push({msg:'Update berhasil'});
                
                //tampilkan halaman berdasarkan posisi file;
                res.render('gurus/edittugas', { 
                  title: 'Edit tugas',
                  guru,
                  materi,

                  kelas,
                  jurusan,
                  lokal,
                  mapel,

                  errors
                });
              }
            });
          }

        }
      });

    }
  });
});

//action delete tugas;
router.get('/hapus/tugass/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari parameter id materi, hapus datanya;
      Tugass.findByIdAndDelete(req.params.idmateri,function(){
        //lempar ke halaman tugas guru;
        res.redirect('/guru/lihat/tugas/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+guru.id);
      });
    }
  });
});

//==================================Posting Tugas======================================
//Posting Tugas;
router.get('/posting/tugass/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri',function(req,res,next){
  //variabel penamung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;
  var tampilkan='';

  //dari params idguru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,gurus){
    if(gurus){
      //jika ada;

      //cari params id materi, cari datanya;
      Tugass.findById(idmateri,function(err,materis){
        if(materis){
          //jika ada;

          if(materis.tampilkan=='Belum'){
            tampilkan='Sudah';
          }else{
            tampilkan='Belum';
          }

          //berdasarkan id materi yg didapat, update datanya;
          Tugass.findByIdAndUpdate(materis.id,{
            tampilkan:tampilkan
          },function(err){
            if(err){
              console.log(err);
            }else{
              //lempar ke halaman tugas guru;
              res.redirect('/guru/lihat/tugas/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+gurus.id+'/');
            }
          });
        }
      });
    }
  });
});

//===========================Pengumpulan tugas==================================
//halaman pengumpulan tugas;=
router.get('/pengumpulan/tugas/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id materi, cari datanya;
      Tugass.findById(idmateri,function(err,materi){
        if(materi){
          //jika ada;

          //variabel penampung;
          let ListTugasSiswa=[];
          let ListSiswas=[];
          var nosis=0;
          var nosiskum=0;

          //dari parameter idmateri yg didapat, cari semua tugas siswa dalam database tugas materi;
          TugasMateris.find({idmateri:materi.id,kelas:kelas,lokal:lokal,jurusan:jurusan,mapel:mapel}).then(tugasmateris=>{
            if(tugasmateris){
              //jika ada;

              //ambil nilainya secara spesifik;
              for(data of tugasmateris){
                nosiskum=nosiskum+1;
                ListTugasSiswa.push({
                  id:data.id,
                  idsiswa:data.idsiswa,
                  namasiswa:data.namasiswa,
                  kelas:data.kelas,
                  jurusan:data.jurusan,
                  lokal:data.lokal,
                  idmateri:data.idmateri,
                  mapel:data.mapel,
                  tanggal:data.tanggal,
                  namatugas:data.namatugas,
                  keterangan:data.keterangan,
                  guru:data.guru,
                  keterangansiswa:data.keterangansiswa,
                  destination:data.destination,
                  encoding:data.encoding,
                  fieldname:data.fieldname,
                  filename:data.filename,
                  mimetype:data.mimetype,
                  originalname:data.originalname,
                  path:data.path,
                  size:data.size,
                  nilai:data.nilai,
                  tanggalkumpul:data.tanggalkumpul,
                  nosiskum
                });
              }

              //cari semua siswa kelas ini;
              Siswas.find({angkatan:kelas,jurusan:jurusan,lokal:lokal}).then(siswas=>{
                if(siswas){
                  //jika ada;

                  //ambil nilainya secara spesifik;
                  for(datasis of siswas){
                    nosis=nosis+1;
                    ListSiswas.push({
                      id:datasis.id,
                      nama:datasis.ndepan+' '+datasis.nbelakang,
                      nis:datasis.nis,
                      nosis
                    });
                  }
                  
                  
                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/kumtugmateri',{
                    title:'Tugas | '+materi.namatugas,
                    guru,
                    materi,

                    kelas,
                    jurusan,
                    lokal,
                    mapel,

                    ListTugasSiswa,
                    ListSiswas
                  });

                }else{
                  //jika tidak ada;

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/kumtugmateri',{
                    title:'Tugas | '+materi.namatugas,
                    guru,
                    materi,

                    kelas,
                    jurusan,
                    lokal,
                    mapel,

                    ListTugasSiswa,
                    ListSiswas
                  });
                }
              });

            }else{
              //jika tidak ada;

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/kumtugmateri',{
                title:'Tugas | '+materi.namatugas,
                guru,
                materi,

                kelas,
                jurusan,
                lokal,
                mapel,

                ListTugasSiswa,
                ListSiswas
              });
              
            }
          });

        }
      });
      
    }
  });

});

//halaman guru memberi nilai tugas materi siswa;=
router.get('/berinilai/tugassiswa/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri/:iddatasiswa',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id materi, cari datanya;
      Tugass.findById(idmateri,function(err,materi){
        if(materi){
          //jika ada;

          //dari params id data tugas siswa, cari datanya;
          TugasMateris.findById(req.params.iddatasiswa,function(err,dttugassiswa){
            if(dttugassiswa){
              //jika ada;

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/berinilai',{
                title:'beri nilai '+dttugassiswa.namasiswa,
                guru,
                materi,

                kelas,
                jurusan,
                lokal,
                mapel,

                dttugassiswa
              });

            }
          });

        }
      });

    }
  });

});

//action beri nilai tugas siswa, guru;=
router.post('/berinilai/tugassiswa/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri/:iddatasiswa',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id materi, cari datanya;
      Tugass.findById(idmateri,function(err,materi){
        if(materi){
          //jika ada;

          //cek nilai masuk;
          console.log(req.body);
          //masukan nilai dalam variabel;
          const{nilai}=req.body;

          //dari params id data siswa yg masuk, cari datanya;
          TugasMateris.findById(req.params.iddatasiswa,function(err,dttugassiswa){
            if(dttugassiswa){
              //jika ada;

              //dari params id data siswa yg masuk, update datanya;
              TugasMateris.findByIdAndUpdate(req.params.iddatasiswa,{
                nilai:nilai
              },function(err){
                if(err){
                  //jika ada err;
                  console.log(err);
                }else{
                  //jika tidak ada err;

                  //manipulasikan;
                  dttugassiswa.nilai=nilai;
                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/berinilai',{
                    title:'Berinilai berhasil',
                    guru,
                    materi,

                    kelas,
                    jurusan,
                    lokal,
                    mapel,

                    dttugassiswa
                  });
                }

              });

            }
          });

          
        }
      });

    };
  });

});

//action hapus data tugas siswa;
router.get('/hapus/tugassiswa/:kelas/:jurusan/:lokal/:mapel/:idguru/:idmateri/:iddatasiswa',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id materi, cari datanya;
      Tugass.findById(idmateri,function(err,materi){
        if(materi){
          //jika ada;

          //dari id params tugas siswa, hapus data tugas siswa;
          TugasMateris.findByIdAndDelete(req.params.iddatasiswa,function(){
            //lalu lempar ke halaman lihat siswa yg ngumpul tugas (halaman pengumpulan tugas);
            res.redirect('/guru/pengumpulan/tugas/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+guru.id+'/'+materi.id+'/')
          });

        }
      });

    }
  });

});

//===========================Absensi==================================
//halaman semua absensi;
router.get('/absensi/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListKode=[];

      KodeAbsens.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(kode=>{
        if(kode){
          //jika ada;

          //ambil nilainya secara spesifik;
          for(data of kode){
            ListKode.push({
              id:data.id,
              tanggal:data.tanggal,
              judul:data.judul,
              deskripsi:data.deskripsi,
              kode:data.kode,
              guru:data.guru,
              kelas:data.kelas,
              jurusan:data.jurusan,
              lokal:data.lokal,
              mapel:data.mapel,

            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/lihatabsensi',{
            title:'Lihat List Absensi',
            guru,
            ListKode,

            kelas,
            jurusan,
            lokal,
            mapel
          });
        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/lihatabsensi',{
            title:'Lihat List Absensi',
            guru,
            ListKode,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }
      });
      
    }
  });

});

//halaman buat absensi;=
router.get('/buat/absensi/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListKode=[];

      //cari semua data kodeabsensi;
      KodeAbsens.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(kode=>{
        if(kode){
          //jika ada;

          //ambil nilainya secara spesifik;
          for(data of kode){
            ListKode.push({
              id:data.id,
              tanggal:data.tanggal,
              judul:data.judul,
              deskripsi:data.deskripsi,
              kode:data.kode,
              guru:data.guru,

              kelas:data.kelas,
              jurusan:data.jurusan,
              lokal:data.lokal,
              mapel:data.mapel
            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/buatabsensi',{
            title:'Buat List Absensi',
            guru,
            ListKode,
            jumlah:ListKode.length+1,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }else{
          //jika tidak ada;
          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/buatabsensi',{
            title:'Buat List Absensi',
            guru,
            ListKode,
            jumlah:ListKode.length+1,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }
      });
      
    }
  });

});

//action buat absensi;=
router.post('/buat/absensi/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var jumlah=1;
  let ListKode=[];

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //cek nilai masuk;
      console.log(req.body);
      //variabel penampung;
      const{tanggal,judul,deskripsi,kode}=req.body;

      //variabel penampung;
      let errors=[];

      //jika kosong;
      if(!tanggal||!judul||!deskripsi||!kode){
        console.log('Lengkapi informasi absensi');
        errors.push({msg:'Lengkapi informasi absensi'});
      }

      //logika
      if(errors>0){
        //jika ada errors;

        //cari semua data kodeabsensi;
        KodeAbsens.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(kode=>{
          if(kode){
            //jika ada;

            //ambil nilainya secara spesifik;
            for(data of kode){
              jumlah=jumlah+1;
              ListKode.push({
                id:data.id,
                tanggal:data.tanggal,
                judul:data.judul,
                deskripsi:data.deskripsi,
                kode:data.kode,
                guru:data.guru,

                kelas:data.kelas,
                jurusan:data.jurusan,
                lokal:data.lokal,
                mapel:data.mapel
              });
            }

            //tampilkan halaman berdasarkan posisi file;
            res.render('gurus/buatabsensi',{
              title:'Buat List Absensi',
              guru,
              ListKode,
              jumlah,
              errors,

              kelas,
              jurusan,
              lokal,
              mapel
            });

          }else{
            //jika tidak ada;

            //tampilkan halaman berdasarkan posisi file;
            res.render('gurus/buatabsensi',{
              title:'Buat List Absensi',
              guru,
              ListKode,
              jumlah,
              errors,

              kelas,
              jurusan,
              lokal,
              mapel
            });

          }
        });

      }else{
        //jika tidak ada errors;

        //simpan;
        const newKodeAbsens=KodeAbsens({
          tanggal,
          judul,
          deskripsi,
          kode,
          guru:guru.nama+' '+guru.gelar,
          kelas,
          jurusan,
          lokal,
          mapel
        });
        newKodeAbsens.save().then(absen=>{
          console.log('Berhasil');
          errors.push({msg:'Berhasil'});

          //cari semua data kodeabsensi;
          KodeAbsens.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(kode=>{
            if(kode){
              //jika ada;

              //ambil nilainya secara spesifik;
              for(data of kode){
                jumlah=jumlah+1;
                ListKode.push({
                  id:data.id,
                  tanggal:data.tanggal,
                  judul:data.judul,
                  deskripsi:data.deskripsi,
                  kode:data.kode,
                  guru:data.guru,

                  kelas:data.kelas,
                  jurusan:data.jurusan,
                  lokal:data.lokal,
                  mapel:data.mapel
                });
              }

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/buatabsensi',{
                title:'Buat List Absensi',
                guru,
                ListKode,
                jumlah,
                errors,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }else{
              //jika tidak ada;

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/buatabsensi',{
                title:'Buat List Absensi',
                guru,
                ListKode,
                jumlah,
                errors,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }
          });
        });

      }

      
    }
  });
});

//halaman edit absensi;
router.get('/edit/absensi/:kelas/:jurusan/:lokal/:mapel/:idguru/:idabsensi',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id absensi, cari datanya;
      KodeAbsens.findById(req.params.idabsensi,function(err,absensi){
        if(absensi){
          //jika ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/editabsensi',{
            title:'Edit List Absensi',
            guru,
            absensi,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }
      });
      
    }
  });

});

//action edit absensi;
router.post('/edit/absensi/:kelas/:jurusan/:lokal/:mapel/:idguru/:idabsensi',function(req,res,next){
//variabel penampung;
var kelas=req.params.kelas;
var jurusan=req.params.jurusan;
var lokal=req.params.lokal;
var mapel=req.params.mapel;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id absensi, cari datanya;
      KodeAbsens.findById(req.params.idabsensi,function(err,absensi){
        if(absensi){
          //jika ada;

          //cek nilai masuk;
          console.log(req.body);
          //masukan dalam variabel;
          const{tanggal,judul,deskripsi,kode}=req.body;

          //variabel penampung;
          let errors=[];

          //jika kosong;
          if(!tanggal||!judul||!deskripsi||!kode){
            console.log('Lengkapi semua data absensi');
            errors.push({msg:'Lengkapi semua data absensi'});
          }

          //logika;
          if(errors>0){
            //jika ada errors;

            //tampilkan halaman berdasarkan posisi file;
            res.render('gurus/editabsensi',{
              title:'Edit List Absensi',
              guru,
              absensi,
              errors,

              kelas,
              jurusan,
              lokal,
              mapel
            });
          }else{
            //jika tidak ada errors;

            //dari id kode yg didapat, update datanya;
            KodeAbsens.findByIdAndUpdate(absensi.id,{
              tanggal,
              judul,
              deskripsi,
              kode
            },function(err){
              if(err){
                //jika ada err;
                console.log(err);
              }else{

                absensi.tanggal=tanggal;
                absensi.judul=judul;
                absensi.deskripsi=deskripsi;
                absensi.kode=kode;
                console.log('Berhasil');
                errors.push({msg:'Berhasil'});
                //tampilkan halaman berdasarkan posisi file;
                res.render('gurus/editabsensi',{
                  title:'Edit List Absensi',
                  guru,
                  absensi,
                  errors,

                  kelas,
                  jurusan,
                  lokal,
                  mapel
                });

              }
            });

          }

        }
      });
      
    }
  });
});

//action hapus absensi;
router.get('/hapus/absensi/:kelas/:jurusan/:lokal/:mapel/:idguru/:idabsensi',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id absensi, cari datanya hapus;
      KodeAbsens.findByIdAndDelete(req.params.idabsensi,function(err,absensi){
        if(absensi){
          //jika ada;

          //lempar kehalaman list absensi;
          res.redirect('/guru/absensi/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+guru.id+'/');

        }
      });

    }

  });

});

//==
//halaman lihat semua siswa absensi;=
router.get('/lihat/absensi/:kelas/:jurusan/:lokal/:mapel/:idguru/:idabsensi',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idabsensi=req.params.idabsensi;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListKode=[];
      var no=0;

      Absensiswa.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idabsensi:idabsensi}).then(kode=>{
        if(kode){
          //jika ada;

          //ambil nilainya secara spesifik;
          for(data of kode){
            no=no+1;
            ListKode.push({
              id:data.id,
              namasiswa:data.namasiswa,
              tanggalkumpul:data.tanggalkumpul,
              no:no

            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/siswaabsensi',{
            title:'Lihat List Absensi',
            guru,
            ListKode,

            kelas,
            jurusan,
            lokal,
            mapel
          });
        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/siswaabsensi',{
            title:'Lihat List Absensi',
            guru,
            ListKode,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }
      });
      
    }
  });

});

//===========================Quis(Judul)====================================
//halaman semua quis (judul);=
router.get('/quis/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel panampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListJudul=[];
      var no=0;

      //cari semua judul quis;
      JudulQuis.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idguru:guru.id}).then(judul=>{
        if(judul){
          //jika ada;

          //ambil nilainya secara spesifik;
          for(data of judul){
            no=no+1;
            ListJudul.push({
              id:data.id,
              kelas:data.kelas,
              jurusan:data.jurusan,
              lokal:data.lokal,
              mapel:data.mapel,
              idguru:data.idguru,
              namaquis:data.namaquis,
              tanggalmulai:data.tanggalmulai,
              bulanmulai:data.bulanmulai,
              tahunmulai:data.tahunmulai,
              tanggalakhir:data.tanggalakhir,
              bulanakhir:data.bulanakhir,
              tahunakhir:data.tahunakhir,
              jenissoal:data.jenissoal,
              jam:data.jam,
              menit:data.menit,
              status:data.status,
              no
            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/buatquis',{
            title:'Lihat Semua Quis',
            guru,
            ListJudul,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/buatquis',{
            title:'Lihat Semua Quis',
            guru,
            ListJudul,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }
      });

    }
  });

});

//halaman buat quis (judul);
router.get('/buat/quis/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //hampilkan halaman berdasarkan posisi file;
      res.render('gurus/buatsoalquis',{
        title:'Buat Soal Quis',
        guru,

        kelas,
        jurusan,
        lokal,
        mapel
      });

    }
  });

});

//action buat quis (judul);
router.post('/buat/quis/:kelas/:jurusan/:lokal/:mapel/:idguru',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //cek nilai masuk;
      console.log(req.body);
      //masukan nilai dalam variabel;
      const{namaquis,tanggalmulai,bulanmulai,tahunmulai,tanggalakhir,bulanakhir,tahunakhir,jenissoal,jam,menit}=req.body;

      //variabel penampung;
      let errors=[];

      //jika kosong;
      if(!namaquis||!tanggalmulai||!bulanmulai||!tahunmulai||!tanggalakhir||!bulanakhir||!tahunakhir||!jenissoal||!jam||!menit){
        console.log('Lengkapi semua data soal!');
        errors.push({msg:'Lengkapi semua data soal'});
      }

      //logika;
      if(errors.length>0){
        //jika ada errors;
        res.render('gurus/buatsoalquis',{
          title:'Buat Soal Gagal',
          guru,
          errors,

          kelas,
          jurusan,
          lokal,
          mapel
        });
      }else{
        //jika tidak ada errors;

        //simpan;
        const newJudulQuis=JudulQuis({
          kelas,
          jurusan,
          lokal,
          mapel,
          idguru:guru.id,
          namaquis,
          tanggalmulai,
          bulanmulai,
          tahunmulai,
          tanggalakhir,
          bulanakhir,
          tahunakhir,
          jenissoal,
          jam,
          menit,
          status:'belum'
        });
        newJudulQuis.save().then(judulquis=>{
          //setelah berhasil disimpan
          console.log('Berhasil membuat judul soal quis');
          res.redirect('/guru/buat/soal/quis/'+jenissoal+'/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+guru.id+'/'+judulquis.id+'/1');
        });

      }

    }
  });

});

//===edit judul dan semua soal pilgan===
//halaman edit quis (judul pilgan);
router.get('/quis/editjudul/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel penampung;
          let ListPilgan=[];
          var no=0;

          //dari params id quis, cari semua soal dalam soal pilgan;
          Soal_Pilgans.find({idquis:req.params.idquis}).then(pilgan=>{
            if(pilgan){
              //jika ada;

              //ambil nilainya secara spesifik;
              for (data of pilgan){
                no=no+1;
                ListPilgan.push({
                  id:data.id,
                  kelas:data.kelas,
                  jurusan:data.jurusan,
                  lokal:data.lokal,
                  mapel:data.mapel,
                  idguru:data.idguru,
                  idquis:data.idquis,
                  soal:data.soal,
                  A:data.A,
                  B:data.B,
                  C:data.C,
                  D:data.D,
                  E:data.E,
                  kunci:data.kunci,
                  no

                });
              }

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/editsoalpilgan',{
                title:'Soal Pilihan Ganda',
                guru,
                quis,
                ListPilgan,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }else{
              //jika tidak ada;

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/editsoalpilgan',{
                title:'Soal Pilihan Ganda',
                guru,
                quis,
                ListPilgan,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }
          });

        }
      });

    }
  });

});

//action edit quis (judul pilgan);
router.post('/quis/editjudul/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //cek nilai masuk;
          console.log(req.body);
          //masukan nilai dalam variabel;
          const{namaquis,tanggalmulai,bulanmulai,tahunmulai,tanggalakhir,bulanakhir,tahunakhir,jam,menit}=req.body;

          //variabel penampung;
          let errors=[];

          //jika kosong;
          if(!namaquis||!tanggalmulai||!bulanmulai||!tahunmulai||!tanggalakhir||!bulanakhir||!tahunakhir||!jam||!menit){
            console.log('Lengkapi semua data soal!');
            errors.push({msg:'Lengkapi semua data soal'});
          }

          //logika;
          if(errors.length>0){
            //tampilkan halaman berdasarkan posisi file;
            res.render('gurus/editsoalpilgan',{
              title:'Soal Pilihan Ganda',
              guru,
              quis,

              kelas,
              jurusan,
              lokal,
              mapel,
              errors
            });
          }else{
            //jika tidak ada;

            //update
            JudulQuis.findByIdAndUpdate(req.params.idquis,{
              namaquis,
              tanggalmulai,
              bulanmulai,
              tahunmulai,
              tanggalakhir,
              bulanakhir,
              tahunakhir,
              jam,
              menit
            },function(err){
              if(err){
                //jika ada err;
                console.log(err);
              }else{
                //berhasil;

                console.log('Berhasil');
                errors.push({msg:'Berhasil Diperbarui'});

                //variabel penampung;
                let ListPilgan=[];
                var no=0;
                //dari params id quis, cari semua soal dalam soal pilgan;
                Soal_Pilgans.find({idquis:req.params.idquis}).then(pilgan=>{
                  if(pilgan){
                    //jika ada;

                    //ambil nilainya secara spesifik;
                    for (data of pilgan){
                      no=no+1;
                      ListPilgan.push({
                        id:data.id,
                        kelas:data.kelas,
                        jurusan:data.jurusan,
                        lokal:data.lokal,
                        mapel:data.mapel,
                        idguru:data.idguru,
                        idquis:data.idquis,
                        soal:data.soal,
                        A:data.A,
                        B:data.B,
                        C:data.C,
                        D:data.D,
                        E:data.E,
                        kunci:data.kunci,
                        no

                      });
                    }

                    //tampilkan halaman berdasarkan posisi file;
                    res.render('gurus/editsoalpilgan',{
                      title:'Soal Pilihan Ganda',
                      guru,
                      quis,
                      ListPilgan,

                      kelas,
                      jurusan,
                      lokal,
                      mapel,
                      errors
                    });

                  }else{
                    //jika tidak ada;

                    //tampilkan halaman berdasarkan posisi file;
                    res.render('gurus/editsoalpilgan',{
                      title:'Soal Pilihan Ganda',
                      guru,
                      quis,
                      ListPilgan,

                      kelas,
                      jurusan,
                      lokal,
                      mapel,
                      errors
                    });

                  }
                });

              }
            });

          }

        }
      });

    }
  });

});

//action hapus quis (judul pilgan);
router.get('/quis/hapusjudul/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari id judul yg didapat, hapus judulnya;
          JudulQuis.findByIdAndDelete(quis.id,function(){
            //lempar kehalaman edit judul quis dan semua soal pilgan;
            res.redirect('/guru/quis/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru);
          });
        
        }
      });

    }
  });

});

//===edit judul dan semua soal essay===
//halaman edit quis (judul essay);
router.get('/quis/editjudul/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel penampung;
          let ListEssay=[];
          var no=0;

          //dari params id quis, cari semua soal dalam soal essay;
          Soal_Essays.find({idquis:req.params.idquis}).then(essay=>{
            if(essay){
              //jika ada;

              //ambil nilainya secara spesifik;
              for (data of essay){
                no=no+1;
                ListEssay.push({
                  id:data.id,
                  kelas:data.kelas,
                  jurusan:data.jurusan,
                  lokal:data.lokal,
                  mapel:data.mapel,
                  idguru:data.idguru,
                  idquis:data.idquis,
                  soal:data.soal,
                  catatan:data.catatan,
                  no

                });
              }

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/editsoalessay',{
                title:'Soal Essay',
                guru,
                quis,
                ListEssay,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }else{
              //jika tidak ada;

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/editsoalessay',{
                title:'Soal Essay',
                guru,
                quis,
                ListEssay,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }
          });

        }
      });

    }
  });

});

//action edit quis (judul essay);
router.post('/quis/editjudul/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //cek nilai masuk;
          console.log(req.body);
          //masukan nilai dalam variabel;
          const{namaquis,tanggalmulai,bulanmulai,tahunmulai,tanggalakhir,bulanakhir,tahunakhir,jam,menit}=req.body;

          //variabel penampung;
          let errors=[];

          //jika kosong;
          if(!namaquis||!tanggalmulai||!bulanmulai||!tahunmulai||!tanggalakhir||!bulanakhir||!tahunakhir||!jam||!menit){
            console.log('Lengkapi semua data soal!');
            errors.push({msg:'Lengkapi semua data soal'});
          }

          //logika;
          if(errors.length>0){
            //tampilkan halaman berdasarkan posisi file;
            res.render('gurus/editsoalessay',{
              title:'Soal Essay',
              guru,
              quis,

              kelas,
              jurusan,
              lokal,
              mapel,
              errors
            });
          }else{
            //jika tidak ada;

            //update
            JudulQuis.findByIdAndUpdate(req.params.idquis,{
              namaquis,
              tanggalmulai,
              bulanmulai,
              tahunmulai,
              tanggalakhir,
              bulanakhir,
              tahunakhir,
              jam,
              menit
            },function(err){
              if(err){
                //jika ada err;
                console.log(err);
              }else{
                //berhasil;

                console.log('Berhasil');
                errors.push({msg:'Berhasil Diperbarui'});

                //variabel penampung;
                let ListEssay=[];
                var no=0;
                //dari params id quis, cari semua soal dalam soal essay;
                Soal_Essays.find({idquis:req.params.idquis}).then(essay=>{
                  if(essay){
                    //jika ada;

                    //ambil nilainya secara spesifik;
                    for (data of essay){
                      no=no+1;
                      ListEssay.push({
                        id:data.id,
                        kelas:data.kelas,
                        jurusan:data.jurusan,
                        lokal:data.lokal,
                        mapel:data.mapel,
                        idguru:data.idguru,
                        idquis:data.idquis,
                        soal:data.soal,
                        catatan:data.catatan,
                        no

                      });
                    }

                    //tampilkan halaman berdasarkan posisi file;
                    res.render('gurus/editsoalessay',{
                      title:'Soal Essay',
                      guru,
                      quis,
                      ListEssay,

                      kelas,
                      jurusan,
                      lokal,
                      mapel,
                      errors
                    });

                  }else{
                    //jika tidak ada;

                    //tampilkan halaman berdasarkan posisi file;
                    res.render('gurus/editsoalessay',{
                      title:'Soal Essay',
                      guru,
                      quis,
                      ListEssay,

                      kelas,
                      jurusan,
                      lokal,
                      mapel,
                      errors
                    });

                  }
                });

              }
            });

          }

        }
      });

    }
  });

});

//action hapus quis (judul essay);
router.get('/quis/hapusjudul/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari id judul yg didapat, hapus judulnya;
          JudulQuis.findByIdAndDelete(quis.id,function(){
            //lempar kehalaman edit judul quis dan semua soal pilgan;
            res.redirect('/guru/quis/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru);
          });
        
        }
      });

    }
  });

});

//===========================Soal Pilgan==============
//halaman soal pilgan;
router.get('/buat/soal/quis/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:nosoal',function(req,res,next){
  //variabel penampung;
  var jenissoal='Pilgan';
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;
  var nosoal=req.params.nosoal;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //tampilkan halaman berdasarkan posisi file;
      res.render('gurus/soalpilgan',{
        title:'Buat Soal Pilgan',
        guru,

        kelas,
        jurusan,
        lokal,
        mapel,

        idquis,
        nosoal
      });

    }
  });

});

//action soal pilgan;
router.post('/buat/soal/quis/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:nosoal',function(req,res,next){
  //variabel penampung;
  var jenissoal='Pilgan';
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;
  var nosoal=req.params.nosoal/1;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //cek nilai masuk;
      console.log(req.body);
      //masukan nilai dalam variabel;
      const{soal,A,B,C,D,E,kunci}=req.body;

      //variabel penampung;
      let errors=[];

      //jika kosong
      if(!soal||!A||!B||!C||!D||!E||!kunci){
        console.log('lengkapi kolom soal');
        errors.push({msg:'Lengkapi kolom soal'});
      }

      //logika;
      if(errors.length>0){
        //tampilkan halaman berdasarkan posisi file;
        res.render('gurus/soalpilgan',{
          title:'Buat Soal Pilgan',
          guru,

          kelas,
          jurusan,
          lokal,
          mapel,

          idquis,
          nosoal,
          errors
        });
      }else{
        //jika tidak ada;

        //simpan soal;
        const newSoal_Pilgan=Soal_Pilgans({
          kelas,
          jurusan,
          lokal,
          mapel,
          idguru,
          idquis,
          nosoal,
          soal,
          A,
          B,
          C,
          D,
          E,
          kunci
        });
        newSoal_Pilgan.save().then(Pilgan=>{
          console.log('lanjut kesoal '+(nosoal+1));
          //lempar kesoal berikutnya;
          nosoal=nosoal+1;
          res.redirect('/guru/buat/soal/quis/Pilgan/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/'+nosoal);
        });

      }

    }
  });

});

//halaman edit soal pilgan;
router.get('/edit/soal/quis/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:idsoal',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari params id soal pilgan, cari datanya;
          Soal_Pilgans.findById(req.params.idsoal,function(err,soal){
            if(soal){
              //jika ada;

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/editsoalpilihanganda',{
                title:'Soal Pilihan Ganda',
                guru,
                quis,
                soal,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }
          });

        }
      });

    }
  });

});

//action edit soal pilgan;
router.post('/edit/soal/quis/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:idsoal',function(req,res,next){
    //variabel penampung;
    var kelas=req.params.kelas;
    var jurusan=req.params.jurusan;
    var lokal=req.params.lokal;
    var mapel=req.params.mapel;
    var idguru=req.params.idguru;
    var idquis=req.params.idquis;
  
    //dari params id guru, cari datanya;
    Gurus.findById(req.params.idguru,function(err,guru){
      if(guru){
        //jika ada;
  
        //dari params id judul quis, cari datanya;
        JudulQuis.findById(req.params.idquis,function(err,quis){
          if(quis){
            //jika ada;
  
            //dari params id soal pilgan, cari datanya;
            Soal_Pilgans.findById(req.params.idsoal,function(err,soals){
              if(soals){
                //jika ada;

                //cek nilai masuk;
                console.log(req.body);
                //masukan kedalam variabel;
                const{soal,A,B,C,D,E,kunci}=req.body;

                //variabel panampung;
                let errors=[];

                //jika kosong;
                if(!soal||!A||!B||!C||!D||!E||!kunci){
                  console.log('Lengkapi semua soal');
                  errors.push({msg:'Lengkapi semua soal'});
                }

                //logika;
                if(errors.length>0){
                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/editsoalpilihanganda',{
                    title:'Soal Pilihan Ganda',
                    guru,
                    quis,
                    soal:soals,

                    kelas,
                    jurusan,
                    lokal,
                    mapel,
                    errors
                  });
                }else{
                  //jika tidak ada

                  //dari params id soal, update datanya;
                  Soal_Pilgans.findByIdAndUpdate(req.params.idsoal,{
                    soal,
                    A,
                    B,
                    C,
                    D,
                    E,
                    kunci
                  },function(err){
                    if(err){
                      //jika ada err;
                      console.log(err);
                    }else{
                      console.log('berhasil');
                      errors.push({msg:'Berhasil'});

                      //tampilkan halaman berdasarkan posisi file;
                      res.render('gurus/editsoalpilihanganda',{
                        title:'Soal Pilihan Ganda',
                        guru,
                        quis,
                        soal:soals,

                        kelas,
                        jurusan,
                        lokal,
                        mapel,
                        errors
                      });

                    }
                  });

                }

              }
            });

          }
        });

      }
    });

});

//action hapus soal pilgan;
router.get('/hapus/soal/quis/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:idsoal',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari params id soal pilgan, cari datanya;
          Soal_Pilgans.findById(req.params.idsoal,function(err,soal){
            if(soal){
              //jika ada;

              //dari id soal pilgan yg didapat, hapus soalnya;
              Soal_Pilgans.findByIdAndDelete(soal.id,function(){
                //lempar kehalaman edit judul quis dan semua soal pilgan;
                res.redirect('/guru/quis/editjudul/Pilgan/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
              });

            }
          });

        }
      });

    }
  });

});

//===========================Soal Essay==============
//halaman soal essay;
router.get('/buat/soal/quis/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:nosoal',function(req,res,next){
  //variabel penampung;
  var jenissoal='Essay';
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;
  var nosoal=req.params.nosoal;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //tampilkan halaman berdasarkan posisi file;
      res.render('gurus/soalessay',{
        title:'Buat Soal Essay',
        guru,

        kelas,
        jurusan,
        lokal,
        mapel,

        idquis,
        nosoal
      });

    }
  });

});

//action soal essay;
router.post('/buat/soal/quis/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:nosoal',function(req,res,next){
  //variabel penampung;
  var jenissoal='Essay';
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;
  var nosoal=req.params.nosoal/1;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //cek nilai masuk;
      console.log(req.body);
      //masukan nilai dalam variabel;
      const{soal,catatan}=req.body;

      //variabel penampung;
      let errors=[];

      //jika kosong
      if(!soal||!catatan){
        console.log('lengkapi kolom soal');
        errors.push({msg:'Lengkapi kolom soal'});
      }

      //logika;
      if(errors.length>0){
        //tampilkan halaman berdasarkan posisi file;
        res.render('gurus/soalpilgan',{
          title:'Buat Soal Pilgan',
          guru,

          kelas,
          jurusan,
          lokal,
          mapel,

          idquis,
          nosoal,
          errors
        });
      }else{
        //jika tidak ada;

        //simpan soal;
        const newSoal_Essay=Soal_Essays({
          kelas,
          jurusan,
          lokal,
          mapel,
          idguru,
          idquis,
          nosoal,
          soal,
          catatan
        });
        newSoal_Essay.save().then(Essay=>{
          console.log('lanjut kesoal '+(nosoal+1));
          //lempar kesoal berikutnya;
          nosoal=nosoal+1;
          res.redirect('/guru/buat/soal/quis/Essay/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/'+nosoal);
        });

      }

    }
  });

});

//halaman edit soal essay;
router.get('/edit/soal/quis/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:idsoal',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari params id soal Essay, cari datanya;
          Soal_Essays.findById(req.params.idsoal,function(err,soal){
            if(soal){
              //jika ada;

              //tampilkan halaman berdasarkan posisi file;
              res.render('gurus/editsoalessays',{
                title:'Soal Essay',
                guru,
                quis,
                soal,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }
          });

        }
      });

    }
  });

});

//action edit soal essay;
router.post('/edit/soal/quis/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:idsoal',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari params id soal Essay, cari datanya;
          Soal_Essays.findById(req.params.idsoal,function(err,soals){
            if(soals){
              //jika ada;

              //cek nilai masuk;
              console.log(req.body);
              //masukan kedalam variabel;
              const{soal,catatan}=req.body;

              //variabel panampung;
              let errors=[];

              //jika kosong;
              if(!soal||!catatan){
                console.log('Lengkapi semua soal');
                errors.push({msg:'Lengkapi semua soal'});
              }

              //logika;
              if(errors.length>0){
                //tampilkan halaman berdasarkan posisi file;
                res.render('gurus/editsoalessays',{
                  title:'Soal Pilihan Ganda',
                  guru,
                  quis,
                  soal:soals,

                  kelas,
                  jurusan,
                  lokal,
                  mapel,
                  errors
                });
              }else{
                //jika tidak ada

                //dari params id soal, update datanya;
                Soal_Essays.findByIdAndUpdate(req.params.idsoal,{
                  soal,
                  catatan
                },function(err){
                  if(err){
                    //jika ada err;
                    console.log(err);
                  }else{
                    console.log('berhasil');
                    errors.push({msg:'Berhasil'});

                    //tampilkan halaman berdasarkan posisi file;
                    res.render('gurus/editsoalessays',{
                      title:'Soal Essay',
                      guru,
                      quis,
                      soal:soals,

                      kelas,
                      jurusan,
                      lokal,
                      mapel,
                      errors
                    });

                  }
                });

              }

            }
          });

        }
      });

    }
  });

});

//action hapus soal essay;
router.get('/hapus/soal/quis/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis/:idsoal',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari params id soal Essay, cari datanya;
          Soal_Essays.findById(req.params.idsoal,function(err,soal){
            if(soal){
              //jika ada;

              //dari id soal Essay yg didapat, hapus soalnya;
              Soal_Essays.findByIdAndDelete(soal.id,function(){
                //lempar kehalaman edit judul quis dan semua soal Essay;
                res.redirect('/guru/quis/editjudul/Essay/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
              });

            }
          });

        }
      });

    }
  });

});

//===========================Koreksi Quis====================================
//============Pilgan==================
//halaman semua nama siswa pilgan;
router.get('/quis/cek/siswakumpul/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel penampung;
          let ListNilai=[];
          let ListSoal=[];
          var jumlah=0;
          var points=0;
          var nilais=0;
          var no=0;

          //cari semua soal quis untuk menghitung jumlah soal;
          Soal_Pilgans.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idguru:guru.id,idquis:quis.id}).then(soal_pilgan=>{
            if(soal_pilgan){
              //jika soal ada;

              //ambil nilainya secara spesifik;
              for (datas of soal_pilgan){
                ListSoal.push({
                  id:datas.id
                });
              }

              //cari semua nilai siswa;
              Nilai_Siswas.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idquis:quis.id}).then(nilai_siswa=>{
                if(nilai_siswa){
                  //jika ada;

                  //ambil nilainya secara spesifik;
                  for (data of nilai_siswa){
                    jumlah=ListSoal.length;
                    points=100/jumlah;
                    nilais=data.nilai*points;
                    no=no+1;
                    ListNilai.push({
                      id:data.id,
                      kelas:data.kelas,
                      jurusan:data.jurusan,
                      lokal:data.lokal,
                      mapel:data.mapel,
                      idsiswa:data.idsiswa,
                      nama:data.nama,
                      idquis:data.idquis,
                      nilai:nilais.toFixed(2),
                      tanggal:data.tanggal,
                      jumso:ListSoal.length,
                      benar:data.nilai,
                      salah:ListSoal.length-data.nilai,
                      no
                    });
                  }

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/hasilquispilgan',{
                    title:'Hasil Soal Quis',
                    guru,
                    quis,
                    ListNilai,

                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });
                }else{
                  //jika tidak ada;

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/hasilquispilgan',{
                    title:'Hasil Soal Quis',
                    guru,
                    quis,
                    ListNilai,

                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });

                }
              });

            }else{
              //jika soal tidak ada;

              //cari semua nilai siswa;
              Nilai_Siswas.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idquis:quis.id}).then(nilai_siswa=>{
                if(nilai_siswa){
                  //jika ada;

                  //ambil nilainya secara spesifik;
                  for (data of nilai_siswa){
                    jumlah=ListSoal.length;
                    points=100/jumlah;
                    nilais=data.nilai*points;
                    no=no+1;
                    ListNilai.push({
                      id:data.id,
                      kelas:data.kelas,
                      jurusan:data.jurusan,
                      lokal:data.lokal,
                      mapel:data.mapel,
                      idsiswa:data.idsiswa,
                      nama:data.nama,
                      idquis:data.idquis,
                      nilai:nilais.toFixed(2),
                      tanggal:data.tanggal,
                      jumso:ListSoal.length,
                      benar:data.nilai,
                      salah:ListSoal.length-data.nilai,
                      no
                    });
                  }

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/hasilquispilgan',{
                    title:'Hasil Soal Quis',
                    guru,
                    quis,
                    ListNilai,

                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });
                }else{
                  //jika tidak ada;

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/hasilquispilgan',{
                    title:'Hasil Soal Quis',
                    guru,
                    quis,
                    ListNilai,

                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });

                }
              });

            }
          });

        }
      });

    }
  });

});

//halaman semua jawaban siswa pilgan;
router.get('/cek/hasil/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idsiswa/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;
  var idsiswa=req.params.idsiswa;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListJawabans=[];
      var no=0;

      //cari semua jawaban siswa ini;
      Jawab_Pilgans.find({idquis:idquis,idsiswa:idsiswa}).then(jawabans=>{
        if(jawabans){
          //jika ada;

          console.log(jawabans);

          //ambil nilainya secara spesifik;
          for(data of jawabans){
            no=no+1;
            if(data.point=='1'){
              data.point='Benar';
            }else{
              data.point='Salah';
            }

            ListJawabans.push({
              id:data.id,
              kelas:data.kelas,
              jurusan:data.jurusan,
              lokal:data.lokal,
              mapel:data.mapel,
              idsiswa:data.idsiswa,
              idquis:data.idquis,
              idsoal:data.idsoal,
              nosoal:data.nosoal,
              soal:data.soal,
              jawaban:data.jawaban,
              point:data.point,
              no
            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/jawabanpilgan',{
            title:'Jawaban Pilgan',
            guru,
            ListJawabans,

            kelas,
            jurusan,
            lokal,
            mapel,

            idquis
          });

        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/jawabanpilgan',{
            title:'Jawaban Pilgan',
            guru,
            ListJawabans,

            kelas,
            jurusan,
            lokal,
            mapel,

            idquis
          });

        }
      });

    }
  });
  
});

//download Excel pilgan;
router.get('/rekap/quis/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListNilai=[];
      let ListSoal=[];
      var no=0;
      var jumso=0;
      var benar=0;
      var salah=0;
      var score=0;

      //cari semua soal quis untuk menghitung jumlah soal;
      Soal_Pilgans.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idguru:guru.id,idquis:idquis}).then(soal_pilgan=>{
        if(soal_pilgan){
          //jika soal ada;

          //ambil nilainya secara spesifik;
          for (datas of soal_pilgan){
            ListSoal.push({
              id:datas.id
            });
          }

          //cari semua nilai siswa quis ini;
          Nilai_Siswas.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idquis:idquis}).then(nilaisiswa=>{
            if(nilaisiswa){
              //jika ada;

              //ambil nilainya secara spesifik;
              for(data of nilaisiswa){
                no=no+1;
                jumso=ListSoal.length;
                benar=data.nilai;
                salah=jumso-benar;
                score=(100/jumso)*benar;
                ListNilai.push({
                  id:data.id,
                  kelas:data.kelas,
                  jurusan:data.jurusan,
                  lokal:data.lokal,
                  mapel:data.mapel,
                  idsiswa:data.idsiswa,
                  nama:data.nama,
                  idquis:data.idquis,
                  nilai:data.nilai,
                  tanggal:data.tanggal,

                  no,
                  jumso,
                  benar,
                  salah,
                  score
                });
              }

              console.log(ListNilai);
              //===============================
              // file baru;
              var wb=new xl.Workbook();
              //add sweet/ halaman;
              var ws = wb.addWorksheet('Nilai Siswa');

              // Kolom 1 Baris 1;
              ws.cell(1, 1)
              .string('No');
              // Kolom 1 Baris 2;
              ws.cell(1, 2)
              .string('Nama Siswa');
              // Kolom 1 Baris 3;
              ws.cell(1, 3)
              .string('Nilai');
              // Kolom 1 Baris 4;
              ws.cell(1, 4)
              .string('Jumlah Soal');
              // Kolom 1 Baris 5;
              ws.cell(1, 5)
              .string('Tanggal Kumpul');


              var i=1;
              var not=0;
              var jumsot=0;
              var benart=0;
              var salaht=0;
              var scoret=0;
              //menampilkan banyaknya data;
              for(datas of nilaisiswa){
                i=i+1;
                not=not+1;
                jumsot=ListSoal.length;
                benart=datas.nilai;
                salaht=jumsot-benart;
                scoret=(100/jumsot)*benart;
                // Kolom 1 Baris 1;
                ws.cell(i, 1)
                .string(''+not);
                // Kolom 1 Baris 2;
                ws.cell(i, 2)
                .string(''+datas.nama);
                // Kolom 1 Baris 3;
                ws.cell(i, 3)
                .string(''+scoret);
                // Kolom 1 Baris 4;
                ws.cell(i, 4)
                .string(''+jumsot);
                // Kolom 1 Baris 5;
                ws.cell(i, 5)
                .string(''+datas.tanggal);
              }


              //posisi simpan;
              wb.write('./public/strong/Quis '+mapel+' '+idquis+' '+kelas+' '+jurusan+' '+lokal+'.xlsx');

              //cari judul quisnya untuk dihilangkan;
              JudulQuis.findByIdAndUpdate(req.params.idquis,{
                status:'sudah'
              },function(err){
                if(err){
                  //jika ada err;
                  console.log(err);
                }else{
                  //jika tidak ada;
                  //lempar kehalaman semula;
                  res.redirect('/guru/quis/cek/siswakumpul/Pilgan/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
                
                }
              });

            }else{
              //jika tidak ada;
              
              //lempar kehalaman semula;
              res.redirect('/guru/quis/cek/siswakumpul/Pilgan/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
            
            }
          });

        }else{
          //jika tidak ada;

          //cari semua nilai siswa quis ini;
          Nilai_Siswas.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idquis:idquis}).then(nilaisiswa=>{
            if(nilaisiswa){
              //jika ada;

              //ambil nilainya secara spesifik;
              for(data of nilaisiswa){
                no=no+1;
                jumso=ListSoal.length;
                benar=data.nilai;
                salah=jumso-benar;
                score=(100/jumso)*benar;
                ListNilai.push({
                  id:data.id,
                  kelas:data.kelas,
                  jurusan:data.jurusan,
                  lokal:data.lokal,
                  mapel:data.mapel,
                  idsiswa:data.idsiswa,
                  nama:data.nama,
                  idquis:data.idquis,
                  nilai:data.nilai,
                  tanggal:data.tanggal,

                  no,
                  jumso,
                  benar,
                  salah,
                  score
                });
              }

              console.log(ListNilai);
              //===============================
              // file baru;
              var wb=new xl.Workbook();
              //add sweet/ halaman;
              var ws = wb.addWorksheet('Nilai Siswa');

              // Kolom 1 Baris 1;
              ws.cell(1, 1)
              .string('No');
              // Kolom 1 Baris 2;
              ws.cell(1, 2)
              .string('Nama Siswa');
              // Kolom 1 Baris 3;
              ws.cell(1, 3)
              .string('Nilai');
              // Kolom 1 Baris 4;
              ws.cell(1, 4)
              .string('Jumlah Soal');
              // Kolom 1 Baris 5;
              ws.cell(1, 5)
              .string('Tanggal Kumpul');


              var i=1;
              var not=0;
              var jumsot=0;
              var benart=0;
              var salaht=0;
              var scoret=0;
              //menampilkan banyaknya data;
              for(datas of nilaisiswa){
                i=i+1;
                not=not+1;
                jumsot=ListSoal.length;
                benart=datas.nilai;
                salaht=jumsot-benart;
                scoret=(100/jumsot)*benart;
                // Kolom 1 Baris 1;
                ws.cell(i, 1)
                .string(''+not);
                // Kolom 1 Baris 2;
                ws.cell(i, 2)
                .string(''+datas.nama);
                // Kolom 1 Baris 3;
                ws.cell(i, 3)
                .string(''+scoret);
                // Kolom 1 Baris 4;
                ws.cell(i, 4)
                .string(''+jumsot);
                // Kolom 1 Baris 5;
                ws.cell(i, 5)
                .string(''+datas.tanggal);
              }


              //posisi simpan;
              wb.write('./public/strong/Quis '+mapel+' '+idquis+' '+kelas+' '+jurusan+' '+lokal+'.xlsx');

              //cari judul quisnya untuk dihilangkan;
              JudulQuis.findByIdAndUpdate(req.params.idquis,{
                status:'sudah'
              },function(err){
                if(err){
                  //jika ada err;
                  console.log(err);
                }else{
                  //jika tidak ada;
                  //lempar kehalaman semula;
                  res.redirect('/guru/quis/cek/siswakumpul/Pilgan/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
                
                }
              });

            }else{
              //jika tidak ada;
              
              //lempar kehalaman semula;
              res.redirect('/guru/quis/cek/siswakumpul/Pilgan/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
            
            }
          }); 

        }
      });

    }
  });

});

//============Essay==================
//halaman semua nama siswa Essay;
router.get('/quis/cek/siswakumpul/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //dari params id judul quis, cari datanya;
      JudulQuis.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel penampung;
          let ListNilai=[];
          let ListSoal=[];
          var jumlah=0;
          var points=0;
          var nilais=0;
          var no=0;

          //cari semua soal quis untuk menghitung jumlah soal;
          Soal_Essays.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idguru:guru.id,idquis:quis.id}).then(soal_essay=>{
            if(soal_essay){
              //jika soal ada;

              //ambil nilainya secara spesifik;
              for (datas of soal_essay){
                ListSoal.push({
                  id:datas.id
                });
              }

              //cari semua nilai siswa;
              Nilai_Siswas.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idquis:quis.id}).then(nilai_siswa=>{
                if(nilai_siswa){
                  //jika ada;

                  //ambil nilainya secara spesifik;
                  for (data of nilai_siswa){
                    jumlah=ListSoal.length;
                    points=100/jumlah;
                    nilais=data.nilai*points;
                    no=no+1;
                    ListNilai.push({
                      id:data.id,
                      kelas:data.kelas,
                      jurusan:data.jurusan,
                      lokal:data.lokal,
                      mapel:data.mapel,
                      idsiswa:data.idsiswa,
                      nama:data.nama,
                      idquis:data.idquis,
                      nilai:data.nilai,
                      tanggal:data.tanggal,
                      jumso:ListSoal.length,
                      benar:data.nilai,
                      salah:ListSoal.length-data.nilai,
                      no
                    });
                  }

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/hasilquisessay',{
                    title:'Hasil Soal Quis',
                    guru,
                    quis,
                    ListNilai,

                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });
                }else{
                  //jika tidak ada;

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/hasilquisessay',{
                    title:'Hasil Soal Quis',
                    guru,
                    quis,
                    ListNilai,

                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });

                }
              });

            }else{
              //jika soal tidak ada;

              //cari semua nilai siswa;
              Nilai_Siswas.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idquis:quis.id}).then(nilai_siswa=>{
                if(nilai_siswa){
                  //jika ada;

                  //ambil nilainya secara spesifik;
                  for (data of nilai_siswa){
                    jumlah=ListSoal.length;
                    points=100/jumlah;
                    nilais=data.nilai*points;
                    no=no+1;
                    ListNilai.push({
                      id:data.id,
                      kelas:data.kelas,
                      jurusan:data.jurusan,
                      lokal:data.lokal,
                      mapel:data.mapel,
                      idsiswa:data.idsiswa,
                      nama:data.nama,
                      idquis:data.idquis,
                      nilai:data.nilai,
                      tanggal:data.tanggal,
                      jumso:ListSoal.length,
                      benar:data.nilai,
                      salah:ListSoal.length-data.nilai,
                      no
                    });
                  }

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/hasilquisessay',{
                    title:'Hasil Soal Quis',
                    guru,
                    quis,
                    ListNilai,

                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });
                }else{
                  //jika tidak ada;

                  //tampilkan halaman berdasarkan posisi file;
                  res.render('gurus/hasilquisessay',{
                    title:'Hasil Soal Quis',
                    guru,
                    quis,
                    ListNilai,

                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });

                }
              });

            }
          });

        }
      });

    }
  });

});

//halaman semua jawaban siswa Essay;
router.get('/cek/hasil/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idsiswa/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;
  var idsiswa=req.params.idsiswa;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListJawabans=[];
      var no=0;

      //cari semua jawaban siswa ini;
      Jawab_Essays.find({idquis:idquis,idsiswa:idsiswa}).then(jawabans=>{
        if(jawabans){
          //jika ada;

          console.log(jawabans);
          //ambil nilainya secara spesifik;
          for(data of jawabans){
            no=no+1;
            ListJawabans.push({
              id:data.id,
              kelas:data.kelas,
              jurusan:data.jurusan,
              lokal:data.lokal,
              mapel:data.mapel,
              idsiswa:data.idsiswa,
              idquis:data.idquis,
              idsoal:data.idsoal,
              nosoal:data.nosoal,
              soal:data.soal,
              jawaban:data.jawaban,
              point:data.point,
              no
            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/jawabanessay',{
            title:'Jawaban Essay',
            guru,
            ListJawabans,

            kelas,
            jurusan,
            lokal,
            mapel,

            idquis
          });

        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('gurus/jawabanessay',{
            title:'Jawaban Essay',
            guru,
            ListJawabans,

            kelas,
            jurusan,
            lokal,
            mapel,

            idquis
          });

        }
      });

    }
  });
  
});

//action beri nilai jawaban siswa Essay;
router.post('/input/hasil/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idsiswa/:idquis/:idjawaban',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idsiswa=req.params.idsiswa;
  var idquis=req.params.idquis;
  var idjawaban=req.params.idjawaban;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //cek nilai masuk;
      console.log(req.body);
      //masukkan dalam variabel;
      var{nilai,banding}=req.body;

      //variabel penampung;
      let errors=[];

      //jika kosong;
      if(!nilai||!banding){
        console.log('lengkapi semua data');
        errors.push({msg:'Lengkapi semua data'});
      }

      //logika;
      if(errors.length>0){
        //jika ada errors;

        //lempar kehalaman semula;
        res.redirect('/guru/cek/hasil/Essay/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idsiswa+'/'+idquis);
      }else{
        //jika tidak ada errors;

        //cari nilai siswa;
        Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:idsiswa,idquis:idquis}).then(nilais=>{
          if(nilais){
            //jika ada;

            //cari jawaban siswa dari id jawaban yg didapat;
            Jawab_Essays.findById(idjawaban,function(err,jawab){
              if(jawab){
                //jika ada;

                //update nilai jawabnya;
                Jawab_Essays.findByIdAndUpdate(jawab.id,{
                  point:nilai
                },function(err){
                  if(err){
                    //jik ada err;
                    console.log(err);
                  }else{
                    //jika berhasil;

                    nilais.nilai=nilais.nilai/1;
                    jawab.point=jawab.point/1;
                    nilai=nilai/1;
                    //update nilai siswa;
                    Nilai_Siswas.findByIdAndUpdate(nilais.id,{
                      nilai:(nilais.nilai-jawab.point)+nilai
                    },function(err){
                      if(err){
                        //jik ada err;
                        console.log(err);
                      }else{
                        //jika berhasil;

                        //lempar kehalaman semula;
                        res.redirect('/guru/cek/hasil/Essay/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idsiswa+'/'+idquis);

                      }
                    });

                  }
                });

              }
            });

          }
        });

      }

    }
  });

});

//download Excel Essay;
router.get('/rekap/quis/Essay/:kelas/:jurusan/:lokal/:mapel/:idguru/:idquis',function(req,res,next){
  //variabel penampung;
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idguru=req.params.idguru;
  var idquis=req.params.idquis;

  //dari params id guru, cari datanya;
  Gurus.findById(req.params.idguru,function(err,guru){
    if(guru){
      //jika ada;

      //variabel penampung;
      let ListNilai=[];
      let ListSoal=[];
      var no=0;
      var jumso=0;
      var benar=0;
      var salah=0;
      var score=0;

      //cari semua soal quis untuk menghitung jumlah soal;
      Soal_Essays.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idguru:guru.id,idquis:idquis}).then(soal_essay=>{
        if(soal_essay){
          //jika soal ada;

          //ambil nilainya secara spesifik;
          for (datas of soal_essay){
            ListSoal.push({
              id:datas.id
            });
          }

          //cari semua nilai siswa quis ini;
          Nilai_Siswas.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idquis:idquis}).then(nilaisiswa=>{
            if(nilaisiswa){
              //jika ada;

              //ambil nilainya secara spesifik;
              for(data of nilaisiswa){
                no=no+1;
                jumso=ListSoal.length;
                benar=data.nilai;
                salah=jumso-benar;
                score=(100/jumso)*benar;
                ListNilai.push({
                  id:data.id,
                  kelas:data.kelas,
                  jurusan:data.jurusan,
                  lokal:data.lokal,
                  mapel:data.mapel,
                  idsiswa:data.idsiswa,
                  nama:data.nama,
                  idquis:data.idquis,
                  nilai:data.nilai,
                  tanggal:data.tanggal,

                  no,
                  jumso,
                  benar,
                  salah,
                  score
                });
              }

              console.log(ListNilai);
              //===============================
              // file baru;
              var wb=new xl.Workbook();
              //add sweet/ halaman;
              var ws = wb.addWorksheet('Nilai Siswa');

              // Kolom 1 Baris 1;
              ws.cell(1, 1)
              .string('No');
              // Kolom 1 Baris 2;
              ws.cell(1, 2)
              .string('Nama Siswa');
              // Kolom 1 Baris 3;
              ws.cell(1, 3)
              .string('Nilai');
              // Kolom 1 Baris 4;
              ws.cell(1, 4)
              .string('Jumlah Soal');
              // Kolom 1 Baris 5;
              ws.cell(1, 5)
              .string('Tanggal Kumpul');

              var i=1;
              var not=0;
              var jumsot=0;
              var benart=0;
              var salaht=0;
              var scoret=0;
              //menampilkan banyaknya data;
              for(datas of nilaisiswa){
                i=i+1;
                not=not+1;
                jumsot=ListSoal.length;
                benart=datas.nilai;
                salaht=jumsot-benart;
                scoret=(100/jumsot)*benart;
                // Kolom 1 Baris 1;
                ws.cell(i, 1)
                .string(''+not);
                // Kolom 1 Baris 2;
                ws.cell(i, 2)
                .string(''+datas.nama);
                // Kolom 1 Baris 3;
                ws.cell(i, 3)
                .string(''+datas.nilai);
                // Kolom 1 Baris 4;
                ws.cell(i, 4)
                .string(''+jumsot);
                // Kolom 1 Baris 5;
                ws.cell(i, 5)
                .string(''+datas.tanggal);
              }


              //posisi simpan;
              wb.write('./public/strong/Quis '+mapel+' '+idquis+' '+kelas+' '+jurusan+' '+lokal+'.xlsx');

              //cari judul quisnya untuk dihilangkan;
              JudulQuis.findByIdAndUpdate(req.params.idquis,{
                status:'sudah'
              },function(err){
                if(err){
                  //jika ada err;
                  console.log(err);
                }else{
                  //jika tidak ada;
                  //lempar kehalaman semula;
                  res.redirect('/guru/quis/cek/siswakumpul/Essay/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
                
                }
              });

            }else{
              //jika tidak ada;
              
              //lempar kehalaman semula;
              res.redirect('/guru/quis/cek/siswakumpul/Essay/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
            
            }
          });

        }else{
          //jika tidak ada;

          //cari semua nilai siswa quis ini;
          Nilai_Siswas.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idquis:idquis}).then(nilaisiswa=>{
            if(nilaisiswa){
              //jika ada;

              //ambil nilainya secara spesifik;
              for(data of nilaisiswa){
                no=no+1;
                jumso=ListSoal.length;
                benar=data.nilai;
                salah=jumso-benar;
                score=(100/jumso)*benar;
                ListNilai.push({
                  id:data.id,
                  kelas:data.kelas,
                  jurusan:data.jurusan,
                  lokal:data.lokal,
                  mapel:data.mapel,
                  idsiswa:data.idsiswa,
                  nama:data.nama,
                  idquis:data.idquis,
                  nilai:data.nilai,
                  tanggal:data.tanggal,

                  no,
                  jumso,
                  benar,
                  salah,
                  score
                });
              }

              console.log(ListNilai);
              //===============================
              // file baru;
              var wb=new xl.Workbook();
              //add sweet/ halaman;
              var ws = wb.addWorksheet('Nilai Siswa');

              // Kolom 1 Baris 1;
              ws.cell(1, 1)
              .string('No');
              // Kolom 1 Baris 2;
              ws.cell(1, 2)
              .string('Nama Siswa');
              // Kolom 1 Baris 3;
              ws.cell(1, 3)
              .string('Nilai');
              // Kolom 1 Baris 4;
              ws.cell(1, 4)
              .string('Jumlah Soal');
              // Kolom 1 Baris 5;
              ws.cell(1, 5)
              .string('Tanggal Kumpul');

              var i=1;
              var not=0;
              var jumsot=0;
              var benart=0;
              var salaht=0;
              var scoret=0;
              //menampilkan banyaknya data;
              for(datas of nilaisiswa){
                i=i+1;
                not=not+1;
                jumsot=ListSoal.length;
                benart=datas.nilai;
                salaht=jumsot-benart;
                scoret=(100/jumsot)*benart;
                // Kolom 1 Baris 1;
                ws.cell(i, 1)
                .string(''+not);
                // Kolom 1 Baris 2;
                ws.cell(i, 2)
                .string(''+datas.nama);
                // Kolom 1 Baris 3;
                ws.cell(i, 3)
                .string(''+datas.nilai);
                // Kolom 1 Baris 4;
                ws.cell(i, 4)
                .string(''+jumsot);
                // Kolom 1 Baris 5;
                ws.cell(i, 5)
                .string(''+datas.tanggal);
              }


              //posisi simpan;
              wb.write('./public/strong/Quis '+mapel+' '+idquis+' '+kelas+' '+jurusan+' '+lokal+'.xlsx');

              //cari judul quisnya untuk dihilangkan;
              JudulQuis.findByIdAndUpdate(req.params.idquis,{
                status:'sudah'
              },function(err){
                if(err){
                  //jika ada err;
                  console.log(err);
                }else{
                  //jika tidak ada;
                  //lempar kehalaman semula;
                  res.redirect('/guru/quis/cek/siswakumpul/Essay/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
                
                }
              });

            }else{
              //jika tidak ada;
              
              //lempar kehalaman semula;
              res.redirect('/guru/quis/cek/siswakumpul/Essay/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+idguru+'/'+idquis+'/');
            
            }
          }); 

        }
      });

    }
  });

});

//============================Logout===================================
//action logout;
router.get('/logout/:idguru',function(req,res,next){
  const idguru=req.params.idguru;
  //dari semua login guru;
  Logins.find({idusers:idguru}).then(login=>{
      if(login){
          //jika ada;
          console.log(login.length);

          //ambil nilainya secara spesifik;
          for(data of login){
              //hapus datanya sesuai jumlah data;
              Logins.findByIdAndDelete(data.id,function(){
                  console.log('berhasil');
              });
          }
          //lempar keluar;
          res.redirect('/');

      }else{
          //jika tidak ada;

          //lempar keluar;
          res.redirect('/');
      }
  });
});
//============================Selesai===================================




module.exports = router;