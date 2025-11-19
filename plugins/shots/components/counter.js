function Counter(name){
    this.html = Lampa.Template.js('shots_counter')
    this.name = this.html.find('span')

    this.name.text(name || '')

    this.update = function(view){
        this.html.find('div').text(Lampa.Utils.bigNumberToShort(view || 0))
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.html.remove()
    }
}

export default Counter