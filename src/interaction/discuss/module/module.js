import MaskHelper from '../../../utils/mask'
import Arrays from '../../../utils/arrays'
import Map from './map'

const Helper = new MaskHelper(Arrays.getKeys(Map))

Helper.MASK.base = Helper.only('Callback')

export default Helper