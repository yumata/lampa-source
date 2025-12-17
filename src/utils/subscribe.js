/**
 * Подписка на события
 */
function Subscribe() {
    this.add = function(type, listener){
        if (this._listeners === undefined) this._listeners = {}

        let listeners = this._listeners

        if (listeners[type] === undefined) listeners[type] = []

        if (listeners[type].indexOf(listener) === -1) listeners[type].push(listener)

        return this
    }

    this.follow = function (type, listener) {
        type.split(',').forEach(name => {
            this.add(name, listener)
        })

        return this
    }

    this.has = function (type, listener) {
        if (this._listeners === undefined) return false

        let listeners = this._listeners

        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1
    }

    this.remove = function (type, listener) {
        if (this._listeners === undefined) return this

        let listeners = this._listeners
        let listenerArray = listeners[type]

        if (listenerArray !== undefined) {
            let index = listenerArray.indexOf(listener)

            if (index !== -1) {
                listenerArray.splice(index, 1)
            }
        }

        return this
    }

    this.send = function (type, event = {}) {
        if (this._listeners === undefined) return this

        try{
            let listeners = this._listeners
            let listenerArray = listeners[type]

            if (listenerArray !== undefined) {
                let array = listenerArray.slice(0)

                for (let i = 0, l = array.length; i < l; i++) {
                    array[i].call(this, event)
                }
            }
        }
        catch(e){
            console.error('Subscribe', 'send error:', e.message, e.stack)
        }

        return this
    }

    this.destroy = function(){
        this._listeners = {}
    }
}

export default ()=> new Subscribe()