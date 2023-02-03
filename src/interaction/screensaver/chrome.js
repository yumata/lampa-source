class Chrome{
    constructor(){}

    create(){
        this.html = $('<div class="screensaver-chrome"><iframe src="https://clients3.google.com/cast/chromecast/home" class="screensaver-chrome__iframe"></iframe><div class="screensaver-chrome__overlay"></div></div>')
    }
    
    render(){
        return this.html
    }

    destroy(){
        this.html.remove()
    }
}

export default Chrome