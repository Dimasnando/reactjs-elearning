var express = require('express');
var router = express.Router();
var Gurus = require('../models/GuruSchema');
var Siswas = require('../models/SiswaSchema');
var Mapels = require('../models/MapelSchema');
var Logins = require('../models/LoginSchema');

//halaman login admin;
router.get('/login',function(req,res,next){
    //hampilkan halaman sesuai posisi file;
    res.render('admins/login',{
        title: 'Login Admin' 
    });
});

//action halaman login admin;
router.post('/login',function(req,res,next){
    //cek nilai masuk;
    console.log(req.body);
    //masukan nilai dalam variabel;
    const {email,password}=req.body;

    //variabel penampung;
    let errors=[];

    //jika kosong;
    if(!email||!password){
        errors.push({msg:'Lengkapi semua data'});
        console.log('Lengkapi semua data');
    }

    //logika;
    if(errors.length>0){
        //tampiilkan halaman berdasarkan posisi file;
        res.render('admins/login',{
            title:'Login Gagal',
            errors
        });
    }else{
        //jika tidak ada errors;

        //cek email masuk;
        if(email=='admin@gmail.com'){
            //jika benar;

            //cek password;
            if(password=='123'){
                //jika password benar;

                //simpan loginnya;
                const newLogins=Logins({
                    idusers:'admins'
                });
                newLogins.save().then(login=>{
                    //jika berhasil;

                    //lempar kehalaman dashboard admin;
                    res.redirect('/admin/dashboard');
                });
                
            }else{
                //jika password salah;
                //tetap di halaman login dan tampilkan pesan;
                errors.push({msg:'Password admin salah'});
                console.log('Password admin salah');
                //tampilkan halaman sesuai posisi file;
                res.render('admins/login',{
                    title:'Password salah',
                    errors
                });
            }
        }else{
            //jika salah;
            //tetap di halaman login dan tampilkan pesan;
            errors.push({msg:'Email admin salah'});
            console.log('Email admin salah');
            //tampilkan halaman sesuai posisi file;
            res.render('admins/login',{
                title:'Email salah',
                errors
            });
        }
    }
});

//===========================dashboard====================
//halaman dashboard admin;
router.get('/dashboard',function(req,res,next){
    //cek semua login admins;
    Logins.find({idusers:'admins'}).then(logins=>{
        if(logins.length==0){
            //jika tidak ada;
            res.redirect('/');
        }
    });
    
    //menampilkan halaman berdasarkan posisi file;
    res.render('admins/dashboard',{
        title:'Dashboard Admin'
    });
});

//===========================buat akun====================
//halaman buat akun guru;
router.get('/buatakun/guru',function(req,res,next){
    //cek semua login admins;
    Logins.find({idusers:'admins'}).then(logins=>{
        if(logins.length==0){
            //jika tidak ada;
            res.redirect('/');
        }
    });

    //tampilkan halaman berdasarkan posisi file;
    res.render('admins/buatguru',{
        title:'Buat akun guru'
    });
});

//action halaman buat akun guru;
router.post('/buatakun/guru',function(req,res,next){
    //cek nilai masuk;
    console.log(req.body);
    //masukan nilai dalam variabel;
    const {nama,gelar,nip,hp,email,password1,password2}=req.body;

    //variabel penampung;
    let errors=[];

    //jika kosong;
    if(!nama||!gelar||!nip||!hp||!email||!password1||!password2){
        errors.push({msg:'Lengkapi semua data guru'});
        console.log('Lengkapi semua data guru');
    }

    //jika password tidak sama;
    if(password1!=password2){
        console.log('Password tidak sama');
        errors.push({msg:'Password tidak sama'});
    }

    //logika;
    if(errors.length>0){
        //jika ada errors,tetap dihalaman buat akun;
        //tampilkan halaman berdasarkan posisi file;
        res.render('admins/buatguru',{
            title:'Gagal membuat akun',
            errors
        });
    }else{
        //jika tidak ada errors;

        //cek email sudah ada blom dalam database guru;
        Gurus.findOne({email:email}).then(guru=>{
            if(guru){
                //jika ada;
                //tetap dihalaman register dan tampilkan pesan errors;
                console.log('Email sudah terdaftar');
                errors.push({msg:'Email sudah terdaftar'});
                //tampilkan halaman berdasarkan posisi file;
                res.render('admins/buatguru',{
                    title:'Akun sudah ada',
                    errors
                });
            }else{
                //jika belum ada;

                //simpan;
                const newGurus=Gurus({
                    nama,
                    gelar,
                    nip,
                    hp,
                    email,
                    password:password1
                });
                newGurus.save().then(guru=>{
                    //jika berhasil tersimpan;
                    console.log('Berhasil tersimpan');
                    errors.push({msg:'Berhasil tersimpan'});
                    res.render('admins/buatguru',{
                        title:'Berhasil',
                        errors
                    });
                });
            }
        });
    }
});

//=======================
//halaman buat akun siswa;
router.get('/buatakun/siswa',function(req,res,next){
    //cek semua login admins;
    Logins.find({idusers:'admins'}).then(logins=>{
        if(logins.length==0){
            //jika tidak ada;
            res.redirect('/');
        }
    });

    //tampilkan halaman berdasarkan posisi file;
    res.render('admins/buatsiswa',{
        title:'Buat akun siswa'
    });
});

//action halaman buat akun siswa;
router.post('/buatakun/siswa',function(req,res,next){
    //cek nilai masuk;
    console.log(req.body);
    //masukan dalam variabel;
    const {ndepan,nbelakang,nis,angkatan,jurusan,lokal,email,password1,password2}=req.body;

    //variabel penampung;
    let errors=[];

    //jika ada kosong;
    if(!ndepan||!nbelakang||!nis||!angkatan||!jurusan||!lokal||!email||!password1||!password2){
        console.log('Lengkapi semua data siswa');
        errors.push({msg:'Lengkapi semua data siswa'});
    }

    //jika password tidak sama;
    if(password1!=password2){
        console.log('Password tidak sama');
        errors.push({msg:'Password tidak sama'});
    }

    //logika;
    if(errors.length>0){
        //jika ada errors;
        res.render('admins/buatsiswa',{
            title:'Gagal buat akun siswa',
            errors
        });
    }else{
        //jika tidak ada errors;

        //cek email sudah ada belum dalam database siswa;
        Siswas.findOne({email:email}).then(siswa=>{
            if(siswa){
                //jika ada;
                //tetap dihalaman dan tampilkan pesan errorsnya;
                console.log('Email sudah terdaftar');
                errors.push({msg:'Email sudah terdaftar'});
                //tampilkan berdasarkan posisi file;
                res.render('admins/buatsiswa',{
                    title:'Akun sudah ada',
                    errors
                });
            }else{
                //jika belum ada;

                //simpan;
                const newSiswas=Siswas({
                    ndepan,
                    nbelakang,
                    nis,
                    angkatan,
                    jurusan,
                    lokal,
                    email,
                    password:password2
                });
                newSiswas.save().then(siswa=>{
                    //jika berhasil tersimpan;
                    console.log('Berhasil tersimpan');
                    errors.push({msg:'Berhasi tersimpan'});
                    //tampilkan halaman berdasarkan posisi file;
                    res.render('admins/buatsiswa',{
                        title:'Berhasil',
                        errors
                    });
                });
            }
        });

    }


});

//===========================kelola akun====================
//halaman kelola akun guru;
router.get('/kelolaakun/guru',function(req,res,next){
    //cek semua login admins;
    Logins.find({idusers:'admins'}).then(logins=>{
        if(logins.length==0){
            //jika tidak ada;
            res.redirect('/');
        }
    });

    //variabel penampung;
    let ListGurus=[];
    var no=0;

    //cari semua akun guru;
    Gurus.find(function(err,gurus){
        if(gurus){
            //jika ada;

            //ambil nilainya secara spesifik;
            for(data of gurus){
                no=no+1;
                ListGurus.push({
                    id:data.id,
                    no:no,
                    nama:data.nama,
                    gelar:data.gelar,
                    nip:data.nip,
                    hp:data.hp,
                    email:data.email,
                    password:data.password
                });
            }

            console.log(ListGurus);
            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/kelolaguru',{
                title:'Kelola Akun Guru',
                ListGurus
            });

        }else{
            //jika tidak ada;
            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/kelolaguru',{
                title:'Kelola Akun Guru',
                ListGurus
            });
        }
    });

});

//halaman edit akun guru;
router.get('/editguru/:idguru',function(req,res,next){
    //dari params id guru, cari datanya;
    Gurus.findById(req.params.idguru,function(err,gurus){
        if(gurus){
            //jika ada;

            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/editguru',{
                title:'Edit Akun Guru',
                gurus
            });
        }
    });
});

//action halaman edit akun guru;
router.post('/editguru/:idguru',function(req,res,next){
    //dari params id guru yg masuk cari datanya;
    Gurus.findById(req.params.idguru,function(err,gurus){
        if(gurus){
            //jika ada;

            //cek nilai masuk;
            console.log(req.body);
            //masukan nilai dalam variabel;
            const { nama,gelar,nip,hp,email,password1,password2}=req.body;

            //variabel penampung;
            let errors=[];

            //jika kosong;
            if(!nama||!gelar||!nip||!hp||!email||!password1||!password2){
                console.log('Lengkapi semua data guru');
                errors.push({msg:'Lengkapi semua data guru'});
            }

            //jika password tidak sama;
            if(password1!=password2){
                console.log('Password tidak sama');
                errors.push({msg:'Password tidak sama'});      
            }

            //logika
            if(errors.length>0){
                //tampilkan halaman berdasarkan posisi file;
                res.render('admins/editguru',{
                    title:'Gagal Edit',
                    gurus,
                    errors
                });
            }else{
                //jika tidak ada errors;

                //update berdasarkan id guru yang didapat;
                Gurus.findByIdAndUpdate(gurus.id,{
                    nama,
                    gelar,
                    nip,
                    hp,
                    email,
                    password:password2
                },function(err){
                    if(err){
                        //jika ada err;
                        console.log(err);
                    }else{
                        //jika tidak err;
                        gurus.nama=nama;
                        gurus.gelar=gelar;
                        gurus.nip=nip;
                        gurus.hp=hp;
                        gurus.email=email;
                        gurus.password=password1;
                        //tampilkan pesan;
                        console.log('Update berhasil');
                        errors.push({msg:'Update berhasil'});
                        //tampilkan halaman berdasarkan posisi file;
                        res.render('admins/editguru',{
                            title:'Update Berhasil',
                            gurus,
                            errors
                        });
                    }
                });

            }

        }
    });
});

//action hapus akun guru;
router.get('/hapusguru/:idguru',function(req,res,next){
    //dari params id guru yg masuk, cari dan hapus akun guru;
    Gurus.findByIdAndDelete(req.params.idguru,function(){
        //lempar ke halaman kelola akun guru;
        console.log('akun guru berhasil dihapus');
        res.redirect('/admin/kelolaakun/guru');
    });
});

//=======================
//halaman kelola akun siswa;
router.get('/kelolaakun/siswa',function(req,res,next){
    //cek semua login admins;
    Logins.find({idusers:'admins'}).then(logins=>{
        if(logins.length==0){
            //jika tidak ada;
            res.redirect('/');
        }
    });

    //variabel penampung;
    let ListSiswas=[];
    var no=0;

    //cari semua akun siswa;
    Siswas.find(function(err,siswas){
        if(siswas){
            //jika ada;

            //ambil datanya secara spesifik;
            for(data of siswas){
                no=no+1;
                ListSiswas.push({
                    id:data.id,
                    no:no,
                    ndepan:data.ndepan,
                    nbelakang:data.nbelakang,
                    nis:data.nis,
                    angkatan:data.angkatan,
                    jurusan:data.jurusan,
                    lokal:data.lokal,
                    email:data.email,
                    password:data.password
                });
            }
            
            console.log(ListSiswas);
            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/kelolasiswa',{
                title:'Kelola akun siswa',
                ListSiswas
            });

        }else{
            //jika tidak ada;

            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/kelolasiswa',{
                title:'Kelola akun siswa',
                ListSiswas
            });

        }
    });


});

//halaman edit akun siswa;
router.get('/editsiswa/:idsiswa',function(req,res,next){
    //dari params idsiswa yg masuk cari datanya;
    Siswas.findById(req.params.idsiswa,function(err,siswas){
        if(siswas){
            //jika ada;

            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/editsiswa',{
                title:'Edit akun siswa',
                siswas
            });
        }
    });
});

//action halaman edit akun siswa;
router.post('/editsiswa/:idsiswa',function(req,res,next){
    //dari params idsiswa yg masuk cari datanya.
    Siswas.findById(req.params.idsiswa,function(err,siswas){
        if(siswas){
            //jika ada;

            //cek nilai masuk;
            console.log(req.body);
            //masukan dalam variabel;
            const {ndepan,nbelakang,nis,angkatan,jurusan,lokal,email,password1,password2}=req.body;

            //variabel penampung;
            let errors=[];

            //jika kosong;
            if(!ndepan||!nbelakang||!nis||!angkatan||!jurusan||!lokal||!email||!password1||!password2){
                console.log('Lengkapi semua data siswa');
                errors.push({msg:'Lengkapi semua data siswa'});
            }

            //jika password tidak sama;
            if(password1!=password2){
                console.log('Password tidak sama');
                errors.push({msg:'Password tidak sama'});   
            }

            //logika;
            if(errors.length>0){
                //tampilkan halaman berdasarkan posisi file;
                res.render('admins/editsiswa',{
                    title:'Gagal Mengedit siswa',
                    siswas,
                    errors
                });
            }else{
                //jika tidak ada errors;

                //update siswa berdasarkan id yg didapat;
                Siswas.findByIdAndUpdate(siswas.id,{
                    ndepan,
                    nbelakang,
                    nis,
                    angkatan,
                    jurusan,
                    lokal,
                    email,
                    password:password2
                },function(err){
                    if(err){
                        //jika ada err;
                        console.log(err);
                    }else{
                        siswas.ndepan=ndepan;
                        siswas.nbelakang=nbelakang;
                        siswas.nis=nis;
                        siswas.angkatan=angkatan;
                        siswas.jurusan=jurusan;
                        siswas.lokal=lokal;
                        siswas.email=email;
                        siswas.password=password1;
                        //tampilkan pesan;
                        console.log('Update siswa berhasil');
                        errors.push({msg:'Update siswa berhasil'});  
                        //tampilkan halaman berdasarkan posisi file;
                        res.render('admins/editsiswa',{
                            title:'Update siswa berhasil',
                            siswas,
                            errors
                        });
                    }
                });

            }
        }
    });
});

//action semua naik kelas;
router.get('/ajaran/baru/naik/kelas',function(req,res,next){
    //cari semua akun siswa(semua);
    Siswas.find(function(err,siswas){
        if(siswas){
            //jika ada;

            //ambil nilainya secara spesifik;
            for (data of siswas){
                //cek kelasnya;
                if(data.angkatan=='X'){
                    //naik;
                    data.angkatan='XI';
                }else if(data.angkatan=='XI'){
                    //naik;
                    data.angkatan='XII';
                }else{
                    //Lulus;
                    data.angkatan='Lulus';
                }

                //dari idsiswa yang didapat, update kelasnya;
                Siswas.findByIdAndUpdate(data.id,{
                    angkatan:data.angkatan
                },function(err){
                    if(err){
                        //jika ada err;
                        console.log(err);
                    }else{
                        //berhasil;
                        console.log('berhasil');
                    }
                });

            }
            //lempar kehalaman kelola siswa;
            res.redirect('/admin/kelolaakun/siswa');
        }else{
            //jika tidak ada;
            //lempar kehalaman kelola siswa;
            res.redirect('/admin/kelolaakun/siswa');
        }
    });
});

//action hapus akun siswa;
router.get('/hapussiswa/:idsiswa',function(req,res,next){
    //dari params id siswa yg masuk, hapus akun siswa;
    Siswas.findByIdAndDelete(req.params.idsiswa,function(){
        //lempar kehalaman kelola akun siswa;
        console.log('hapus akun siswa berhasil');
        res.redirect('/admin/kelolaakun/siswa');
    });
});

//===========================Jadwal Mengajar====================
//halaman buat jadwal mengajar;
router.get('/buatjadwal/guru',function(req,res,next){
    //cek semua login admins;
    Logins.find({idusers:'admins'}).then(logins=>{
        if(logins.length==0){
            //jika tidak ada;
            res.redirect('/');
        }
    });

    //variabel penampung;
    let ListGurus=[];
    //cari semua data guru;
    Gurus.find(function(err,gurus){
        if(gurus){
            //jika ada;

            //ambil nilainya secara spesifik;
            for(data of gurus){
                ListGurus.push({
                    id:data.id,
                    nama:data.nama,
                    gelar:data.gelar,
                    nip:data.nip,
                    email:data.email
                });
            }

            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/buatjadwal',{
                title:'Buat jadwal baru',
                ListGurus
            });
        }else{
            //jika tidak ada;
            
            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/buatjadwal',{
                title:'Buat jadwal baru',
                ListGurus
            });
        }
    });

});

//action halaman buat jadwal mengajar;
router.post('/buatjadwal/guru',function(req,res,next){
    //cek nilai masuk;
    console.log(req.body);
    //masukan dalam variabel;
    const {hari,jam,guru,kelas,jurusan,lokal,mapel}=req.body;

    //variabel penampung;
    let errors=[];

    //jika kosong;
    if(!hari||!jam||!guru||!kelas||!jurusan||!lokal||!mapel){
        //tampilkan pesan errors;
        console.log('Lengkapi semua data jadwal mengajar');
        errors.push({msg:'Lengkapi semua data jadwal mengajar'});
    }

    //logika;
    if(errors.length>0){
        //jika ada errors;
        //tetap dihalaman buat jadwal ngajar;

        //variabel penampung;
        let ListGurus=[];

        //cari semua data guru;
        Gurus.find(function(err,gurus){
            if(gurus){
                //jika ada;

                //ambil nilainya secara spesifik;
                for(data of gurus){
                    ListGurus.push({
                        id:data.id,
                        nama:data.nama,
                        gelar:data.gelar,
                        nip:data.nip,
                        email:data.email
                    });
                }

                //tampilkan halaman berdasarkan posisi file;
                res.render('admins/buatjadwal',{
                    title:'Buat jadwal gagal',
                    ListGurus,
                    errors
                });
            }else{
                //jika tidak ada;
                
                //tampilkan halaman berdasarkan posisi file;
                res.render('admins/buatjadwal',{
                    title:'Buat jadwal gagal',
                    ListGurus,
                    errors
                });
            }
        });

    }else{
        //jika tidak ada errors;

        //simpan jadwal mengajar/mapel;
        const newMapels=Mapels({
            hari,
            jam,
            guru,
            kelas,
            jurusan,
            lokal,
            mapel
        });
        newMapels.save().then(mapels=>{
            //jika berhasil di simpan;
            //tetap dihalaman dan tampilkan pesan errorsnya;
            console.log('Jadwal '+guru+' berhasil dibuat');
            errors.push({msg:'Jadwal '+guru+' berhasil dibuat'});

            //variabel penampung;
            let ListGurus=[];

            //cari semua data guru;
            Gurus.find(function(err,gurus){
                if(gurus){
                    //jika ada;

                    //ambil nilainya secara spesifik;
                    for(data of gurus){
                        ListGurus.push({
                            id:data.id,
                            nama:data.nama,
                            gelar:data.gelar,
                            nip:data.nip,
                            email:data.email
                        });
                    }

                    //tampilkan halaman berdasarkan posisi file;
                    res.render('admins/buatjadwal',{
                        title:'Buat jadwal baru berhasil',
                        ListGurus,
                        errors
                    });
                }else{
                    //jika tidak ada;
                    
                    //tampilkan halaman berdasarkan posisi file;
                    res.render('admins/buatjadwal',{
                        title:'Buat jadwal baru berhasil',
                        ListGurus,
                        errors
                    });
                }
            });
        });

    }


});

//===========================Kelola Jadwal Mengajar====================
//halaman kelola jadwal;
router.get('/kelolajadwal/guru',function(req,res,next){
    //cek semua login admins;
    Logins.find({idusers:'admins'}).then(logins=>{
        if(logins.length==0){
            //jika tidak ada;
            res.redirect('/');
        }
    });
    
    //variabel penampung;
    let ListMapel=[];
    var no=0;
    //cari semua data jadwal ngajar;
    Mapels.find(function(err,mapels){
        if(mapels){
            //jika ada;

            //ambil nilainya secara spesifik;
            for(data of mapels){
                no=no+1;
                ListMapel.push({
                    id:data.id,
                    hari:data.hari,
                    jam:data.jam,
                    guru:data.guru,
                    kelas:data.kelas,
                    jurusan:data.jurusan,
                    lokal:data.lokal,
                    mapel:data.mapel,
                    no:no
                });
            }
            console.log(ListMapel);
            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/kelolajadwal',{
                title:'Kelola Jadwal',
                ListMapel
            });
        }else{
            //jika tidak ada;
            //tampilkan halaman berdasarkan posisi file;
            res.render('admins/kelolajadwal',{
                title:'Kelola Jadwal',
                ListMapel
            });
        }
    });

});

//halaman edit jadwal;
router.get('/editjadwal/:idjadwal',function(req,res,next){
    //dari parameter idjadwal, cari datanya;
    Mapels.findById(req.params.idjadwal,function(err,jadwal){
        if(jadwal){
            //jika ada;

            //variabel penampung;
            let ListGurus=[];
            //cari semua data guru;
            Gurus.find(function(err,gurus){
                if(gurus){
                    //jika ada;

                    //ambil nilainya secara spesifik;
                    for(data of gurus){
                        ListGurus.push({
                            id:data.id,
                            nama:data.nama,
                            gelar:data.gelar,
                            nip:data.nip,
                            hp:data.hp,
                            email:data.email,
                            password:data.password

                        });
                    }
                    //tampilkan halaman berdasarkan posisi file;
                    res.render('admins/editjadwal',{
                        title:'Edit jadwal',
                        jadwal,
                        ListGurus
                    });

                }else{
                    //jika tidak ada;

                    //tampilkan halaman berdasarkan posisi file;
                    res.render('admins/editjadwal',{
                        title:'Edit jadwal',
                        jadwal,
                        ListGurus
                    });
                }
            });

        }
    });
});

//action halaman edit jadwal;
router.post('/editjadwal/:idjadwal',function(req,res,next){
    //dari params id jadwal, dari datanya;
    Mapels.findById(req.params.idjadwal,function(err,jadwal){
        if(jadwal){
            //jika ada;

            //cek nilai masuk;
            console.log(req.body);
            //masukan dalam variabel;
            const {hari,jam,guru,kelas,jurusan,lokal,mapel}=req.body;

            //variabel penampung;
            let errors=[];

            //jika kosong;
            if(!hari||!jam||!guru||!kelas||!jurusan||!lokal||!mapel){
                console.log('Lengkapi semua data jadwal');
                errors.push({msg:'Lengkapi semua data jadwal'});
            }

            //logika;
            if(errors.length>0){
                //jika ada errors;

                //variabel penampung;
                let ListGurus=[];
                //cari semua data guru;
                Gurus.find(function(err,gurus){
                    if(gurus){
                        //jika ada;

                        //ambil nilainya secara spesifik;
                        for(data of gurus){
                            ListGurus.push({
                                id:data.id,
                                nama:data.nama,
                                gelar:data.gelar,
                                nip:data.nip,
                                hp:data.hp,
                                email:data.email,
                                password:data.password

                            });
                        }
                        //tampilkan halaman berdasarkan posisi file;
                        res.render('admins/editjadwal',{
                            title:'Edit jadwal',
                            jadwal,
                            ListGurus,
                            errors
                        });

                    }else{
                        //jika tidak ada;

                        //tampilkan halaman berdasarkan posisi file;
                        res.render('admins/editjadwal',{
                            title:'Edit jadwal',
                            jadwal,
                            ListGurus,
                            errors
                        });
                    }
                });
            }else{
                //jika tidak ada errors;
                //update;
                Mapels.findByIdAndUpdate(jadwal.id,{
                    hari,
                    jam,
                    guru,
                    kelas,
                    jurusan,
                    lokal,
                    mapel
                },function(err){
                    if(err){
                        //jika err;
                        console.log(err);
                    }else{
                        jadwal.hari=hari;
                        jadwal.jam=jam;
                        jadwal.guru=guru;
                        jadwal.kelas=kelas;
                        jadwal.jurusan=jurusan;
                        jadwal.lokal=lokal;
                        jadwal.mapel=mapel;
                        //tetap dihalaman dan tampilkan pesannya;
                        console.log('Update berhasil');
                        errors.push({msg:'Update berhasil'});
                        //variabel penampung;
                        let ListGurus=[];
                        //cari semua data guru;
                        Gurus.find(function(err,gurus){
                            if(gurus){
                                //jika ada;

                                //ambil nilainya secara spesifik;
                                for(data of gurus){
                                    ListGurus.push({
                                        id:data.id,
                                        nama:data.nama,
                                        gelar:data.gelar,
                                        nip:data.nip,
                                        hp:data.hp,
                                        email:data.email,
                                        password:data.password

                                    });
                                }
                                //tampilkan halaman berdasarkan posisi file;
                                res.render('admins/editjadwal',{
                                    title:'Edit jadwal',
                                    jadwal,
                                    ListGurus,
                                    errors
                                });

                            }else{
                                //jika tidak ada;

                                //tampilkan halaman berdasarkan posisi file;
                                res.render('admins/editjadwal',{
                                    title:'Edit jadwal',
                                    jadwal,
                                    ListGurus,
                                    errors
                                });
                            }
                        });
                    }
                });
            }

        }
    });
});

//action hapus jadwal;
router.get('/hapusjadwal/:idjadwal',function(req,res,next){
    //dari parameter idjadwal, hapus datanya;

    Mapels.findByIdAndDelete(req.params.idjadwal,function(){
        //lempar kehalaman kelola jadwal mengajar;
        console.log('jadwal berhasil di hapus');
        res.redirect('/admin/kelolajadwal/guru');
    });
});

//============================Logout===================================
//action logout;
router.get('/logout',function(req,res,next){
    //dari semua login admins;
    Logins.find({idusers:'admins'}).then(login=>{
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
