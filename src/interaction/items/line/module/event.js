class Module{
    onEvent(type){
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
    }

    onCreate(){
        this.emit('event', 'create')
    }

    onCreateAndAppend(){
        this.emit('event', 'append')
    }

    onVisible(){
        this.emit('event', 'visible')
    }

    onToggle(){
        this.emit('event', 'toggle')
    }

    onDestroy(){
        this.emit('event', 'destroy')
    }
}

export default Module