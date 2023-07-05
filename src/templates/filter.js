let html = `<div>
    <div class="simple-button simple-button--filter selector filter--search">
        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"/>
            <path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <div class="hide"></div>
    </div>
    <div class="simple-button simple-button--filter selector filter--sort">
        <span>#{filter_sorted}</span><div class="hide"></div>
    </div>

    <div class="simple-button simple-button--filter selector filter--filter">
        <span>#{filter_filtred}</span><div class="hide"></div>
    </div>
</div>`

export default html