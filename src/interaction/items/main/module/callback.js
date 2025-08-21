import Controller from '../../../../core/controller'
import Activity from '../../../activity/activity'

class Module{
    onLeft(){
        Controller.toggle('menu')
    }

    onBack(){
        Activity.backward()
    }
}

export default Module