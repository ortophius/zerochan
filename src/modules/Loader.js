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
        const _ = this;
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
            
            r.links = [];
            const links = xmlDocument.querySelectorAll('item');

            if (links && links.length > 0) {
                for (let i = 0; i < links.length; i++) {
                    let link = links[i].querySelector('link').innerHTML;
                    link = link.replace('http://', 'https://');
                    r.links.push(link);
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

        const regex = /Zerochan has (\d+(\,\d+)?)\s/;
        r.count = regex.exec(r.description)[1].replace(',', '')

        return r;
    }

    getImageLink(link) {
        const _ = this;
        return new Promise (function(resolve) {
            _
            .loadHTML(link)
            .then(function(html) {
                if (!html) {
                    resolve(null);
                    return;
                }
                const preview = html.querySelector('a.preview');
                const large = html.querySelector('#large img');
                const actualLink = (preview) ? preview.getAttribute('href') : large.getAttribute('src');
                resolve(actualLink);
            })
        })
    }

    loadHTML(url) {
        return new Promise(function(resolve) {
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'html',
                error: function() { resolve(null) },
                success: function(html) {
                    const htmlDocument = parser.parseFromString(html, 'text/html');
                    if (!htmlDocument.querySelector('html')) resolve(null);
                    else resolve(htmlDocument);
                }
            });
        });
    }

}

const loader = new Loader();
module.exports = loader;