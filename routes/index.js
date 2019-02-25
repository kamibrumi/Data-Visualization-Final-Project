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
  makeSimTree(res, artist, track)
});

function makeSimTree(res, artist, track) {
  let simTracks = {
    "track": [

    ]
  };
  getThreeSim(artist, track)
      .then(async (response) => {
        simTracks.track = JSON.parse(response).similartracks.track;

        let finalArray = simTracks.track.map(async(t) => {
          const result = await getThreeSim(t.artist.name, t.name);
          t["children"] = JSON.parse(result);
          return result;
        });
        // needed so that response is not sent until each iteration of loop has completed and received response
        const resolvedFinalArray = await Promise.all(finalArray);
        res.send(simTracks);
      })
      .catch((err) => {
        console.error(err.statusText);
      });
}

function getThreeSim(artist, track) {
  return new Promise(function (resolve, reject){
    let xhr  = new XMLHttpRequest();
    xhr.onload = function(e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
          console.error(xhr.statusText)
        }
      }
    };
    xhr.onerror = function() {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.open("GET", "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=" + artist + "&track=" + track + "&api_key="  + API_KEY + "&limit=3" + "&format=json", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
  })
}

module.exports = router;
