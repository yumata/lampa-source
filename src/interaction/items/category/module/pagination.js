import Select from '../../../select'
import Controller from '../../../../core/controller'
import Lang from '../../../../core/lang'
import Head from '../../../head/head'
import Template from '../../../template'

function getSmartPages(current, total, maxButtons = 7) {
    let pages = [];

    // всегда добавляем первую и последнюю страницу
    pages.push(1);
    pages.push(total);

    // добавляем текущую страницу
    if(pages.indexOf(current) == -1) pages.push(current);

    // добавляем несколько вокруг текущей
    for (let i = 1; i <= 2; i++) {
        if (current - i > 1) pages.push(current - i);
        if (current + i < total) pages.push(current + i);
    }

    // добавляем промежуточные диапазоны (каждые ~10%)
    let steps = Math.max(2, Math.floor(total / (maxButtons - 2)));

    for (let i = steps; i < total; i += steps) {
        pages.push(Math.round(i));
    }

    // сортируем и возвращаем массив с "..." где пропуски
    let sorted = pages.sort((a, b) => a - b);

    return sorted;
}


export default {
    onBuild: function(){
        this.navigator = Template.elem('div', {class: 'head__navigator'})

        this.navigator.on('click', this.emit.bind(this, 'right'))
    },
    onStart: function(){
        if(this.total_pages > 10 && this.navigator) Head.addElement(this.navigator)
    },
    onPause: function(){
        this.navigator && this.navigator.remove()
    },
    onScroll: function(){
        this.navigator && this.navigator.text((this.object.page || 1) + ' / ' + (this.total_pages || 1))
    },
    onRight: function(){
        if(!this.navigator) return

        let controller   = Controller.enabled().name
        let current_page = parseInt(this.object.page || 1)
        let pages        = getSmartPages(current_page, parseInt(this.total_pages || 1), 7)

        pages = pages.map(page=>({title: Lang.translate('title_page') + ' ' + page, page, selected: page === current_page}))

        Select.show({
            title: Lang.translate('title_navigation'),
            items: pages,
            onSelect: (a)=>{
                this.object.page = a.page

                Controller.toggle(controller)

                this.activity.refresh()
            },
            onBack: ()=>{
                Controller.toggle(controller)
            }
        })
    },
    onDestroy: function(){
        this.navigator && this.navigator.remove()
    }
}