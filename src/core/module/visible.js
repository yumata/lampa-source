import Template from '../../interaction/template'

export default {
    onCreate: function(){
        this.html.on('visible:change',this.emit.bind(this, 'visibleChange'))
    },

    onVisibleChange: function(){
        if(this.html.visibility == 'hidden'){
            this.blank = Template.elem('div', {class: 'layer--visible no-shrink'})

            this.blank.style.width  = this.html.bond.width  + 'px'
            this.blank.style.height = this.html.bond.height + 'px'

            this.blank.on('visible', ()=>{
                this.blank.replaceWith(this.html)

                this.html.style.visibility = 'visible'
            })

            this.html.replaceWith(this.blank)
        }
    },

    onDestroy: function(){
        this.blank?.remove()
    }
}