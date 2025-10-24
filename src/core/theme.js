import Storage from './storage/storage'
import Utils from '../utils/utils'

class Theme{
    constructor(){

    }

    init(){
        if(this.get()) this.set(this.get())
    }

    toggle(url){
        if(url){
            Storage.set('cub_theme',url)

            this.set(url)
        }
        else{
            Storage.set('cub_theme','')

            $('#cub-theme').remove()
        }
    }

    get(){
        return Storage.get('cub_theme','')
    }

    set(url){
        $('#cub-theme').remove()

        let href = Utils.rewriteIfHTTPS(Utils.addUrlComponent(url, 'token='+encodeURIComponent(Storage.get('account','{}').token)))

        let css = $('<link rel="stylesheet" href="'+href+'" id="cub-theme">')

        $('body').append(css)
    }
}

export default new Theme()