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

//TODO: Timeline only shows refs with href, but there are citations without them. Need to include all.
//TODO: Timeline shows two entries for same ref if there are two hrefs inside
//TODO: Address user specified page doesn't exist

usrFindSimilar = () => {
    const page = userInput();
    newTreeMap(page);
};

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
                        console.log("update timeline?");
                        var data = info;
                        //console.log(data);
                        var orderList = data.reference_lists[0].order; // this is the list with the identifiers
                        var references = data.references_by_id; // the references
                        for (var i = 0; i < orderList.length; i++) {
                            var htmlData = references[orderList[i]].content.html;
                            var links = htmlData.match(/href="(.*?)"/g);

                            if (links !== null) {
                                let even = index % 2 === 0;
                                var citations = "";
                                for (var j = 0; j < links.length; j++) {
                                    var l = links[j].replace(/['"]+/g, '').substr(5);
                                    var time = 2019;
                                    if (!l.includes("TemplateStyles")) {
                                        citations += l + " <br> <br>";
                                    }
                                }
                                timeline.innerHTML +=
                                    `<div class="${even ? 'container right' : 'container left'}">
                      <div class="content">
                        <h2>${index + 1}</h2>
                        <p>${citations}</p>
                      </div>
                  
                   </div>`;
                                index++;
                            }
                        }
                    }
                    else {
                        const error = info;
                        console.error("Status code: " + error.status);
                        console.error(error.statusText);
                        alert("Invalid Page Name")
                    }
                    resolve(xhr.responseText);
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
