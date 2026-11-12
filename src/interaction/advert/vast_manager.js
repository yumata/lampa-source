import Utils from '../../utils/utils'
import Manifest from '../../core/manifest'
import Storage from '../../core/storage/storage'
import Platform from '../../core/platform'
import Timer from '../../core/timer'
import Arrays from '../../utils/arrays'
import VPN from '../../core/vpn'

class VastManager {
    constructor(params){
        this.played = {
            time: 0,
            prerolls: []
        }

        this.data_loaded = {
            ad: []
        }

        Arrays.extend(params, {
            api: 'preroll',
            cooling: 1000 * 60 * 5
        })

        this.params = params
    }

    init(){
        this.load()

        Timer.add(1000 * 60 * 60, this.load.bind(this))
    }

    load(){
        let pos = 0
        let self = this

        let request = function(){
            let domain = Manifest.cub_mirrors[pos]

            if(!domain) return

            let url = Utils.protocol() + domain + '/api/ad/get/' + self.params.api
            let xhr = new XMLHttpRequest()

            xhr.open('GET', url, true)
            xhr.timeout = 10000

            xhr.onload = function(){
                if(xhr.status >= 200 && xhr.status < 300){
                    try{
                        let data = JSON.parse(xhr.responseText)

                        if(data.ad && Arrays.isArray(data.ad)){
                            self.data_loaded.ad = data.ad

                            console.log('Ad', 'manager ' + self.params.api, 'loaded', self.data_loaded.ad.length)
                        }
                        else{
                            console.log('Ad', 'manager ' + self.params.api, 'wrong format from', domain)

                            pos++

                            request()
                        }
                    }
                    catch(e){
                        console.log('Ad', 'manager ' + self.params.api, 'parse error from', domain)

                        pos++

                        request()
                    }
                }
                else{
                    console.log('Ad', 'manager ' + self.params.api, 'no load from', domain)

                    pos++

                    request()
                }
            }

            xhr.onerror = function(){
                console.log('Ad', 'manager ' + self.params.api, 'no load from', domain)

                pos++

                request()
            }

            xhr.ontimeout = function(){
                console.log('Ad', 'manager ' + self.params.api, 'timeout from', domain)

                pos++

                request()
            }

            xhr.send()
        }

        request()
    }

    coolingReady(){
        return Date.now() - this.played.time > this.params.cooling
    }

    markCooling(){
        this.played.time = Date.now()
    }

    withoutGenres(without_genre){
        let movie = Storage.get('activity', '{}').movie

        try{
            let genres = without_genre.split(',').map(g => parseInt(g))

            if(genres.length && movie.genres.find(g => genres.find(gg => gg == g.id))){
                return true
            }
        }
        catch(e){}
    }

    orderTag(tags){
        tags.sort((a, b) => b.impressions - a.impressions)

        return tags[0]
    }

    filter(view){
        view = view.filter(v => !this.played.prerolls.find(pr => pr == v.name))

        if(!window.lampa_settings.developer.ads){
            view = view.filter(v => this.withoutGenres(v.whitout_genre) !== true)
            view = view.filter(v => v.screen == (Platform.screen('tv') ? 'tv' : 'mobile') || v.screen == 'all')
            view = view.filter(v => v.platforms.indexOf(Platform.get()) !== -1 || v.platforms.indexOf('all') !== -1 || !v.platforms.length)
            view = view.filter(v => v.region.split(',').indexOf(VPN.code()) !== -1 || v.region.indexOf('all') !== -1 || !v.region.length)
        }

        console.log('Ad', 'manager ' + this.params.api, 'filter view', view)

        if(view.length){
            let preroll = this.orderTag(view)

            this.played.prerolls.push(preroll.name)

            return preroll
        }

        return null
    }

    get(first_run = false){
        if(first_run) this.played.prerolls = []

        return this.data_loaded.ad.length ? this.filter(this.data_loaded.ad) : null
    }
}

export default VastManager
