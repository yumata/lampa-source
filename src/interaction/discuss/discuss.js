import Constructor from '../constructor'
import Map from './module/map'
import Arrays from '../../utils/arrays'

class Discuss extends Constructor(Map) {
    constructor(data) {
        super(data)

        Arrays.extend(data.params, {
            line: {
                full_text: false
            }
        })
    }
}

export default Discuss