let tag;
let firstImage = false;
let downloading = false;
const storage = require('./modules/Storage');
const parser = new DOMParser();
const zerochan = 'https://www.zerochan.net';

chrome.runtime.onMessage.addListener(
    function(q) {
        if (q.query != 'start') return;
        tag = q.tagName;
        storage.setProp('currentTag', tag).then(
            function() {
                storage.getProp(tag).then(start);
            }
        )
    }
)