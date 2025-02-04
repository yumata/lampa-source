function Task(data){
    this.data = data
    this.work = 0
    this.need = data.length

    this.check = function(){
        if(this.work >= this.need) this.onComplite()
    }

    this.next = function(){
        this.onProgress(this.data[this.work], ()=>{
            this.work++

            if(this.work < this.need) this.next()
            else this.check()
        })
    }

    this.start = function(){
        if(this.need) this.next()
        else this.check()
    }
}

export default Task