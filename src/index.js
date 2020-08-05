const router = require('./modules/Router');
const search = require('./modules/Search');
const browser = require('./modules/Browser');
const searchInput = document.getElementById('search');
const loader = require('./modules/Loader');
const storage = require('./modules/Storage');

router.switch('loader');

storage
    .getProp('downloading')
    .then(function(d){
        if (d) {
            storage
                .getProp('currentTag')
                .then(tagToUrl)
                .then(loadXML)
                .then(dispatch);
        }
 
        else {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                let url = tabs[0].url;

                if (url.search(/\/www\.zerochan\.net\//) === -1)
                    router.switch('search');
                
                else {
                    url = url
                        .replace(/\?p=\d+/, '')
                        .replace('full/', '')
                        .replace('#full', '');

                    loader
                        .loadXML(url)
                        .then(dispatch);
                }
            })
        }
    });

function tagToUrl(tag) {
    return Promise.resolve(encodeURI(tag));
}

function dispatch(res) {
    if (!res) {
        router.switch('search');
        return;
    }

    if (!res.tagPage) {
        loader
            .loadXML(res.tagUrl)
            .then(dispatch);
        return;
    }

    browser.displayTagInfo(res);
    return Promise.resolve();
}
