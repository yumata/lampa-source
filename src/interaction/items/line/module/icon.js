class Module{
    onCreate(){
        let icon = $(`<div class="full-person layer--visible full-person--small">
            <div class="full-person__photo">
                <img>
            </div>
        
            <div class="full-person__body">
                <div class="full-person__name">${this.data.title}</div>
            </div>
        </div>`)[0]

        let img = icon.find('img')

        img.onload = ()=>{
            icon.addClass('full-person--loaded')
        }
        
        img.onerror = ()=>{
            img.src = './img/actor.svg'
        }

        icon.on('visible', ()=>{
            icon.find('img').src = this.data.icon || './img/actor.svg'
        })

        this.html.find('.items-line__title').html(icon)
    }
}

export default Module