let html = `<div class="friend-recommend">
    <div class="friend-recommend__all selector">
        <div class="friend-recommend__all-icon"><svg><use xlink:href="#sprite-friends"></use></svg></div>
        <div class="friend-recommend__all-title">#{friends_recommend_all}</div>
        <div class="friend-recommend__total"></div>
        <div class="friend-recommend__check"></div>
    </div>
    <div class="friend-recommend__label">
        <span>#{friends_recommend_choose}</span>
        <span class="friend-recommend__selected"></span>
    </div>
    <div class="friend-recommend__list"></div>
</div>`

export default html
