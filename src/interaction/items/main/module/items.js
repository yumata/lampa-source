import Arrays from '../../../../utils/arrays'
import Layer from '../../../../core/layer'
import Controller from '../../../../core/controller'
import Platform from '../../../../core/platform'

export default {
    onInit: function(){
        this.items      = []
        this.loaded     = []
        this.active     = 0
        this.limit_view = Platform.screen('tv') ? 1 : 6
    },

    onDown: function(){
        this.active++

        this.active = Math.min(this.active, this.items.length - 1)

        this.items[this.active].toggle()
    },

    onUp: function(){
        this.active--
        
        if(this.active < 0){
            this.active = 0

            Controller.toggle('head')
        }
        else{
            this.items[this.active].toggle()
        }
    },

    onAppend: function(item){
        item.use({
            onDown: this.emit.bind(this, 'down'),
            onUp: this.emit.bind(this, 'up'),
            onBack: this.emit.bind(this, 'back'),
            onLeft: this.emit.bind(this, 'left'),
            onActive: ()=>{
                this.active = this.items.indexOf(item)
            },
            onToggle: ()=>{
                this.scroll.update(item.render(true))
            }
        })

        this.fragment.appendChild(item.render(true))

        this.items.push(item)
    },

    onPushLoaded: function(){
        let add = this.loaded.shift()

        if(add && add.length){
            this.frament = document.createDocumentFragment()

            add.forEach(this.emit.bind(this, 'createAndAppend'))

            this.scroll.append(this.fragment)

            Layer.visible(this.scroll.render(true))
        }
    },

    onResize: function(){
        if(this.items[this.active]) this.scroll.update(this.items[this.active].render(true))
    },

    onCreate: function(){
        this.scroll.onWheel = (step)=>{
            this.emit(step > 0 ? 'down' : 'up')
        }

        this.scroll.onAnimateEnd = ()=>{
            this.emit('pushLoaded')
        }
    },

    onBuild: function(data){
        this.fragment = document.createDocumentFragment()

        data.forEach(this.emit.bind(this, 'createAndAppend'))

        this.scroll.append(this.fragment)

        Layer.visible(this.scroll.render(true))
    },

    onDestroy: function(){
        Arrays.destroy(this.items)
    }
}