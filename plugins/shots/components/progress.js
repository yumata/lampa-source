function Progress(params = {}){
    this.html = Lampa.Template.get('shots_progress')
    this.text = params.text || ''

    this.create = function(){
        this.setText(this.text)
        this.setProgress(0)
        this.setState('waiting')
    }

    this.setText = function(text){
        this.text = text

        this.html.find('.shots-progress__text').text(this.text)
    }

    this.setProgress = function(percent){
        this.html.find('.shots-progress__bar div').css('width', percent + '%')
    }

    this.setState = function(state){
        this.html.removeClass('state--waiting state--uploading state--done')
        
        this.html.addClass('state--' + state)
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.html.remove()
    }
}

export default Progress