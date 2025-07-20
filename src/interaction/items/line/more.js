import Items from './items'
import Controller from '../../controller'
import Activity from '../../activity'
import Lang from '../../../utils/lang'
import MoreButton from '../../more'

class More extends Items {
    moreEvent(){
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

    moreAppend(){
        let more = new MoreButton(this.params)

        more.create()

        more.onFocus = (target)=>{
            this.last = target

            this.active = this.items.indexOf(more)

            this.scroll.update(more.render(true), this.params.align_left ? false : true)

            if(this.onFocusMore) this.onFocusMore()
        }

        more.onEnter = this.moreEvent.bind(this)

        this.scroll.append(more.render(true))

        this.items.push(more)

        return more.render(true)
    }

    onVisible() {
        super.onVisible()

        if((this.data.results.length >= 20 || this.data.more) && !this.params.nomore){
            let button = document.createElement('div')
                button.classList.add('items-line__more')
                button.classList.add('selector')
                button.innerText = Lang.translate('more')

                button.on('hover:enter', this.moreEvent.bind(this))

            this.html.find('.items-line__head').append(button)
        }
    }

    onScroll() {
        super.onScroll()

        if(!this.more_item && !this.params.nomore && this.data.results.length == this.items.length && this.data.results.length >= 20){
            this.more_item = this.moreAppend()

            if(Controller.own(this)) Controller.collectionAppend(this.more_item)
        }
    }
}

export default More