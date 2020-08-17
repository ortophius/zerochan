
const loader = require('./modules/Loader');
const storage = require('./modules/Storage');
const parser = new DOMParser();
const zerochan = 'https://www.zerochan.net';

chrome.storage.onChanged.addListener(function(changes, area) {
    if (area !== 'local') return;
    if (changes.downloading && changes.downloading.newValue) download();
});

chrome.runtime.onMessage.addListener(
    function(q) {
        if (q.query != 'start') return;

        storage.setProp('currentTag', q.tag).then(function(){
            storage.getProp(q.tagInfo.tag).then(function(tagObj) {
                if (!tagObj) {
                    fetchTagPage(q.tagInfo.tagUrl, q.tagInfo.tag)
                    .then(function() {
                        storage.setProps({
                            currentTag: q.tagInfo.tag,
                            firstImage: true,
                            downloading: true
                        });
                    });
                }
                else {
                    storage.setProps({
                        currentTag: q.tagInfo.tag,
                        firstImage: true,
                        downloading: true
                    });
                };
            })
        });
    }
);

function download() {
    storage
    .getProps(['currentTag', 'firstImage'])
    .then(function(r) {
        storage.getProp(r.currentTag).then(function(tagObj) {
            if (!tagObj) return;
            loader
            .getImageLink(tagObj.links[0])
            .then(function(imageLink) {
                const opts = {};
                opts.url = imageLink;
                opts.conflictAction = chrome.downloads.FilenameConflictAction.UNIQUFY;
                // opts.saveAs = (r.firstImage) ? true : false;
                chrome.downloads.download(opts, function(id) {
                    addDownloadListener(id, r.currentTag);
                });
            });
        });
    });
}

function addDownloadListener(id, tagName) {
    chrome.downloads.onChanged.addListener(function (delta) {
        if(delta.id !== id) return;

        if (delta.url) {
            console.log(delta.url);
        }
        
        if (delta.state) {
            if (delta.state.current == 'complete') {
                storage
                .getProp('downloading')
                .then(function(d) {
                    if (!d) storage.setProp('downloading', false);
                    else {
                        storage
                        .getProp(tagName)
                        .then(function(tagObj) {
                            tagObj.links.splice(0, 1);
                            if (tagObj.links.length === 0 && !tagObj.next) {
                                storage.setProp('downloading', false);
                                storage.removeProp(tagObj.tag);
                                return
                            }
                            
                            if (tagObj.links.lenth === 0 && tagObj.next) {
                                fetchTagPage(tagObj.next, tagName)
                                .then(download);
                                return;
                            }
                            tagObj.downloaded++;
                            storage
                            .setProps({[tagName]: tagObj, firstImage: false})
                            .then(download);
                        });
                    }
                });
            };
        
            if (delta.state.current == 'interrupted') {
                storage.setProp('downloading', false);
            };
        }
    });
}

function fetchTagPage(url, tagName) {
    return new Promise(function(resolve) {
        loader
        .loadXML(url)
        .then(function(newTagObj) {
            if (!newTagObj) {
                resolve();
                return;
            }

            storage
            .getNestedProp(tagName, 'downloaded')
            .then(function(downloaded) {
                newTagObj.downloaded = (downloaded) ? downloaded : 0;
                newTagObj.count = newTagObj.count;
                storage.setProps({
                    [tagName]: newTagObj,
                })
            })
            .then(resolve);
        })
    });
}