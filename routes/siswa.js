var express = require('express');
var multer=require('multer');
var path=require('path');
var router = express.Router();
var Siswas=require('../models/SiswaSchema');
var Mapels=require('../models/MapelSchema');
var Materis=require('../models/MateriSchema');
var Logins=require('../models/LoginSchema');

var TugasMateris=require('../models/TugMatSchema');
var TugasSiswa=require('../models/TugasSchema');

var KodeAbsensi=require('../models/KodeAbsenSchema');
var Absensiswa = require('../models/AbsensiSchema');

var JudulSoals = require('../models/JudulQuisSchema');
var Soal_Pilgans = require('../models/SoalPilganSchema');
var Soal_Essays = require('../models/SoalEssaySchema');

var Jawab_Pilgans = require('../models/JawabPilganSchema');
var Jawab_Essays = require('../models/JawabEssaySchema');

var Nilai_Siswas = require('../models/NilaiSiswaSchema');
var Soal_Selesais = require('../models/SelesaiQuisSchema');

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

// halaman login siswa;
router.get('/login', function(req, res, next) {
  //tampilkan halaman berdasarkan posisi file;
  res.render('siswas/login', { 
    title: 'Login Siswa'
  });
});

//action login siswa;
router.post('/login',function(req,res,next){
  //cek nilai masuk;
  console.log(req.body);
  //masukan dalam variabel;
  const{email,password}=req.body;

  //variabel penampung;
  let errors=[];

  //jika kosong;
  if(!email||!password){
    console.log('Lengkapi data anda');
    errors.push({msg:'Lengkapi data anda'});
  }

  //logika;
  if(errors.length>0){
    //jika ada errors;
    res.render('siswas/login',{
      title:'Login siswa gagal',
      errors
    });
  }else{
    //jika tidak ada errors;

    //dari email yg masuk, cek datanya;
    Siswas.findOne({email:email}).then(siswa=>{
      if(siswa){
        //jika ada;

        //cek passwordnya benar tidak;
        if(password==siswa.password){
          //jika benar;

          //simpan loginnya;
          const newLogins=Logins({
            idusers:siswa.id
          });
          newLogins.save().then(login=>{
              //jika berhasil;

              //lempar ke halaman dashboard siswa;
              res.redirect('/siswa/dashboard/'+siswa.id);
          });

        }else{
          //jika salah;

          console.log('Password Siswa Salah');
          errors.push({msg:'Password Siswa salah'});
          //tampilkan halaman berdasarkan posisi file;
          res.render('siswas/login',{
            title:'Password salah',
            errors
          });;
        }
      }else{
        //jika tidak ada;

        console.log('Email siswa tidak terdaftar');
        errors.push({msg:'Email siswa tidak terdaftar'});
        //tampilkan halaman berdasarkan posisi file;
        res.render('siswas/login',{
          title:'Email salah',
          errors
        });;
      }
    });
  }


});

//===============================Dashboard Siswa(pilih mapel)====================================
//halaman dashboard siswa;
router.get('/dashboard/:idsiswa',function(req,res,next){
  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //cek semua login siswa;
      Logins.find({idusers:siswa.id}).then(login=>{
        if(login.length==0){
            //jika tidak ada, Lempar keluar;
            res.redirect('/');
        }
      });

      //variabel penampung;
      let ListMapels=[];

      //cari semua mapel sesuai dengan kelas, jursan, dan lokal;
      Mapels.find({kelas:siswa.angkatan,jurusan:siswa.jurusan,lokal:siswa.lokal}).then(mapels=>{
        if(mapels){
          //jika ada;

          //ambil nilainya secara spesifik;
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
          res.render('siswas/dashboardsiswa',{
            title:'Dashboard Siswa',
            siswa,
            ListMapels
          });
        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('siswas/dashboardsiswa',{
            title:'Dashboard Siswa',
            siswa,
            ListMapels
          });
        }
      });

    }
  });
});

//===============================Kelas Siswa(materi)====================================
//halaman kelas siswa;==
router.get('/:kelas/:jurusan/:lokal/:mapel/:idsiswa',function(req,res,next){
  //cek semua login siswa;
  Logins.find({idusers:req.params.idsiswa}).then(login=>{
    if(login.length==0){
        //jika tidak ada, Lempar keluar;
        res.redirect('/');
    }
  });

  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //variabel penampung;
      let ListMateris=[];
      let ListJuduls=[];
      var gambar='';
      var video='';
      var document='';
      var tampilkan='';

      //tampilkan materi sesuai dengan kelas,jurusan,lokal,mapel;
      Materis.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(materis=>{
        if(materis){
          //jika ada;

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

            //waktu ditampilkan;
            var waktutampil=new Date(data.tanggal);
            console.log('waktutampil '+waktutampil);
            var waktusekarang=new Date();
            console.log('waktusekarang '+waktusekarang);
            //cek waktu;
            if(waktusekarang>=waktutampil){
              tampilkan='aktif';
            }else{
              tampilkan='nonaktif';
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

              gambar:gambar,
              video:video,
              document:document,
              tampilkan:tampilkan
            });
          }

          //cari semua judul soal;
          JudulSoals.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,status:'belum'}).then(juduls=>{
            if(juduls){
              //jika ada;

              //ambil nilainya secara spesifik;
              for (datas of juduls){
                ListJuduls.push({
                  id:datas.id,
                  kelas:datas.kelas,
                  jurusan:datas.jurusan,
                  lokal:datas.lokal,
                  mapel:datas.mapel,
                  idguru:datas.idguru,
                  namaquis:datas.namaquis,
                  tanggalmulai:datas.tanggalmulai,
                  bulanmulai:datas.bulanmulai,
                  tahunmulai:datas.tahunmulai,
                  tanggalakhir:datas.tanggalakhir,
                  bulanakhir:datas.bulanakhir,
                  tahunakhir:datas.tahunakhir,
                  jenissoal:datas.jenissoal,
                  jam:datas.jam,
                  menit:datas.menit,
                  status:datas.status
                });
              }
              
              //tampilkan halaman berdasarkan posisi file;
              res.render('siswas/kelassiswa',{
                title:'Kelas '+kelas+' '+lokal+' | '+mapel,
                siswa,
                ListMateris,
                ListJuduls,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }else{
              //jika tidak ada;

              //tampilkan halaman berdasarkan posisi file;
              res.render('siswas/kelassiswa',{
                title:'Kelas '+kelas+' '+lokal+' | '+mapel,
                siswa,
                ListMateris,
                ListJuduls,

                kelas,
                jurusan,
                lokal,
                mapel
              });

            }
          });

        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('siswas/kelassiswa',{
            title:'Kelas '+kelas+' '+lokal+' | '+mapel,
            siswa,
            ListMateris,
            ListJuduls,

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

//===============================Tugas Siswa(tugas)====================================
//halaman tugas siswa;=
router.get('/lihat/tugas/:kelas/:jurusan/:lokal/:mapel/:idsiswa',function(req,res,next){
  //cek semua login siswa;
  Logins.find({idusers:req.params.idsiswa}).then(login=>{
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

  //dari params id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //variabel penampung;
      let ListTugasSiswa=[];
      var gambar='';
      var video='';
      var document='';
      var tampilkan='';

      //cari semua tugas berdasarkan kelas, jurusan, lokal, mapel;
      TugasSiswa.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(tugassiswa=>{
        if(tugassiswa){
          //jika ada;

          //ambil nilainya secara spesifik
          for(data of tugassiswa){
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

            //cek waktu
            var waktutampil=new Date(data.tanggal);
            var waktusekarang=new Date();
            console.log('waktu tampil '+waktutampil);
            console.log('waktu sekarang '+waktusekarang);

            if (waktusekarang>=waktutampil){
              tampilkan='aktif';
            }else{
              tampilkan='nonaktif';
            }

            ListTugasSiswa.push({
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

              gambar:gambar,
              video:video,
              document:document,
              tampilkan:tampilkan

            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('siswas/lihattugas',{
            title:'Halaman Tugas',
            siswa,
            ListTugasSiswa,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('siswas/lihattugas',{
            title:'Halaman Tugas',
            siswa,
            ListTugasSiswa,

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

//===============================Siswa Mengumpulkan Tugas====================================
//halaman pengumpulan tugas siswa;=
router.get('/kumpultugas/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idmateri',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari parmeter id materi cari datanya;
      TugasSiswa.findById(idmateri,function(err,materi){
        if(materi){
          //jika ada;

          //variabel penampung;
          let errors=[];
          var tombol='';

          //cek tanggal;
          var waktusekarang=new Date();
          var waktuakhir=new Date(materi.tanggalakhir);
          console.log('waktu sekarang '+waktusekarang);
          console.log('waktu akhir '+waktuakhir);
          if(waktusekarang>=waktuakhir){
            //jika sudah habis waktu;
            tombol='nonaktif';
            errors.push({msg:'Batas pengumpulan tugas berakhir pada '+materi.tanggalakhir});
          }else{
            //jika belum habis waktu;
            tombol='aktif';
            errors.push({msg:'Batas pengumpulan tugas berakhir pada '+materi.tanggalakhir});
          }


          //cek dalam database TugasMateri, sudah pernah ngumpul belum;
          TugasMateris.findOne({idsiswa:siswa.id,kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idmateri:materi.id}).then(tugasmateri=>{
            if(tugasmateri){
              //jika ada;

              //tampilkan halaman hasil tugas;
              res.render('siswas/hasilmateri',{
                title:'Tugas '+materi.namatugas+' sudah dikumpul',
                siswa,
                materi,
                tugasmateri,

                kelas,
                jurusan,
                lokal,
                mapel,

                tombol:tombol,
                errors
              });

            }else{
              //jika belum ada;

              //tampilkan halaman pengumpulan tugas;
              //tampilkan halaman berdasarkan posisi file;
              res.render('siswas/kumpultugas',{
                title:'Kumpul Tugas '+materi.namatugas,
                siswa,
                materi,

                kelas,
                jurusan,
                lokal,
                mapel,
                
                tombol:tombol,
                errors
              });

            }
          });

        }
      });

    }
  });
});

//action pengumpulan tugas siswa;=
router.post('/kumpultugas/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idmateri',upload.single('file'),function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idmateri=req.params.idmateri;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari parmeter id TugasSiswa cari datanya;
      TugasSiswa.findById(idmateri,function(err,materi){
        if(materi){
          //jika ada;

          //cek nilai masuk;
          console.log(req.body);
          console.log(req.file);
          //masukan dalam variabel;
          const{keterangan}=req.body;
          const{destination,encoding,fieldname,filename,mimetype,originalname,path,size}=req.file;

          //variabel penampung;
          let errors=[];

          //jika kosong;
          if(!keterangan||!mimetype){
            console.log('Lengkapi semua tugas anda');
            errors.push({msg:'Lengkapi semua tugas anda'});
          }

          //logika;
          if(errors.length>0){
            //jika ada errors;
            res.render('siswas/kumpultugas',{
              title:'Kumpul Tugas '+materi.namatugas,
              siswa,
              materi,

              kelas,
              jurusan,
              lokal,
              mapel,

              tombol:'nonaktif',
              errors
            });
          }else{
            //jika tidak ada errors;

            //simpan tugas siswa;
            const newTugas=TugasMateris({
              //data siswa;
              idsiswa:siswa.id,
              namasiswa:siswa.ndepan+' '+siswa.nbelakang,
              kelas,
              jurusan,
              lokal,
              //data materi;
              idmateri:materi.id,
              mapel,
              tanggal:materi.tanggal,
              namatugas:materi.namatugas,
              keterangan:materi.keterangan,
              guru:materi.guru,
              //data tugas;
              keterangansiswa:keterangan,
              destination,
              encoding,
              fieldname,
              filename,
              mimetype,
              originalname,
              path,
              size,
              //nilai;
              nilai:0,
              //tanggal pengumpulan;
              tanggalkumpul:new Date()
            });
            newTugas.save().then(tugas=>{
              console.log('Tugas Berhasil Dikumpulkan');
              errors.push({msg:'Tugas Berhasil Dikumpulkan'});
              //tampilkan halaman berdasarkan posisi file;
              res.render('siswas/kumpultugas',{
                title:'Tugas Berhasil Dikumpul',
                siswa,
                materi,

                kelas,
                jurusan,
                lokal,
                mapel,

                tombol:'nonaktif',
                errors
              });
            });


          }

        }
      });

    }
  });
});

//=============================================Absensi===============================================
//halaman absensi;
router.get('/lihat/absensi/:kelas/:jurusan/:lokal/:mapel/:idsiswa',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //variabel penampung;
      let ListAbsensi=[];

      //cari semua absensi kehadiran;
      KodeAbsensi.find({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel}).then(absensi=>{
        if(absensi){
          //jika ada;

          //ambil nilainya secara spesifik;
          for(data of absensi){
            ListAbsensi.push({
              id:data.id,
              judul:data.judul,
              tanggal:data.tanggal,
              deskripsi:data.deskripsi,
              kode:data.kode
            });
          }

          //tampilkan halaman berdasarkan posisi file;
          res.render('siswas/absensi',{
            title:'absensi',
            siswa,
            ListAbsensi,

            kelas,
            jurusan,
            lokal,
            mapel
          });

        }else{
          //jika tidak ada;

          //tampilkan halaman berdasarkan posisi file;
          res.render('siswas/absensi',{
            title:'absensi',
            siswa,
            ListAbsensi,

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

//halaman kumpul absensi;=
router.get('/input/absensi/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idabsensi',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idabsensi=req.params.idabsensi;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //variabel penampung;
      let errors=[];

      //dari parameter id absensi, cari datanya;
      KodeAbsensi.findById(req.params.idabsensi,function(err,absensi){
        if(absensi){
          //jika ada;

          //cek siswa ini sudah absensi belum?
          Absensiswa.findOne({idabsensi:idabsensi,idsiswa:siswa.id}).then(sudah=>{
            if(sudah){
              //jika ada;
              console.log('sudah absen '+sudah.kode);
              errors.push({msg:'Kamu sudah mengisi absensi kehadiran ini'});
              //tampilkan halaman berdasarkan posisi file;
              res.render('siswas/inputabsensi',{
                title:'Absensi '+absensi.judul ,
                siswa,
                absensi,
                errors,
                tombol:'nonaktif',

                kelas,
                jurusan,
                lokal,
                mapel
              });


            }else{
              //jika belum ada;
              console.log('belum absensi');
              //tampilkan halaman berdasarkan posisi file;
              res.render('siswas/inputabsensi',{
                title:'Absensi '+absensi.judul ,
                siswa,
                absensi,
                errors,
                tombol:'aktif',

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

//action pengumpulan absensi siswa;=
router.post('/input/absensi/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idabsensi',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idabsensi=req.params.idabsensi;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari parmeter id idabsensi cari datanya;
      KodeAbsensi.findById(idabsensi,function(err,absensi){
        if(absensi){
          //jika ada;

          //cek nilai masuk;
          console.log(req.body);
          //masukan dalam variabel;
          const{kode}=req.body;

          //variabel penampung;
          let errors=[];

          if(!kode){
            errors.push({msg:'lengkapi data'});
          }

          //logika;
          if(errors.length>0){
            //jika ada errors;
            res.render('siswas/inputabsensi',{
              title:'Absensi '+absensi.judul,
              siswa,
              absensi,

              kelas,
              jurusan,
              lokal,
              mapel,

              errors,
              tombol:'aktif'
            });
          }else{
            //jika tidak ada errors;

            //cek benar tidak;
            if(kode==absensi.kode){
              //jika benar;

              //simpan absensi siswa;
              const newAbsensiswa=Absensiswa({
                //data siswa;
                idabsensi:absensi.id,
                idsiswa:siswa.id,
                namasiswa:siswa.ndepan+' '+siswa.nbelakang,
                kelas,
                jurusan,
                lokal,
                mapel,

                kode,
                tanggalkumpul:new Date()
              });
              newAbsensiswa.save().then(absensis=>{
                console.log('Absensi Berhasil Dikumpulkan');
                errors.push({msg:'Absensi Berhasil Dikumpulkan'});
                //tampilkan halaman berdasarkan posisi file;
                res.render('siswas/inputabsensi',{
                  title:'Absensi '+absensi.judul,
                  siswa,
                  absensi,

                  kelas,
                  jurusan,
                  lokal,
                  mapel,

                  errors,
                  tombol:'nonaktif'
                });
              });

            }else{
              //jika salah;

              console.log('Absensi Gagal, Password Salah');
              errors.push({msg:'Absensi Gagal, Password Salah'});
              //tampilkan halaman berdasarkan posisi file;
              res.render('siswas/inputabsensi',{
                title:'Absensi '+absensi.judul,
                siswa,
                absensi,

                kelas,
                jurusan,
                lokal,
                mapel,

                errors,
                tombol:'aktif'
              });
            }
            


          }

        }
      });

    }
  });
});

//===========================Quis====================================
//cek soal (judul quis (belum,sedang,sudah));
router.get('/quis/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idquis',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idsiswa=req.params.idsiswa;
  var idquis=req.params.idquis;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari params id quis, cari datanya;
      JudulSoals.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel waktu;
          var waktu_sekarang=new Date();
          var waktu_mulaiquis= new Date(quis.tahunmulai+'-'+quis.bulanmulai+'-'+quis.tanggalmulai);
          var waktu_akhirquis= new Date(quis.tahunakhir+'-'+quis.bulanakhir+'-'+quis.tanggalakhir);
          let errors=[];

          //cek waktu;
          if(waktu_sekarang<waktu_mulaiquis){
            //belum mulai;
            console.log('Quis belum dimulai');
            errors.push({msg:'Quis belum dimulai'});
            //tampilkan halaman berdasarkan posisi file;
            res.render('siswas/alertquis',{
              title:'Belum Dimulai',
              siswa,
              quis,
              errors,

              kelas,
              jurusan,
              lokal,
              mapel
            });

          }else if(waktu_sekarang>=waktu_mulaiquis&&waktu_sekarang<=waktu_akhirquis){
            //waktu mengerjakan quis;
            console.log('sedang berlangsung');
            //lempar kehalaman sesuai dengan jenis soal;
            res.redirect('/siswa/quis/'+quis.jenissoal+'/'+quis.kelas+'/'+quis.jurusan+'/'+quis.lokal+'/'+quis.mapel+'/'+siswa.id+'/'+quis.id+'/'+quis.jam+'/'+quis.menit+'/00/1');

          }else{
            //sudah selesai, waktu habis;
            console.log('Quis sudah berakhir');
            errors.push({msg:'Quis sudah berakhir'});
            //tampilkan halaman berdasarkan posisi file;
            //tampilkan halaman berdasarkan posisi file;
            res.render('siswas/alertquis',{
              title:'Sudah Berakhir',
              siswa,
              quis,
              errors,

              kelas,
              jurusan,
              lokal,
              mapel
            });
          }

        }
      });

    }
  });

});

//======================Pilgan=======================
//halaman soal pilgan (sudah jawab);
router.get('/quis/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idquis/:jam/:menit/:detik/:nosoal',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idsiswa=req.params.idsiswa;
  var idquis=req.params.idquis;
  var nosoal=req.params.nosoal/1;

  var jam=req.params.jam;
  var menit=req.params.menit;
  var detik=req.params.detik;

  var tombol='';
  var mundur=nosoal-1;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari params id quis, cari datanya;
      JudulSoals.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel penampung;
          let errors=[];


          //cek siswa ini sudah mengerjakan quis belum dalam Soal_Selesais?;
          Soal_Selesais.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(selesais=>{
            if(selesais){
              //jika sudah ada, siswa tidak boleh mengerjakan lagi;

              Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(nilai=>{
                if(nilai){
                  //jika sudah ada, siswa tidak boleh mengerjakan lagi;

                  console.log('Sudah Pernah Mengerjakan');
                  errors.push({msg:'Quis sudah selesai kamu kerjakan, dengan '+nilai.nilai+' point'});
                  //tampilkan halaman berdasarkan posisi file;
                  res.render('siswas/alertquis',{
                    title:'Selesai',
                    siswa,
                    quis,
                    errors,
    
                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });

                }
              });

            }else{
              //jika belum ada siswa bisa mengerjakan;

              //dari id quis yang didapat, cari soal pilgan sesuai kelas dan nomer;
              Soal_Pilgans.findOne({idquis:quis.id,kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,nosoal:nosoal}).then(soal=>{
                if(soal){
                  //jika soal ada;
                  
                  if(nosoal==1){
                    tombol='nonaktif';
                  }else{
                    tombol='aktif';
                  }

                  var A='';
                  var B='';
                  var C='';
                  var D='';
                  var E='';

                  //cek sudah pernah jawab belum;
                  Jawab_Pilgans.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id,idsoal:soal.id,nosoal:nosoal}).then(jawabpilgan=>{
                    if(jawabpilgan){
                      //jika sudah ada;

                      //cek jawabannya;
                      if(jawabpilgan.jawaban=='A'){
                        A='checked';
                      }
                      if(jawabpilgan.jawaban=='B'){
                        B='checked';
                      }
                      if(jawabpilgan.jawaban=='C'){
                        C='checked';
                      }
                      if(jawabpilgan.jawaban=='D'){
                        D='checked';
                      }
                      if(jawabpilgan.jawaban=='E'){
                        E='checked';
                      }

                      //tampilkan berdasarkan posisi file;
                      res.render('siswas/soalpilgan',{
                        title:'Soal Pilgan '+nosoal,
                        siswa,
                        quis,
                        soal,

                        kelas,
                        jurusan,
                        lokal,
                        mapel,

                        jam,
                        menit,
                        detik,

                        tombol,
                        mundur,
                        habis:'/siswa/quis/Pilgan/habis/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+siswa.id+'/'+quis.id,
                        A,B,C,D,E
                      });

                    }else{
                      //jika belum ada;

                      //tampilkan berdasarkan posisi file;
                      res.render('siswas/soalpilgan',{
                        title:'Soal Pilgan '+nosoal,
                        siswa,
                        quis,
                        soal,

                        kelas,
                        jurusan,
                        lokal,
                        mapel,

                        jam,
                        menit,
                        detik,

                        tombol,
                        mundur,
                        habis:'/siswa/quis/Pilgan/habis/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+siswa.id+'/'+quis.id,
                        A,B,C,D,E
                      });

                    }
                  });

                }else{
                  // jika tidak ada(nosoal habis);

                  console.log('Selesai');
                  errors.push({msg:'Quis telah selesai'});
                  //lempar kehalaman habis;
                  res.redirect('/siswa/quis/Pilgan/habis/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+siswa.id+'/'+quis.id);
                  // //tampilkan halaman berdasarkan posisi file;
                  // res.render('siswas/alertquis',{
                  //   title:'Selesai',
                  //   siswa,
                  //   quis,
                  //   errors,

                  //   kelas,
                  //   jurusan,
                  //   lokal,
                  //   mapel
                  // });

                }
              });

            }
          });

        }
      });

    }
  });

});

//action soal pilgan;
router.post('/quis/Pilgan/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idquis/:idsoal/:jam/:menit/:detik/:nosoal',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idsiswa=req.params.idsiswa;
  var idquis=req.params.idquis;
  var nosoal=req.params.nosoal/1;

  var tombol='';
  var mundur=nosoal-1;

  var point=0;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari params id quis, cari datanya;
      JudulSoals.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari id quis yang didapat, cari soal pilgan sesuai kelas dan nomer;
          Soal_Pilgans.findOne({idquis:quis.id,kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,nosoal:nosoal}).then(soal=>{
            if(soal){
              //jika soal ada;

              //cek nilai masuk;
              console.log(req.body);
              //masukan dalam variabel;
              const{jam,menit,detik,jawab}=req.body;

              //cek jawaban;
              if(jawab==soal.kunci){
                console.log('benar');
                point=point+1;
              }else{
                console.log('salah');
                point=0;
              }

              //cek sudah pernah jawab belum untuk soal nomer ini;
              Jawab_Pilgans.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id,idsoal:soal.id,nosoal:nosoal}).then(jawabpilgan=>{
                if(jawabpilgan){
                  //jika sudah ada, update saja;
                  var update=0;
                  //cek jawaban;
                  if(jawab==soal.kunci){
                    if(jawab==jawabpilgan.jawaban){
                      point=0;
                      update=0;
                    }else{
                      point=1;
                      update=1;
                    }
                  }else{
                    if(jawabpilgan.jawaban==soal.kunci){
                      point=0;
                      update=-1;
                    }else{
                      point=0;
                      update=0;
                    }
                  }

                  //dari id jawaban pilgan, update datanya;
                  Jawab_Pilgans.findByIdAndUpdate(jawabpilgan.id,{
                    jawaban:jawab,
                    point
                  },function(err){
                    if(err){
                      //jika ada err;
                      console.log(err);
                    }else{
                      //cari nilai siswa;
                      Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(nilai_siswa=>{
                        if(nilai_siswa){
                          //jika ada;

                          //dari id nilai siswa, update datanya;
                          Nilai_Siswas.findByIdAndUpdate(nilai_siswa.id,{
                            nilai:nilai_siswa.nilai+update
                          },function(err){
                            if(err){
                              //jika ada err;
                              console.log(err);
                            }else{
                              //lempar kehalaman berikutnya;
                              nosoal=nosoal+1;
                              res.redirect('/siswa/quis/'+quis.jenissoal+'/'+quis.kelas+'/'+quis.jurusan+'/'+quis.lokal+'/'+quis.mapel+'/'+siswa.id+'/'+quis.id+'/'+jam+'/'+menit+'/'+detik+'/'+nosoal);

                            }
                          });

                        }
                      });

                    }
                  });

                }else{
                  //jika belum ada, simpan;

                  //simpan jawaban;
                  const newJawab_Pilgans=Jawab_Pilgans({
                    kelas,
                    jurusan,
                    lokal,
                    mapel,
                    idsiswa:siswa.id,
                    idquis:quis.id,
                    idsoal:soal.id,
                    nosoal,
                    soal:soal.soal,
                    jawaban:jawab,
                    point
                  });
                  newJawab_Pilgans.save().then(pilgan=>{

                    //cek nilai siswa ini sudah ada belum;
                    Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(nilai_siswa=>{
                      if(nilai_siswa){
                        //jika sudah ada, update saja nilainya;

                        //dari id nilai yang didapat, update nilainya;
                        Nilai_Siswas.findByIdAndUpdate(nilai_siswa.id,{
                          nilai:nilai_siswa.nilai+point
                        },function(err){
                          if(err){
                            //jika ada err;
                            console.log(err);
                          }else{
                            //lempar kehalaman berikutnya;
                            nosoal=nosoal+1;
                            res.redirect('/siswa/quis/'+quis.jenissoal+'/'+quis.kelas+'/'+quis.jurusan+'/'+quis.lokal+'/'+quis.mapel+'/'+siswa.id+'/'+quis.id+'/'+jam+'/'+menit+'/'+detik+'/'+nosoal);

                          }
                        });

                      }else{
                        //jika belum ada, buat baru;
                        
                        //simpan nilai siswa;
                        const newNilai_Siswa=Nilai_Siswas({
                          kelas,
                          jurusan,
                          lokal,
                          mapel,
                          idsiswa:siswa.id,
                          nama:siswa.ndepan+' '+siswa.nbelakang,
                          idquis:quis.id,
                          nilai:point,
                          tanggal:new Date()
                        });
                        newNilai_Siswa.save().then(nilai=>{

                          //lempar kehalaman berikutnya;
                          nosoal=nosoal+1;
                          res.redirect('/siswa/quis/'+quis.jenissoal+'/'+quis.kelas+'/'+quis.jurusan+'/'+quis.lokal+'/'+quis.mapel+'/'+siswa.id+'/'+quis.id+'/'+jam+'/'+menit+'/'+detik+'/'+nosoal);

                        });

                      }
                    });

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

//habis soal pilgan (rekam jawab);
router.get('/quis/Pilgan/habis/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idquis',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idsiswa=req.params.idsiswa;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari params id quis, cari datanya;
      JudulSoals.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel penampung;
          let errors=[];

          //cek siswa ini sudah mengerjakan quis belum?, nilainya berapa;
          Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(nilai=>{
            if(nilai){
              //jika sudah ada, siswa tidak boleh mengerjakan lagi;

              //simpan kalau sudah mengerakan;
              const newSoal_Selesai=Soal_Selesais({
                kelas,
                jurusan,
                lokal,
                mapel,
                idsiswa:siswa.id,
                idquis:quis.id,
                nama:siswa.ndepan+' '+siswa.nbelakang,
              });
              newSoal_Selesai.save().then(selesai=>{

                console.log('Selesai');
                errors.push({msg:'Terimakasih, Kamu mendapatkan '+nilai.nilai+' point pada quis ini.'});
                //tampilkan halaman berdasarkan posisi file;
                res.render('siswas/alertquis',{
                  title:'Selesai',
                  siswa,
                  quis,
                  nilai,
                  errors,
          
                  kelas,
                  jurusan,
                  lokal,
                  mapel
                });

              });

            }
          });

        }
      });

    }
  });

});

//======================Essay=======================
//halaman soal essay (sudah jawab);
router.get('/quis/Essay/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idquis/:jam/:menit/:detik/:nosoal',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idsiswa=req.params.idsiswa;
  var idquis=req.params.idquis;
  var nosoal=req.params.nosoal/1;

  var jam=req.params.jam;
  var menit=req.params.menit;
  var detik=req.params.detik;

  var tombol='';
  var mundur=nosoal-1;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari params id quis, cari datanya;
      JudulSoals.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel penampung;
          let errors=[];


          //cek siswa ini sudah mengerjakan quis belum dalam Soal_Selesais?;
          Soal_Selesais.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(selesais=>{
            if(selesais){
              //jika sudah ada, siswa tidak boleh mengerjakan lagi;

              Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(nilai=>{
                if(nilai){
                  //jika sudah ada, siswa tidak boleh mengerjakan lagi;

                  console.log('Sudah Pernah Mengerjakan');
                  errors.push({msg:'Quis sudah selesai kamu kerjakan dengan nilai '+nilai.nilai});
                  //tampilkan halaman berdasarkan posisi file;
                  res.render('siswas/alertquis',{
                    title:'Selesai',
                    siswa,
                    quis,
                    errors,
    
                    kelas,
                    jurusan,
                    lokal,
                    mapel
                  });

                }
              });

            }else{
              //jika belum ada siswa bisa mengerjakan;

              //dari id quis yang didapat, cari soal essay sesuai kelas dan nomer;
              Soal_Essays.findOne({idquis:quis.id,kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,nosoal:nosoal}).then(soal=>{
                if(soal){
                  //jika soal ada;
                  
                  if(nosoal==1){
                    tombol='nonaktif';
                  }else{
                    tombol='aktif';
                  }

                  //cek sudah pernah jawab belum;
                  Jawab_Essays.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id,idsoal:soal.id,nosoal:nosoal}).then(jawabessay=>{
                    if(jawabessay){
                      //jika sudah ada;

                      //tampilkan berdasarkan posisi file;
                      res.render('siswas/soalessay',{
                        title:'Soal Essay '+nosoal,
                        siswa,
                        quis,
                        soal,

                        kelas,
                        jurusan,
                        lokal,
                        mapel,

                        jam,
                        menit,
                        detik,

                        tombol,
                        mundur,
                        habis:'/siswa/quis/Essay/habis/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+siswa.id+'/'+quis.id,
                        jawabessay
                      });

                    }else{
                      //jika belum ada;

                      //tampilkan berdasarkan posisi file;
                      res.render('siswas/soalessay',{
                        title:'Soal Essay '+nosoal,
                        siswa,
                        quis,
                        soal,

                        kelas,
                        jurusan,
                        lokal,
                        mapel,

                        jam,
                        menit,
                        detik,

                        tombol,
                        mundur,
                        habis:'/siswa/quis/Essay/habis/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+siswa.id+'/'+quis.id,
                        jawabessay:[]
                      });

                    }
                  });

                }else{
                  // jika tidak ada(nosoal habis);

                  console.log('Selesai');
                  errors.push({msg:'Quis telah selesai'});
                  //lempar kehalaman habis;
                  res.redirect('/siswa/quis/Essay/habis/'+kelas+'/'+jurusan+'/'+lokal+'/'+mapel+'/'+siswa.id+'/'+quis.id);
                  // //tampilkan halaman berdasarkan posisi file;
                  // res.render('siswas/alertquis',{
                  //   title:'Selesai',
                  //   siswa,
                  //   quis,
                  //   errors,

                  //   kelas,
                  //   jurusan,
                  //   lokal,
                  //   mapel
                  // });

                }
              });

            }
          });

        }
      });

    }
  });

});

//action soal essay;
router.post('/quis/Essay/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idquis/:idsoal/:jam/:menit/:detik/:nosoal',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idsiswa=req.params.idsiswa;
  var idquis=req.params.idquis;
  var nosoal=req.params.nosoal/1;

  var tombol='';
  var mundur=nosoal-1;

  var point=0;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari params id quis, cari datanya;
      JudulSoals.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //dari id quis yang didapat, cari soal Essay sesuai kelas dan nomer;
          Soal_Essays.findOne({idquis:quis.id,kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,nosoal:nosoal}).then(soal=>{
            if(soal){
              //jika soal ada;

              //cek nilai masuk;
              console.log(req.body);
              //masukan dalam variabel;
              const{jam,menit,detik,jawab}=req.body;

              //cek sudah pernah jawab belum untuk soal nomer ini;
              Jawab_Essays.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id,idsoal:soal.id,nosoal:nosoal}).then(jawabessay=>{
                if(jawabessay){
                  //jika sudah ada, update saja;
                  var update=0;

                  //dari id jawaban Essay, update datanya;
                  Jawab_Essays.findByIdAndUpdate(jawabessay.id,{
                    jawaban:jawab,
                    point
                  },function(err){
                    if(err){
                      //jika ada err;
                      console.log(err);
                    }else{
                      //cari nilai siswa;
                      Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(nilai_siswa=>{
                        if(nilai_siswa){
                          //jika ada;

                          //dari id nilai siswa, update datanya;
                          Nilai_Siswas.findByIdAndUpdate(nilai_siswa.id,{
                            nilai:nilai_siswa.nilai+update
                          },function(err){
                            if(err){
                              //jika ada err;
                              console.log(err);
                            }else{
                              //lempar kehalaman berikutnya;
                              nosoal=nosoal+1;
                              res.redirect('/siswa/quis/'+quis.jenissoal+'/'+quis.kelas+'/'+quis.jurusan+'/'+quis.lokal+'/'+quis.mapel+'/'+siswa.id+'/'+quis.id+'/'+jam+'/'+menit+'/'+detik+'/'+nosoal);

                            }
                          });

                        }
                      });

                    }
                  });

                }else{
                  //jika belum ada, simpan;

                  //simpan jawaban;
                  const newJawab_Essays=Jawab_Essays({
                    kelas,
                    jurusan,
                    lokal,
                    mapel,
                    idsiswa:siswa.id,
                    idquis:quis.id,
                    idsoal:soal.id,
                    nosoal,
                    soal:soal.soal,
                    jawaban:jawab,
                    point
                  });
                  newJawab_Essays.save().then(essay=>{

                    //cek nilai siswa ini sudah ada belum;
                    Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(nilai_siswa=>{
                      if(nilai_siswa){
                        //jika sudah ada, update saja nilainya;

                        //dari id nilai yang didapat, update nilainya;
                        Nilai_Siswas.findByIdAndUpdate(nilai_siswa.id,{
                          nilai:nilai_siswa.nilai+point
                        },function(err){
                          if(err){
                            //jika ada err;
                            console.log(err);
                          }else{
                            //lempar kehalaman berikutnya;
                            nosoal=nosoal+1;
                            res.redirect('/siswa/quis/'+quis.jenissoal+'/'+quis.kelas+'/'+quis.jurusan+'/'+quis.lokal+'/'+quis.mapel+'/'+siswa.id+'/'+quis.id+'/'+jam+'/'+menit+'/'+detik+'/'+nosoal);

                          }
                        });

                      }else{
                        //jika belum ada, buat baru;

                        //simpan nilai siswa;
                        const newNilai_Siswa=Nilai_Siswas({
                          kelas,
                          jurusan,
                          lokal,
                          mapel,
                          idsiswa:siswa.id,
                          nama:siswa.ndepan+' '+siswa.nbelakang,
                          idquis:quis.id,
                          nilai:point,
                          tanggal:new Date()
                        });
                        newNilai_Siswa.save().then(nilai=>{

                          //lempar kehalaman berikutnya;
                          nosoal=nosoal+1;
                          res.redirect('/siswa/quis/'+quis.jenissoal+'/'+quis.kelas+'/'+quis.jurusan+'/'+quis.lokal+'/'+quis.mapel+'/'+siswa.id+'/'+quis.id+'/'+jam+'/'+menit+'/'+detik+'/'+nosoal);

                        });

                      }
                    });

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

//habis soal Essay (rekam jawab);
router.get('/quis/Essay/habis/:kelas/:jurusan/:lokal/:mapel/:idsiswa/:idquis',function(req,res,next){
  var kelas=req.params.kelas;
  var jurusan=req.params.jurusan;
  var lokal=req.params.lokal;
  var mapel=req.params.mapel;
  var idsiswa=req.params.idsiswa;

  //dari parameter id siswa, cari datanya;
  Siswas.findById(req.params.idsiswa,function(err,siswa){
    if(siswa){
      //jika ada;

      //dari params id quis, cari datanya;
      JudulSoals.findById(req.params.idquis,function(err,quis){
        if(quis){
          //jika ada;

          //variabel penampung;
          let errors=[];

          //cek siswa ini sudah mengerjakan quis belum?, nilainya berapa;
          Nilai_Siswas.findOne({kelas:kelas,jurusan:jurusan,lokal:lokal,mapel:mapel,idsiswa:siswa.id,idquis:quis.id}).then(nilai=>{
            if(nilai){
              //jika sudah ada, siswa tidak boleh mengerjakan lagi;

              //simpan kalau sudah mengerakan;
              const newSoal_Selesai=Soal_Selesais({
                kelas,
                jurusan,
                lokal,
                mapel,
                idsiswa:siswa.id,
                idquis:quis.id,
                nama:siswa.ndepan+' '+siswa.nbelakang,
              });
              newSoal_Selesai.save().then(selesai=>{

                console.log('Selesai');
                errors.push({msg:'Terimakasih, Jawaban kamu sedang diperiksa oleh guru'});
                //tampilkan halaman berdasarkan posisi file;
                res.render('siswas/alertquis',{
                  title:'Selesai',
                  siswa,
                  quis,
                  nilai,
                  errors,
          
                  kelas,
                  jurusan,
                  lokal,
                  mapel
                });

              });

            }
          });

        }
      });

    }
  });

});

//============================Logout===================================
//action logout;
router.get('/logout/:idsiswa',function(req,res,next){
  const idsiswa=req.params.idsiswa;
  //dari semua login siswa;
  Logins.find({idusers:idsiswa}).then(login=>{
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