import Controller from '../../../controller'
import Lang from '../../../../utils/lang'
import MoreButton from '../../../more'


class Module{
    onVisible(){
        if((this.data.results.length >= 20 || this.data.more) && !this.params.nomore){
            let button = document.createElement('div')
                button.classList.add('items-line__more')
                button.classList.add('selector')
                button.text(Lang.translate('more'))

                button.on('hover:enter', this.emit.bind(this, 'more', this.data))

            this.html.find('.items-line__head').append(button)
        }
    }

    onScroll(){
        if(!this.more && !this.params.nomore && this.data.results.length == this.items.length && this.data.results.length >= 20){
            this.more = new MoreButton(this.params)

            this.more.create()

            this.more.onFocus = (target)=>{
                this.last = target

                this.active = this.items.indexOf(this.more)

                this.scroll.update(this.more.render(true), this.params.align_left ? false : true)
            }

            this.more.onEnter = this.emit.bind(this, 'more', this.data)

            this.scroll.append(this.more.render(true))

            this.items.push(this.more)

            if(Controller.own(this)) Controller.collectionAppend(this.more.render(true))
        }
    }
}

export default Module