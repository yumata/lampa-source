import MaskHelper from '../../../../utils/mask_helper'
import Arrays from '../../../../utils/arrays'
import Map from './map'

const Helper = new MaskHelper(Arrays.getKeys(Map))

Helper.MASK.base = Helper.except('Icon')

export default Helper