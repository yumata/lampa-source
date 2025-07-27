class Module{
    onCreate(){
        this.card.addEventListener('hover:focus',()=>{
            this.emit('focus', {
                card: this.card,
                data: this.data
            })
        })

        this.card.addEventListener('hover:touch',()=>{
            this.emit('touch', {
                card: this.card,
                data: this.data
            })
        })
        
        this.card.addEventListener('hover:hover',()=>{
            this.emit('hover', {
                card: this.card,
                data: this.data
            })
        })

        this.card.addEventListener('hover:enter',()=>{
            this.emit('enter', {
                card: this.card,
                data: this.data
            })
        })
        
        this.card.addEventListener('hover:long',()=>{
            this.emit('long', {
                card: this.card,
                data: this.data
            })
        })
    }
}

export default Module