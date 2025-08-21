import Utils from '../../../../utils/math'

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

        icon.on('visible', ()=>{
            if(this.data.icon_svg){
                icon.find('.full-person__photo').html(this.data.icon_svg)

                if(this.data.icon_bgcolor) icon.find('.full-person__photo').style.backgroundColor = this.data.icon_bgcolor
                if(this.data.icon_color)   icon.find('.full-person__photo').style.color           = this.data.icon_color

                icon.addClass('full-person--loaded')
                icon.addClass('full-person--svg')
            }
            else{
                Utils.imgLoad(icon.find('img'), this.data.icon_img || './img/actor.svg', (img)=>{
                    icon.addClass('full-person--loaded')
                }, (img)=>{
                    img.src = './img/actor.svg'
                })
            }
        })

        this.html.find('.items-line__title').html(icon)
    }
}

export default Module