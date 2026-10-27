import Template from '../../template'
import Utils from '../../../utils/utils'
import Favorite from '../../../core/favorite'
import HistoryLabel from '../../../utils/watch_history_label'

/**
 * Карточка в «Истории» с синхронизацией CUB (watch_history): дата просмотра и серии за этот день
 * (сервер группирует просмотры карточки по дням: «S01 E1–3», у фильма — «×2»).
 * Удаление — снятием галочки «История просмотров» (закладка history): сервер убирает все просмотры карточки,
 * а карточка здесь гаснет
 */
export default {
    onCreate: function(){
        let data = this.data.watch_history

        if(!data) return

        let time = Utils.parseTime(data.watched_at)
        let part = HistoryLabel.label(data, Boolean(this.data.original_name))

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
