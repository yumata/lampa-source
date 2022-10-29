let html = `<div>
    <div class="simple-button selector filter--back">
        <svg width="38" height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="35" height="27" rx="1.5" stroke="currentColor" stroke-width="3"/>
            <rect x="6" y="7" width="25" height="3" fill="currentColor"/>
            <rect x="6" y="13" width="13" height="3" fill="currentColor"/>
            <rect x="6" y="19" width="19" height="3" fill="currentColor"/>
        </svg>
    </div>
    <div class="simple-button simple-button--filter selector filter--search">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve">
            <path fill="currentColor" d="M225.474,0C101.151,0,0,101.151,0,225.474c0,124.33,101.151,225.474,225.474,225.474 c124.33,0,225.474-101.144,225.474-225.474C450.948,101.151,349.804,0,225.474,0z M225.474,409.323 c-101.373,0-183.848-82.475-183.848-183.848S124.101,41.626,225.474,41.626s183.848,82.475,183.848,183.848 S326.847,409.323,225.474,409.323z"/>
            <path fill="currentColor" d="M505.902,476.472L386.574,357.144c-8.131-8.131-21.299-8.131-29.43,0c-8.131,8.124-8.131,21.306,0,29.43l119.328,119.328 c4.065,4.065,9.387,6.098,14.715,6.098c5.321,0,10.649-2.033,14.715-6.098C514.033,497.778,514.033,484.596,505.902,476.472z"/>
        </svg>
        <span>#{filter_clarify}</span>
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