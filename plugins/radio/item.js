function item(data){
    let item = Lampa.Template.get('radio_item',{
        name: data.title
    })

    let img = item.find('img')[0]

    img.onerror = function(){
        img.src = './img/img_broken.svg'
    }

    img.src = data.icon_gray

    this.render = function(){
        return item
    }

    this.destroy = function(){
        img.onerror = ()=>{}
        img.onload = ()=>{}

        img.src = ''

        item.remove()
    }
}

export default item