import More from '../../../more'


class Module{
    onCreate(){
        this.more = new More(this.params.more)

        this.more.create()

        this.more.html.addClass('card-more--first')

        this.more.html.on('hover:focus hover:touch', ()=>{
            this.last = this.more.render(true)

            this.active = this.items.indexOf(this.more)

            this.scroll.update(this.more.render(true), this.params.align_left ? false : true)
        })

        this.more.html.on('hover:enter', this.emit.bind(this, 'more', this.data))

        this.scroll.append(this.more.render(true))

        this.items.push(this.more)
    }
}

export default Module