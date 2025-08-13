class Module{
    onCreate(){
        this.card.on('hover:focus', this.emit.bind(this, 'focus', this.card, this.data))

        this.card.on('hover:touch', this.emit.bind(this, 'touch', this.card, this.data))
        
        this.card.on('hover:hover', this.emit.bind(this, 'hover', this.card, this.data))

        this.card.on('hover:enter', this.emit.bind(this, 'enter', this.card, this.data))
        
        this.card.on('hover:long', this.emit.bind(this, 'long', this.card, this.data))
    }
}

export default Module