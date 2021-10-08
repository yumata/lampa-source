function create(object){
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

export default create