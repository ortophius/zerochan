const router = require('./Router');
const storage = require('./Storage');
const loader = require('./Loader');

class Browser {
    constructor() {
        const _ = this;
        this.thumb = document.getElementById('thumb')
        this.tagName = document.getElementById('tag-name')
        this.countElem = document.getElementById('images-count')
        this.backButton = document.getElementById('to-search');
        this.startButton = document.getElementById('start');
        this.stopButton = document.getElementById('stop');
        
        this.progress = document.getElementById('progress');
        this.currentCount = document.getElementById('current-count');
        this.totalCount = document.getElementById('total-count');
        this.progressBar = document.getElementById('progress-bar');
        this.bar = document.getElementById('bar');
        this.status = document.getElementById('status');
        this.clearButton = document.getElementById('clear');
        this.setupListeners();
    }

    setupListeners() {
        const _ = this;

        this.backButton.onclick = function(e) {
            e.preventDefault();
            router.switch('search');
        }

        this.startButton.onclick = function(e) {
            e.preventDefault();
            chrome.runtime.sendMessage({query: 'start', tagInfo: _.tagInfo});
            _.startButton.classList.add('invisible');
            _.backButton.classList.add('invisible');
        }

        this.stopButton.onclick = function(e) {
            e.preventDefault();
            _.startButton.classList.remove('invisible');
            _.clearButton.classList.remove('invisible');
            _.stopButton.classList.add('invisible');
            storage.setProp('downloading', false);
        }

        this.clearButton.onclick = function(e) {
            e.preventDefault();
            storage.removeProp(_.tagInfo.tag);
        }

        chrome.storage.local.onChanged.addListener(function(delta) {
            const tag = _.tagInfo.tag;
            if (delta[tag] && !delta[tag].newValue) _.clear();
            if (delta[tag] && delta[tag].newValue) _.updateProgress(delta[tag].newValue);
            if (delta.downloading && delta.downloading.newValue) _.showProgress(tag);
        });
    }

    clear() {
        this.backButton.classList.remove('invisible');
        this.progress.classList.add('invisible');
        this.stopButton.classList.add('invisible');
        this.clearButton.classList.add('invisible');
        this.startButton.classList.remove('invisible');
        this.bar.style.width = '0%';
    }

    displayTagInfo(info) {
        const _ = this;
        _.tagInfo = info;
        _.clear();
        router.switch('loader');
        
        if (!info) {
            router.switch('search');
            return;
        }

        if (typeof info === 'string') {
            loader
                .loadXML(loader.urlFromTag(info))
                .then(this.displayTagInfo.bind(_));
            return;
        }

        if (info.tagPage) {
            this.tag = info.tag;
            this.tagName.innerHTML = info.tag;
            this.countElem.innerHTML = info.count;
            router.switch('browser');
            const _ = this;
            loader.getImageLink(info.links[0]).then(function(link) {
                _.thumb.setAttribute('src', link);
            });
        }

        storage
        .getNestedProp(info.tag, 'downloaded')
        .then(function(c) {
            console.log(c);
            if (c > 0) _.showProgress(info.tag);
        });
    }

    showProgress(tag) {
        if (!tag) return;
        const _ = this;
        storage
        .getProp(tag)
        .then(function(tagObj) {
            _.totalCount.innerHTML = tagObj.count;
            _.currentCount.innerHTML = tagObj.downloaded;
            _.progress.classList.remove('invisible');

            _.bar.style.width = Math.floor(tagObj.downloaded * 100 / tagObj.count) + '%';
            return Promise.resolve();
        })
        .then(function() {
            storage
            .getProp('downloading')
            .then(function(d) {
                if (d) {
                    _.status.innerHTML = 'Идёт загрузка';
                    _.stopButton.classList.remove('invisible');
                }
                else _.status.innerHTML = 'Остановлено';
            });
        });
    }

    updateProgress(tagObj) {
        if (tagObj.downloaded) {
            this.currentCount.innerHTML = tagObj.downloaded;
            this.bar.style.width = Math.floor(tagObj.downloaded * 100 / tagObj.count) + '%';
        }
    }


}

const browser = new Browser();

module.exports = browser;