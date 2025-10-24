export default {
    onCreate: function(){
        this.html.on('hover:focus', this.emit.bind(this, 'focus', this.html, this.data))

        this.html.on('hover:touch', this.emit.bind(this, 'touch', this.html, this.data))
        
        this.html.on('hover:hover', this.emit.bind(this, 'hover', this.html, this.data))

        this.html.on('hover:enter', this.emit.bind(this, 'enter', this.html, this.data))
        
        this.html.on('hover:long', this.emit.bind(this, 'long', this.html, this.data))
    }
}