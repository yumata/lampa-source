import Subscribe from '../../utils/subscribe'

function AVPlay(call_video) {
    let avplay, plugin, stream_url, loaded, current_time, offset_time
    let object = $('<object class="player-video_video"  style="visibility:hidden;"></object>')
    let video = object[0]
    let listener = Subscribe()
    let change_scale_later
    let change_speed_later
    let canGetVideoResolution = false;
    let isHls = false;

    /**
     * Установить урл
     */
    Object.defineProperty(video, "src", {
        set: function (url) {
            if (url) {
                if (url.toLowerCase().indexOf(".m3u8") != -1 && url.toUpperCase().indexOf("|COMPONENT=HLS") == -1) {
                    isHls = true;
                    url += "|COMPONENT=HLS";
                }
                else if (url.toLowerCase().indexOf(".mpd") != -1 && url.toUpperCase().indexOf("|COMPONENT=HAS") == -1) {
                    isHls = true;
                    url += "|COMPONENT=HAS";
                }               
                stream_url = url
                console.log(stream_url)
                avplay.init()
                plugin = avplay.setPlayerPluginObject()
                avplay.onEvent = eventHandler;
            }
        },
        get: function () { }
    });

    /**
     * Позиция
     */
    Object.defineProperty(video, "currentTime", {
        set: function (t) {
            try {
                seekTo(t)
            } catch (e) { listener.send('error', { error: 'code [' + e.code + '] ' + e.message }) }
        },
        get: function () {
            return current_time ? current_time / 1000 : 0
        }
    });
    /**
     * 
     */
    function seekTo(time) {
        let time_s;
        let time_ms = Math.ceil(time) * 1000;
        let duration_ms = avplay.getDuration()
        if ((time_ms >= 0 && current_time - time_ms >= 0)) {
            time_s = Math.ceil((current_time - time_ms) / 1000)
            plugin.Execute("JumpBackward", time_s);
        } else if (time_ms >= 0 && duration_ms - current_time + time_ms >= 0) {
            time_s = Math.ceil((time_ms - current_time) / 1000)
            plugin.Execute("JumpForward", time_s);
        }
    }
    /**
     * Длительность
     */
    Object.defineProperty(video, "duration", {
        set: function () { },
        get: function () {
            let d = 0

            try {
                d = avplay.getDuration()
            } catch (e) { }

            return d ? d / 1000 : 0
        }
    });
    /**
     * Пауза
     */
    Object.defineProperty(video, "paused", {
        set: function () {

        },
        get: function () {
            try {
                return avplay.status == '5'
            } catch (e) {
                return false
            }
        }
    });

    /**
     * Аудиодорожки
     */
    Object.defineProperty(video, "audioTracks", {
        set: function () {

        },
        get: function () {
            try {
                let amount = avplay.getTotalNumOfStreamID(1);
                let tracks = Array.apply(null, { length: amount }).map(Number.call, Number).map(function (i) {

                    let item = {
                        extra: JSON.parse(avplay.getStreamExtraData(1, i)),
                        index: parseInt(i),
                        language: languageNumToStr(avplay.getStreamLanguageInfo(1, i)),
                    }


                    Object.defineProperty(item, "enabled", {
                        set: (v) => {
                            if (v) {
                                try {
                                    avplay.setStreamID(1, item.index);
                                } catch (e) {
                                    console.log('Player', 'no change audio:', e.message)
                                }
                            }
                        },
                        get: () => { }
                    })

                    return item
                }).sort(function (a, b) {
                    return a.index - b.index
                })

                return tracks
            } catch (e) {
                return []
            }
        }
    });

    /**
     * Субтитры
     */
    Object.defineProperty(video, "textTracks", {
        set: function () {
        },
        get: function () {
            try {
                let amount = avplay.getTotalNumOfStreamID(4);
                let tracks = Array.apply(null, { length: amount }).map(Number.call, Number).map(function (i) {

                    let item = {
                        extra: JSON.parse(avplay.getStreamExtraData(4, i)),
                        index: parseInt(i),
                        language: languageNumToStr(avplay.getStreamLanguageInfo(4, i)),
                    }
                    Object.defineProperty(item, "mode", {
                        set: (v) => {
                            if (v == 'showing') {
                                try {
                                    avplay.setStreamID(4, item.index);
                                } catch (e) {
                                    console.log('Player', 'no change text:', e.message)
                                }
                            }
                        },
                        get: () => { }
                    })

                    return item
                }).sort(function (a, b) {
                    return a.index - b.index
                })

                return tracks;
            } catch (e) {
                return []
            }
        }
    });
    /**
     * Получаем текст языка субтитров или аудио
     */
    function languageNumToStr(num) {
        let str;
        //Словарь кодов озвучек
        const lang = { 6384738: "Albanian", 7565673: "Albanian", 6647399: "English", 6388325: "Azerbaijan", 6386285: "Armenian", 6448492: "Belarusian", 6452588: "Bulgarian", 6514793: "Chinese", 6776178: "German", 6911073: "Italian", 7565409: "Spanish", 7037306: "Kazakh", 7040882: "Korean", 7368562: "Portuguese", 7501171: "Russian", 7564399: "Slovak", 7564406: "Slovenian", 7565936: "Serbian", 7632242: "Turkish", 7699042: "Uzbek", 7695218: "Ukrainian", 8026747: "Ukrainian", 6713957: "French", 7567205: "Swedish", 6975598: "Japanese" }
        if (lang[num] != undefined) {
            str = lang[num];
        } else {
            let nHex = num.toString(16);
            let sHex1 = "0x" + nHex.substring(0, 2);
            let sHex2 = "0x" + nHex.substring(2, 2);
            let sHex3 = "0x" + nHex.substring(4, 2);
            let str1 = String.fromCharCode(sHex1);
            let str2 = String.fromCharCode(sHex2);
            let str3 = String.fromCharCode(sHex3);
            str = str1 + str2 + str3;
            if (str === "\0\0\0") {
                str = "Неизвестный";
            }
        }
        return str;
    }
    /**
     * Ширина видео
     */
    Object.defineProperty(video, "videoWidth", {
        set: function () {

        },
        get: function () {
            if (canGetVideoResolution) {
                return avplay.getVideoResolution().split('|')[0]
            }
            else{return 0}
        }
    });

    /**
     * Высота видео
     */
    Object.defineProperty(video, "videoHeight", {
        set: function () {

        },
        get: function () {
            if (canGetVideoResolution) {
                return avplay.getVideoResolution().split('|')[1]
            }
            else { return 0 }
        }
    });

    /**
     * Меняем размер видео
     * @param {string} scale - default|fill
     */
    function changeScale(scale) {     
        try {           
            let xV = curWidget.width, yV = curWidget.height, aX = 0, aY = 0, aW = curWidget.width, aH = curWidget.height, cX = 0, cY = 0, pH = 100, pW = 100, cW = video.videoWidth, cH = video.videoHeight;
            if(cH==0||cW==0)
            {
                throw false;
            }
            switch (scale) {
                //original
                case 'default':
                    if (cW / cH < 1.79) {
                        aW = yV * cW / cH;
                        aX = (xV - aW) / 2;
                    } else {
                        aH = xV * cH / cW;
                        aY = (yV - aH) / 2;
                    };
                    break;
                //full
                case 'fill':
                    break;
                default:
                    //zoom
                    let type = scale[0];
                    let zoom = parseInt(scale.replace(/\D+/g, ""));
                    if (type == 's') {
                        pH = zoom;
                        pW = zoom;
                    } else if (type == 'v') {
                        pH = zoom;
                        pW = 100;
                    }
                    if (zoom >= 80 && zoom <= 140) {

                        if (pW <= 100) {
                            aW = (xV / 100) * pW;
                            aX = (xV - aW) / 2
                        } else {
                            cX = cW * (pW / 200 - 0.5);
                            cW = cW * (2 - pW / 100)
                        }
                        if (pH <= 100) {
                            aH = (yV / 100) * pH;
                            aY = (yV - aH) / 2
                        } else {
                            cY = cH * ((pH / 200) - 0.5);
                            cH = cH * (2 - pH / 100)
                        }
                    } else {
                        changeScale('default');
                        return;
                    }
                    break;
            };
            avplay.setDisplayArea({ left: aX, top: aY, width: aW, height: aH });
            if (scale != 'fill') {
                avplay.setCropArea(() => { console.log('Player', 'change scale ' + scale) }, (e) => { listener.send('error', { error: 'code [' + e.code + '] ' + e.message }); }, { left: cX, top: cY, width: cW, height: cH })
            } else {
                avplay.setCropArea(() => { console.log('Player', 'change scale ' + scale) }, (e) => { listener.send('error', { error: 'code [' + e.code + '] ' + e.message }); }, { left: 0, top: 0, width: 0, height: 0 })
            }
        } catch (e) {
            change_scale_later = scale;
        }
    }

    function changeSpeed(speed) {
        try {
            avplay.setSpeed(speed)
        } catch (e) {
            change_speed_later = speed;
        }
    }

    /**
     * Всегда говорим да, мы можем играть
     */
    video.canPlayType = function () {
        return true;
    }

    /**
     * Вешаем кастомные события
     */
    video.addEventListener = listener.follow.bind(listener)

    /**
     * Вешаем события от плеера orsay
     */
    let eventHandler = (type, data) => {
        switch (type) {
            // 1 CONNECTION_FAILED;
            case 1:
                listener.send('error', { error: '[orsay native player: CONNECTION_FAILED]' })
                break;
            // 2 AUTHENTICATION_FAILED
            case 2:
                listener.send('error', { error: '[orsay native player: AUTHENTICATION_FAILED]' })
                break;
            // 3 STREAM_NOT_FOUND
            case 3:
                listener.send('error', { error: '[orsay native player: STREAM_NOT_FOUND]' })
                break;
            // 4 NETWORK_DISCONNECTED
            case 4:
                listener.send('error', { error: '[orsay native player: NETWORK_DISCONNECTED]' })
                break;
            // 5 NETWORK_SLOW
            case 5:
                listener.send('error', { error: '[orsay native player: NETWORK_SLOW]' })
                break;
            // 6 RENDER_ERROR (a)
            case 6:
                switch (data) {
                    case "0":
                        listener.send('error', { error: '[orsay native player: UNKNOWN_ERROR]' })
                        break;
                    case "1":
                        listener.send('error', { error: '[orsay native player: UNSUPPORTED_CONTAINER]' })
                        break;
                    case "2":
                        listener.send('error', { error: '[orsay native player: UNSUPPORTED_VIDEO_CODEC]' })
                        break;
                    case "3":
                        listener.send('error', { error: '[orsay native player: UNSUPPORTED_AUDIO_CODEC]' })
                        break;
                    case "4":
                        listener.send('error', { error: '[orsay native player: UNSUPPORTED_VIDEO_RESOLUTION]' })
                        break;
                    case "5":
                        listener.send('error', { error: '[orsay native player: UNSUPPORTED_VIDEO_FRAMERATE]' })
                        break;
                    case "6":
                        listener.send('error', { error: '[orsay native player: CURRUPTED_STREAM]' })
                        break;
                    case "100":
                        listener.send('error', { error: '[orsay native player: CUSTOM_ERROR]' })
                        break;
                }
            // 7 RENDERING_START
            case 7:
                console.log('Player', 'RENDERING_START');
                break;
            // 8 RENDERING_COMPLETE
            case 8:
                console.log('Player', 'RENDERING_COMPLETE');
                avplay.stop()
                listener.send('ended')
                break;
            // 9 STREAM_INFO_READY
            case 9:
                canGetVideoResolution = true;

                $('body').toggleClass('orsay-player--show', true)

                console.log('Player', 'STREAM_INFO_READY');

                avplay.startSubtitle({ path: "/dtv/temp/", streamID: 999, sync: 999, callback: () => { } });

                listener.send('loadeddata')
                break;
            // 10 DECODING_COMPLETE
            case 10:
                console.log('Player', 'DECODING_COMPLETE');
                break;
            case 11:
                console.log('Player', 'buffering start')
                listener.send('waiting')
                break;
            // 12 BUFFERING_COMPLETE
            case 12:
                console.log('Player', 'BUFFERING_COMPLETE')
                listener.send('playing')
                break;
            // 13 BUFFERING_PROGRESS
            case 13:
                listener.send('progress', { percent: data })
                break;
            // 14 CURRENT_PLAYBACK_TIME
            case 14:
                current_time = data
                listener.send('timeupdate')
                if (change_scale_later) {
                    changeScale(change_scale_later)
                    change_scale_later = false                   
                }

                if (change_speed_later) {                    
                    changeSpeed(change_speed_later)
                    change_speed_later = false
                }
                break;
            // 15 AD_START
            case 15:
                console.log('Player', 'AD_START');
                break;
            // 16 AD_END
            case 16:
                console.log('Player', 'AD_END');
                break;
            // 17 RESOLUTION_CHANGED
            case 17:
                console.log('Player', 'RESOLUTION_CHANGED ' + data);
                break;
            // 18 BITRATE_CHANGED
            case 18:
                console.log('Player', 'BITRATE_CHANGED ' + data);
                break;
            // 19 SUBTITLE
            case 19:
                listener.send('subtitle', { text: data })
                break;
        }
    }

    /**
     * Загрузить
     */
    video.load = function () {
        if (stream_url) {
            if (avplay.open(stream_url)) {
                loaded = true
                listener.send('canplay')
            }
        }
    }

    /**
     * Играть
     */
    video.play = function () {
        if (loaded) {
            if (avplay.status == '5') {
                avplay.resume()
            } else {
                avplay.play(() => {
                    console.log('Player', 'play')
                }, (e) => {
                    listener.send('error', { error: 'code [' + e.code + '] ' + e.message })
                })
            }
        }
    }


    /**
     * Пауза
     */
    video.pause = function () {
        if (loaded) avplay.pause()
    }

    /**
     * Установить масштаб
     */
    video.size = function (type) {
        changeScale(type)
    }

    /**
     * Установить скорость
     */
    video.speed = function (speed) {
        changeSpeed(speed)
    }

    /**
     * Уничтожить
     */
    video.destroy = function () {
        try {
            console.log('Player', 'destroy')
            avplay.destroy()
        } catch (e) { }

        $('body').toggleClass('orsay-player--show', false)

        video.remove()

        listener.destroy()
    }

    webapis.avplay.getAVPlay((av) => {
        avplay = av;
    }, (e) => {
        listener.send('error', { error: 'code [' + e.code + '] ' + e.message });
    });

    call_video(video)

    return object
}

export default AVPlay