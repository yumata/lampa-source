import Controller from '../../../../core/controller'
import Activity from '../../../activity/activity'

export default {
    onLeft: function(){
        Controller.toggle('menu')
    },

    onBack: function(){
        Activity.backward()
    }
}