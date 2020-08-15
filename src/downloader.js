
const loader = require('./modules/Loader');
const storage = require('./modules/Storage');
const parser = new DOMParser();
const zerochan = 'https://www.zerochan.net';

chrome.runtime.onMessage.addListener(
    function(q) {
        if (q.query != 'start') return;

        storage.setProp('currentTag', q.tag).then(function(){
            storage.getProp(q.tagInfo.tag).then(function(tagObj) {
                if (!tagObj) {
                    console.log(q.tagInfo);
                    loader.loadXML(q.tagInfo.tagUrl).then(function(newTagObj) {
                    tagInfo.count = newTagObj.getImagesCount();
                    storage
                        .setProps({[tag]: newTagObj, currentTag: q.tagInfo.tag, firstImage: true, downloading: true})
                        .then(download);
                    });
                }
                else {
                    storage
                        .setProps({currentTag: q.tagInfo.tag, firstImage: true, downloading: true})
                        .then(download);
                };
            })
        });
    }
);

function start (tagObj, tag) {
    // if (!tagObj) {
    //     const url = loader.urlFromTag(tag);
    //     loader.loadXML(url).then(function(tagInfo) {
    //         tagInfo.count = tagInfo.getImagesCount();
    //         storage
    //             .setProps({[tag]: tagInfo, currentTag: tag, downloading: true})
    //             .then(download);
    //     });
    // }
    // else {
    //     storage
    //         .setProps({currentTag: tag, downloading: true})
    //         .then(download);
    // };
}

function download() {
    storage
        .getProp('currentTag')
        .then(console.log)
}