let html = `<div class="account-modal-split">
    <div class="account-modal-split__qr">
        <img class="account-modal-split__qr-img hide" />
        <div class="account-modal-split__qr-code"></div>
        <div class="account-modal-split__qr-text">#{account_qr_create}</div>
    </div>

    <div class="account-modal-split__info">
        <div class="account-modal-split__title">#{account_none_title}</div>
        <div class="account-modal-split__text">#{account_create}<br>
        <br>- #{account_none_include_1}
        <br>- #{account_none_include_2}
        <br>- #{account_none_include_3}
        <br>- #{account_none_include_4}
        </div>

        <div class="simple-button simple-button--inline selector">#{settings_cub_signin_button}</div>
    </div>
</div>`

export default html