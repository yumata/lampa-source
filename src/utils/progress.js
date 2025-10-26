import Arrays from './arrays'

/**
 * Прогресс выполнения нескольких асинхронных задач
 * @example
 * let progress = new Progress()
 * progress.append((done)=>{ // какая-то асинхронная задача
 *     done(data) // по завершении вызываем done с результатом
 * })
 * progress.append([ // можно добавить массив задач одним вызовом
 *     (done)=>{ // какая-то асинхронная задача
 *        done(data) // по завершении вызываем done с результатом
 *    },
 *   (done)=>{ // какая-то асинхронная задача
 *       done(data) // по завершении вызываем done с результатом
 *  }
 * ])
 * progress.start((result)=>{ // запуск всех задач
 *     console.log(result) // массив результатов всех задач
 * })
 */
function Progress(){
    let works  = []
    let result = []
    let loaded = 0

    this.append = function(call){
        if(Arrays.isArray(call)) works = works.concat(call)
        else if(typeof call == 'function') works.push(call)
    }

    this.start = function(complite){
        works.forEach((fun,i)=>{
            try{
                fun((data)=>{
                    result[i] = data

                    loaded++

                    if(loaded == works.length) complite(result)
                })
            }
            catch(e){
                console.warn('Progress', 'task error:', e.message, e.stack)
                
                loaded++

                if(loaded == works.length) complite(result)
            }
        })
    }
}

export default Progress