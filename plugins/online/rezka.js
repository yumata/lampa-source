function rezka(component, _object){
    let network    = new Lampa.Reguest()
    let extract    = {}
    let embed      = 'https://voidboost.net/'
    let object     = _object

    let select_title = ''
    let select_id    = ''
    let filter_items = {}

    let choice = {
        season: 0,
        voice: 0
    }

    /**
     * Поиск
     * @param {Object} _object 
     */
    this.search = function(_object, kinopoisk_id){
        object = _object

        select_id    = kinopoisk_id
        select_title = object.movie.title

        getFirstTranlate(kinopoisk_id, (voice)=>{
            getFilm(kinopoisk_id, voice)
        })
    }

    this.extendChoice = function(saved){
        Lampa.Arrays.extend(choice, saved, true)
    }

    /**
     * Сброс фильтра
     */
     this.reset = function(){
        component.reset()

        choice = {
            season: 0,
            voice: 0
        }

        component.loading(true)

        getFilm(select_id)

        component.saveChoice(choice)
    }

    /**
     * Применить фильтр
     * @param {*} type 
     * @param {*} a 
     * @param {*} b 
     */
     this.filter = function(type, a, b){
        choice[a.stype] = b.index

        component.reset()

        filter()

        component.loading(true)

        getFilm(select_id, extract.voice[choice.voice].token)

        component.saveChoice(choice)

        setTimeout(component.closeFilter,10)
    }

    /**
     * Уничтожить
     */
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
        },()=>{
            component.empty()
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
            else component.empty()
        },()=>{
            component.empty()
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
        },()=>{
            component.empty()
        },false,{
            dataType: 'text'
        })
    }

    /**
     * Запросить фильм
     * @param {Int} id 
     * @param {String} voice 
     */
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

    /**
     * Построить фильтр
     */
     function filter(){
        filter_items  = {
            season: extract.season.map(v=>v.name),
            voice: extract.season.length ? extract.voice.map(v=>v.name) : []
        }
        
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

    /**
     * Получить поток
     * @param {*} element 
     */
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
                
                //ухня тут происходит, хрен знает почему после .join() возврошает только последнию ссылку
                video = video.slice(1).split(/,\[/).map((s)=>{
                    return s.split(']')[0] + ']' + (s.indexOf(' or ') > -1 ? s.split('or').pop().trim() : s.split(']').pop())
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

    /*
    function decode(x){
        let file = x.replace('JCQkIyMjIyEhISEhISE=', '')
            .replace('QCMhQEBAIyMkJEBA', '')
            .replace('QCFeXiFAI0BAJCQkJCQ=', '')
            .replace('Xl4jQEAhIUAjISQ=', '')
            .replace('Xl5eXl5eIyNAzN2FkZmRm', '')
            .split('//_//')
            .join('')
            .substr(2)
        try {
            return atob(file)
        } catch (e){
            console.log("Encrypt error: ", file)
            return ''
        }
    }
    */

    /**
     * Получить данные о фильме
     * @param {String} str 
     */
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

    /**
     * Показать файлы
     */
    function append(){
        component.reset()

        let items  = []
        let viewed = Lampa.Storage.cache('online_view', 5000, [])

        if(extract.season.length){
            extract.episode.forEach(episode=>{
                items.push({
                    title: 'S' + extract.season[Math.min(extract.season.length-1,choice.season)].id + ' / ' + episode.name,
                    quality: '720p ~ 1080p',
                    season: extract.season[Math.min(extract.season.length-1,choice.season)].id,
                    episode: parseInt(episode.id),
                    info: ' / ' + extract.voice[choice.voice].name,
                    voice: extract.voice[choice.voice]
                })
            })
        }
        else{
            extract.voice.forEach(voice => {
                items.push({
                    title: voice.name.length > 3 ? voice.name : select_title,
                    quality: '720p ~ 1080p',
                    voice: voice,
                    info: ''
                })
            })
        }

        items.forEach(element => {
            let hash = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title].join('') : object.movie.original_title)
            let view = Lampa.Timeline.view(hash)
            let item = Lampa.Template.get('online',element)

            let hash_file = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title,element.voice.name].join('') : object.movie.original_title + element.voice.name)

            element.timeline = view

            item.append(Lampa.Timeline.render(view))

            if(Lampa.Timeline.details){
                item.find('.online__quality').append(Lampa.Timeline.details(view,' / '))
            }

            if(viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">'+Lampa.Template.get('icon_star',{},true)+'</div>')

            item.on('hover:enter',()=>{
                if(object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

                getStream(element,(stream)=>{
                    let first = {
                        url: stream,
                        timeline: view,
                        quality: element.qualitys,
                        title: element.title
                    }

                    Lampa.Player.play(first)

                    Lampa.Player.playlist([first])

                    if(element.subtitles && Lampa.Player.subtitles) Lampa.Player.subtitles(element.subtitles)

                    if(viewed.indexOf(hash_file) == -1){
                        viewed.push(hash_file)

                        item.append('<div class="torrent-item__viewed">'+Lampa.Template.get('icon_star',{},true)+'</div>')

                        Lampa.Storage.set('online_view', viewed)
                    }
                },()=>{
                    Lampa.Noty.show('Не удалось извлечь ссылку')
                })
            })

            component.append(item)

            component.contextmenu({
                item,
                view,
                viewed,
                hash_file
            })
        })

        component.start(true)
    }
}

export default rezka