const parser = new DOMParser();

class Loader {

    urlFromTag(tagName) {
        return 'https://www.zerochan.net/' + tagName.replace(/\s/g, '+');
    }

    loadXML(url) {
        const _ = this;
        const d = (url.search(/\?/g) > -1) ? '&' : '?';
        url = url + d + 'xml';
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

        const r = {};
        let channel = xmlDocument.querySelector('channel');
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
            r.tag = decodeURIComponent(r.tag)
                .replace(/\?.*/, '')
                .replace(/\+/g, ' ');
                
            
            const nextLink = xmlDocument.querySelector('[rel=next]');
            if (nextLink) r.next = 'https://www.zerochan.net' + nextLink.getAttribute('href');
            else r.next = null;
            
            r.images = [];
            const images = xmlDocument.querySelectorAll('item');

            if (images && images.length > 0) {

                for (let i = 0; i < images.length; i++) {
                    let imageName = images[i]
                        .querySelector('[width]')
                        .getAttribute('url')
                        .split('/');
                    imageName = imageName[imageName.length - 1];
                    const tagPart = 
                        images[i]
                        .querySelector('title')
                        .innerHTML
                        .replace(/\s/g, '.');

                    r.images.push('https://static.zerochan.net/'+ tagPart + '.full.' + imageName);
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

        r.tagUrl = 'https://www.zerochan.net/' + r.tag.replace(/\s/g, '+'); 

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