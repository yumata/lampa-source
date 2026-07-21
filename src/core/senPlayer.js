import { createXCallbackPlayer } from './xCallbackPlayer.js'

export default createXCallbackPlayer({
    id: 'senplayer',
    scheme: 'senplayer',
    schemeAppleTv: 'SenPlayer',
    launchModeKey: 'senplayer_launch_mode',
    modeField: 'senplayer_mode',
    seasonOnlyField: 'senplayer_season_only',
    maxItemsField: 'senplayer_max_items',
    maxUrlLengthField: 'senplayer_max_url_length',
    successCallback: 'senplayerDidFinish',
    failCallback: 'senplayerDidFail'
})
