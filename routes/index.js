var express = require('express');
var router = express.Router();

// halaman index
router.get('/', function(req, res, next) {
  //tampilkan halaman berdasarkan posisi file;
  res.render('indexs/index', { 
    title: 'E-Learning SMA ADHYAKSA 1 JAMBI'
  });
});


module.exports = router;
