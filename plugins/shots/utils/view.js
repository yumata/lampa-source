function init(){
    let button = `<div class="full-start__button selector view--online" data-subtitle="#{shots_watch}">
        <svg><use xlink:href="#sprite-shots"></use></svg>

        <span>Shots</span>
    </div>`

    Lampa.Listener.follow('full',(e)=>{
        if(e.type == 'complite'){
            let btn = $(Lampa.Lang.translate(button))

            btn.on('hover:enter',()=>{
                Lampa.Activity.push({
                    url: '',
                    title: 'Shots',
                    component: 'shots_card',
                    card: e.data.movie,
                    page: 1
                })
            })

            e.object.activity.render().find('.view--torrent').after(btn)
        }
    })
}

export default {
    init
}