export default {
    onFocus: function(target){
        this.last = target

        this.scroll.update(target, true)
    },

    onTouch: function(target){
        this.last = target
    },

    onHover: function(target){
        this.last = target
    }
}