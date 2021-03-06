class Storage {
    constructor() {
        this.storage = chrome.storage.local;
    }

    getProp(propName) {
        const storage = this.storage;

        return new Promise(function(resolve) {
            if (typeof propName !== 'string') {
                resolve(null);
                return;
            }
            storage.get(propName, function(obj) {
                if (obj[propName] === undefined) {
                    resolve(null);
                    return;
                }

                obj = obj[propName];
                resolve(obj);
            });
        });
    }

    setProp(key, value) {
        const _ = this;
        const storage = this.storage;

        return new Promise(function(resolve) {
            if (typeof key !== 'string' || value === undefined) {
                resolve(null);
                return;
            }

            storage.set({[key]: value}, resolve);
        });
    }

    setProps(obj) {
        const _ = this;
        const storage = this.storage;

        return new Promise(function(resolve) {
            storage.set(obj, resolve);
        });
    }

    getProps(arr) {
        if (!(arr instanceof Array) && typeof arr !== 'string') return Promise.resolve();

        const _ = this;
        const storage = this.storage;

        return new Promise(function(resolve) {
            storage.get(arr, resolve);
        });
    }

    getNestedProp(objName, key) {
        const _ = this;
        const storage = this.storage;
        return new Promise(function(resolve) {
            if (typeof objName !== 'string' || typeof key !== 'string') {
                resolve(null);
                return;
            }
            _.getProp(objName).then(function(obj) {
                if (obj === null || obj[key] === undefined) {
                    resolve(null);
                    return;
                }
                resolve(obj[key]);
            });
        });
    }

    setNestedProp(objName, key, value) {
        const _ = this;
        const storage = this.storage;

        return new Promise(function(resolve) {
            if (typeof objName !== 'string' 
                || typeof key !== 'string' 
                || value === undefined) {
                resolve(null);
                return;
            }
            _.getProp(objName).then(function(o) {
                if (o === null) o = {};
                o[key] = value;
                _.setProp(objName, o).then(resolve);
            });
        });
    }

    removeProp(propName) {
        if(!propName || typeof propName !== 'string') return Promise.resolve(null);
        return new Promise(function(resolve) {
            chrome.storage.local.remove(propName, resolve);
        });
    }
}

const storage = new Storage();
module.exports = storage;
