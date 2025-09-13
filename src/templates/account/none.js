let html = `<div class="account-modal-split layer--height">
    <div class="account-modal-split__qr">
        <img class="account-modal-split__qr-img hide" />
        <div class="account-modal-split__qr-code"></div>
        <div class="account-modal-split__qr-text">Отсканируйте QR-код для создания аккаунта.</div>
    </div>

    <div class="account-modal-split__info">
        <div class="account-modal-split__title">Все еще нет аккаунта?</div>
        <div class="account-modal-split__text">Создайте его на сайте <span class="account-add-device__site">{site}</span> и получите доступ к дополнительным возможностям.<br>
        <br>- Синхронизация закладок и истории между устройствами
        <br>- Доступ к премиум функциям приложения
        <br>- Участие в развитии проекта и многое другое
        </div>

        <div class="simple-button simple-button--inline selector">#{account_code_input}</div>
    </div>
</div>`

export default html