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
    makeCitations(res, req.query.page);
  }
});

function makeCitations(res, page) {
  page = page.replace(/['"]+/g, '');
  console.log("FAKE PAGE: " + page);
  getCitations(page)
      .then((response) => {
        console.log("FINISHED REF");
        res.send(response)
      })
      .catch((err) => {
        console.error("ERROR FETCHING ROOT REFS NAME");
        console.error("Status code: " + err.status);
        console.error(err.statusText);
        res.send(err);
      });
}

function getCitations(page) {
  console.log("REF PAGE: " + page);
  return new Promise(function (resolve, reject){
    let xhr  = new XMLHttpRequest();
    xhr.onload = function(e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else if (xhr.status === 302) {
          console.log("REDIRECT")
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText
          });
        }
      }
    };
    xhr.onerror = function() {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };
    xhr.open("GET", "https://en.wikipedia.org/api/rest_v1/page/references/" + page, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Api-User-Agent", "khroberts@wpi.edu");
    xhr.send();
  })
}

function makeSimTree(res, page) {
  let simPages = {
    "displaytitle": page.replace(/_/g, ' '),
    "title": page,
    "children": [

    ]
  };
  getThreeSim(page)
      .then(async (simResponse) => {
        simPages.children = JSON.parse(simResponse)["pages"];
        let finalArray = simPages.children.map(async (t) => {
          try {
            const simResult = await getThreeSim(t.title);
            t["children"] = JSON.parse(simResult)["pages"];
            const rawResult = await getCitations(t.title);
            const refResult = JSON.parse(rawResult);
            let numCitations = 0;
            if (refResult.reference_lists.length > 0) {
              numCitations = refResult.reference_lists[0].order.length;
            }
            const leafVal = numCitations / LIMIT;
            console.log("Leaf val: " + leafVal);
            t.children.forEach((child) => {
              child["leafVal"] = leafVal;
            });

            return simResult;
          } catch (err) {
            console.error("ERROR GETTING CHILD INFO");
            console.error("Status code: " + err.status);
            console.error(err.statusText)
          }
        });
        // needed so that response is not sent until each iteration of loop has completed and received response
        const resolvedFinalArray = await Promise.all(finalArray);

        console.log("FINISHED SIM");
        res.send(simPages);
      })
      .catch((err) => {
        console.error("ERROR FETCHING ROOT RELATED");
        console.error("Status code: " + err.status);
        console.error(err.statusText);
        res.send(err);
      });
}

function getThreeSim(page) {
  return new Promise(function (resolve, reject){
    let xhr  = new XMLHttpRequest();
    xhr.onload = function(e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let relatedPages = JSON.parse(xhr.responseText);
          relatedPages.pages = relatedPages.pages.slice(1,LIMIT+1);
          resolve(JSON.stringify(relatedPages));
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText
          });
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
