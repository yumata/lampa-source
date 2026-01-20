import Api from './api.js'

let loaded_shots = {}

function init(){
    let button = `<div class="full-start__button shots-view-button selector view--online" data-subtitle="#{shots_watch}">
        <svg><use xlink:href="#sprite-shots"></use></svg>

        <span class="shots-view-button__title">Shots</span>
    </div>`

    Lampa.Listener.follow('full',(e)=>{
        if(e.type == 'complite' && (Lampa.Storage.field('shots_in_card') || Lampa.Storage.field('shots_in_player'))){
            let btn = $(Lampa.Lang.translate(button))
            let mov = e.data.movie

            btn.on('hover:enter',()=>{
                Lampa.Activity.push({
                    url: '',
                    title: 'Shots',
                    component: 'shots_card',
                    card: mov,
                    page: 1
                })
            })

            load(mov, (shots)=>{
                if(shots.length){
                    console.log('Shots','load for full view:', shots.length, 'items;', 'card id:', mov.id, mov.original_name ? 'tv' : 'movie')

                    btn.attr('data-subtitle', Lampa.Lang.translate('shots_watch') + ' <span class="shots-view-button__count">' + (shots.length > 99 ? '99+' : shots.length) + '</span>')
                }
            })

            if(Lampa.Storage.field('shots_in_card')) e.object.activity.render().find('.view--torrent').last().after(btn)
        }
    })
}

function load(card, call){
    let key = card.id + '_' + (card.original_name ? 'tv' : 'movie')

    if(loaded_shots[key]){
        call(loaded_shots[key])
    }
    else{
        Api.shotsCard(card, 1, (data)=>{
            loaded_shots[key] = data.results

            call(data.results)
        })
    }
}

function clear(){
    loaded_shots = {}
}

function remove(card){
    let key = card.id + '_' + (card.original_name ? 'tv' : 'movie')

    delete loaded_shots[key]
}

function get(card){
    let key = card.id + '_' + (card.original_name ? 'tv' : 'movie')

    return loaded_shots[key]
}

export default {
    init,
    load,
    clear,
    remove,
    get
}