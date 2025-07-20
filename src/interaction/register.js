import Template from './template'

function Register(data){
    let register = Template.js('register')

    this.create = function(){
        register.addClass('selector')

        register.find('.register__name').text(data.title)
        register.find('.register__counter').text(data.count)

        register.on('hover:enter',()=>{
            if(this.onEnter) this.onEnter(e, data)
        })

        register.on('hover:focus',(e)=>{
            if(this.onHover) this.onHover(e, data)
        })
    }

    this.render = function(){
        return register
    }

    this.destroy = function(){
        register.remove()
    }
}

export default Register