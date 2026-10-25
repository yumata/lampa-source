let html = `<div class="account-modal-split account-modal-split--device-code">
    <div class="account-modal-split__qr">
        <div class="account-modal-split__qr-code"></div>
        <div class="account-modal-split__qr-text">#{account_device_code_qr}</div>
    </div>

    <div class="account-modal-split__info">
        <div class="account-modal-split__title">#{account_add_device_title}</div>
        <div class="account-modal-split__text">#{account_device_code_text}</div>

        <div class="account-modal-split__device-code">----&nbsp;----</div>
        <div class="account-modal-split__status">#{account_device_code_wait}</div>

        <div class="simple-button simple-button--inline selector account-modal-split__manual">#{account_device_code_manual}</div>
    </div>
</div>`

export default html
