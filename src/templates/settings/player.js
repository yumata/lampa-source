let html = `<div>
    <div class="settings-param selector is--player" data-type="toggle" data-name="player">
        <div class="settings-param__name">Тип плеера</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Каким плеером воспроизводить</div>
    </div>
    
    <div class="settings-param selector is--android" data-type="button" data-name="reset_player" data-static="true">
        <div class="settings-param__name">Сбросить плеер по умолчанию</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Сбрасывает выбранный Android плеер в приложении</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="player_normalization">
        <div class="settings-param__name">Нормализация звука</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Нормализирует звук в один уровень, понижает громкие звуки и повышает тихие.</div>
    </div>
    
    <div class="settings-param selector" data-type="toggle" data-name="playlist_next">
        <div class="settings-param__name">Следующая серия</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Автоматически переключать на следующую серию по окончании текущей</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="player_timecode">
        <div class="settings-param__name">Таймкод</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Продолжить с последнего места просмотра</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="player_scale_method">
        <div class="settings-param__name">Метод масштабирования</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Каким образом производить вычисления для масштабирования видео</div>
    </div>
    
    <div class="is--has_subs">
        <div class="settings-param-title"><span>Субтитры</span></div>

        <div class="settings-param selector" data-type="toggle" data-name="subtitles_start">
            <div class="settings-param__name">Включить</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">Всегда включать субтитры после запуска видео</div>
        </div>

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

    <div class="settings-param-title"><span>Ещё</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="video_quality_default">
        <div class="settings-param__name">Качество видео по умолчанию</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Предпочтительное качество видео для просмотра</div>
    </div>
</div>`

export default html
