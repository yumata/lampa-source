/**
 * Последовательное выполнение задач
 * @param {Array} data - массив данных для обработки
 * @property {function(object, function)} onProgress - функция, которая будет вызвана для каждого элемента массива, принимает элемент и функцию next для продолжения
 * @property {function()} onComplite - функция, которая будет вызвана по завершении всех задач
 * @example
 * let task = new Task([1,2,3,4,5])
 * task.onProgress = (item, next)=>{
 *   console.log('Process item:', item)
 *  next() //обязательно вызвать для продолжения
 * }
 * task.onComplite = ()=>{
 *  console.log('All items processed')
 * }
 * task.start() //начать выполнение
 */
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