const parser = new DOMParser();

class Loader {

    urlFromTag(tagName) {
        return 'https://www.zerochan.net/' + encodeURIComponent(tagName);
    }

    loadXML(url) {
        const _ = this;
        const d = (url.search(/\?/g) > -1) ? '&' : '?';
        url = url + d + 'xml';
        console.log(url);
        return new Promise(function(resolve){
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'text',
                error: function() { resolve(null) },
                success: function(data) {
                    data = data
                        .replace('& ', '&amp; ');
                    resolve(_.toObj(data));
                }
            });
        });
    }

    toObj(document) {
        const xmlDocument = parser.parseFromString(document, 'text/xml');
        console.log(xmlDocument);

        const r = {};
        console.log(xmlDocument);
        let channel = xmlDocument.querySelector('channel');
        console.log(xmlDocument);
        console.log(channel);
        if (!xmlDocument || !channel) return null;

        let title = xmlDocument.querySelector('channel title').innerHTML;
        // Preventing from downloading ALL the fucking zerochan
        // (Please dont do it, seriously.)
        if (title.search(/^Page \d/) === 0) return null;

        if (title.search(/Image #\d/) === -1) {

            r.tagPage = true;
            
            const description = xmlDocument.querySelector('description');
            r.description = (description) ? description.innerHTML : null;
            
            r.tag = xmlDocument
                .querySelector('channel link')
                .innerHTML
                .split('/')[3]
            r.tag = decodeURI(r.tag)
                .replace(/\?.*/, '')
                .replace(/\+/g, ' ');
                
            
            const nextLink = xmlDocument.querySelector('[rel=next]');
            if (nextLink) r.next = 'https://www.zerochan.net' + nextLink.getAttribute('href');
            else r.next = null;
            
            r.images = [];
            const images = xmlDocument.querySelectorAll('item');

            if (images && images.length > 0) {

                for (let i = 0; i < images.length; i++) {
                    r.images.push( 
                        images[i]
                        .querySelector('[width]')
                        .getAttribute('url')
                        .replace('/600/', '/full/')
                        .replace('/240/', '/full/'));
                }
            }
        }

        else {
            r.tag = xmlDocument
                .querySelector('item title')
                .innerHTML
                .replace(/\s\(#\d+\)/, '')
            r.tagPage = false;
        }

        r.tagUrl = 'https://www.zerochan.net/' + encodeURI(r.tag); 

        r.getImagesCount = function(noDelim) {
            const regex = /Zerochan has (\d+(\,\d+)?)\s/;
            return (noDelim) ?
                regex.exec(this.description)[1].replace(',', '')
                : regex.exec(this.description)[1];
        }

        return r;
    }

}

const loader = new Loader();
module.exports = loader;