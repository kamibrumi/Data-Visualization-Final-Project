init = () => {
    document.getElementById("findSimilar").addEventListener("click", usrFindSimilar, true);
    window.addEventListener("keydown", keyPressHandler, true);
};

function keyPressHandler (e) {
    switch(e.key){
        case "Enter":
            usrFindSimilar();
    }
}

function userInput(){
    const usrPage = document.getElementById("pageTitle").value;
    let page = "Volcano";
    if (usrPage) {
        page = usrPage.charAt(0).toUpperCase() + usrPage.slice(1);
        page = page.replace(/ /g, '_')
    }
    return page;
}

usrFindSimilar = () => {
    const page = userInput();
    newTreeMap(page);
};

const NR_CHARS_PER_LINE = 7;
function findSimilar(page) {

    return new Promise(function (resolve, reject) {
        let queryStr = "?page=" + page;
        let xhr = new XMLHttpRequest();
        xhr.onload = async () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 && JSON.parse(xhr.responseText).displaytitle) {
                    var index = 0;

                    const info = JSON.parse(await findReferences(page));
                    if (info.reference_lists) {
                        console.log("REFS PAGE" + page);
                        //addEntriesToTimeline(info);
                        let timeline = document.getElementById("timeline");
                        timeline.innerHTML = "";
                        let titleEl = document.createElement("h1");
                        titleEl.style.color = "white";
                        var data = info;
                        //console.log(data);
                        if (data.reference_lists.length > 0 && data.reference_lists[data.reference_lists.length-1].order) {
                            titleEl.innerText = "Linked References for " + JSON.parse(xhr.responseText).displaytitle;
                            timeline.appendChild(titleEl);
                            var orderList = data.reference_lists[data.reference_lists.length - 1].order; // this is the list with the identifiers

                            var references = data.references_by_id; // the references
                            for (var i = 0; i < orderList.length; i++) {
                                var htmlData = references[orderList[i]].content.html;
                                const urlTail = references[orderList[i]].back_links[0].href.substr(1);
                                console.log("TAIL: " + urlTail);
                                const wikiURL = "https://en.wikipedia.org/wiki" + urlTail;

                                var links = htmlData.match(/"http(.*?)"/g);
                                console.log("Thinking: " + orderList);
                                if (links !== null) {
                                    let even = index % 2 === 0;
                                    var citations = "";

                                    for (var j = 0; j < links.length; j++) {

                                        var l = "";
                                        var lNew = "";
                                        l = links[j].replace(/['"]+/g, '');
                                        console.log(l);
                                        lNew = l;
                                        var whereToCut = 7;
                                        if (l.indexOf("https") === 0) {
                                            whereToCut = 8;

                                        }
                                        lNew = lNew.substr(8);
                                        lNew = lNew.substr(0, lNew.indexOf("/"));
                                        lNew = "<a href=" + l + " target=\"_blank\">" + lNew + "</a>";
                                        citations += lNew + " <br> <br>";
                                    }
                                    timeline.innerHTML +=
                                        `<div class="${even ? 'container right' : 'container left'}">
                                          <div class="content">
                                            <h2>${index + 1}</h2>
                                            <p>${citations}</p>
                                            <form action="${wikiURL}" method="get" target="_blank"><button type="submit"> See Reference in Context</button> </form>
                                          </div>
                                       </div>`;
                                    index++;
                                }
                            }
                        } else {
                            titleEl.innerText = "No Linked References for " + JSON.parse(xhr.responseText).displaytitle;
                            timeline.appendChild(titleEl);

                        }
                        resolve(xhr.responseText);
                    }
                    else {
                        const error = info;
                        console.error("Status code: " + error.status);
                        console.error(error.statusText);
                        alert("Invalid Page Name")
                    }
                } else {
                    const error = JSON.parse(xhr.responseText);
                    alert("Invalid Page Name");
                    reject({
                        status: error.status,
                        statusText: error.statusText
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

function findHTML(page) {
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
        xhr.open("GET", "/html" + queryStr);
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
