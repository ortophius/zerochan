chrome.runtime.onMessage.addListener(
    function(tagName, cookie) {
        const zerochan = 'https://www.zerochan.net/';
        const tagLink = zerochan+encodeURI(tagName);
    }
)