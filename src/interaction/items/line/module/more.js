import Controller from '../../../controller'
import Activity from '../../../activity'
import Lang from '../../../../utils/lang'
import MoreButton from '../../../more'


class Module{
    onMore(){
        if(this.onEnter) this.onEnter()
                        
        if(this.data.onMore) this.data.onMore(this.data)
        else if(this.onMore){
            this.onMore(this.data)
        }
        else{
            Activity.push({
                url: this.data.url,
                title: this.data.title || Lang.translate('title_category'),
                component: 'category_full',
                page: 1,
                genres: this.params.genres,
                filter: this.data.filter,
                source: this.data.source || this.params.object.source
            })
        }
    }

    onVisible(){
        if((this.data.results.length >= 20 || this.data.more) && !this.params.nomore){
            let button = document.createElement('div')
                button.classList.add('items-line__more')
                button.classList.add('selector')
                button.text(Lang.translate('more'))

                button.on('hover:enter', this.emit.bind(this, 'more'))

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

                if(this.onFocusMore) this.onFocusMore()
            }

            this.more.onEnter = this.emit.bind(this, 'more')

            this.scroll.append(this.more.render(true))

            this.items.push(this.more)

            if(Controller.own(this)) Controller.collectionAppend(this.more.render(true))
        }
    }
}

export default Module