import { createXCallbackPlayer } from './xCallbackPlayer.js'

export default createXCallbackPlayer({
    id: 'infuse',
    scheme: 'infuse',
    launchModeKey: 'infuse_launch_mode',
    modeField: 'infuse_mode',
    seasonOnlyField: 'infuse_season_only',
    maxItemsField: 'infuse_max_items',
    maxUrlLengthField: 'infuse_max_url_length',
    successCallback: 'infuseDidFinish',
    failCallback: 'infuseDidFail'
})
