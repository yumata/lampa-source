import Utils from './utils'

class Channel {
    constructor(data, playlist) {
        this.data = data
        this.playlist = playlist
    }

    /**
     * Загрузить шаблон
     */
    build() {
        this.card = Lampa.Template.js('cub_iptv_channel_main_board')
        this.icon = this.card.querySelector('.iptv-channel__ico') || {}

        this.card.addEventListener('visible', this.visible.bind(this))
    }

    /**
     * Загрузить картинку
     */
    image() {
        this.icon.onload = () => {
            this.card.classList.add('loaded')

            if(this.data.logo.indexOf('epg.it999') == -1){
                this.card.addClass('small--icon')
            }
        }

        this.icon.onerror = () => {
            let simb = document.createElement('div')
                simb.addClass('iptv-channel__simb')
                simb.text(this.data.name.length <= 3 ? this.data.name.toUpperCase() : this.data.name.replace(/[^a-z|а-я|0-9]/gi,'').toUpperCase()[0])

            let text = document.createElement('div')
                text.addClass('iptv-channel__name')
                text.text(Utils.clear(this.data.name))

            this.card.querySelector('.iptv-channel__body').append(simb)
            this.card.querySelector('.iptv-channel__body').append(text)
        }
    }

    /**
     * Создать
     */
    create() {
        this.build()

        this.card.addEventListener('hover:focus', () => {
            if (this.onFocus) this.onFocus(this.card, this.data)
        })

        this.card.addEventListener('hover:hover', () => {
            if (this.onHover) this.onHover(this.card, this.data)
        })

        this.card.addEventListener('hover:enter', () => {
            let play = {
                title: this.data.name || '',
                url: this.data.url,
                tv: true
            }

            Lampa.Player.runas(Lampa.Storage.field('player_iptv'))

            Lampa.Player.play(play)
            Lampa.Player.playlist(this.playlist.map((a)=>{ return {
                title: a.name, 
                url: a.url,
                tv: true
            } }))
        })

        this.image()
    }

    emit(){
        
    }

    use(){
        
    }

    /**
     * Загружать картинку если видна карточка
     */
    visible() {
        if(this.data.logo) this.icon.src = this.data.logo
        else this.icon.onerror()
        
        if(this.onVisible) this.onVisible(this.card, this.data)
    }

    /**
     * Уничтожить
     */
    destroy() {
        this.icon.onerror = () => { }
        this.icon.onload = () => { }

        this.icon.src = ''

        this.card.remove()

        this.card = null

        this.icon = null
    }

    /**
     * Рендер
     * @returns {object}
     */
    render(js) {
        return js ? this.card : $(this.card)
    }
    
}

export default Channel