import Utils from '../utils/utils.js'

function Tags(tags_data = false){
    this.html = Lampa.Template.get('shots_tags')

    this.create = function(){
        if(tags_data) this.update(tags_data)
    }

    this.update = function(data){
        let tags = []

        this.html.empty()

        data.season && tags.push('S-'+data.season)
        data.episode && tags.push('E-'+data.episode)

        let voice = Utils.shortVoice(data.voice_name)

        if(data.voice_name && voice !== data.card_title) tags.push(voice)

        this.html.append(tags.map(tag=>'<div>'+tag+'</div>').join(''))
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.html.remove()
    }
}

export default Tags