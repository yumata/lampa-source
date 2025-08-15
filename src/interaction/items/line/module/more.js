import Controller from '../../../controller'
import Lang from '../../../../utils/lang'
import More from '../../../more'


class Module{
    onVisible(){
        let pages = this.data.total_pages || 1

        if(pages <= 1) return

        let button = document.createElement('div')
            button.classList.add('items-line__more')
            button.classList.add('selector')
            button.text(Lang.translate('more'))

            button.on('hover:enter', this.emit.bind(this, 'more', this.data))

        this.html.find('.items-line__head').append(button)
    }

    onScroll(){
        if(!this.more && this.data.results.length == this.items.length && this.data.total_pages > 1){
            this.more = new More(this.params.more)

            this.more.create()

            this.more.html.on('hover:focus hover:touch', ()=>{
                this.last = this.more.render(true)

                this.active = this.items.indexOf(this.more)

                this.scroll.update(this.more.render(true), this.params.align_left ? false : true)
            })

            this.more.html.on('hover:enter', this.emit.bind(this, 'more', this.data))

            this.scroll.append(this.more.render(true))

            this.items.push(this.more)

            if(Controller.own(this)) Controller.collectionAppend(this.more.render(true))
        }
    }
}

export default Module