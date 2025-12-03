import Tags from './tags.js'

function Preview(data){
    this.data = data
    this.html = Lampa.Template.get('shots_preview')

    this.create = function(){
        if(this.data.recording.screenshot){
            this.html.find('.shots-preview__screenshot img').css({opacity: 1}).eq(0)[0].src = this.data.recording.screenshot
        }

        let release_date = this.data.play_data.card.release_date || this.data.play_data.card.first_air_date || ''
        let year = release_date.slice(0,4)

        this.html.find('.shots-preview__year').html(year || '----')
        this.html.find('.shots-preview__title').html(this.data.play_data.card.name || this.data.play_data.card.title || '')

        this.tags = new Tags(this.data.play_data)
        this.tags.create()

        this.html.find('.shots-preview__body').append(this.tags.render())
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.html.remove()
    }
}

export default Preview