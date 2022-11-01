function collaps(component, _object){
    let network    = new Lampa.Reguest()
    let extract    = {}
    let embed      = component.proxy('collaps') +  'https://api.delivembd.ws/embed/'
    let object     = _object

    let filter_items = {}

    let choice = {
        season: 0,
        voice: 0
    }

    this.searchByKinopoisk = function(_object, kinopoisk_id){
        object = _object

        let url = embed + 'kp/' + kinopoisk_id

        network.silent(url, (str) => {
            if(str){
                parse(str)
            }
            else component.doesNotAnswer()

            component.loading(false)
        }, (a,c)=>{
            component.doesNotAnswer()
        }, false,{
            dataType: 'text'
        })
    }

    this.extendChoice = function(saved){
        Lampa.Arrays.extend(choice, saved, true)
    }

    this.reset = function(){
        component.reset()

        choice = {
            season: 0,
            voice: 0
        }

        filter()

        append(filtred())

        component.saveChoice(choice)
    }

    this.filter = function(type, a, b){
        choice[a.stype] = b.index

        component.reset()

        filter()

        append(filtred())

        component.saveChoice(choice)
    }

    this.destroy = function(){
        network.clear()

        extract = null
    }

    function parse(str){
        str = str.replace(/\n/g,'')

        let find = str.match('makePlayer\\({(.*?)}\\);')

        if(find){
            let json

            try{
                json = eval('({'+find[1]+'})')
            }
            catch(e){}

            if(json){
                extract = json

                filter()

                append(filtred())
            }
            else component.doesNotAnswer()
        }
    }

    function filter(){
        filter_items = {
            season: [],
            voice: [],
            quality: []
        }

        if(extract.playlist){
            if(extract.playlist.seasons){
                extract.playlist.seasons.forEach((season)=>{
                    filter_items.season.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + season.season)
                })
            }
        }
        else{

        }

        filter_items.season.sort()

        component.filter(filter_items, choice)
    }

    function filtred(){
        let filtred = []

        let filter_data = component.getChoice()
        
        if(extract.playlist){
            extract.playlist.seasons.forEach((season, i)=>{
                if(i == filter_data.season){
                    season.episodes.forEach(episode=>{
                        filtred.push({
                            file: episode.hls,
                            episode: parseInt(episode.episode),
                            season: season.season,
                            title: episode.title,
                            quality: '',
                            info: episode.audio.names.slice(0,5).join(', '),
                            subtitles: episode.cc ? episode.cc.map(c=>{ return {label: c.name, url: c.url}}) : false
                        })
                    })
                }
            })

        }
        else if(extract.source){
            let resolution  = Lampa.Arrays.getKeys(extract.qualityByWidth).pop()
            let max_quality = extract.qualityByWidth ? extract.qualityByWidth[resolution] || 0 : 0
            
            filtred.push({
                file: extract.source.hls,
                title: extract.title,
                quality: max_quality ? max_quality + 'p / ' : '',
                info: extract.source.audio.names.slice(0,4).join(', '),
                subtitles: extract.source.cc ? extract.source.cc.map(c=>{ return {label: c.name, url: c.url}}) : false
            })
        }

        return filtred
    }

    function append(items) {
        component.reset()

        component.draw(items,{
            onEnter: (item, html)=>{
                if(item.file){
                    let playlist = []
                    let first = {
                        url: item.file,
                        timeline: item.timeline,
                        title: item.title,
                        subtitles: item.subtitles
                    }

                    if(item.season){
                        items.forEach(elem=>{
                            playlist.push({
                                title: elem.title,
                                url: elem.file,
                                timeline: elem.timeline,
                                subtitles: elem.subtitles,
                                callback: ()=>{
                                    elem.mark()
                                }
                            })
                        })
                    }
                    else{
                        playlist.push(first)
                    }

                    if(playlist.length > 1) first.playlist = playlist

                    Lampa.Player.play(first)

                    Lampa.Player.playlist(playlist)

                    item.mark()
                }
                else Lampa.Noty.show(Lampa.Lang.translate('online_nolink'))
            },
            onContextMenu: (item, html, data, call)=>{
                call({file: item.file})
            }
        })
    }
}

export default collaps