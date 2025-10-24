let html = `<div>
    <div class="simple-button simple-button--filter selector filter--search">
        <svg><use xlink:href="#sprite-search"></use></svg>
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