import Controller from '../../../core/controller'
import Select from '../../select'
import Arrays from '../../../utils/arrays'
import Lang from '../../../core/lang'
import Utils from '../../../utils/utils'
import Html from './html'
import listener from './listener'

let tracks    = []
let subs      = []
let flows     = false
let qualitys  = false
let translates = {}

function normalName(name){
    return name.replace(/^[0-9]+(\.)?([\t ]+)?/,'').replace(/\s#[0-9]+/,'')
}

function init(){
    /**
     * Выбор потока
     */
    Html.elem('flow').on('hover:enter',()=>{
        if(flows){
            let enabled = Controller.enabled().name

            Select.show({
                title: Lang.translate('player_flow'),
                items: flows,
                onSelect: (a)=>{
                    flows.forEach(element => {
                        element.enabled  = false
                        element.selected = false
                    })

                    a.enabled  = true
                    a.selected = true

                    Controller.toggle(enabled)

                    listener.send('flow',{url: a.url})
                },
                onBack: ()=>{
                    Controller.toggle(enabled)
                }
            })
        }
    })

    /**
     * Выбор качества
     */
    Html.elem('quality').text('auto').on('hover:enter',()=>{
        if(qualitys){
            let qs = []
            let nw = Html.elem('quality').text()

            if(Arrays.isArray(qualitys)){
                qs = qualitys
            }
            else{
                for(let i in qualitys){
                    let qa = qualitys[i]
                    let qu = typeof qa == 'object' ? qa.url : typeof qa == 'string' ? qa : ''
                    let lb = typeof qa == 'object' ? qa.label : ''

                    qs.push({
                        quality: i,
                        title: i + (lb ? '<sub>' + lb + '</sub>' : ''),
                        url: qu,
                        selected: nw == Utils.qualityToText(i),
                        call: typeof qa == 'object' ? qa.call : false,
                        instance: qa
                    })
                }
            }

            if(!qs.length) return

            let enabled = Controller.enabled().name

            Select.show({
                title: Lang.translate('player_quality'),
                items: qs,
                onSelect: (a)=>{
                    if(a.call){
                        Controller.toggle(enabled)

                        a.call(a.instance, (url)=>{
                            Html.elem('quality').text(Utils.qualityToText(a.quality))

                            qs.forEach(q=>q.selected = false)

                            a.selected = true

                            listener.send('quality',{name: a.quality, url: url})

                            if(a.instance && a.instance.trigger) a.instance.trigger()
                        })
                    }
                    else{
                        Html.elem('quality').text(Utils.qualityToText(a.quality))

                        qs.forEach(q=>q.selected = false)

                        a.enabled = true
                        a.selected = true

                        if(!Arrays.isArray(qualitys) || a.change_quality) listener.send('quality',{name: a.quality, url: a.url})

                        if(a.instance && a.instance.trigger) a.instance.trigger()

                        Controller.toggle(enabled)
                    }
                },
                onBack: ()=>{
                    Controller.toggle(enabled)
                }
            })
        }
    })

    /**
     * Выбор аудиодорожки
     */
    Html.elem('tracks').on('hover:enter',(e)=>{
        if(tracks.length){
            tracks.forEach((element, p) => {
                let name = []
                let from = translates.tracks && Arrays.isArray(translates.tracks) && translates.tracks[p] ? translates.tracks[p] : element

                name.push(p + 1)
                name.push(normalName(from.language || from.name || Lang.translate('player_unknown')))

                if(from.label) name.push(normalName(from.label))

                if(from.extra){
                    if(from.extra.channels) name.push(from.extra.channels + ' Ch')
                    if(from.extra.fourCC) name.push(from.extra.fourCC)
                }

                element.title = name.join(' / ')
            })

            let enabled = Controller.enabled().name

            Select.show({
                title: Lang.translate('player_tracks'),
                items: tracks,
                onSelect: (a)=>{
                    tracks.forEach(element => {
                        element.enabled  = false
                        element.selected = false
                    })

                    a.enabled  = true
                    a.selected = true

                    Controller.toggle(enabled)

                    if(a.onSelect) a.onSelect(a)
                },
                onBack: ()=>{
                    Controller.toggle(enabled)
                }
            })
        }
    })

    /**
     * Выбор субтитров
     */
    Html.elem('subs').on('hover:enter',(e)=>{
        if(subs.length){
            if(subs[0].index !== -1){
                let any_select = subs.find(s=>s.selected)

                Arrays.insert(subs, 0, {
                    title: Lang.translate('player_disabled'),
                    selected: any_select ? false : true,
                    index: -1
                })
            }

            subs.forEach((element, p) => {
                if(element.index !== -1){
                    let track_num = element.extra && element.extra.track_num ? parseInt(element.extra.track_num) : element.index

                    let from = translates.subs && Arrays.isArray(translates.subs) && translates.subs[track_num] ? translates.subs[track_num] : element

                    element.title = p + ' / ' + normalName(from.language && from.label ? from.language + ' / ' + from.label : from.language || from.label || Lang.translate('player_unknown'))
                }
            })

            let enabled = Controller.enabled().name

            Select.show({
                title: Lang.translate('player_subs'),
                items: subs,
                onSelect: (a)=>{
                    subs.forEach(element => {
                        element.mode     = 'disabled'
                        element.selected = false
                    })

                    a.mode     = 'showing'
                    a.selected = true

                    listener.send('subsview',{status: a.index > -1})

                    Controller.toggle(enabled)

                    if(a.onSelect) a.onSelect(a)
                },
                onBack: ()=>{
                    Controller.toggle(enabled)
                }
            })
        }
    })
}

function setSubs(su){
    subs = su

    Html.elem('subs').toggleClass('hide',false)
}

function setTracks(tr){
    tracks = tr

    Html.elem('tracks').toggleClass('hide',false)
}

function setLevels(levels, current){
    if(qualitys && Object.keys(qualitys).length) return

    qualitys = levels

    Html.elem('quality').text(Utils.qualityToText(current))
}

function quality(qs, url){
    if(qs){
        Html.elem('quality').toggleClass('hide',false)

        qualitys = qs

        for(let i in qs){
            let qa = qs[i]
            let qu = typeof qa == 'object' ? qa.url : typeof qa == 'string' ? qa : ''

            if(qu == url){
                Html.elem('quality').text(Utils.qualityToText(i))
                break
            }
        }
    }
}

function setTranslate(data){
    if(typeof data == 'object') translates = data
}

function updateTranslate(where, data){
    if(!translates[where]) translates[where] = data
}

function setFlows(data){
    flows = typeof data == 'object' ? data : false

    Html.elem('flow').toggleClass('hide', flows ? false : true)
}

function hasQuality(){
    return qualitys
}

function destroy(){
    tracks    = []
    subs      = []
    qualitys  = false
    flows     = false
    translates = {}

    Html.elem('quality').text('auto')

    Html.elem('subs').toggleClass('hide',true)
    Html.elem('tracks').toggleClass('hide',true)
    Html.elem('flow').toggleClass('hide',true)
}

export default {
    init,
    setSubs,
    setTracks,
    setLevels,
    quality,
    setTranslate,
    updateTranslate,
    setFlows,
    hasQuality,
    destroy
}
