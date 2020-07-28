let tag;
let firstImage = false;
let downloading = false;
const parser = new DOMParser();
const zerochan = 'https://www.zerochan.net';

chrome.runtime.onInstalled.addListener(function(){
    chrome.storage.local.set({cfg: {}});
});

chrome.runtime.onMessage.addListener(
    function(q) {
        if (q.query != 'start') return;
        tag = q.tagName;
        chrome.storage.local.get([tag], start);
    }
)

chrome.runtime.onMessage.addListener(
    function(q, sender, cb) {
        if (q.query != 'checkStatus') return;
        cb({tag, downloading});
    }
);

chrome.runtime.onMessage.addListener(
    function(q) {
        if (q.query != 'stop') return;
        downloading = false;
    }
)

function setTagProp(key, value) {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get(tag, function(o) {
            if (o[tag] !== undefined) o = o[tag];
            o[key] = value;
            chrome.storage.local.set({[tag]: o}, resolve);
        });
    });
}

function start(tagInfo) {
    const tagObj = tagInfo[tag];
    downloading = true;
    if (tagObj === undefined || tagObj.next === undefined) {
        firstImage = true;
        getFirstPage(tag)
        .then(load)
        .then(getLinks)
        .then(downloadImage)
    }
    else next();
}

function getFirstPage(tagName) {
    return new Promise(function(resolve) {
        load(zerochan+'/'+tagName)
        .then(function(html) {
        const doc = parser.parseFromString(html, 'text/html');
        const a = doc.querySelector('#thumbs2 a');
        const link = zerochan + a.getAttribute('href');
        resolve(link);
        });
    });
}

function getLinks(html) {
    return new Promise(function(resolve, reject) {
        let doc = parser.parseFromString(html, 'text/html');
        let next =
            doc.querySelector('.active ~ li a') 
            || doc.querySelector('a[rel="next"]');
        if (next !== null) next = next.getAttribute('href');

        let current = 
            doc.querySelector('a.preview') 
            || doc.querySelector('#large img');

        current = (current.tagName === 'A') ?
            current.getAttribute('href')
            : current.getAttribute('src');

        setTagProp('next', next).then(function() { resolve(current) });
    });
}


function downloadImage(link) {
    const opts = {};
    opts.url = link;
    opts.conflictAction = chrome.downloads.FilenameConflictAction.UNIQUIFY;
    if (firstImage) {
        opts.saveAs = true;
        firstImage = false;
    }
    chrome.downloads.download(opts, function(id) {
        chrome.downloads.onChanged.addListener(function(e) {
            console.log(0);
            if (e.id !== id || e.state === undefined) return;
            console.log(1);
            if (e.state.current === 'interrupted') return;
            if (e.state.current === 'complete') next();
        });
    });
}

function next() {
    chrome.storage.local.get(tag, function(o){
        o = o[tag];
        if (!downloading 
            || o === undefined
            || o.next === undefined
            || o.next === null) 
            return;
        load(zerochan + o.next)
        .then(getLinks)
        .then(downloadImage)
    });
}

function load(url, context) {
    const _ = this;
    return new Promise(function(resolve, reject){
        $.ajax({
            type: 'GET',
            context: (context !== undefined) ? context : _,
            url,
            success: resolve,
        });
    });
}