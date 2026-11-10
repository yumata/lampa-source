import Api from '../core/api/api'
import Storage from '../core/storage/storage'
import Lang from '../core/lang'
import Utils from '../utils/utils'
import {selectLogo, statusText} from './media_loading_data'

const MEDIA_MD = 767
const DASH = '—'

function imageUrl(path, size){
    if(!path) return ''
    if(/^(https?:)?\/\//i.test(path) || /^(data|blob):/i.test(path)) return path

    return Api.img(path, size)
}

function mediaData(data = {}){
    let card = data.card || data.movie || data
    let logo = selectLogo(card.images && card.images.logos, Storage.field('tmdb_lang'))

    return {
        title: data.first_title || card.title || card.name || data.title || '',
        background: imageUrl(card.backdrop_path, 'original') || card.background_image || card.background || data.background || data.img || data.thumbnail || '',
        logo: logo ? imageUrl(logo.file_path, 'w500') : card.logo || data.logo || ''
    }
}

function createMark(media, class_name){
    let mark = $('<div class="media-loading__mark-content '+class_name+'"></div>')

    if(media.logo){
        mark.append($('<img class="media-loading__logo" alt="">').attr('src', media.logo))
    }
    else{
        mark.append($('<div class="media-loading__title"></div>').text(media.title))
    }

    return mark
}

function create(){
    let html = $(`<div class="media-loading hide">
        <img class="media-loading__backdrop" alt="">
        <div class="media-loading__shade"></div>
        <div class="media-loading__content">
            <div class="media-loading__mark">
                <div class="media-loading__mark-background"></div>
                <div class="media-loading__mark-fill"></div>
            </div>
            <div class="media-loading__status">
                <div class="media-loading__row media-loading__row--main">
                    <span class="media-loading__peers">
                        <svg class="media-loading__peers-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 19h14"></path>
                        </svg>
                        <span class="media-loading__peers-value"></span>
                    </span>
                    <span class="media-loading__separator media-loading__peers-separator"></span>
                    <span class="media-loading__speed"></span>
                    <span class="media-loading__separator media-loading__speed-separator"></span>
                    <span class="media-loading__percent">0%</span>
                </div>
                <span class="media-loading__separator media-loading__rows-separator"></span>
                <div class="media-loading__row media-loading__row--extra">
                    <span class="media-loading__seeds"></span>
                    <span class="media-loading__separator media-loading__seeds-separator"></span>
                    <span class="media-loading__buffer"></span>
                    <span class="media-loading__separator media-loading__buffer-separator"></span>
                    <span class="media-loading__eta"></span>
                </div>
                <span class="media-loading__bar"></span>
            </div>
        </div>
    </div>`)
    let media = {}
    let hide_timer
    let resize_timer
    let content_size = 0

    function set(data){
        media = mediaData(data)

        let backdrop = html.find('.media-loading__backdrop')
        let background = html.find('.media-loading__mark-background')
        let fill = html.find('.media-loading__mark-fill')

        if(media.background) backdrop.attr('src', media.background).removeClass('hide')
        else backdrop.attr('src', '').addClass('hide')

        background.empty().append(createMark(media, 'media-loading__mark-content--background'))
        fill.empty().append(createMark(media, 'media-loading__mark-content--foreground'))

        html.toggleClass('media-loading--text', !media.logo)
    }

    function setValue(selector, text, empty = DASH){
        html.find(selector).text(text === null ? empty : text).toggleClass('media-loading__idle', text === null)
    }

    function setSeeds(value){
        let seeds = html.find('.media-loading__seeds').empty()

        $('<span class="media-loading__label"></span>').text(Lang.translate('torrent_preload_seeds')).appendTo(seeds)
        $('<span class="media-loading__dot"></span>').appendTo(seeds)
        $('<span class="media-loading__value"></span>').text(value === null ? DASH : value).appendTo(seeds)

        seeds.toggleClass('media-loading__idle', value === null)
    }

    function layout(){
        let status = html.find('.media-loading__status')
        let narrow = (window.innerWidth || 0) > 0 && window.innerWidth <= MEDIA_MD

        status.toggleClass('media-loading__status--tworow', narrow)

        // в одну строку не помещается — автоматически переходим на две
        if(!narrow && status[0] && status[0].clientWidth > 0 && status[0].scrollWidth > status[0].clientWidth + 1){
            status.addClass('media-loading__status--tworow')
        }
    }

    function onResize(){
        clearTimeout(resize_timer)

        resize_timer = setTimeout(()=>{
            content_size = 0

            layout()
        }, 120)
    }

    function setProgress(value){
        let progress = Math.max(0, Math.min(100, parseFloat(value) || 0))

        html.find('.media-loading__mark-fill').css('width', progress + '%')
        html.find('.media-loading__bar').css('width', progress + '%')
        html.find('.media-loading__percent').text(Math.round(progress) + '%')
    }

    /**
     * @param {number|null} value - прогресс 0..100, null — не менять
     * @param {object|string} detail - данные из preloadDetail или произвольный текст статуса
     */
    function update(value, detail){
        if(value !== null && value !== undefined) setProgress(value)

        // Произвольный текст (Loading.setText): показываем только его, остальные значения не трогаем
        if(typeof detail == 'string' && detail){
            setValue('.media-loading__speed', detail)

            return
        }

        let text = statusText(typeof detail == 'object' ? detail : null, Utils.bytesToSize, Lang.translate('torrent_preload_sec'))

        setValue('.media-loading__peers-value', text.peers, DASH + ' / ' + DASH)
        setValue('.media-loading__speed', text.speed)
        setSeeds(text.seeds)
        setValue('.media-loading__buffer', text.buffer, DASH + ' / ' + DASH)
        setValue('.media-loading__eta', text.eta)

        // Ширина колонок задана минимумом: перепроверяем раскладку, только если контент вырос
        let size = [text.peers, text.speed, text.seeds, text.buffer, text.eta].join('').length

        if(size > content_size){
            content_size = size

            if(!html.hasClass('hide')) layout()
        }
    }

    function show(data){
        clearTimeout(hide_timer)

        if(data) set(data)

        html.removeClass('hide media-loading--leaving')

        content_size = 0

        layout()

        window.addEventListener('resize', onResize)
        window.addEventListener('orientationchange', onResize)
    }

    function hide(immediate){
        clearTimeout(hide_timer)

        if(immediate){
            html.addClass('hide').removeClass('media-loading--leaving')
        }
        else{
            html.addClass('media-loading--leaving')

            hide_timer = setTimeout(()=>{
                html.addClass('hide').removeClass('media-loading--leaving')
            },300)
        }
    }

    function destroy(){
        clearTimeout(hide_timer)
        clearTimeout(resize_timer)

        window.removeEventListener('resize', onResize)
        window.removeEventListener('orientationchange', onResize)

        html.remove()
    }

    return {
        render: ()=>html,
        set,
        update,
        show,
        hide,
        destroy
    }
}

export default {
    create
}
