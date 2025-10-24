import MaskHelper from '../../../utils/mask'
import Arrays from '../../../utils/arrays'
import Map from './map'

const Helper = new MaskHelper(Arrays.getKeys(Map))

Helper.MASK.base = Helper.toggle(Helper.MASK.all, 'Folder', 'Subscribe')

export default Helper