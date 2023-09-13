import Socket from '../../utils/socket'
import Notice from '../notice'
import Lang from '../../utils/lang'
import Arrays from '../../utils/arrays'
import Reguest from '../../utils/reguest'
import TMDB from '../../utils/tmdb'
import Storage from '../../utils/storage'

let network

let translates = {
    premiere_author_recomend_1: {
        ru: 'Закажите пиццу и готовьтесь к драйву.',
        en: 'Order pizza and get ready for some excitement.',
        uk: 'Замовте піцу та підготуйтеся до драйву.',
        be: 'Замовіце піцу і падрыхтуйцеся да драйву.',
        pt: 'Peça pizza e prepare-se para a emoção.',
        zh: '订披萨，准备好迎接刺激。',
        bg: 'Поръчайте пица и се пригответе за забава',
    },
    premiere_author_recomend_2: {
        ru: 'Вечеринка только начинается.',
        en: 'The party is just getting started.',
        uk: 'Вечірка тільки починається.',
        be: 'Вечарынка толькі пачынаецца.',
        pt: 'A festa está apenas começando.',
        zh: '派对刚刚开始。'
        bg: 'Вечеринката тъкмо започва'
    },
    premiere_author_recomend_3: {
        ru: 'Подготовьтесь к адреналину.',
        en: 'Get ready for some adrenaline.',
        uk: 'Підготуйтесь до адреналіну.',
        be: 'Прыгатуйцеся да адрэналіну.',
        pt: 'Prepare-se para a adrenalina.',
        zh: '准备迎接肾上腺素。',
        bg: 'Бъдете готови за адреналина.',
    },
    premiere_author_recomend_4: {
        ru: 'Готовы к незабываемому вечеру?',
        en: 'Ready for an unforgettable evening?',
        uk: 'Готові до незабутнього вечора?',
        be: 'Гатовыя да нязабыўнага вечара?',
        pt: 'Pronto para uma noite inesquecível?',
        zh: '准备好度过难忘的夜晚了吗？',
        bg: 'Готови ли сте за една незабравима вечер?',
    },
    premiere_author_recomend_5: {
        ru: 'Рекомендую к просмотру.',
        en: 'I recommend watching it.',
        uk: 'Я рекомендую його подивитися.',
        be: 'Я рэкамендую гэта праглядзець.',
        pt: 'Eu recomendo assistir.',
        zh: '我推荐观看它。',
        bg: 'Препоръчвам ви да гледате',
    },
    premiere_title: {
        ru: 'Премьера',
        en: 'Premiere',
        uk: 'Прем\'єра',
        be: 'Прем’ера',
        pt: 'Estréia',
        zh: '首映'
        bg: 'Премиера',
    }
}

function init(){
    network = new Reguest()

    Socket.listener.follow('message',(e)=>{
        if(e.method == 'premiere') update(e.data)
    })
}

function update(data){
    let id = data.type + '/' + data.id
    
    if(Notice.classes.lampa.notices.find(n=>n.id == id)) return

    let codes = Arrays.getKeys(Lang.codes())

    network.silent(TMDB.api(id + '?append_to_response=translations,credits&language='+Storage.get('language','ru')+'&api_key='+TMDB.key()),(movie)=>{
        network.silent(TMDB.api(id + '/images?include_image_language=' + codes.join(',')+'&language='+Storage.get('language','ru')+'&api_key='+TMDB.key()),(images)=>{
            let card = Arrays.clone(movie)

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
                notice.title[t.iso_639_1] = translates.premiere_title[t.iso_639_1] + ': ' + (t.data.title || t.data.name || movie.title || movie.name)
                notice.text[t.iso_639_1]  = (t.data.overview || movie.overview || '').slice(0,130) + '...'
            })

            images.posters.forEach(i=>{
                notice.poster[i.iso_639_1] = i.file_path
            })

            if(movie.credits && movie.credits.cast){
                let casts = movie.credits.cast.filter(c=>c.known_for_department.toLowerCase() == 'acting')
                
                if(casts.length){
                    notice.author = {}

                    let recomend = translates['premiere_author_recomend_' + (Math.floor(Math.random() * 5) + 1)]

                    codes.forEach(c=>{
                        notice.author[c] = {
                            name: casts[0].character,
                            img: casts[0].profile_path,
                            text: recomend[c] || recomend.en
                        }
                    })
                }
            }

            Notice.pushNotice('lampa',notice)
        })
    })
}

export default {
    init
}
