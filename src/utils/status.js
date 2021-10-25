function status(need){
    this.data = {}
    this.work = 0;

    this.check = function(){
        if(this.work >= need) this.onComplite(this.data)
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
}

export default status