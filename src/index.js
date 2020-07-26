const search = require('./modules/Search');
const browser = require('./modules/Browser');
const searchInput = document.getElementById('search');
console.log(searchInput);
search.listen(searchInput);

