let html = `<div class="person-start">

    <div class="person-start__body">
        <div class="person-start__right">
            <div class="person-start__poster">
                <img src="{img}" class="person-start__img" />
            </div>
        </div>

        <div class="person-start__left">
            <div class="person-start__tags">
                <div class="person-start__tag">
                    <img src="./img/icons/pulse.svg" /> <div>{birthday}</div>
                </div>
            </div>
            
            <div class="person-start__name">{name}</div>
            <div class="person-start__place">{place}</div>

            <div class="person-start__descr">{descr}</div>
        </div>
    </div>

    <div class="person-start__descr-mobile">{descr}</div>
</div>`

export default html