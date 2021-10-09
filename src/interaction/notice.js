import Storage from '../utils/storage'
import Arrays from '../utils/arrays'
import Modal from './modal'
import Controller from './controller'
import Template from './template'

let where
let data    = {}
let notices = []

function init(){
    data    = Storage.get('notice','{}')
    notices = [
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

function open(){
    let html  = $('<div></div>')
    let items = notices.slice(0,5)

    items.forEach(element => {
        let item = Template.get('notice',element)

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

    data.time = maxtime()

    Storage.set('notice',data)

    icon()
}

function maxtime(){
    let max = 0

    notices.forEach(element => {
        let time = new Date(element.time).getTime()

        max = Math.max(max, time)
    })

    return max
}

function any(){
    return maxtime() > data.time
}

function icon(){
    where.find('.notice--icon').toggleClass('active', any())
}

function start(html){
    where = html

    icon()
}

export default {
    open,
    start,
    init
}