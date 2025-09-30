import Explorer from '../../../../interaction/explorer'

export default {
    onInit: function(){
        this.explorer = new Explorer(this.object)
    },

    onCreate: function(){
        this.explorer.appendFiles(this.scroll.render(true))

        this.scroll.minus(this.explorer.render(true).find('.explorer__files-head'))

        this.html.append(this.explorer.render(true))
    },

    onController: function(controller){
        controller.left = ()=>{
            if(Navigator.canmove('left')) Navigator.move('left')
            else this.explorer.toggle()
        }
    },

    onEmpty: function(){
        if(this.empty_class){
            this.empty_class.use({
                onController: (controller)=>{
                    controller.left = ()=>{
                        if(Navigator.canmove('left')) Navigator.move('left')
                        else this.explorer.toggle()
                    }
                }
            })
        }
    }
}