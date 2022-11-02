function rezka(component, _object){
    let network    = new Lampa.Reguest()
    let extract    = {}
    let embed      = component.proxy('rezka') + 'https://voidboost.net/'
    let object     = _object

    let select_id    = ''
    let filter_items = {}

    let choice = {
        season: 0,
        voice: 0,
        voice_name: ''
    }

    this.searchByKinopoisk = function(_object, kinopoisk_id){
        object = _object

        select_id = kinopoisk_id

        getFirstTranlate(kinopoisk_id, (voice)=>{
            getFilm(kinopoisk_id, voice)
        })
    }

    this.extendChoice = function(saved){
        Lampa.Arrays.extend(choice, saved, true)
    }
    
    this.reset = function(){
        component.reset()

        choice = {
            season: 0,
            voice: 0,
            voice_name: ''
        }

        component.loading(true)

        getFilm(select_id)

        component.saveChoice(choice)
    }

    this.filter = function(type, a, b){
        choice[a.stype] = b.index

        if(a.stype == 'voice') choice.voice_name = filter_items.voice[b.index]

        component.reset()

        filter()

        component.loading(true)

        getFilm(select_id, extract.voice[choice.voice].token)

        component.saveChoice(choice)

        setTimeout(component.closeFilter,10)
    }

    this.destroy = function(){
        network.clear()

        extract = null
    }

    function getSeasons(voice, call){
        let url = embed + 'serial/'+voice+'/iframe?h=gidonline.io'

        network.clear()
        network.timeout(10000)

        network.native(url,(str)=>{
            extractData(str)

            call()
        },(a,c)=>{
            component.doesNotAnswer()
        },false,{
            dataType: 'text'
        })
    }

    function getFirstTranlate(id, call){
        network.clear()
        network.timeout(10000)

        network.native(embed + 'embed/'+id + '?s=1',(str)=>{
            extractData(str)

            if(extract.voice.length) call(extract.voice[0].token)
            else component.doesNotAnswer()
        },(a,c)=>{
            component.doesNotAnswer()
        },false,{
            dataType: 'text'
        })
    }

    function getEmbed(url){
        network.clear()
        network.timeout(10000)

        network.native(url,(str)=>{
            component.loading(false)

            extractData(str)

            filter()

            append()
        },(a,c)=>{
            component.doesNotAnswer()
        },false,{
            dataType: 'text'
        })
    }

    function getFilm(id, voice){
        network.clear()

        network.timeout(10000)

        let url = embed

        if(voice){
            if(extract.season.length){
                let ses = extract.season[Math.min(extract.season.length-1,choice.season)].id

                url += 'serial/'+voice+'/iframe?s='+ses+'&h=gidonline.io'

                return getSeasons(voice, ()=>{
                    let check = extract.season.filter(s=>s.id == ses)

                    if(!check.length){
                        choice.season = extract.season.length - 1

                        url = embed + 'serial/'+voice+'/iframe?s='+extract.season[Math.min(extract.season.length-1,choice.season)].id+'&h=gidonline.io'
                    } 
                    
                    getEmbed(url)
                })
            }
            else{
                url += 'movie/'+voice+'/iframe?h=gidonline.io'

                getEmbed(url)
            }
        }
        else{
            url += 'embed/'+id
            url += '?s=1'

            getEmbed(url)
        }
    }

    function filter(){
        filter_items  = {
            season: extract.season.map(v=>v.name),
            voice: extract.season.length ? extract.voice.map(v=>v.name) : []
        }

        if(choice.voice_name){
            let inx = filter_items.voice.map(v=>v.toLowerCase()).indexOf(choice.voice_name.toLowerCase())
            
            if(inx == -1) choice.voice = 0
            else if(inx !== choice.voice){
                choice.voice = inx
            }
        }

        if(!extract.season[choice.season]) choice.season = 0
        
        component.filter(filter_items, choice)
    }

    function parseSubtitles(str){
        let subtitle = str.match("subtitle': '(.*?)'")

        if(subtitle){
            let index = -1

            return subtitle[1].split(',').map((sb)=>{
                let sp = sb.split(']')

                index++

                return {
                    label: sp[0].slice(1),
                    url: sp.pop(),
                    index: index
                }
            })
        }
    }

    function getStream(element, call, error){
        if(element.stream) return call(element.stream)

        let url = embed

        if(element.season){
            url += 'serial/'+extract.voice[choice.voice].token+'/iframe?s='+element.season+'&e='+element.episode+'&h=gidonline.io'
        }
        else{
            url += 'movie/'+element.voice.token+'/iframe?h=gidonline.io'
        }

        network.clear()

        network.timeout(3000)

        network.native(url,(str)=>{
            var videos = str.match("file': '(.*?)'")

            if(videos){
                let video = decode(videos[1]),
                    qused = '',
                    first = '',
                    mass = ['2160p','1440p','1080p Ultra','1080p','720p','480p','360p']
                
                video = video.slice(1).split(/,\[/).map((s)=>{
                    return s.split(']')[0] + ']' + (s.indexOf(' or ') > -1 ? s.split(' or').pop().trim() : s.split(']').pop())
                }).join('[')

                element.qualitys = {}

                let preferably = Lampa.Storage.get('video_quality_default','1080')

                mass.forEach((n)=>{
                    let link = video.match(new RegExp(n + "](.*?)mp4"))

                    if(link){
                        if(!first) first = link[1]+'mp4'

                        element.qualitys[n] = link[1]+'mp4'

                        if(n.indexOf(preferably) >= 0){
                            qused = link[1]+'mp4'

                            first = qused
                        } 
                    }
                })

                if(!first) element.qualitys = false

                if(first){
                    element.stream = qused || first

                    element.subtitles = parseSubtitles(str)

                    call(element.stream)
                }
                else error()
            }
            else error()

        },error,false,{
            dataType: 'text'
        })
    }

    function decode(data) {
        function product(iterables, repeat) {
            var argv = Array.prototype.slice.call(arguments),
                argc = argv.length;
            if (argc === 2 && !isNaN(argv[argc - 1])) {
                var copies = [];
                for (var i = 0; i < argv[argc - 1]; i++) {
                    copies.push(argv[0].slice()); // Clone
                }
                argv = copies;
            }
            return argv.reduce(function tl(accumulator, value) {
                var tmp = [];
                accumulator.forEach(function(a0) {
                    value.forEach(function(a1) {
                        tmp.push(a0.concat(a1));
                    });
                });
                return tmp;
            }, [
                []
            ]);
        }
    
        function unite(arr) {
            var final = [];
            arr.forEach(function(e) {
                final.push(e.join(""))
            })
            return final;
        }
        var trashList = ["@", "#", "!", "^", "$"];
        var two = unite(product(trashList, 2));
        var tree = unite(product(trashList, 3));
        var trashCodesSet = two.concat(tree);
    
        var arr = data.replace("#h", "").split("//_//");
        var trashString = arr.join('');
    
        trashCodesSet.forEach(function(i) {
            trashString = trashString.replace(new RegExp(btoa(i),'g'),'')
        })

        var result = ''

        try{
            result = atob(trashString.substr(2))
        }
        catch(e){}

        return result
    }

    function extractData(str){
        extract.voice   = []
        extract.season  = []
        extract.episode = []

        str = str.replace(/\n/g,'')

        let voices = str.match('<select name="translator"[^>]+>(.*?)</select>')
        let sesons = str.match('<select name="season"[^>]+>(.*?)</select>')
        let episod = str.match('<select name="episode"[^>]+>(.*?)</select>')

        if(sesons){
            let select = $('<select>'+sesons[1]+'</select>')

            $('option',select).each(function(){
                extract.season.push({
                    id: $(this).attr('value'),
                    name: $(this).text()
                })
            })
        }

        if(voices){
            let select = $('<select>'+voices[1]+'</select>')

            $('option',select).each(function(){
                let token = $(this).attr('data-token')

                if(token){
                    extract.voice.push({
                        token: token,
                        name: $(this).text(),
                        id: $(this).val()
                    })
                }
            })
        }

        if(episod){
            let select = $('<select>'+episod[1]+'</select>')

            $('option',select).each(function(){
                extract.episode.push({
                    id: $(this).attr('value'),
                    name: $(this).text()
                })
            })
        }
    }

    function append(){
        component.reset()

        let items = []

        if(extract.season.length){
            extract.episode.forEach(episode=>{
                items.push({
                    title: episode.name,
                    quality: '720p ~ 1080p',
                    season: extract.season[Math.min(extract.season.length-1,choice.season)].id,
                    episode: parseInt(episode.id),
                    info: extract.voice[choice.voice].name,
                    voice: extract.voice[choice.voice],
                    voice_name: extract.voice[choice.voice].name,
                })
            })
        }
        else{
            extract.voice.forEach(voice => {
                items.push({
                    title: voice.name.length > 3 ? voice.name : object.movie.title,
                    quality: '720p ~ 1080p',
                    voice: voice,
                    info: '',
                    voice_name: voice.name,
                })
            })
        }

        component.draw(items,{
            onEnter: (item, html)=>{
                getStream(item,(stream)=>{
                    let first = {
                        url: stream,
                        timeline: item.timeline,
                        quality: item.qualitys,
                        title: item.title
                    }

                    Lampa.Player.play(first)

                    if(item.season){
                        let playlist = []

                        items.forEach(elem => {
                            let cell = {
                                url: (call)=>{
                                    getStream(elem,(stream)=>{
                                        cell.url = stream
                                        cell.quality = elem.qualitys

                                        elem.mark()

                                        call()
                                    },()=>{
                                        cell.url = ''

                                        call()
                                    })
                                },
                                timeline: elem.timeline,
                                title: elem.title,
                            }

                            if(elem == item) cell.url = stream

                            playlist.push(cell)
                        })

                        Lampa.Player.playlist(playlist)
                    }
                    else{
                        Lampa.Player.playlist([first])
                    }

                    if(item.subtitles && Lampa.Player.subtitles) Lampa.Player.subtitles(item.subtitles)

                    item.mark()
                },()=>{
                    Lampa.Noty.show(Lampa.Lang.translate('online_nolink'))
                })
            },
            onContextMenu: (item, html, data, call)=>{
                getStream(item,(stream)=>{call({file:stream,quality:item.qualitys})})
            }
        })
    }
}

export default rezka