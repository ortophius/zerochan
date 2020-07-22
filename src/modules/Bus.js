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
        const id = Date.now();

        // Some dumb checks
        if (typeof eventType != "string") return false;
        if (!(callback instanceof Object)) return false;

        subscription[eventType][id] = new Listener(callback, once);
        return { unsubscribe: _.unsubscribe.bind(eventType, id) }
    },
    unsubscribe: function(eventType, id){
        delete subscriptions[eventType][id];
        if (Object.keys(subscriptions[eventType]) === 0)
            delete subscriptions[eventType];
        return id;
    },
    emit: function(e){
        if (!(e instanceof Event)) return false;
        if (this[e.eventType] === undefined) return false;

        const events = this[e.eventType];
        const _ = this;
        
        Object.keys(events).forEach(function(id){
            const listener = events[id];
            listener.callback();
            if (listener.once) _.unsubscribe(eventType, id);
        });
    }
};

exports.default = Bus;
