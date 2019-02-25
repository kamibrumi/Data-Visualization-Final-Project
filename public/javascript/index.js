init = () => {
  document.getElementById("findSimilar").addEventListener("click", usrFindSimilar, true);
};

usrFindSimilar = () => {
    const usrArtist = document.getElementById("artistInput").value;
    const usrTrack = document.getElementById("trackInput").value;
    let artist = "Amon Amarth";
    let track = "Annihilation of Hammerfest";
    if (usrArtist && usrTrack) {
        artist = usrArtist;
        track = usrTrack;
    }
    findSimilar(artist, track)
};

findSimilar = (artist, track) => {
    let queryStr = "";
    queryStr = "?artist=" + artist + "&track=" + track;
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", getSimilar);
    xhr.open("GET", "/similar" + queryStr);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send()
};

function getSimilar() {
    const response = this.responseText;
    document.getElementById("similarSongs").innerHTML = prettyPrintJson.toHtml(JSON.parse(this.responseText));
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