/**
 * Утилита для отслеживания статуса
 * Нужно для того, чтобы дождаться завершения нескольких асинхронных процессов
 * @constructor
 * @param {number} need - количество процессов, которые нужно дождаться
 * @property {function} onComplite - функция, которая будет вызвана по завершении всех процессов
 * @property {function} stop - остановить проверку (например, если пользователь ушёл со страницы)
 * @property {function(string, object)} append - добавить успешный процесс
 * @property {function()} error - отметить ошибку в процессе
 * @example
    let status = new Status(3)
    status.onComplite = (result)=>{
        //все процессы завершены
    }

    asyncProcess1((data)=>{
        status.append('process1', data)
    }, ()=>{
        status.error()
    })

    asyncProcess2((data)=>{
        status.append('process2', data)
    }, ()=>{
        status.error()
    })

    asyncProcess3((data)=>{
        status.append('process3', data)
    }, ()=>{
        status.error()
    })
 */
function Status(need){
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

export default Status