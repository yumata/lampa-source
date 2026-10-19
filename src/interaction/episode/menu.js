import Activity from '../activity/activity'
import Controller from '../../core/controller'
import Select from '../select'
import Lang from '../../core/lang'

export default function episodeMenu(episode, card){
    let onBack = ()=>Controller.toggle('content')

    Select.show({
        title: episode.data.title,
        items: [
            {title: Lang.translate('title_watch'), action: 'watch'},
            {title: Lang.translate(episode.data.timeline.percent ? 'episode_mark_unwatched' : 'episode_mark_watched'), action: 'mark'}
        ],
        onSelect: (item)=>{
            onBack()

            if(item.action == 'mark'){
                episode.emit('mark')
                return
            }

            // Reuse the loaded card's sources, including buttons added by plugins.
            let full = Activity.all().slice().reverse().find(item=>
                item.component == 'full' && item.card && item.card.id == card.id && item.card.source == card.source &&
                item.activity && item.activity.component && item.activity.component.items && item.activity.component.items.length
            )
            let season = episode.data.season_number

            if(full) full.activity.component.items[0].emit('watch', {season, onBack})
            else Activity.push({
                component: 'full',
                id: card.id,
                method: 'tv',
                source: card.source,
                card,
                episode_season: season
            })
        },
        onBack
    })
}
