const express = require('express');
const router = express.Router();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const LIMIT = 5;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/similar', function(req, res, next) {
  console.log("IM IN DA SURVUR");
  if(req.query && req.query.page) {
    makeSimTree(res, req.query.page)
  }
});

router.get('/refs', function(req, res, next) {
  if(req.query && req.query.page) {
    getCitations(req.query.page, res);
  }
});

function getCitations(page, res) {
  let xhr = new XMLHttpRequest();
  xhr.onload = function(e) {
    res.send(xhr.responseText);
  };
  xhr.onerror = function() {
    reject({
      status: this.status,
      statusText: xhr.statusText
    })
  };
  xhr.open("GET", "https://en.wikipedia.org/api/rest_v1/page/references/" + page, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Api-User-Agent", "khroberts@wpi.edu");
  xhr.send();
}

function makeSimTree(res, page) {
  let simPages = {
    "title": page,
    "children": [

    ]
  };
  getThreeSim(page)
      .then(async (response) => {
        console.log("RESPONDED");
        simPages.children = JSON.parse(response)["pages"];
        let finalArray = simPages.children.map(async(t) => {
          const result = await getThreeSim(t.title);
          t["children"] = JSON.parse(result)["pages"];
          delete t.pageid;
          return result;
        });
        // needed so that response is not sent until each iteration of loop has completed and received response
        const resolvedFinalArray = await Promise.all(finalArray);
        console.log("FINISHED");
        res.send(simPages);
      })
      .catch((err) => {
        console.error(err.statusText);
      });
}

function getThreeSim(page) {
  return new Promise(function (resolve, reject){
    console.log("GETTING SIM");
    let xhr  = new XMLHttpRequest();
    xhr.onload = function(e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log("RETURN SIM");
          let relatedPages = JSON.parse(xhr.responseText);
          relatedPages.pages = relatedPages.pages.slice(1,6);
          resolve(JSON.stringify(relatedPages));
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText
          });
          console.error(xhr.statusText)
        }
      }
    };
    xhr.onerror = function() {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };
    xhr.open("GET", "https://en.wikipedia.org/api/rest_v1/page/related/" + page, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Api-User-Agent", "khroberts@wpi.edu");
    xhr.send();
  })
}

module.exports = router;
