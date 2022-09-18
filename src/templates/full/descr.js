let html = `<div class="full-descr">
    <div class="full-descr__left">
        <div class="full-descr__text">{text}</div>

        <div class="full-descr__line full--genres">
            <div class="full-descr__line-name">#{full_genre}</div>
            <div class="full-descr__line-body">{genres}</div>
        </div>

        <div class="full-descr__line full--companies">
            <div class="full-descr__line-name">#{full_production}</div>
            <div class="full-descr__line-body">{companies}</div>
        </div>
    </div>

    <div class="full-descr__right">
        <div class="full-descr__info">
            <div class="full-descr__info-name">#{full_date_of_release}</div>
            <div class="full-descr__info-body">{relise}</div>
        </div>

        <div class="full-descr__info full--budget">
            <div class="full-descr__info-name">#{full_budget}</div>
            <div class="full-descr__info-body">{budget}</div>
        </div>

        <div class="full-descr__info">
            <div class="full-descr__info-name">#{full_countries}</div>
            <div class="full-descr__info-body">{countries}</div>
        </div>
    </div>
</div>`

export default html