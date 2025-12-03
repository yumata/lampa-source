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

        let email = data.email
        let icon  = data.icon

        if(!email){
            email = Lampa.Account.Permit.account.email
            icon  = Lampa.Account.Permit.account.profile.icon
        }

        this.img.src =  Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/img/profiles/' + (icon || 'l_1') + '.png'

        this.html.find('.shots-author__name').text(Lampa.Utils.capitalizeFirstLetter((email || 'Unknown').split('@')[0]))
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