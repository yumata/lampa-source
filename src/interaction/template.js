import Lang from '../utils/lang'

import head from '../templates/head'
import wrap from '../templates/wrap'
import menu from '../templates/menu'
import activitys from '../templates/activitys'
import activity from '../templates/activity'
import scroll from '../templates/scroll'
import settings from '../templates/settings'
import settings_main from '../templates/settings/main'
import settings_interface from '../templates/settings/interface'
import settings_parser from '../templates/settings/parser'
import settings_server from '../templates/settings/server'
import settings_player from '../templates/settings/player'
import settings_more from '../templates/settings/more'
import settings_plugins from '../templates/settings/plugins'
import settings_cloud from '../templates/settings/cloud'
import settings_account from '../templates/settings/account'
import items_line from '../templates/items/line'
import card from '../templates/card'
import card_parser from '../templates/card_parser'
import card_watched from '../templates/card_watched'
import full_start from '../templates/full/start'
import full_descr from '../templates/full/descr'
import full_person from '../templates/full/person'
import full_review from '../templates/full/review'
import full_episode from '../templates/full/episode'
import player from '../templates/player'
import player_panel from '../templates/player/panel'
import player_video from '../templates/player/video'
import player_info from '../templates/player/info'
import selectbox from '../templates/selectbox/box'
import selectbox_item from '../templates/selectbox/item'
import info from '../templates/info'
import filter from '../templates/filter'
import more from '../templates/more'
import search from '../templates/search/main'
import settings_input from '../templates/settings/input'
import modal from '../templates/modal'
import company from '../templates/company'
import modal_loading from '../templates/modal_loading'
import modal_pending from '../templates/modal_pending'
import person_start from '../templates/person/start'
import empty from '../templates/empty'
import notice from '../templates/notice'
import notice_card from '../templates/notice_card'
import torrent from '../templates/torrent/item'
import torrent_file from '../templates/torrent/file'
import files from '../templates/files'
import about from '../templates/about'
import error from '../templates/error'
import torrent_noconnect from '../templates/torrent/errors/noconnect'
import torrent_nocheck from '../templates/torrent/errors/nocheck'
import torrent_nohash from '../templates/torrent/errors/nohash'
import torrent_install from '../templates/torrent/install'
import torrent_error from '../templates/torrent/error'
import torrent_file_serial from '../templates/torrent/serial'
import search_box from '../templates/search'
import console from '../templates/console'
import icon_star from '../templates/icons/star'
import timeline from '../templates/timeline'
import timeline_details from '../templates/timeline_details'
import list_empty from '../templates/list_empty'
import screensaver from "../templates/screensaver";
import plugins_catalog from "../templates/plugins_catalog";
import broadcast from "../templates/broadcast";
import lang_choice from '../templates/lang'

let templates = {
    head,
    wrap,
    menu,
    activitys,
    activity,
    settings,
    settings_main,
    settings_interface,
    settings_parser,
    settings_server,
    settings_player,
    settings_more,
    settings_plugins,
    settings_cloud,
    settings_account,
    scroll,
    items_line,
    card,
    card_parser,
    card_watched,
    full_start,
    full_descr,
    full_person,
    full_review,
    full_episode,
    player,
    player_panel,
    player_video,
    player_info,
    selectbox,
    selectbox_item,
    info,
    more,
    search,
    settings_input,
    modal,
    company,
    modal_loading,
    modal_pending,
    person_start,
    empty,
    notice,
    notice_card,
    torrent,
    torrent_file,
    files,
    about,
    error,
    torrent_noconnect,
    torrent_file_serial,
    torrent_nocheck,
    torrent_nohash,
    torrent_install,
    torrent_error,
    filter,
    search_box,
    console,
    icon_star,
    timeline,
    timeline_details,
    list_empty,
    screensaver,
    plugins_catalog,
    broadcast,
    lang_choice
}

function get(name, vars = {}, like_static = false){
    let tpl = templates[name]

    if(!tpl) throw 'Template ['+name+'] not found'

    tpl = Lang.translate(tpl)

    for(let n in vars){
        tpl = tpl.replace(new RegExp('{'+n+'}','g'),vars[n])
    }

    tpl = tpl.replace(/{\@([a-z_-]+)}/g, function(e,s){
        return templates[s] || ''
    })

    return like_static ? tpl : $(tpl)
}

function add(name, html){
    templates[name] = html
}

function all(){
    return templates
}

export default {
    get,
    add,
    all
}