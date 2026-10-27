import Template from '../../template'
import Utils from '../../../utils/utils'
import Favorite from '../../../core/favorite'
/**
 * Карточка в «Истории» с синхронизацией CUB (watch_history, одна карточка на сериал/фильм): дата последнего просмотра
 * и последняя просмотренная серия «S15E10», у фильма, посмотренного не раз, — «×2».
 * Удаление — снятием галочки «История просмотров» (закладка history): сервер убирает все просмотры карточки,
 * а карточка здесь гаснет
 */
export default {
    onCreate: function(){
        let data = this.data.watch_history

        if(!data) return

        let time = Utils.parseTime(data.watched_at)
        let pad  = (n)=>('0' + n).slice(-2)
        let last = data.last && data.last.season > 0 ? data.last : null
        let part = this.data.original_name ? (last ? 'S' + pad(last.season) + 'E' + pad(last.episode) : '') : (data.views > 1 ? '×' + data.views : '')

        let line = Template.elem('div', {class: 'card__history', children: [
            Template.elem('div', {class: 'card__history-date', text: time.full}),
            part ? Template.elem('div', {class: 'card__history-episode', text: part}) : Template.elem('div', {class: 'card__history-episode hide'})
        ]})

        this.html.find('.card__view').after(line)

        this.listenerHistory = (e)=>{
            if(e.where == 'history' && e.method == 'id' && e.card && e.card.id == this.data.id) this.html.addClass('card--history-removed')
        }

        Favorite.listener.follow('remove', this.listenerHistory)
    },

    onDestroy: function(){
        if(this.listenerHistory) Favorite.listener.remove('remove', this.listenerHistory)
    }
}
