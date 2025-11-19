function Author(author_data = false){
    this.html = Lampa.Template.js('shots_author')
    this.img  = this.html.find('img')
    this.box  = this.html.find('.shots-author__img')

    this.img.onload = ()=>{
        this.box.addClass('loaded')
    }

    this.img.onerror = ()=>{
        this.img.src = './img/img_broken.svg'
    }

    this.create = function(){
        if(author_data) this.update(author_data)
    }

    this.update = function(data){
        this.box.removeClass('loaded')

        this.img.src = data.img || './img/img_broken.svg'

        this.html.find('.shots-author__name').text(data.name || 'Unknown')
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.img.onload = null
        this.img.onerror = null

        this.html.remove()
    }
}

export default Author