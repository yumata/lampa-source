import Notice from '../notice'
import Storage from '../../utils/storage'
import Account from '../../utils/account'
import Manifest from '../../utils/manifest'
import Lang from '../../utils/lang'
import Utils from '../../utils/math'

function init(){
    if(Account.logged() && Lang.selected(['ru','uk','be','bg']) && window.lampa_settings.account_use){
        let user = Storage.get('account_user','{}')

        if(user.premium && !Account.hasPremium()) setTimeout(push,5000)
    }
}

function push(){
    let now = new Date()
    let id  = 'extend_premium_' + now.getFullYear() + '_' + now.getMonth()
    
    if(Notice.classes.lampa.notices.find(n=>n.id == id)) return

    let notice = {
        id,
        from: 'cub',
        title: {
            ru: 'Продлите CUB Premium прямо сейчас!',
            uk: 'Продовжіть CUB Premium прямо зараз!',
            be: 'Працягнеце CUB Premium прама зараз!',
            bg: 'Подновете CUB Premium точно сега!'
        },
        text: {
            ru: 'Ваша подписка на CUB Premium истекла! Не упустите шанс продлить доступ к эксклюзивному контенту и дополнительным функциям. Обновите премиум-статус сейчас и наслаждайтесь всеми преимуществами CUB без ограничений!',
            uk: 'Ваша передплата на CUB Premium закінчилася! Не пропустіть шанс продовжити доступ до ексклюзивного контенту та додаткових функцій. Оновіть преміум-статус зараз та насолоджуйтесь усіма перевагами CUB без обмежень!',
            be: 'Ваша падпіска на CUB Premium скончылася! Не выпусціце шанец падоўжыць доступ да эксклюзіўнага кантэнту і дадатковым функцый. Абнавіце прэміум-статус зараз і атрымлівайце асалоду ад усімі перавагамі CUB без абмежаванняў!',
            bg: 'Вашият абонамент за CUB Premium е изтекъл! Не пропускайте шанса си да подновите достъпа си до ексклузивно съдържание и допълнителни функции. Надстройте до премиум статус сега и се насладете на всички предимства на CUB без ограничения!'
        },
        time: Date.now(),
        icon: Utils.protocol() + Manifest.cub_domain+'/img/icons/premium_two.svg'
    }

    Notice.pushNotice('lampa',notice, ()=>{
        
    },(er)=>{
        
    })
}

export default {
    init
}
