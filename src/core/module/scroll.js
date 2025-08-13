class Module{
    onFocus(target){
        this.last = target

        this.scroll.update(target, true)
    }

    onTouch(target){
        this.last = target
    }

    onHover(target){
        this.last = target
    }
}

export default Module