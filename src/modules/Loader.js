const parser = new DOMParser();

class Loader {

    loadXML(url) {
        const _ = this;
        const d = (url.search(/\?/g) > -1) ? '&' : '?';
        url = url + d + 'xml';
        console.log(url);
        return new Promise(function(resolve){
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'xml',
                error: function() { resolve(null) },
                success: function(data) {
                    resolve(_.toObj(data));
                }
            });
        });
    }

    toObj(xmlDocument) {
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

        r.tag = title.replace(/( (- )?Image #\d+)? - Zerochan/, '').split(' - ')[0];

        if (title.search(/Image #\d/) === -1) {
            title = title.split(' - ');
            r.tagPage = true;
            r.description = xmlDocument.querySelector('description').innerHTML;
            
            const nextLink = xmlDocument.querySelector('[rel=next]');
            if (nextLink) r.next = 'https://www.zerochan.net' + nextLink.getAttribute('url');
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
            r.tagPage = false;
            title = title.split(' - ');
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