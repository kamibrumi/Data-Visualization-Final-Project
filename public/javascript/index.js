init = () => {
  document.getElementById("findSimilar").addEventListener("click", usrFindSimilar, true);
};

function userInput(){
    const usrArtist = document.getElementById("artistInput").value;
    const usrTrack = document.getElementById("trackInput").value;
    let artist = "Amon Amarth";
    let track = "Annihilation of Hammerfest";
    if (usrArtist && usrTrack) {
        artist = usrArtist;
        track = usrTrack;
    }

    return {
        "artist": artist,
        "track": track
    }
}

usrFindSimilar = () => {
    const info = userInput();
    newTreeMap(info.artist, info.track)
};

function findSimilar(artist, track) {
    return new Promise(function (resolve, reject) {
        let queryStr = "";
        queryStr = "?artist=" + artist + "&track=" + track;
        let xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                    console.error(xhr.statusText);
                }
            }
            //drawTreeMap(JSON.parse(xhr.responseText));
            //document.getElementById("similarSongs").innerHTML = prettyPrintJson.toHtml(JSON.parse(xhr.responseText));
        };
        xhr.open("GET", "/similar" + queryStr);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send()
    });
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
