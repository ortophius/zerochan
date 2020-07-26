function isOnTagPage(msg, callback){    
    const isThumbsPage = (document.querySelector('#thumbs2') !== null);
    const isImagePage = (document.querySelector('#large') !== null);

    let tag;

    if (isThumbsPage) {
        tag = document
            .querySelector('h1 span')
            .innerHTML;
    }
    else if (isImagePage) {
        tag = document
            .querySelector('.breadcrumbs')
            .lastElementChild
            .innerHTML;
    }
    else callback(false);
    callback(tag);

};

function dispatchMessage(msg, sender, callback){
    if(msg.query === 'isOnTagPage') isOnTagPage(msg, callback);
};

chrome.runtime.onMessage.addListener(dispatchMessage);