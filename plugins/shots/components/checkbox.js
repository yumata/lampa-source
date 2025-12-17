function Checkbox(params = {}){
    this.html  = Lampa.Template.get('shots_checkbox')
    this.state = params.state || false

    this.create = function(){
        this.setText(params.text || '')
        this.setState(this.state)

        this.html.on('hover:enter', ()=>{
            this.setState(!this.state)
        })
    }

    this.setText = function(text){
        this.html.find('.shots-checkbox__text').html(text)
    }

    this.setState = function(state){
        this.state = state

        this.html.toggleClass('shots-checkbox--checked',state)
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.html.remove()
    }
}

export default Checkbox