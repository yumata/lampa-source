let html = `<div class="account-modal-split layer--height">
    <div class="account-modal-split__qr">
        <img class="account-modal-split__qr-img hide" />
        <div class="account-modal-split__qr-code"></div>
        <div class="account-modal-split__qr-text">#{account_qr_premium}</div>
    </div>

    <div class="account-modal-split__info">
        <div class="account-modal-split__title" style="font-weight: 600;">CUB Premium</div>
        <div class="account-modal-split__text">#{account_premium}<br>
        <br>- #{account_premium_include_1}
        <br>- #{account_premium_include_2}
        <br>- #{account_premium_include_4}
        </div>
    </div>
</div>`

export default html