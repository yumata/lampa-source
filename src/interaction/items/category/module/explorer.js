import Explorer from '../../../../interaction/explorer'

class Module{
    onInit(){
        this.explorer = new Explorer(this.object)
    }

    onCreate(){
        this.explorer.appendFiles(this.scroll.render(true))

        this.scroll.minus(this.explorer.render(true).find('.explorer__files-head'))

        this.html.append(this.explorer.render(true))
    }

    onController(controller){
        controller.left = ()=>{
            if(Navigator.canmove('left')) Navigator.move('left')
            else this.explorer.toggle()
        }
    }
}

export default Module