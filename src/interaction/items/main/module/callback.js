import Controller from '../../../controller'
import Activity from '../../../activity'

class Module{
    onLeft(){
        Controller.toggle('menu')
    }

    onBack(){
        Activity.backward()
    }
}

export default Module