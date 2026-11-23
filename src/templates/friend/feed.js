// Карточка фильма в событии две: на ТВ — справа колонкой (__target--side), на телефоне — в строке под линией рядом с иконкой (__row), как на сайте CUB.
// Видна одна из них (friend.scss, $media_sm)
let target = (mod)=>`<div class="friend-feed__target friend-feed__target--${mod}">
        <div class="friend-feed__about">
            <div class="friend-feed__title"></div>
            <div class="friend-feed__meta"></div>
        </div>
        <div class="friend-feed__poster"><img /></div>
    </div>`

let html = `<div class="friend-feed selector">
    <div class="friend-feed__avatar"><img src="./img/img_load.svg" /></div>
    <div class="friend-feed__body">
        <div class="friend-feed__head"><span class="friend-feed__name"></span> <span class="friend-feed__action"></span></div>
        <div class="friend-feed__time"></div>
        <div class="friend-feed__row">
            <div class="friend-feed__detail"><svg><use xlink:href=""></use></svg><span></span></div>
            ${target('row')}
        </div>
    </div>
    ${target('side')}
</div>`

export default html
