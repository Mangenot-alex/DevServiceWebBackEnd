var express = require('express');
var router = express.Router();


//Error: No default engine was specified and no extension was provided.
//at res.render
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/test', function(req, res, next) {
  res.send('Welcome to the index test page');
});

module.exports = router;
