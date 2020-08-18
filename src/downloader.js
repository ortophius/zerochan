
const loader = require('./modules/Loader');
const storage = require('./modules/Storage');
const parser = new DOMParser();
const zerochan = 'https://www.zerochan.net';

chrome.storage.onChanged.addListener(function(changes, area) {
    if (area !== 'local') return;
    if (changes.downloading) {
        if (changes.downloading) {
            chrome.downloads.setShelfEnabled(false);
            download();
        }
        else chrome.downloads.setShelfEnabled(false);
    };
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

async function download() {
    
    const tagName = await storage.getProp('currentTag');
    const tagObj = await storage.getProp(tagName);

    if (!tagObj) return;

    const imageLink = await loader.getImageLink(tagObj.links[0]);

    const opts = {};
    opts.url = imageLink;
    opts.conflictAction = chrome.downloads.FilenameConflictAction.UNIQUFY;

    chrome.downloads.download(opts, function(id) {
        addDownloadListener(id, tagName);
    });

    return;
}

function addDownloadListener(id, tagName) {
    
    chrome.downloads.onChanged.addListener(async function (delta) {

        const d = await storage.getProp('downloading');
        
        const tagObj = await storage.getProp(tagName);
        if (!tagObj) {
            await storage.setProp('downloading', false);
            return;
        }

        if (delta.id !== id) return;
        if (!delta.state) return;
        if (delta.state.current === 'in_progress') return;

        if ((delta.state.current === 'complete') || (delta.error && delta.error.current === 'SERVER_BAD_CONTENT')) {

            await rotateLinks(tagObj);
            if (d) download();
            chrome.downloads.erase({id: id});
            return;
        }

        if (delta.state.current === 'interrupted') {
            await storage.setProp('downloading', false);
            return;
        }
    })
}

async function rotateLinks(tagObj) {

    tagObj.downloaded++;
    tagObj.links.splice(0, 1);

    if (tagObj.links.length === 0 && !tagObj.next) {
        await storage.setProp('downloading', false);
        await storage.removeProp(tagObj.tag);
    }

    if (tagObj.links.length === 0 && tagObj.next) {
        await fetchTagPage(tagObj.next, tagObj.tag);
    }

    if (tagObj.links.length > 0) await storage.setProp(tagObj.tag, tagObj);
    return;
}

async function fetchTagPage(url, tagName) {

    const oldTagObj = await storage.getProp(tagName);
    const newTagObj = await loader.loadXML(url);

    newTagObj.downloaded = (oldTagObj && oldTagObj.downloaded) ? oldTagObj.downloaded : 0;

    await storage.setProp(tagName, newTagObj);

    return;
}