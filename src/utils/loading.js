import Progress from './progress'
import Task from './task'

let queue_calls = []
let secondary_calls = []

function queue(call){
    queue_calls.push(call)
}

function secondary(call){
    secondary_calls.push(call)
}

function start(){
    let task = new Task(queue_calls)

    task.onProgress = (call, next)=>{
        let called = false

        let launch = ()=>{
            if(!called) next()
            
            called = true
        }

        let timer = setTimeout(launch, 10000)

        call(()=>{
            clearTimeout(timer)

            launch()
        })
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