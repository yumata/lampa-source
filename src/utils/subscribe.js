function subscribe() {
    this.follow = function (type, listener) {
        if (this._listeners === undefined)
            this._listeners = {};

        var listeners = this._listeners;

        if (listeners[type] === undefined) {

            listeners[type] = [];

        }

        if (listeners[type].indexOf(listener) === -1) {

            listeners[type].push(listener);

        }

    }

    this.has = function (type, listener) {
        if (this._listeners === undefined)
            return false;

        var listeners = this._listeners;

        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;

    }

    this.remove = function (type, listener) {
        if (this._listeners === undefined)
            return;

        var listeners = this._listeners;
        var listenerArray = listeners[type];

        if (listenerArray !== undefined) {

            var index = listenerArray.indexOf(listener);

            if (index !== -1) {

                listenerArray.splice(index, 1);

            }

        }

    }

    this.send = function (type, event = {}) {
        if (this._listeners === undefined)
            return;

        var listeners = this._listeners;
        var listenerArray = listeners[type];

        if (listenerArray !== undefined) {

            event.target = this;

            var array = listenerArray.slice(0);

            for (var i = 0, l = array.length; i < l; i++) {

                array[i].call(this, event);

            }

        }

    }

    this.destroy = function(){
        this._listeners = null
    }
}

function start(){
    return new subscribe()
}

export default start