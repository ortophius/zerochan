const results = require('./Results');

class Search {

    constructor() {
        this.listen(document.getElementById('search'));
    }

    listen(input) {
        if (typeof input !== 'object') return;
        
        this.input = input;
        input.oninput = this.watch.bind(this);
        input.onpaste = this.watch.bind(this);

        this.resultDiv = document.getElementById('results');
    }

    watch() {
        if(this.tId !== undefined) clearTimeout(this.tId);
        if (this.input.value === '') return;
        this.tId = setTimeout(this.suggest.bind(this), 500)
    }

    suggest() {
        if (this.request !== undefined) this.request.abort();
        const _ = this;
        const query = this.input.value.replace('/s', '+');

        this.request = $.ajax({
            type: 'GET',
            url: 'https://www.zerochan.net/suggest?q='+query,
            context: _,
            success: _.displayTags,
        });
    }

    displayTags(data) {
        if (data === '') return;

        const _ = this;
        const tags = [];
        const resultDiv = this.resultDiv;

        data.split(/[\n\r]/g).forEach(function(line) {
            if (line === '') return;
            const splittedLine = line.split('|');
            tags.push({name: splittedLine[0], type: splittedLine[1]});
        });

        results.flush();
        tags.forEach(function(tag) {
            results.addTag(tag) 
        });
    }

    inspectMeta(tag) {
        const url = tag.name.replace('/s', '+');
        chrome.tabs.create({url});
    }
};
const search = new Search();
module.exports = search;
