export default {
    onEvent: function(type){
        Lampa.Listener.send('line',{
            line: this, 
            type: type, 
            params: this.params,
            data: this.data,
            scroll: this.scroll,
            body: this.body,
            items: this.items,
            active: this.active
        })
    },

    onCreate: function(){
        this.emit('event', 'create')
    },

    onCreateAndAppend: function(){
        this.emit('event', 'append')
    },

    onVisible: function(){
        this.emit('event', 'visible')
    },

    onToggle: function(){
        this.emit('event', 'toggle')
    },

    onDestroy: function(){
        this.emit('event', 'destroy')
    }
}