import Lang from '../utils/lang'

import head from '../templates/head'
import wrap from '../templates/wrap'
import menu from '../templates/menu'
import activitys from '../templates/activitys'
import activity from '../templates/activity'
import activity_wait_refresh from '../templates/activity_wait_refresh'
import scroll from '../templates/scroll'
import settings from '../templates/settings'
import settings_main from '../templates/settings/main'
import settings_interface from '../templates/settings/interface'
import settings_parser from '../templates/settings/parser'
import settings_server from '../templates/settings/server'
import settings_player from '../templates/settings/player'
import settings_more from '../templates/settings/more'
import settings_tmdb from '../templates/settings/tmdb'
import settings_plugins from '../templates/settings/plugins'
import settings_account from '../templates/settings/account'
import items_line from '../templates/items/line'
import card from '../templates/card'
import card_parser from '../templates/card_parser'
import card_watched from '../templates/card_watched'
import card_episode from '../templates/card_episode'
import full_start from '../templates/full/start'
import full_start_new from '../templates/full/start_new'
import full_descr from '../templates/full/descr'
import full_person from '../templates/full/person'
import full_review from '../templates/full/review'
import full_episode from '../templates/full/episode'
import player from '../templates/player'
import player_panel from '../templates/player/panel'
import player_video from '../templates/player/video'
import player_info from '../templates/player/info'
import player_footer from '../templates/player/footer'
import player_footer_card from '../templates/player/footer/card'
import selectbox from '../templates/selectbox/box'
import selectbox_item from '../templates/selectbox/item'
import selectbox_icon from '../templates/selectbox/icon'
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
import empty from '../templates/empty/simple'
import empty_filter from '../templates/empty/filter'
import notice from '../templates/notice'
import notice_card from '../templates/notice_card'
import torrent from '../templates/torrent/item'
import torrent_file from '../templates/torrent/file'
import files from '../templates/files'
import about from '../templates/about'
import error from '../templates/error'
import season_episode from '../templates/season/episode'
import season_episode_rate from '../templates/season/rate'
import season_info from '../templates/season/info'
import torrent_noconnect from '../templates/torrent/errors/noconnect'
import torrent_nocheck from '../templates/torrent/errors/nocheck'
import torrent_nohash from '../templates/torrent/errors/nohash'
import torrent_install from '../templates/torrent/install'
import torrent_error from '../templates/torrent/error'
import torrent_file_serial from '../templates/torrent/serial'
import search_box from '../templates/search'
import console from '../templates/console'
import icon_star from '../templates/icons/star'
import icon_viewed from '../templates/icons/viewed'
import icon_lock from '../templates/icons/lock'
import icon_like from '../templates/icons/like'
import icon_text from '../templates/icons/text'
import icon_card from '../templates/icons/card'
import icon_top from '../templates/icons/top'
import icon_fire from '../templates/icons/fire'
import icon_hd from '../templates/icons/hd'
import icon_collection from '../templates/icons/collection'
import timeline from '../templates/timeline'
import timeline_details from '../templates/timeline_details'
import list_empty from '../templates/list_empty'
import screensaver from "../templates/screensaver";
import plugins_catalog from "../templates/plugins_catalog";
import broadcast from "../templates/broadcast";
import lang_choice from '../templates/lang'
import extensions from '../templates/extensions/main'
import extensions_block from '../templates/extensions/block'
import extensions_item from '../templates/extensions/item'
import extensions_recomend from '../templates/extensions/recomend'
import extensions_info from '../templates/extensions/info'
import extensions_theme from '../templates/extensions/theme'
import extensions_screensaver from '../templates/extensions/screensaver'
import iframe from '../templates/iframe'
import account from '../templates/account'
import account_limited from '../templates/account_limited'
import cub_premium from '../templates/cub_premium'
import cub_premium_modal from '../templates/cub_premium_modal'
import explorer from '../templates/explorer/main'
import explorer_button_back from '../templates/explorer/button_back'
import https from '../templates/https'
import navigation_bar from '../templates/navigation_bar'
import head_backward from '../templates/head_backward'
import account_add_device from '../templates/account_add_device'
import feed_item from '../templates/feed/item'
import feed_head from '../templates/feed/head'
import feed_episode from '../templates/feed/episode'
import register from '../templates/register'
import speedtest from '../templates/speedtest'
import ad_bot from '../templates/ad/bot'
import ad_video_block from '../templates/ad/video'
import discuss_rules from '../templates/discuss_rules'
import bookmarks_folder from '../templates/bookmarks_folder'
import ai_search_animation from '../templates/ai/search_animation'
import plugins_rules from '../templates/plugins_rule'



let templates = {
    head,
    wrap,
    menu,
    activitys,
    activity,
    activity_wait_refresh,
    settings,
    settings_main,
    settings_interface,
    settings_parser,
    settings_server,
    settings_player,
    settings_more,
    settings_tmdb,
    settings_plugins,
    settings_account,
    scroll,
    items_line,
    card,
    card_parser,
    card_watched,
    card_episode,
    full_start,
    full_start_new,
    full_descr,
    full_person,
    full_review,
    full_episode,
    player,
    player_panel,
    player_video,
    player_info,
    player_footer,
    player_footer_card,
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
    empty_filter,
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
    icon_viewed,
    icon_lock,
    icon_like,
    icon_text,
    icon_card,
    icon_top,
    icon_fire,
    icon_hd,
    icon_collection,
    timeline,
    timeline_details,
    list_empty,
    screensaver,
    plugins_catalog,
    broadcast,
    lang_choice,
    extensions,
    extensions_block,
    extensions_item,
    extensions_recomend,
    extensions_info,
    extensions_theme,
    extensions_screensaver,
    iframe,
    account,
    account_limited,
    cub_premium,
    cub_premium_modal,
    selectbox_icon,
    explorer,
    explorer_button_back,
    https,
    navigation_bar,
    head_backward,
    account_add_device,
    feed_item,
    feed_head,
    feed_episode,
    register,
    speedtest,
    season_episode,
    season_episode_rate,
    season_info,
    ad_bot,
    ad_video_block,
    discuss_rules,
    bookmarks_folder,
    ai_search_animation,
    plugins_rules
}

let created = {}

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

function js(name, vars = {}) {
    if (!created[name]) {
        // создаём чистый шаблон без переменных
        let raw = get(name, {}, false)[0];

        created[name] = raw.cloneNode(true); // кэшируем "чистый" DOM
    }

    // клонируем кэш
    let cloned = created[name].cloneNode(true);

    // подставим значения
    if (vars && Object.keys(vars).length > 0) {
        replaceVars(cloned, vars);
    }

    return cloned;
}

function getValueFromPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : ''), obj);
}

function replaceVars(root, vars) {
    const varRegex = /\{\{([a-zA-Z0-9_.]+)\}\}|\{([a-zA-Z0-9_]+)\}/g;

    function processNode(node) {
        // Если это текстовый узел и в нём есть подстановки
        if (node.nodeType === Node.TEXT_NODE) {
            const matches = [...node.textContent.matchAll(varRegex)];

            if (matches.length > 0) {
                const parent = node.parentNode;

                // создаём новый документ-фрагмент для вставки
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                const text = node.textContent;

                for (const match of matches) {
                    const index = match.index;
                    const raw = match[0];
                    const key = match[1] || match[2];
                    const value = getValueFromPath(vars, key);

                    // Добавляем текст до переменной
                    if (index > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
                    }

                    // Вставляем значение
                    if (value instanceof Node) {
                        fragment.appendChild(value.cloneNode(true)); // вставляем DOM
                    } else {
                        fragment.appendChild(document.createTextNode(String(value)));
                    }

                    lastIndex = index + raw.length;
                }

                // Добавляем оставшийся текст
                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
                }

                // заменяем оригинальный текстовый узел
                parent.replaceChild(fragment, node);
                return; // больше не обрабатывать
            }
        }

        // Если есть атрибуты — заменим только строки
        if (node.attributes) {
            for (let attr of node.attributes) {
                attr.value = attr.value.replace(varRegex, (_, nested, flat) => {
                    const key = nested || flat;
                    const value = getValueFromPath(vars, key);
                    return value instanceof Node ? '' : String(value);
                });
            }
        }

        // Рекурсивно обрабатываем детей
        for (let child of Array.from(node.childNodes)) {
            processNode(child);
        }
    }

    processNode(root);
}

function prefix(root, pref) {
    const result = {};

    // поддержка и для jQuery, и для обычного DOM
    const base = root instanceof jQuery ? root[0] : root;

    base.querySelectorAll(`[class*="${pref}__"]`).forEach(elem => {
        elem.classList.forEach(cls => {
            if (cls.startsWith(pref + '__')) {
                const key = cls.slice(pref.length + 2); // удалить pref__
                result[key] = elem;
            }
        });
    });

    return result
}

function elem(tag, options = {}) {
    const element = document.createElement(tag);

    // Добавляем классы
    if (options.class) {
        const classes = Array.isArray(options.class) ? options.class : options.class.split(' ');
        element.classList.add(...classes);
    }

    // Добавляем атрибуты
    if (options.attrs) {
        for (let [key, value] of Object.entries(options.attrs)) {
            element.setAttribute(key, value);
        }
    }

    // Текст
    if (options.text) {
        element.textContent = options.text;
    }

    // HTML
    if (options.html) {
        element.innerHTML = options.html;
    }

    // Дети
    if (options.children) {
        const children = Array.isArray(options.children) ? options.children : [options.children];
        for (let child of children) {
            element.appendChild(child);
        }
    }

    return element;
}


function add(name, html){
    delete created[name]

    templates[name] = html
}

function all(){
    return templates
}

function string(name){
    return templates[name] || ''
}

export default {
    get,
    js,
    add,
    all,
    string,
    prefix,
    elem
}