function status(need){
    this.data = {}
    this.work = 0;
    this.need = need
    this.complited = false

    this.check = function(){
        if(this.stopped) return
        
        if(this.work >= this.need && !this.complited){
            this.complited = true

            this.onComplite(this.data)
        } 
    }

    this.append = function(name, json){
        this.work++

        this.data[name] = json

        this.check()
    }

    this.error = function(){
        this.work++

        this.check()
    }

    this.stop = function(){
        this.stopped = true
    }
}

export default status