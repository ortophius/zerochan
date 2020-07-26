const results = require('./Results');

const Search = {
    onDisplay: function(){
        this.input.focus();
    },
    listen: function(input){
        if (typeof input !== 'object') return;
        
        this.input = input;
        input.oninput = this.watch.bind(this);
        input.onpaste = this.watch.bind(this);

        this.resultDiv = document.getElementById('results');
    },

    watch: function(){
        if(this.tId !== undefined) clearTimeout(this.tId);
        if (this.input.value === '') return;
        this.tId = setTimeout(this.suggest.bind(this), 500)
    },

    suggest: function(){
        if (this.request !== undefined) this.request.abort();
        const _ = this;
        const query = this.input.value.replace('/s', '+');

        this.request = $.ajax({
            type: 'GET',
            url: 'https://www.zerochan.net/suggest?q='+query,
            context: _,
            success: _.displayTags,
        });
    },

    displayTags: function(data){
        if (data === '') return;

        const _ = this;
        const tags = [];
        const resultDiv = this.resultDiv;

        data.split(/[\n\r]/g).forEach(function(line){
            if (line === '') return;
            const splittedLine = line.split('|');
            tags.push({name: splittedLine[0], type: splittedLine[1]});
        });

        results.flush();
        tags.forEach(function(tag){
            results.addTag(tag) 
        });
    },

    inspectMeta: function(tag) {
        const url = tag.name.replace('/s', '+');
        chrome.tabs.create({url});
    }
};

module.exports = Search;
