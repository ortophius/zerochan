class Router {
    constructor() {
        this.search = document.getElementById('page-search');
        this.browse = document.getElementById('page-browse');
        this.loader = document.getElementById('loader');
    }

    switch(page){
        if (this[page] === undefined) return;
        this.search.classList.add('invisible');
        this.browse.classList.add('invisible');
        this.loader.classList.add('invisible');

        this[page].classList.remove('invisible');
    }
}

const router = new Router();
module.exports = router;