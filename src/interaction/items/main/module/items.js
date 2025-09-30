import Arrays from '../../../../utils/arrays'
import Layer from '../../../../core/layer'
import Controller from '../../../../core/controller'

export default {
    onInit: function(){
        this.items   = []
        this.active  = 0
    },

    onDown: function(){
        this.active++

        this.active = Math.min(this.active, this.items.length - 1)

        this.items[this.active].toggle()

        this.scroll.update(this.items[this.active].render(true))
    },

    onUp: function(){
        this.active--
        
        if(this.active < 0){
            this.active = 0

            Controller.toggle('head')
        }
        else{
            this.items[this.active].toggle()

            this.scroll.update(this.items[this.active].render(true))
        }
    },

    onAppend: function(item){
        item.use({
            onDown: this.emit.bind(this, 'down'),
            onUp: this.emit.bind(this, 'up'),
            onBack: this.emit.bind(this, 'back'),
            onLeft: this.emit.bind(this, 'left')
        })

        this.scroll.append(item.render(true))

        this.items.push(item)
    },

    onCreate: function(){
        this.scroll.onWheel = (step)=>{
            this.emit(step > 0 ? 'down' : 'up')
        }
    },

    onBuild: function(data){
        data.forEach(this.emit.bind(this, 'createAndAppend'))

        Layer.visible(this.scroll.render(true))
    },

    onDestroy: function(){
        Arrays.destroy(this.items)
    }
}