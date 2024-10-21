let html = `<div class="full-descr">
    <div class="full-descr__left">
        <div class="full-descr__text selector">{text}</div>

        <div class="full-descr__details">
            <div class="full-descr__info">
                <div class="full-descr__info-name">#{full_date_of_release}</div>
                <div class="full-descr__info-body">{relise}</div>
            </div>

            <div class="full-descr__info full--budget">
                <div class="full-descr__info-name">#{full_budget}</div>
                <div class="full-descr__info-body">{budget}</div>
            </div>

            <div class="full-descr__info full--countries">
                <div class="full-descr__info-name">#{full_countries}</div>
                <div class="full-descr__info-body">{countries}</div>
            </div>
        </div>

        <div class="full-descr__tags"></div>
    </div>

    
</div>`

export default html