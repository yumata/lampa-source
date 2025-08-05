class Module{
    onCreate(){
        this.card.on('hover:focus',()=>{
            this.emit('focus', {
                card: this.card,
                data: this.data
            })
        })

        this.card.on('hover:touch',()=>{
            this.emit('touch', {
                card: this.card,
                data: this.data
            })
        })
        
        this.card.on('hover:hover',()=>{
            this.emit('hover', {
                card: this.card,
                data: this.data
            })
        })

        this.card.on('hover:enter',()=>{
            this.emit('enter', {
                card: this.card,
                data: this.data
            })
        })
        
        this.card.on('hover:long',()=>{
            this.emit('long', {
                card: this.card,
                data: this.data
            })
        })
    }
}

export default Module