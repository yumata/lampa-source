class Module{
    onCreate(){
        this.card.addEventListener('hover:focus',()=>{
            this.onFocus && this.onFocus(this.card, this.data)
        })

        this.card.addEventListener('hover:touch',()=>{
            this.onTouch && this.onTouch(this.card, this.data)
        })
        
        this.card.addEventListener('hover:hover',()=>{
            this.onHover && this.onHover(this.card, this.data)
        })

        this.card.addEventListener('hover:enter',()=>{
            this.onEnter && this.onEnter(this.card, this.data)
        })
        
        this.card.addEventListener('hover:long',()=>{
            this.onMenu && this.onMenu(this.card, this.data)
        })
    }
}

export default Module