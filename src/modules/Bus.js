const uuid = require('uuid').v4;

class Listener {
    constructor(callback, once) {
        this.callback = callback;
        this.once = once;
    }
}

const Bus = {
    subscriptions: {},
    subscribe: function(eventType, callback, once) {
        const _ = this;
        const id = uuid();
        once = (once === undefined) ? false : once;

        // Some dumb checks
        if (typeof eventType != 'string') return false;
        if (typeof callback != 'function') return false;

        if (this.subscriptions[eventType] === undefined) this.subscriptions[eventType] = {};
        this.subscriptions[eventType][id] = new Listener(callback, once);
        return {
            id: id,
            unsubscribe: _.unsubscribe.bind(_, eventType, id),
        }
    },
    unsubscribe: function(eventType, id){
        delete this.subscriptions[eventType][id];
        if (Object.keys(this.subscriptions[eventType]).length === 0)
            delete this.subscriptions[eventType];
        return id;
    },
    emit: function(eventType, data){
        if (typeof(eventType) !== 'string') return false;
        if (this.subscriptions[eventType] === undefined) return false;

        const events = this.subscriptions[eventType];
        const _ = this;
        
        Object.keys(events).forEach(function(id){
            const listener = events[id];
            listener.callback(data);
            if (listener.once) _.unsubscribe(eventType, id);
        });
    }
};

module.exports = Bus;
