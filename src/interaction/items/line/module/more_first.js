import More from '../../../more'


export default {
    onCreate: function(){
        this.more = new More(this.params.more)

        this.more.create()

        this.more.html.addClass('card-more--first')

        this.more.html.on('hover:focus hover:touch', ()=>{
            this.last = this.more.render(true)

            this.active = this.items.indexOf(this.more)

            this.scroll.update(this.more.render(true), this.params.items.align_left ? false : true)
        })

        this.more.html.on('hover:enter', this.emit.bind(this, 'more', this.data))

        this.scroll.append(this.more.render(true))

        this.items.push(this.more)
    },

    onAppend: function(item, elem){
        if(this.data.results.indexOf(elem) == 0) this.more_set_size = item
    },

    onVisible: function(){
        this.more.size(this.more_set_size?.render(true))

        this.more_set_size = null
    }
}