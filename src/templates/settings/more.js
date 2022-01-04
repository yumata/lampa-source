let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="start_page">
        <div class="settings-param__name">Стартовая страница</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">С какой страницы начинать при запуске</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="source">
        <div class="settings-param__name">Основной источник</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Откуда брать информацию о фильмах.</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="tmdb_lang">
        <div class="settings-param__name">TMDB</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">На каком языке отображать данные с TMDB</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="pages_save_total">
        <div class="settings-param__name">Сколько страниц хранить в памяти</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Хранит страницы в том состояние, в котором вы её покинули</div>
    </div>

    <div class="settings-param-title"><span>Скринсейвер</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="screensaver">
        <div class="settings-param__name">Показывать заставку при бездействии</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="screensaver_type">
        <div class="settings-param__name">Тип заставки</div>
        <div class="settings-param__value"></div>
    </div>
    
    <div class="settings-param-title"><span>Еще</span></div>

    <div class="settings-param selector" data-type="select" data-name="time_offset">
        <div class="settings-param__name">Сместить время</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="navigation_type">
        <div class="settings-param__name">Тип навигации</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="device_name" placeholder="Например: Моя Лампа">
        <div class="settings-param__name">Название устройства</div>
        <div class="settings-param__value"></div>
    </div>
</div>`

export default html