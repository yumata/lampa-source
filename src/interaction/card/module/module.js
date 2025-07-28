import MaskHelper from '../../../utils/mask_helper'
import Arrays from '../../../utils/arrays'
import Map from './map'

const Helper = new MaskHelper(Arrays.getKeys(Map))

Helper.MASK.base = Helper.MASK.all

export default Helper