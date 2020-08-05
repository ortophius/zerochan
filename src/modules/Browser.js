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

        this.setupListeners();
    }

    setupListeners() {
        this.backButton.onclick = function(e) {
            console.log('fuck');
            e.preventDefault();
            router.switch('search');
        }
    }

    displayTagInfo(info) {
        const _ = this;

        router.switch('loader');
        
        if (!info) {
            router.switch('search');
            return;
        }

        if (typeof info === 'string') {
            loader
                .loadXML(encodeURI('https://www.zerochan.net/' + info))
                .then(this.displayTagInfo.bind(_));
            return;
        }

        if (info.tagPage) {
            this.tagName.innerHTML = info.tag;
            this.countElem.innerHTML = info.getImagesCount();
            router.switch('browser');
            this.thumb.setAttribute('src', info.images[0].replace('/full/', '/240/'))
            router.switch('browser');
        }
    }

    showProgress(tag) {
        if (!tag) return;
        this.progress.classList.remove('invisible');
        this.totalCount.innerHTML = tag.count;
        this.currentCount.innerHTML = tag.currentCount;

        this.bar.style.width = Math.floor(tag.currentCount * 100 / tag.count);
    }
}

const browser = new Browser();

module.exports = browser;