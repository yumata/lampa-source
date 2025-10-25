import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Utils from '../../../utils/utils'
import Storage from '../../../core/storage/storage'
import Player from '../../../interaction/player'
import Android from '../../../core/android'
import Platform from '../../../core/platform'
import Lang from '../../../core/lang'

export default {
    onCreate: function(){
        let videos = this.data.videos

        if(videos && videos.results.length && !window.lampa_settings.disable_features.trailers){
            this.html.find('.view--trailer').on('hover:enter',()=>{
                let items = []

                videos.results.forEach(element => {
                    let date = Utils.parseTime(element.published_at).full

                    items.push({
                        title: Utils.shortText(element.name, 50),
                        subtitle: (element.official ? Lang.translate('full_trailer_official') : Lang.translate('full_trailer_no_official')) + ' - ' + date,
                        id: element.key,
                        player: element.player,
                        code: element.iso_639_1,
                        time: new Date(element.published_at).getTime(),
                        url: element.url || 'https://www.youtube.com/watch?v=' + element.key,
                        youtube: typeof element.youtube !== 'undefined' ? element.youtube : true,
                        icon: '<img class="size-youtube" src="'+(element.icon || 'https://img.youtube.com/vi/'+element.key+'/default.jpg')+'" />',
                        template: 'selectbox_icon'
                    })
                })

                items.sort((a,b)=>{
                    return a.time > b.time ? -1 : a.time < b.time ? 1 : 0
                })

                let my_lang = items.filter(n=>n.code == Storage.field('tmdb_lang'))
                let en_lang = items.filter(n=>n.code == 'en' && my_lang.indexOf(n) == -1)
                let al_lang = []

                if(my_lang.length){
                    al_lang = al_lang.concat(my_lang)
                }

                if(al_lang.length && en_lang.length){
                    al_lang.push({
                        title: Lang.translate('more'),
                        separator: true
                    })
                }

                al_lang = al_lang.concat(en_lang)

                Select.show({
                    title: Lang.translate('title_trailers'),
                    items: al_lang,
                    onSelect: (a)=>{
                        this.toggle()

                        if(Platform.is('android') && Storage.field('player_launch_trailers') == 'youtube' && a.youtube){
                            Android.openYoutube(a.id)
                        }
                        else{
                            let playlist = al_lang.filter(v=>!v.separator)

                            Player.play(a)
                            Player.playlist(playlist)
                        }
                    },
                    onBack: ()=>{
                        Controller.toggle('content')
                    }
                })
            })
        }
        else{
            this.html.find('.view--trailer').remove()
        }
    }
}