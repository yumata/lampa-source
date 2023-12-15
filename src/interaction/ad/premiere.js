import Socket from '../../utils/socket'
import Notice from '../notice'
import Lang from '../../utils/lang'
import Arrays from '../../utils/arrays'
import Reguest from '../../utils/reguest'
import TMDB from '../../utils/tmdb'
import Storage from '../../utils/storage'

let network

function init(){
    network = new Reguest()

    Socket.listener.follow('message',(e)=>{
        if(e.method == 'premiere') update(e.data)
    })
}

function update(data){
    let id = data.type + '/' + data.id

    console.log('Premiere', 'load:', data, 'exist:', Boolean(Notice.classes.lampa.notices.find(n=>n.id == id)))
    
    if(Notice.classes.lampa.notices.find(n=>n.id == id)) return

    let codes = Arrays.getKeys(Lang.codes())

    network.silent(TMDB.api(id + '?append_to_response=translations,credits&language='+Storage.get('language','ru')+'&api_key='+TMDB.key()),(movie)=>{
        network.silent(TMDB.api(id + '/images?include_image_language=' + codes.join(',')+'&language='+Storage.get('language','ru')+'&api_key='+TMDB.key()),(images)=>{
            let card = Arrays.clone(movie)

            console.log('Premiere', 'card loaded', card)

            delete card.translations
            delete card.credits
            delete card.credits
            delete card.spoken_languages
            delete card.production_companies
            delete card.production_countries

            let notice = {
                id,
                from: 'cub',
                title: {},
                text: {},
                time: Date.now(),
                poster: {},
                card: card
            }

            movie.translations.translations.filter(t=>codes.indexOf(t.iso_639_1) >= 0).forEach(t=>{
                notice.title[t.iso_639_1] = Lang.translate('premiere_title') + ': ' + (t.data.title || t.data.name || movie.title || movie.name)
                notice.text[t.iso_639_1]  = (t.data.overview || movie.overview || '').slice(0,130) + '...'
            })

            images.posters.forEach(i=>{
                notice.poster[i.iso_639_1] = i.file_path
            })

            if(movie.credits && movie.credits.cast){
                let casts = movie.credits.cast.filter(c=>c.known_for_department.toLowerCase() == 'acting')
                
                if(casts.length){
                    notice.author = {}

                    codes.forEach(c=>{
                        notice.author[c] = {
                            name: casts[0].name || casts[0].character,
                            img: casts[0].profile_path,
                            text: Lang.translate('premiere_author_recomend_' + (Math.floor(Math.random() * 5) + 1))
                        }
                    })
                }
            }

            Notice.pushNotice('lampa',notice, ()=>{
                console.log('Premiere', 'card added')
            },(er)=>{
                console.log('Premiere', 'card added error:', er)
            })
        })
    })
}

export default {
    init
}
