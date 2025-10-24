/**
 * Статическая машина состояний
 * @param {Object} object - Объект состояний и переходов
 * @example
    let fsm = new StateMachine({
        state: 'idle', //начальное состояние
        transitions: {
            idle: function() {
                console.log('idle')
                this.state = 'loading'
                this.dispath(this.state)
            },
            loading: function() {
                console.log('loading')
                this.state = 'complete'
                this.dispath(this.state)
            },
            complete: function() {
                console.log('complete')
            }
        }
    })
    fsm.start() // запустить машину
 */
function StateMachine(object){
    this.state = object.state

    this.start = function(){
        this.dispath(this.state)
    }

    this.dispath = function(action_name){
        let action = object.transitions[action_name]

        if (action) {
            action.call(this);
        } else {
            console.log('invalid action');
        }
    }
}

export default StateMachine