const search = require('./modules/Search');
const browser = require('./modules/Browser');
const searchInput = document.getElementById('search');
console.log(searchInput);
search.listen(searchInput);

chrome.cookies.getAll({domain: 'zerochan.net'}, function(arr) { console.log(arr) });