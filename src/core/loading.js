import Progress from '../utils/progress'
import Task from '../utils/task'

let queue_calls = []
let secondary_calls = []

function queue(call){
    queue_calls.push(call)
}

function secondary(call){
    secondary_calls.push(call)
}

/**
 * Запуск очереди загрузки
 * 1. Выполняет задачи из очереди queue_calls последовательно
 * 2. После завершения всех задач из очереди queue_calls выполняет задачи из очереди secondary_calls параллельно
 */
function start(){
    let task = new Task(queue_calls)

    task.onProgress = (call, next)=>{
        let called = false

        let launch = ()=>{
            if(!called) next()
            
            called = true
        }

        let timer = setTimeout(launch, 16000)

        try{
            call(()=>{
                clearTimeout(timer)

                launch()
            })
        }
        catch(e){
            console.warn('Loader', 'queue task error:', e.message, e.stack)

            clearTimeout(timer)

            launch()
        }
    }

    task.onComplite = ()=>{
        let progress = new Progress()

        progress.append(secondary_calls)

        progress.start(()=>{})
    }

    task.start()
}

export default {
    queue,
    secondary,
    start
}