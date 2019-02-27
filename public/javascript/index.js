init = () => {
    document.getElementById("findSimilar").addEventListener("click", usrFindSimilar, true);
};

function userInput(){
    const usrPage = document.getElementById("pageTitle").value;
    let page = "Volcano";
    if (usrPage) {
        page = usrPage.charAt(0).toUpperCase() + usrPage.slice(1);
        page = page.replace(/ /g, '_')
    }
    return page;
}

//TODO: Timeline only shows refs with href, but there are citations without them. Need to include all.
//TODO: Timeline shows two entries for same ref if there are two hrefs inside
//TODO: Address user specified page doesn't exist

usrFindSimilar = () => {
    const page = userInput();
    newTreeMap(page);
};

const NR_CHARS_PER_LINE = 7;
function findSimilar(page) {

    return new Promise(function (resolve, reject) {
        let queryStr = "?page=" + page;
        let xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var index = 0;
                    findReferences(page)
                        .then((info) => {
                            //addEntriesToTimeline(info);
                            let timeline = document.getElementById("timeline");
                            timeline.innerHTML = "";
                            console.log("update timeline?");
                            var data = JSON.parse(info);
                            //console.log(data);
                            var orderList = data.reference_lists[0].order; // this is the list with the identifiers
                            var references = data.references_by_id; // the references
                            for (var i = 0; i < orderList.length; i++) {
                                var htmlData = references[orderList[i]].content.html;
                                var links = htmlData.match(/"http(.*?)"/g);

                                if (links !== null) {
                                    let even = index % 2 === 0;
                                    var citations = "";
                                    for (var j = 0; j < links.length; j++) {
                                        var l = "";
                                        var lNew = "";
                                        //var l = links[j].replace(/['"]+/g, '').substr(5); // when there is the href= at the beginning
                                        // we have to make the links to be shorter than some amount of letters
                                        l = links[j].replace(/['"]+/g, '');
                                        /*console.log(l);
                                        var lSize = l.length;
                                        var numberOfLines = lSize / NR_CHARS_PER_LINE;
                                        var smallerLine = lSize % NR_CHARS_PER_LINE;

                                        var lNew = "";
                                        for (var k = 0; k < numberOfLines - 1; k++) {
                                            lNew += l.substr(k * NR_CHARS_PER_LINE, (k+1) * NR_CHARS_PER_LINE) + " <br>";
                                        }
                                        // add the smallest line
                                        lNew += l.substr((numberOfLines-1) * NR_CHARS_PER_LINE);

                                        lNew = "<a href=" + l + ">" + lNew + "</a>";
                                        //var time = 2019; */
                                        console.log(l);
                                        lNew = l;
                                        var whereToCut = 7;
                                        if (l.indexOf("https") === 0) {
                                            whereToCut = 8;

                                        }
                                        lNew = lNew.substr(8);
                                        console.log(lNew);
                                        console.log(lNew.indexOf("/"))
                                        lNew = lNew.substr(0, lNew.indexOf("/"));
                                        console.log(lNew);
                                        lNew = "<a href=" + l + ">" + lNew + "</a>";
                                        console.log(lNew);
                                        console.log("------------");
                                        citations += lNew + " <br> <br>";
                                    }
                                    timeline.innerHTML +=
                                        `<div class="${even ? 'container right' : 'container left'}">
                                          <div class="content">
                                            <h2>${index+1}</h2>
                                            <p>${citations}</p>
                                          </div>
                                      
                                       </div>`;
                                    index++;
                                }
                            }
                        })
                        .catch((err) => {
                            console.error("Status code: " + err.status);
                            console.error(err.statusText);
                        });
                    resolve(xhr.responseText);
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                    console.error(xhr.statusText);
                }
            }
        };
        xhr.open("GET", "/similar" + queryStr);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send();
    })
}

function findReferences(page) {
    return new Promise(function (resolve, reject) {
        let queryStr = "?page=" + page;
        let xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                    console.error(xhr.statusText);
                }
            }
        };
        xhr.open("GET", "/refs" + queryStr);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send();
    })
}

/*
* TAKEN FROM: https://blog.centerkey.com/2013/05/javascript-colorized-pretty-print-json.html
 */
const prettyPrintJson = {
    toHtml: function(obj) {
        function replacer(match, pIndent, pKey, pVal, pEnd) {
            const key =  '<span class=json-key>';
            const val =  '<span class=json-value>';
            const bool = '<span class=json-boolean>';
            const str =  '<span class=json-string>';
            const isBool = ['true', 'false'].includes(pVal);
            const pValSpan = /^"/.test(pVal) ? str : isBool ? bool : val;
            let r = pIndent || '';
            if (pKey)
                r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
            if (pVal)
                r = r + pValSpan + pVal + '</span>';
            return r + (pEnd || '');
        }
        const jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
        return JSON.stringify(obj, null, 3)
            .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(jsonLine, replacer);
    }
};
