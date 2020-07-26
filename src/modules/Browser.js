const router = require('./Router');
console.log(router);

class Browser {
    constructor(){
        const _ = this;
        this.thumb = document.getElementById('thumb')
        this.tagElem = document.getElementById('tag-name')
        this.countElem = document.getElementById('images-count')
        this.backButton = document.getElementById('to-search');

        this.backButton.onclick = function(e) {
            e.preventDefault();
            router.switch('search');
        }

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            const tab = _.tab = tabs[0];
            const zerochan = tab.url.search(/https:\/\/www\.zerochan\.net\//);
            
            if(zerochan !== 0) return;

            chrome.tabs.sendMessage(tab.id, {query: 'isOnTagPage'}, _.isOnTagPageHandler.bind(_));
        })
    }

    onDisplay(){
        this.isOnTagPageHandler();
    }

    isOnTagPageHandler(response) {
        if (response === false) return;
        this.setTag(response);
        this.showTagInfo();
    }

    getPage(url) {
        const _ = this;
        return new Promise(function(resolve, reject){
            $.ajax({
                url,
                type: 'GET',
                context: _,
                success: resolve,
            })
        });
    }

    showTagInfo(){
        this.getPage(this.tagUrl)
            .then(this.fetchTagInfo.bind(this))
            .then(function(){ router.switch('browse') });
    }

    setTag(tag){
        this.tagUrl = 'https://www.zerochan.net/'+encodeURI(tag);
        this.tag = tag;
    }

    fetchTagInfo(htmlString){
        const _ = this;
        return new Promise(function(resolve){
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            console.log(doc);
            _.count = doc.querySelector('#parents-listing').childNodes[0].data.split(' ')[0];
            _.thumb.setAttribute('src', doc.querySelector('#thumbs2 li img').getAttribute('src'));
            _.tagElem.innerHTML = _.tag;
            _.countElem.innerHTML = _.count;
            resolve();
        });
    }
}

const browser = new Browser();

module.exports = browser;