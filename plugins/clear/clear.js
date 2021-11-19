Lampa.Settings.listener.follow('open',(e)=>{
    if(e.name == 'main'){
        e.body.find('[data-component="server"],[data-component="parser"]').addClass('hide')
    }
    if(e.name == 'more'){
        e.body.find('[data-name="source"]').addClass('hide')
    }
})

Lampa.Listener.follow('full',(e)=>{
    if(e.type == 'build' && e.name == 'start'){
        e.body.find('.view--torrent').addClass('hide')
    }
})

Lampa.Listener.follow('menu',(e)=>{
    if(e.type == 'start'){
        e.body.find('[data-action="mytorrents"],[data-action="collections"]').addClass('hide')
    }
})

Lampa.Listener.follow('app',(e)=>{
    if(e.type == 'ready'){
        $('.head__action.open--notice').addClass('hide')
    }
})