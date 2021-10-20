let html = `<div>
    <div class="settings-param selector is--player" data-type="toggle" data-name="player">
        <div class="settings-param__name">Тип плеера</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Каким плеером воспроизводить</div>
    </div>
    
    <div class="settings-param selector" data-type="toggle" data-name="playlist_next">
        <div class="settings-param__name">Следующая серия</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Автоматически переключать на следующую серию при окончание текущей</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="player_timecode">
        <div class="settings-param__name">Таймкод</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Продолжить с последнего места просмотра</div>
    </div>
    
    <div class="is--has_subs">
        <div class="settings-param-title"><span>Субтитры</span></div>
        
        <div class="settings-param selector" data-type="toggle" data-name="subtitles_size">
            <div class="settings-param__name">Размер</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr"></div>
        </div>
        
        <div class="settings-param selector" data-type="toggle" data-name="subtitles_stroke">
            <div class="settings-param__name">Использовать окантовку</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">Субтитры будут обведены черным цветом для улучшения читаемости</div>
        </div>
        
        <div class="settings-param selector" data-type="toggle" data-name="subtitles_backdrop">
            <div class="settings-param__name">Использовать подложку</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">Субтитры будут отображаться на полупрозрачной подложке для улучшения читаемости</div>
        </div>
    </div>  
</div>`

export default html