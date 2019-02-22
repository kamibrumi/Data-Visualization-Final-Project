const express = require('express');
const router = express.Router();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const API_KEY = "655ebfb5fd6756447fdfcb2748a8de06";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/similar', function(req, res, next) {
  let artist = "rick astley";
  let track = "never gonna give you up";
  if(req.query && req.query.artist && req.query.track){
    artist = req.query.artist;
    track = req.query.track;
  }
  let xhr  = new XMLHttpRequest();
  xhr.onload = function(e) {
    console.log(xhr.responseText);
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        res.send(xhr.responseText)
      } else {
        console.error(xhr.statusText)
      }
    }
  };
  xhr.open("GET", "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=" + artist + "&track=" + track + "&api_key="  + API_KEY + "&format=json", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.send()
});

module.exports = router;
