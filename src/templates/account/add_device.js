let html = `<div class="account-modal-split layer--height">
    <div class="account-modal-split__qr">
        <img class="account-modal-split__qr-img hide" />
        <div class="account-modal-split__qr-code"></div>
        <div class="account-modal-split__qr-text">#{account_qr_code}</div>
    </div>

    <div class="account-modal-split__info">
        <div class="account-modal-split__title">#{account_add_device_title}</div>
        <div class="account-modal-split__text">#{account_add_device_text}</div>

        <div class="account-modal-split__code">
            <div class="account-modal-split__code-num"><span></span></div>
            <div class="account-modal-split__code-num"><span></span></div>
            <div class="account-modal-split__code-num"><span></span></div>
            <div class="account-modal-split__code-num"><span></span></div>
            <div class="account-modal-split__code-num"><span></span></div>
            <div class="account-modal-split__code-num"><span></span></div>
        </div>

        <div class="account-modal-split__keyboard">
            <div class="simple-keyboard"></div>
        </div>
    </div>
</div>`

export default html