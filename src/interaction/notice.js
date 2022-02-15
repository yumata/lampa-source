import Storage from '../utils/storage'
import Arrays from '../utils/arrays'
import Modal from './modal'
import Controller from './controller'
import Template from './template'
import Account from '../utils/account'
import Activity from './activity'
import Utils from '../utils/math'

let where
let data    = {}
let notices = []

function init(){
    data    = Storage.get('notice','{}')
    notices = [
        {
            time: '2021-12-23 14:00',
            title: 'Обновление 1.3.7',
            descr: '1. Добавлен голосовой поиск.<br>2. Устранены баги с мышкой и добавлена поддержка мыши в плеере.<br>3. Добавлена привязка аккаунта к CUB.<br>4. Всякие другие не интересные мелочи.'
        },
        {
            time: '2021-11-25 13:00',
            title: 'Обновление 1.3.6',
            descr: '1. Добавлен новый каталог CUB.<br>2. Изменен источник релизов, теперь работает даже в MSX.<br>3. Добавлена категория аниме ;)'
        },
        {
            time: '2021-11-15 11:00',
            title: 'Обновление 1.3.5',
            descr: '1. Добавлен скринсейвер от Google ChromeCast.<br>2. Релизы запускаются сразу же без поиска .<br>3. В клавиатуре убрана кнопка ввода.<br>4. В плеере улучшена перемотка и добавлены кнопки (в конец / в начало).<br>5. Добавлена синхронизация через сервис gist.github.com.'
        },
        {
            time: '2021-11-10 10:00',
            title: 'Обновление 1.3.4',
            descr: '1. Исправлена отметка времени при выключенном свойстве (продолжить с последнего места).<br>2. На телеках самсунг исправлены плашки черного цвета в плеере.<br>3. Добавлены плагины в настройках.'
        },
        {
            time: '2021-11-02 10:00',
            title: 'Обновление 1.3.3',
            descr: '1. Добавлен поиск по торрентам.<br>2. Исправлена загрузка главной с выбранным источником.<br>3. Добавлен множественный выбор в фильтре.<br>4. Добавлено больше выбора для масштабирования видео.<br>5. Исправлены другие мелочи.'
        },
        {
            time: '2021-10-25 15:00',
            title: 'Обновление 1.3.2',
            descr: '1. Исправлен поиск карточки, каждая карточка имеет свой источник (tmdb,ivi,okko)<br>2. Возможность переключить источник на (tmdb,ivi,okko).<br>3. Обновлена работа фона.<br>4. Добавлено перелистывание в торрент файлах, влево или вправо перелистывает на 10 позиций.<br>5. Изменен источник НЦР.<br>6. Исправлена история просмотров, теперь карточка добавляется если начали просмотр видео.<br>7. Добавлены комментарии в источнике ivi.'
        },
        {
            time: '2021-10-20 16:20',
            title: 'Обновление 1.3.1',
            descr: '1. Добавлены подборки с ivi и okko<br>2. Вернул возможность изменения масштаба видео.<br>3. Добавлены цифровые релизы, в MSX не работает.<br>4. На каком языке выводить данные TMDB.<br>5. В скринсейвер добавлена возможно переключить на природу.<br>6. Возможность выбрать на каком языке находить торренты.<br>7. Возможность отключить продолжить по таймкоду.'
        },
        {
            time: '2021-10-14 13:00',
            title: 'Скринсейвер',
            descr: 'Добавлен скринсейвер, запускается через 5 минут, если ничего не делать.'
        },
        {
            time: '2021-10-14 10:00',
            title: 'Обновление 1.2.6',
            descr: '1. Исправлена ошибка удаления торрента.<br>2. Исправлена отметка времени.<br>3. Добавлен визуал для сериалов, в торрент-файлах лучше видно серии.<br>4. Другие мелочи.'
        },
        {
            time: '2021-10-12 19:10',
            title: 'Полезно знать',
            descr: 'А вы знали? Что если долго удерживать кнопку (OK) на карточке, то можно вызвать меню для добавления в закладки. Такой же метод работает и на торрентах, долгий тап позволяет добавить раздачу в список (Мои торренты)'
        },
        {
            time: '2021-10-12 19:00',
            title: 'Обновление 1.2.4',
            descr: '1. Добавлено меню (Мои торренты).<br>2. Обновлен фильтр и сортировка в торрентах.<br>3. Добавлена лента (Новинки) в фильмах и сериалах.<br>4. Исправлены ссылки для Torserver.<br>5. Добавлена отметка просмотра для сериалов.<br>6. Исправлено несколько багов и ошибок.'
        },
        {
            time: '2021-10-10 18:00',
            title: 'Обновление 1.2.3',
            descr: '1. Добавлена поддержка мыши.<br>2. Добавлено запоминание позиции просмотра (Фильмы)<br>3. Исправлен баг в плеере с недоконца закрытыми плашками.<br>4. Добавлена дополнительная ссылка на Torserver<br>5. Отметка просмотренного торрента<br>6. Добавлен переход с торрента на карточку фильма'
        },
        {
            time: '2021-10-09 15:00',
            title: 'Обновление 1.2.2',
            descr: '1. Добавлен Tizen плеер<br>2. Добавлен WebOS плеер<br>3. В плеере добавлена статистика загрузки торрента.<br>4. Добавлена полоса перемотки в плеере<br>5. Исправлено пустые постеры для Torserver<br>6. Исправлены другие мелкие ошибки и баги'
        },
        {
            time: '2021-10-07 17:00',
            title: 'Обновление 1.2.1',
            descr: '1. Исправлен баг с кнопкой назад в MSX<br>2. Исправлен баг с поиском<br>3. Добавлен фильтр в торрентах<br>4. Визуально доработан плеер<br>5. Добавлены настройки быстродействия<br>6. Исправлены имена в торрент-файлах<br>7. Исправлен баг с паузой в плеере<br>8. Исправлены другие мелкие ошибки и баги'
        },
        {
            time: '2021-10-03 12:00',
            title: 'Обновление 1.0.10',
            descr: '1. Доработана подгрузка карточек в мелком режиме<br>2. Добавлены логи, для просмотра логов наведите на шапку и щелкайте вверх 10 раз'
        },
        {
            time: '2021-10-01 09:00',
            title: 'Обновление 1.0.9',
            descr: '1. Доработан фон в закладках и в фильме<br>2. Изменены инструкции<br>3. Доделан плагин под Orsay'
        },
        {
            time: '2021-09-30 18:00',
            title: 'Обновление 1.0.8',
            descr: '1. Доработан фон<br>2. Выведена кнопка (Торренты)<br>3. Добавлена сортировка торрентов<br>4. Доделан выход под Tizen и WebOS<br> 5. Возможно доделаны кнопки управления под Orsay'
        },
        {
            time: '2021-09-29 17:00',
            title: 'Обновление 1.0.7',
            descr: '1. Оптимизирована главная страница и каталоги<br>2. Добавлена авторизация для TorServer<br> 3. Добавлены подсказки ошибок в TorServer'
        },
        {
            time: '2021-09-28 16:00',
            title: 'Исправления',
            descr: '1. Исправлена ошибка (Невозможно получить HASH)<br>2. Доделан парсер для MSX, теперь не нужно указывать явную ссылку, только по желанию<br> 3. Улучшен парсер jac.red, теперь точнее ищет'
        },
        {
            time: '2021-09-27 15:00',
            title: 'Исправлен парсер',
            descr: 'В парсере была выявлена ошибка, из за которой jac.red не выдавал результаты'
        },
        {
            time: '2021-09-26 17:00',
            title: 'Добро пожаловать!',
            descr: 'Это ваш первый запуск приложения, надеемся вам очень понравится. Приятного вам просмотра.'
        }
    ]

    Arrays.extend(data,{
        time: 0
    })
}

function getNotice(call){
    Account.notice((result)=>{
        if(result.length){
            let items = []

            result.forEach((item)=>{
                let data = JSON.parse(item.data)

                let k = []
        
                for(let i in data.card.seasons) k.push(i)

                let s = k.pop()

                items.push({
                    time: item.date + ' 12:00',
                    title: data.card.name,
                    descr: 'Новая серия<br><br>Cезон - <b>'+s+'</b><br>Эпизод - <b>'+data.card.seasons[s]+'</b>',
                    card: data.card
                })
            })

            let all = notices.slice(0,10).concat(items)

            all.sort((a,b)=>{
                let t_a = new Date(a.time).getTime(),
                    t_b = new Date(b.time).getTime()

                if(t_a > t_b) return -1
                else if(t_a < t_b) return 1
                else return 0
            })

            call(all)
        }
        else call(notices.slice(0,10))
    })
}

function open(){
    getNotice((notice)=>{
        let html = $('<div></div>')

        notice.forEach(element => {
            let item = Template.get(element.card ? 'notice_card' : 'notice',element)

            if(element.card){
                let img = item.find('img')[0]
                let poster_size  = Storage.field('poster_size')

                img.onload = function(){}
            
                img.onerror = function(e){
                    img.src = './img/img_broken.svg'
                }

                img.src = element.card.poster ? element.card.poster : element.card.img ? element.card.img : Utils.protocol() + 'image.tmdb.org/t/p/'+poster_size+'/'+element.card.poster_path

                item.on('hover:enter',()=>{
                    Modal.close()

                    Activity.push({
                        url: '',
                        component: 'full',
                        id: element.card.id,
                        method: 'tv',
                        card: element.card,
                        source: 'cub'
                    })
                })
            }

            html.append(item)
        })

        Modal.open({
            title: 'Уведомления',
            size: 'medium',
            html: html,
            onBack: ()=>{
                Modal.close()

                Controller.toggle('head')
            }
        })

        data.time = maxtime(notice)

        Storage.set('notice',data)

        icon(notice)
    })
}

function maxtime(notice){
    let max = 0

    notice.forEach(element => {
        let time = new Date(element.time).getTime()

        max = Math.max(max, time)
    })

    return max
}

function any(notice){
    return maxtime(notice) > data.time
}

function icon(notice){
    where.find('.notice--icon').toggleClass('active', any(notice))
}

function start(html){
    where = html

    getNotice(icon)
}

export default {
    open,
    start,
    init
}