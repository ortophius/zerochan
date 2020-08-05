const browser = require('./Browser');
const router = require('./Router');

class Results {
    constructor(){
        this.domRoot = document.getElementById('results');
        this.domRoot.addEventListener('click', this.handleClick.bind(this));
        this.show = false;
    }

    handleClick(e) {
        if(e.target.tagName !== 'A') return;
        e.preventDefault();
        const a = e.target;
        const link = a.getAttribute('href');

        if (a.dataset.type === 'Meta') {
            chrome.tabs.create({url: link});
        }
        else {
            browser.displayTagInfo(a.dataset.name);
        }
    }

    flush(){
        this.domRoot.innerHTML = '';
    }

    addTag(tag) {
        if(tag.name === undefined || typeof tag.name !== 'string') return;
        if(tag.type === undefined || typeof tag.type !== 'string') return;

        const link = document.createElement('a')
        const href = 'https://www.zerochan.net/'+tag.name.replace('/s', '+');

        link.setAttribute('href', href);
        link.dataset.type = tag.type;
        link.dataset.name = tag.name;
        link.innerHTML = `${tag.name} <sup>${tag.type}</sup>`;
        link.classList.add('tag');
        
        if (tag.type === "Meta") {
            link.classList.add('meta');
            link.dataset.meta = true;
        }
        else link.dataset.meta = false;

        console.log(link);

        this.domRoot.appendChild(link);
        
        //Time to kostily
        this.domRoot.innerHTML += " ";
    }
}

const r = new Results();

module.exports = r;