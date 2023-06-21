import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Template from '../interaction/template'
import Utils from '../utils/math'
import Filter from '../interaction/filter'
import Storage from '../utils/storage'
import Empty from '../interaction/empty'
import Torrent from '../interaction/torrent'
import Modal from '../interaction/modal'
import Background from '../interaction/background'
import Select from '../interaction/select'
import Torserver from '../interaction/torserver'
import Noty from '../interaction/noty'
import Parser from '../utils/api/parser'
import Helper from '../interaction/helper'
import Lang from '../utils/lang'
import TMDB from '../utils/tmdb'
import Explorer from '../interaction/explorer'
import Layer from '../utils/layer'


function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over: true})
    let files   = new Explorer(object)
    let filter
    let results = []
    let filtred = []

    let total_pages = 1
    let count       = 0
    let last
    let last_filter
    let initialized

    let filter_items = {
        quality: [Lang.translate('torrent_parser_any_one'),'4k','1080p','720p'],
        hdr: [Lang.translate('torrent_parser_no_choice'),Lang.translate('torrent_parser_yes'),Lang.translate('torrent_parser_no')],
        dv: [Lang.translate('torrent_parser_no_choice'),Lang.translate('torrent_parser_yes'),Lang.translate('torrent_parser_no')],
        sub: [Lang.translate('torrent_parser_no_choice'),Lang.translate('torrent_parser_yes'),Lang.translate('torrent_parser_no')],
        voice: [],
        tracker: [Lang.translate('torrent_parser_any_two')],
        year: [Lang.translate('torrent_parser_any_two')]
    }

    let filter_translate = {
        quality: Lang.translate('torrent_parser_quality'),
        hdr: 'HDR',
        dv: 'Dolby Vision',
        sub: Lang.translate('torrent_parser_subs'),
        voice: Lang.translate('torrent_parser_voice'),
        tracker: Lang.translate('torrent_parser_tracker'),
        year: Lang.translate('torrent_parser_year'),
        season: Lang.translate('torrent_parser_season')
    }

    let filter_multiple = ['quality','voice','tracker','season']

    let sort_translate = {
        Seeders: Lang.translate('torrent_parser_sort_by_seeders'),
        Size: Lang.translate('torrent_parser_sort_by_size'),
        Title: Lang.translate('torrent_parser_sort_by_name'),
        Tracker:Lang.translate('torrent_parser_sort_by_tracker'),
        PublisTime: Lang.translate('torrent_parser_sort_by_date'),
        viewed: Lang.translate('torrent_parser_sort_by_viewed')
    }

    let i = 20,
        y = (new Date()).getFullYear()

    while (i--) {
        filter_items.year.push((y - (19 - i)) + '')
    }

    let viewed = Storage.cache('torrents_view', 5000, [])

    let finded_seasons      = []
    let finded_seasons_full = []

    let voices = ["Laci", "Kerob", "LE-Production",  "Parovoz Production", "Paradox", "Omskbird", "LostFilm", "Причудики", "BaibaKo", "NewStudio", "AlexFilm", "FocusStudio", "Gears Media", "Jaskier", "ViruseProject",
    "Кубик в Кубе", "IdeaFilm", "Sunshine Studio", "Ozz.tv", "Hamster Studio", "Сербин", "To4ka", "Кравец", "Victory-Films", "SNK-TV", "GladiolusTV", "Jetvis Studio", "ApofysTeam", "ColdFilm",
    "Agatha Studdio", "KinoView", "Jimmy J.", "Shadow Dub Project", "Amedia", "Red Media", "Selena International", "Гоблин", "Universal Russia", "Kiitos", "Paramount Comedy", "Кураж-Бамбей",
    "Студия Пиратского Дубляжа", "Чадов", "Карповский", "RecentFilms", "Первый канал", "Alternative Production", "NEON Studio", "Колобок", "Дольский", "Синема УС", "Гаврилов", "Живов", "SDI Media",
    "Алексеев", "GreenРай Studio", "Михалев", "Есарев", "Визгунов", "Либергал", "Кузнецов", "Санаев", "ДТВ", "Дохалов", "Sunshine Studio", "Горчаков", "LevshaFilm", "CasStudio", "Володарский",
    "ColdFilm", "Шварко", "Карцев", "ETV+", "ВГТРК", "Gravi-TV", "1001cinema", "Zone Vision Studio", "Хихикающий доктор", "Murzilka", "turok1990", "FOX", "STEPonee", "Elrom", "Колобок", "HighHopes",
    "SoftBox", "GreenРай Studio", "NovaFilm", "Четыре в квадрате", "Greb&Creative", "MUZOBOZ", "ZM-Show", "RecentFilms", "Kerems13", "Hamster Studio", "New Dream Media", "Игмар", "Котов", "DeadLine Studio",
    "Jetvis Studio", "РенТВ", "Андрей Питерский", "Fox Life", "Рыбин", "Trdlo.studio", "Studio Victory Аsia", "Ozeon", "НТВ", "CP Digital", "AniLibria", "STEPonee", "Levelin", "FanStudio", "Cmert",
    "Интерфильм", "SunshineStudio", "Kulzvuk Studio", "Кашкин", "Вартан Дохалов", "Немахов", "Sedorelli", "СТС", "Яроцкий", "ICG", "ТВЦ", "Штейн", "AzOnFilm", "SorzTeam", "Гаевский", "Мудров",
    "Воробьев Сергей", "Студия Райдо", "DeeAFilm Studio", "zamez", "ViruseProject", "Иванов", "STEPonee", "РенТВ", "СВ-Дубль", "BadBajo", "Комедия ТВ", "Мастер Тэйп", "5-й канал СПб", "SDI Media",
    "Гланц", "Ох! Студия", "СВ-Кадр", "2x2", "Котова", "Позитив", "RusFilm", "Назаров", "XDUB Dorama", "Реальный перевод", "Kansai", "Sound-Group", "Николай Дроздов", "ZEE TV", "Ozz.tv", "MTV",
    "Сыендук", "GoldTeam", "Белов", "Dream Records", "Яковлев", "Vano", "SilverSnow", "Lord32x", "Filiza Studio", "Sony Sci-Fi", "Flux-Team", "NewStation", "XDUB Dorama", "Hamster Studio", "Dream Records",
    "DexterTV", "ColdFilm", "Good People", "RusFilm", "Levelin", "AniDUB", "SHIZA Project", "AniLibria.TV", "StudioBand", "AniMedia", "Kansai", "Onibaku", "JWA Project", "MC Entertainment", "Oni", "Jade",
    "Ancord", "ANIvoice", "Nika Lenina", "Bars MacAdams", "JAM", "Anika", "Berial", "Kobayashi", "Cuba77", "RiZZ_fisher", "OSLIKt", "Lupin", "Ryc99", "Nazel & Freya", "Trina_D", "JeFerSon", "Vulpes Vulpes",
    "Hamster", "KinoGolos", "Fox Crime", "Денис Шадинский", "AniFilm", "Rain Death", "LostFilm", "New Records", "Ancord", "Первый ТВЧ", "RG.Paravozik", "Profix Media", "Tycoon", "RealFake",
    "HDrezka", "Jimmy J.", "AlexFilm", "Discovery", "Viasat History", "AniMedia", "JAM", "HiWayGrope", "Ancord", "СВ-Дубль", "Tycoon", "SHIZA Project", "GREEN TEA", "STEPonee", "AlphaProject",
    "AnimeReactor", "Animegroup", "Shachiburi", "Persona99", "3df voice", "CactusTeam", "AniMaunt", "AniMedia", "AnimeReactor", "ShinkaDan", "Jaskier", "ShowJet", "RAIM", "RusFilm", "Victory-Films",
    "АрхиТеатр", "Project Web Mania", "ko136", "КураСгречей", "AMS", "СВ-Студия", "Храм Дорам ТВ", "TurkStar", "Медведев", "Рябов", "BukeDub", "FilmGate", "FilmsClub", "Sony Turbo", "ТВЦ", "AXN Sci-Fi",
    "NovaFilm", "DIVA Universal", "Курдов", "Неоклассика", "fiendover", "SomeWax", "Логинофф", "Cartoon Network", "Sony Turbo", "Loginoff", "CrezaStudio", "Воротилин", "LakeFilms", "Andy", "CP Digital",
    "XDUB Dorama + Колобок", "SDI Media", "KosharaSerials", "Екатеринбург Арт", "Julia Prosenuk", "АРК-ТВ Studio", "Т.О Друзей", "Anifilm", "Animedub", "AlphaProject", "Paramount Channel", "Кириллица",
    "AniPLague", "Видеосервис", "JoyStudio", "HighHopes", "TVShows", "AniFilm", "GostFilm", "West Video", "Формат AB", "Film Prestige", "West Video", "Екатеринбург Арт", "SovetRomantica", "РуФилмс",
    "AveBrasil", "Greb&Creative", "BTI Studios", "Пифагор", "Eurochannel", "NewStudio", "Кармен Видео", "Кошкин", "Кравец", "Rainbow World", "Воротилин", "Варус-Видео", "ClubFATE", "HiWay Grope",
    "Banyan Studio", "Mallorn Studio", "Asian Miracle Group", "Эй Би Видео", "AniStar", "Korean Craze", "LakeFilms", "Невафильм", "Hallmark", "Netflix", "Mallorn Studio", "Sony Channel", "East Dream",
    "Bonsai Studio", "Lucky Production", "Octopus", "TUMBLER Studio", "CrazyCatStudio", "Amber", "Train Studio", "Анастасия Гайдаржи", "Мадлен Дюваль", "Fox Life", "Sound Film", "Cowabunga Studio", "Фильмэкспорт",
    "VO-Production", "Sound Film", "Nickelodeon", "MixFilm", "GreenРай Studio", "Sound-Group", "Back Board Cinema", "Кирилл Сагач", "Bonsai Studio", "Stevie", "OnisFilms", "MaxMeister", "Syfy Universal",
    "TUMBLER Studio", "NewStation", "Neo-Sound", "Муравский", "IdeaFilm", "Рутилов", "Тимофеев", "Лагута", "Дьяконов", "Zone Vision Studio", "Onibaku", "AniMaunt", "Voice Project", "AniStar", "Пифагор",
    "VoicePower", "StudioFilms", "Elysium", "AniStar", "BeniAffet", "Selena International", "Paul Bunyan", "CoralMedia", "Кондор", "Игмар", "ViP Premiere", "FireDub", "AveTurk", "Sony Sci-Fi", "Янкелевич",
    "Киреев", "Багичев", "2x2", "Лексикон", "Нота", "Arisu", "Superbit", "AveDorama", "VideoBIZ", "Киномания", "DDV", "Alternative Production", "WestFilm", "Анастасия Гайдаржи + Андрей Юрченко", "Киномания",
    "Agatha Studdio", "GreenРай Studio", "VSI Moscow", "Horizon Studio", "Flarrow Films", "Amazing Dubbing", "Asian Miracle Group", "Видеопродакшн", "VGM Studio", "FocusX", "CBS Drama", "NovaFilm", "Novamedia",
    "East Dream", "Дасевич", "Анатолий Гусев", "Twister", "Морозов", "NewComers", "kubik&ko", "DeMon", "Анатолий Ашмарин", "Inter Video", "Пронин", "AMC", "Велес", "Volume-6 Studio", "Хоррор Мэйкер",
    "Ghostface", "Sephiroth", "Акира", "Деваль Видео", "RussianGuy27", "neko64", "Shaman", "Franek Monk", "Ворон", "Andre1288", "Selena International", "GalVid", "Другое кино", "Студия NLS", "Sam2007",
    "HaseRiLLoPaW", "Севастьянов", "D.I.M.", "Марченко", "Журавлев", "Н-Кино", "Lazer Video", "SesDizi", "Red Media", "Рудой", "Товбин", "Сергей Дидок", "Хуан Рохас", "binjak", "Карусель", "Lizard Cinema",
    "Варус-Видео", "Акцент", "RG.Paravozik", "Max Nabokov", "Barin101", "Васька Куролесов", "Фортуна-Фильм", "Amalgama", "AnyFilm", "Студия Райдо", "Козлов", "Zoomvision Studio", "Пифагор", "Urasiko",
    "VIP Serial HD", "НСТ", "Кинолюкс", "Project Web Mania", "Завгородний", "AB-Video", "Twister", "Universal Channel", "Wakanim", "SnowRecords", "С.Р.И", "Старый Бильбо", "Ozz.tv", "Mystery Film", "РенТВ",
    "Латышев", "Ващенко", "Лайко", "Сонотек", "Psychotronic", "DIVA Universal", "Gremlin Creative Studio", "Нева-1", "Максим Жолобов", "Good People", "Мобильное телевидение", "Lazer Video",
    "IVI", "DoubleRec", "Milvus", "RedDiamond Studio", "Astana TV", "Никитин", "КТК", "D2Lab", "НСТ", "DoubleRec", "Black Street Records", "Останкино", "TatamiFilm", "Видеобаза", "Crunchyroll", "Novamedia",
    "RedRussian1337", "КонтентикOFF", "Creative Sound", "HelloMickey Production", "Пирамида", "CLS Media", "Сонькин", "Мастер Тэйп", "Garsu Pasaulis", "DDV", "IdeaFilm", "Gold Cinema", "Че!", "Нарышкин",
    "Intra Communications", "OnisFilms", "XDUB Dorama", "Кипарис", "Королёв", "visanti-vasaer", "Готлиб", "Paramount Channel", "СТС", "диктор CDV", "Pazl Voice", "Прямостанов", "Zerzia", "НТВ", "MGM",
    "Дьяков", "Вольга", "АРК-ТВ Studio", "Дубровин", "МИР", "Netflix", "Jetix", "Кипарис", "RUSCICO", "Seoul Bay", "Филонов", "Махонько", "Строев", "Саня Белый", "Говинда Рага", "Ошурков", "Horror Maker",
    "Хлопушка", "Хрусталев", "Антонов Николай", "Золотухин", "АрхиАзия", "Попов", "Ultradox", "Мост-Видео", "Альтера Парс", "Огородников", "Твин", "Хабар", "AimaksaLTV", "ТНТ", "FDV", "3df voice",
    "The Kitchen Russia", "Ульпаней Эльром", "Видеоимпульс", "GoodTime Media", "Alezan", "True Dubbing Studio", "FDV", "Карусель", "Интер", "Contentica", "Мельница", "RealFake", "ИДДК", "Инфо-фильм",
    "Мьюзик-трейд", "Кирдин | Stalk", "ДиоНиК", "Стасюк", "TV1000", "Hallmark", "Тоникс Медиа", "Бессонов", "Gears Media", "Бахурани", "NewDub", "Cinema Prestige", "Набиев", "New Dream Media", "ТВ3",
    "Малиновский Сергей", "Superbit", "Кенс Матвей", "LE-Production", "Voiz", "Светла", "Cinema Prestige", "JAM", "LDV", "Videogram", "Индия ТВ", "RedDiamond Studio", "Герусов", "Элегия фильм", "Nastia",
    "Семыкина Юлия", "Электричка", "Штамп Дмитрий", "Пятница", "Oneinchnales", "Gravi-TV", "D2Lab", "Кинопремьера", "Бусов Глеб", "LE-Production", "1001cinema", "Amazing Dubbing", "Emslie",
    "1+1", "100 ТВ", "1001 cinema", "2+2", "2х2", "3df voice", "4u2ges", "5 канал", "A. Lazarchuk", "AAA-Sound", "AB-Video", "AdiSound", "ALEKS KV", "AlexFilm", "AlphaProject", "Alternative Production", 
    "Amalgam", "AMC", "Amedia", "AMS", "Andy", "AniLibria", "AniMedia", "Animegroup", "Animereactor", "AnimeSpace Team", "Anistar", "AniUA", "AniWayt", "Anything-group", "AOS", 
    "Arasi project", "ARRU Workshop", "AuraFilm", "AvePremier", "AveTurk", "AXN Sci-Fi", "Azazel", "AzOnFilm", "BadBajo", "BadCatStudio", "BBC Saint-Petersburg", "BD CEE", "Black Street Records", 
    "Bonsai Studio", "Boльгa", "Brain Production", "BraveSound", "BTI Studios", "Bubble Dubbing Company", "Byako Records", "Cactus Team", "Cartoon Network", "CBS Drama", "CDV", "Cinema Prestige", 
    "CinemaSET GROUP", "CinemaTone", "ColdFilm", "Contentica", "CP Digital", "CPIG", "Crunchyroll", "Cuba77", "D1", "D2lab", "datynet", "DDV", "DeadLine", "DeadSno", "DeMon", "den904", "Description", 
    "DexterTV", "Dice", "Discovery", "DniproFilm", "DoubleRec", "DreamRecords", "DVD Classic", "East Dream", "Eladiel", "Elegia", "ELEKTRI4KA", "Elrom", "ELYSIUM", "Epic Team", "eraserhead", "erogg", 
    "Eurochannel", "Extrabit", "F-TRAIN", "Family Fan Edition", "FDV", "FiliZa Studio", "Film Prestige", "FilmGate", "FilmsClub", "FireDub", "Flarrow Films", "Flux-Team", "FocusStudio", "FOX", "Fox Crime", 
    "Fox Russia", "FoxLife", "Foxlight", "Franek Monk", "Gala Voices", "Garsu Pasaulis", "Gears Media", "Gemini", "General Film", "GetSmart", "Gezell Studio", "Gits", "GladiolusTV", "GoldTeam", "Good People", 
    "Goodtime Media", "GoodVideo", "GostFilm", "Gramalant", "Gravi-TV", "GREEN TEA", "GreenРай Studio", "Gremlin Creative Studio", "Hallmark", "HamsterStudio", "HiWay Grope", "Horizon Studio", "hungry_inri", 
    "ICG", "ICTV", "IdeaFilm", "IgVin &amp; Solncekleshka", "ImageArt", "INTERFILM", "Ivnet Cinema", "IНТЕР", "Jakob Bellmann", "JAM", "Janetta", "Jaskier", "JeFerSon", "jept", "JetiX", "Jetvis", "JimmyJ", 
    "KANSAI", "KIHO", "kiitos", "KinoGolos", "Kinomania", "KosharaSerials", "Kолобок", "L0cDoG", "LakeFilms", "LDV", "LE-Production", "LeDoyen", "LevshaFilm", "LeXiKC", "Liga HQ", "Line", "Lisitz", 
    "Lizard Cinema Trade", "Lord32x", "lord666", "LostFilm", "Lucky Production", "Macross", "madrid", "Mallorn Studio", "Marclail", "Max Nabokov", "MC Entertainment", "MCA", "McElroy", "Mega-Anime", 
    "Melodic Voice Studio", "metalrus", "MGM", "MifSnaiper", "Mikail", "Milirina", "MiraiDub", "MOYGOLOS", "MrRose", "MTV", "Murzilka", "MUZOBOZ", "National Geographic", "NemFilm", "Neoclassica", "NEON Studio", 
    "New Dream Media", "NewComers", "NewStation", "NewStudio", "Nice-Media", "Nickelodeon", "No-Future", "NovaFilm", "Novamedia", "Octopus", "Oghra-Brown", "OMSKBIRD", "Onibaku", "OnisFilms", "OpenDub", 
    "OSLIKt", "Ozz TV", "PaDet", "Paramount Comedy", "Paramount Pictures", "Parovoz Production", "PashaUp", "Paul Bunyan", "Pazl Voice", "PCB Translate", "Persona99", "PiratVoice", "Postmodern", "Profix Media", 
    "Project Web Mania", "Prolix", "QTV", "R5", "Radamant", "RainDeath", "RATTLEBOX", "RealFake", "Reanimedia", "Rebel Voice", "RecentFilms", "Red Media", "RedDiamond Studio", "RedDog", "RedRussian1337", 
    "Renegade Team", "RG Paravozik", "RinGo", "RoxMarty", "Rumble", "RUSCICO", "RusFilm", "RussianGuy27", "Saint Sound", "SakuraNight", "Satkur", "Sawyer888", "Sci-Fi Russia", "SDI Media", "Selena", "seqw0", 
    "SesDizi", "SGEV", "Shachiburi", "SHIZA", "ShowJet", "Sky Voices", "SkyeFilmTV", "SmallFilm", "SmallFilm", "SNK-TV", "SnowRecords", "SOFTBOX", "SOLDLUCK2", "Solod", "SomeWax", "Sony Channel", "Sony Turbo", 
    "Sound Film", "SpaceDust", "ssvss", "st.Elrom", "STEPonee", "SunshineStudio", "Superbit", "Suzaku", "sweet couple", "TatamiFilm", "TB5", "TF-AniGroup", "The Kitchen Russia", "The Mike Rec.", "Timecraft", 
    "To4kaTV", "Tori", "Total DVD", "TrainStudio", "Troy", "True Dubbing Studio", "TUMBLER Studio", "turok1990", "TV 1000", "TVShows", "Twister", "Twix", "Tycoon", "Ultradox", "Universal Russia", "VashMax2", 
    "VendettA", "VHS", "VicTeam", "VictoryFilms", "Video-BIZ", "Videogram", "ViruseProject", "visanti-vasaer", "VIZ Media", "VO-production", "Voice Project Studio", "VoicePower", "VSI Moscow", "VulpesVulpes", 
    "Wakanim", "Wayland team", "WestFilm", "WiaDUB", "WVoice", "XL Media", "XvidClub Studio", "zamez", "ZEE TV", "Zendos", "ZM-SHOW", "Zone Studio", "Zone Vision", "Агапов", "Акопян", "Алексеев", "Артемьев", 
    "Багичев", "Бессонов", "Васильев", "Васильцев", "Гаврилов", "Герусов", "Готлиб", "Григорьев", "Дасевич", "Дольский", "Карповский", "Кашкин", "Киреев", "Клюквин", "Костюкевич", "Матвеев", "Михалев", "Мишин", 
    "Мудров", "Пронин", "Савченко", "Смирнов", "Тимофеев", "Толстобров", "Чуев", "Шуваев", "Яковлев", "ААА-sound", "АБыГДе", "Акалит", "Акира", "Альянс", "Амальгама", "АМС", "АнВад", "Анубис", "Anubis", "Арк-ТВ", 
    "АРК-ТВ Studio", "Б. Федоров", "Бибиков", "Бигыч", "Бойков", "Абдулов", "Белов", "Вихров", "Воронцов", "Горчаков", "Данилов", "Дохалов", "Котов", "Кошкин", "Назаров", "Попов", "Рукин", "Рутилов", 
    "Варус Видео", "Васька Куролесов", "Ващенко С.", "Векшин", "Велес", "Весельчак", "Видеоимпульс", "Витя «говорун»", "Войсовер", "Вольга", "Ворон", "Воротилин", "Г. Либергал", "Г. Румянцев", "Гей Кино Гид", 
    "ГКГ", "Глуховский", "Гризли", "Гундос", "Деньщиков", "Есарев", "Нурмухаметов", "Пучков", "Стасюк", "Шадинский", "Штамп", "sf@irat", "Держиморда", "Домашний", "ДТВ", "Дьяконов", "Е. Гаевский", "Е. Гранкин", 
    "Е. Лурье", "Е. Рудой", "Е. Хрусталёв", "ЕА Синема", "Екатеринбург Арт", "Живаго", "Жучков", "З Ранку До Ночі", "Завгородний", "Зебуро", "Зереницын", "И. Еремеев", "И. Клушин", "И. Сафронов", "И. Степанов", 
    "ИГМ", "Игмар", "ИДДК", "Имидж-Арт", "Инис", "Ирэн", "Ист-Вест", "К. Поздняков", "К. Филонов", "К9", "Карапетян", "Кармен Видео", "Карусель", "Квадрат Малевича", "Килька",  "Кипарис", "Королев", "Котова", 
    "Кравец", "Кубик в Кубе", "Кураж-Бамбей", "Л. Володарский", "Лазер Видео", "ЛанселаП", "Лапшин", "Лексикон", "Ленфильм", "Леша Прапорщик", "Лизард", "Люсьена", "Заугаров", "Иванов", "Иванова и П. Пашут", 
    "Латышев", "Ошурков", "Чадов", "Яроцкий", "Максим Логинофф", "Малиновский", "Марченко", "Мастер Тэйп", "Махонько", "Машинский", "Медиа-Комплекс", "Мельница", "Мика Бондарик", "Миняев", "Мительман", 
    "Мост Видео", "Мосфильм", "Муравский", "Мьюзик-трейд", "Н-Кино", "Н. Антонов", "Н. Дроздов", "Н. Золотухин", "Н.Севастьянов seva1988", "Набиев", "Наталья Гурзо", "НЕВА 1", "Невафильм", "НеЗупиняйПродакшн", 
    "Неоклассика", "Несмертельное оружие", "НЛО-TV", "Новий", "Новый диск", "Новый Дубляж", "Новый Канал", "Нота", "НСТ", "НТВ", "НТН", "Оверлорд", "Огородников", "Омикрон", "Гланц", "Карцев", "Морозов", 
    "Прямостанов", "Санаев", "Парадиз", "Пепелац", "Первый канал ОРТ", "Переводман", "Перец", "Петербургский дубляж", "Петербуржец", "Пирамида", "Пифагор", "Позитив-Мультимедиа", "Прайд Продакшн", "Премьер Видео", 
    "Премьер Мультимедиа", "Причудики", "Р. Янкелевич", "Райдо", "Ракурс", "РенТВ", "Россия", "РТР", "Русский дубляж", "Русский Репортаж", "РуФилмс", "Рыжий пес", "С. Визгунов", "С. Дьяков", "С. Казаков", 
    "С. Кузнецов", "С. Кузьмичёв", "С. Лебедев", "С. Макашов", "С. Рябов", "С. Щегольков", "С.Р.И.", "Сolumbia Service", "Самарский", "СВ Студия", "СВ-Дубль", "Светла", "Селена Интернешнл", "Синема Трейд", 
    "Синема УС", "Синта Рурони", "Синхрон", "Советский", "Сокуров", "Солодухин", "Сонотек", "Сонькин", "Союз Видео", "Союзмультфильм", "СПД - Сладкая парочка", "Строев", "СТС", "Студии Суверенного Лепрозория", 
    "Студия «Стартрек»", "KOleso", "Студия Горького", "Студия Колобок", "Студия Пиратского Дубляжа", "Студия Райдо", "Студия Трёх", "Гуртом", "Супербит", "Сыендук", "Так Треба Продакшн", "ТВ XXI век", "ТВ СПб", 
    "ТВ-3", "ТВ6", "ТВИН", "ТВЦ", "ТВЧ 1", "ТНТ", "ТО Друзей", "Толмачев", "Точка Zрения", "Трамвай-фильм", "ТРК", "Уолт Дисней Компани", "Хихидок", "Хлопушка", "Цікава Ідея", "Четыре в квадрате", "Швецов", 
    "Штамп", "Штейн", "Ю. Живов", "Ю. Немахов", "Ю. Сербин", "Ю. Товбин", "Я. Беллманн","Red Head Sound", "UKR"]
    
    scroll.minus(files.render().find('.explorer__files-head'))

    scroll.body().addClass('torrent-list')

    this.create = function(){
        return this.render()
    }

    this.initialize = function(){
        this.activity.loader(true)

        if(object.movie.original_language == 'ja' && object.movie.genres.find(g=>g.id == 16) && Storage.field('language') !== 'en'){
            network.silent(TMDB.api((object.movie.name ? 'tv' : 'movie') + '/' + object.movie.id + '?api_key=' + TMDB.key() + '&language=en' ),(result)=>{
                object.search_two = result.name || result.title

                this.parse()
            },this.parse.bind(this))
        }
        else{
            this.parse()
        }

        scroll.onEnd = this.next.bind(this)

        return this.render()
    }

    this.parse = function(){
        filter = new Filter(object)

        Parser.get(object,(data)=>{
            results = data

            this.build()

            Layer.update(scroll.render(true))

            this.activity.loader(false)

            this.activity.toggle()
        },(text)=>{
            this.empty(Lang.translate('torrent_error_connect') + ': ' + text)
        })

        filter.onSearch = (value)=>{
            Activity.replace({
                search: value,
                clarification: true
            })
        }

        filter.onBack = ()=>{
            this.start()
        }

        filter.render().find('.selector').on('hover:focus',(e)=>{
            last_filter = e.target
        })

        filter.addButtonBack()

        files.appendHead(filter.render())
    }

    this.empty = function(descr){
        let empty = new Empty({
            descr: descr
        })

        files.render().find('.explorer__files-head').addClass('hide')

        files.appendFiles(empty.render(filter.empty()))

        empty.render().find('.simple-button').on('hover:enter',()=>{
            filter.render().find('.filter--search').trigger('hover:enter')
        })

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.listEmpty = function(){
        let em = Template.get('list_empty')
        let bn = $('<div class="simple-button selector"><span>'+Lang.translate('filter_clarify')+'</span></div>')
        let ft = $('<div class="empty__footer"></div>')

        bn.on('hover:enter',()=>{
            filter.render().find('.filter--filter').trigger('hover:enter')
        })

        ft.append(bn)

        em.append(ft)

        scroll.append(em)
    }

    this.buildSorted = function(){
        let need   = Storage.get('torrents_sort','Seeders')
        let select = [
            {
                title: Lang.translate('torrent_parser_sort_by_seeders'),
                sort: 'Seeders'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_size'),
                sort: 'Size'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_name'),
                sort: 'Title'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_tracker'),
                sort: 'Tracker'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_date'),
                sort: 'PublisTime'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_viewed'),
                sort: 'viewed'
            }
        ]

        select.forEach(element => {
            if(element.sort == need) element.selected = true
        });

        filter.sort(results.Results, need)

        this.sortWithPopular()

        filter.set('sort', select)

        this.selectedSort()
    }

    this.sortWithPopular = function(){
        let popular = []
        let other   = []

        results.Results.forEach((a)=>{
            if(a.viewing_request) popular.push(a)
            else other.push(a)
        })

        popular.sort((a,b)=>b.viewing_average - a.viewing_average)

        results.Results = popular.concat(other)
    }

    this.buildFilterd = function(){
        let need     = Storage.get('torrents_filter','{}')
        let select   = []

        let add = (type, title)=>{
            let items    = filter_items[type]
            let subitems = []
            let multiple = filter_multiple.indexOf(type) >= 0
            let value    = need[type]

            if(multiple) value = Arrays.toArray(value)

            items.forEach((name, i) => {
                subitems.push({
                    title: name,
                    //selected: multiple ? i == 0 : value == i,
                    checked: multiple && value.indexOf(name) >= 0,
                    checkbox: multiple && i > 0,
                    noselect: true,
                    index: i
                })
            })

            select.push({
                title: title,
                subtitle: multiple ? (value.length ? value.join(', ') : items[0]) : (typeof value == 'undefined' ? items[0] : items[value]),
                items: subitems,
                noselect: true,
                stype: type
            })
        }

        filter_items.voice   = [Lang.translate('torrent_parser_any_two'),Lang.translate('torrent_parser_voice_dubbing'),Lang.translate('torrent_parser_voice_polyphonic'),Lang.translate('torrent_parser_voice_two'),Lang.translate('torrent_parser_voice_amateur')]
        filter_items.tracker = [Lang.translate('torrent_parser_any_two')]
        filter_items.season  = [Lang.translate('torrent_parser_any_two')]

        

        results.Results.forEach(element => {
            let title = element.Title.toLowerCase(),
                tracker = element.Tracker;
            
            for(let i = 0; i < voices.length; i++){
                let voice = voices[i].toLowerCase()

                if(title.indexOf(voice) >= 0){
                    if(filter_items.voice.indexOf(voices[i]) == -1) filter_items.voice.push(voices[i])
                }
            }

            tracker.split(',').forEach(t=>{
                if(filter_items.tracker.indexOf(t.trim()) === -1) filter_items.tracker.push(t.trim())
            })

            let season = title.match(/.?s\[(\d+)-\].?|.?s(\d+).?|.?\((\d+) сезон.?|.?season (\d+),.?/)

            if(season){
                season = season.filter(c=>c)

                if(season.length > 1){
                    let orig   = season[1]
                    let number = parseInt(orig) + ''

                    if(number && finded_seasons.indexOf(number) == -1){
                        finded_seasons.push(number)
                        finded_seasons_full.push(orig)
                    }
                }
            }
        })

        finded_seasons_full.sort((a,b)=>{
            let ac = parseInt(a)
            let bc = parseInt(b)

            if(ac > bc) return 1
            else if(ac < bc) return -1
            else return 0
        })

        finded_seasons.sort((a,b)=>{
            let ac = parseInt(a)
            let bc = parseInt(b)

            if(ac > bc) return 1
            else if(ac < bc) return -1
            else return 0
        })

        if(finded_seasons.length) filter_items.season = filter_items.season.concat(finded_seasons)

        
        //надо очистить от отсутствующих ключей
        need.voice   = Arrays.removeNoIncludes(Arrays.toArray(need.voice), filter_items.voice)
        need.tracker = Arrays.removeNoIncludes(Arrays.toArray(need.tracker), filter_items.tracker)
        need.season  = Arrays.removeNoIncludes(Arrays.toArray(need.season), filter_items.season)

        Storage.set('torrents_filter', need)

        select.push({
            title: Lang.translate('torrent_parser_reset'),
            reset: true
        })

        add('quality',Lang.translate('torrent_parser_quality'))
        add('hdr','HDR')
        add('dv','Dolby Vision')
        add('sub',Lang.translate('torrent_parser_subs'))
        add('voice',Lang.translate('torrent_parser_voice'))
        add('season', Lang.translate('torrent_parser_season'))
        add('tracker', Lang.translate('torrent_parser_tracker'))
        add('year', Lang.translate('torrent_parser_year'))
        

        filter.set('filter', select)

        this.selectedFilter()
    }

    this.selectedFilter = function(){
        let need   = Storage.get('torrents_filter','{}'),
            select = []

        for(let i in need){
            if(need[i]){
                if(Arrays.isArray(need[i])){
                    if(need[i].length) select.push(filter_translate[i] + ':' + need[i].join(', '))
                }
                else{
                    select.push(filter_translate[i] + ': ' + filter_items[i][need[i]])
                }
            }
        }

        filter.chosen('filter', select)
    }

    this.selectedSort = function(){
        let select = Storage.get('torrents_sort','Seeders')

        filter.chosen('sort', [sort_translate[select]])
    }

    this.build = function(){
        this.buildSorted()
        this.buildFilterd()

        this.filtred()

        filter.onSelect = (type, a, b)=>{
            if(type == 'sort'){
                Storage.set('torrents_sort',a.sort)

                filter.sort(results.Results, a.sort)

                this.sortWithPopular()
            }
            else{
                if(a.reset){
                    Storage.set('torrents_filter','{}')

                    this.buildFilterd()
                }
                else{
                    a.items.forEach(n=>n.checked = false)

                    let filter_data = Storage.get('torrents_filter','{}')

                    filter_data[a.stype] = filter_multiple.indexOf(a.stype) >= 0 ? [] : b.index

                    a.subtitle = b.title

                    Storage.set('torrents_filter',filter_data)
                }
            }

            this.applyFilter()

            this.start()
        }

        filter.onCheck = (type, a, b)=>{
            let data = Storage.get('torrents_filter','{}'),
                need = Arrays.toArray(data[a.stype])

            if(b.checked && need.indexOf(b.title)) need.push(b.title)
            else if(!b.checked) Arrays.remove(need, b.title)

            data[a.stype] = need

            Storage.set('torrents_filter',data)

            a.subtitle = need.length ? need.join(', ') : a.items[0].title

            this.applyFilter()
        }

        if(results.Results.length) this.showResults()
        else{
            this.empty(Lang.translate('torrent_parser_empty'))
        }
    }

    this.applyFilter = function(){
        this.filtred()

        this.selectedFilter()

        this.selectedSort()

        this.reset()

        this.showResults()

        last = scroll.render().find('.torrent-item:eq(0)')[0]

        if(last) scroll.update(last)
        else scroll.reset()
    }

    this.filtred = function(){
        let filter_data = Storage.get('torrents_filter','{}')
        let filter_any  = false

        for(let i in filter_data){
            let filr = filter_data[i]

            if(filr){
                if(Arrays.isArray(filr)){
                    if(filr.length) filter_any = true
                } 
                else filter_any = true
            }
        }

        filtred  = results.Results.filter((element)=>{
            if(filter_any){
                let passed  = false,
                    nopass  = false,
                    title   = element.Title.toLowerCase(),
                    tracker = element.Tracker;

                let qua = Arrays.toArray(filter_data.quality),
                    hdr = filter_data.hdr,
                    dv  = filter_data.dv,
                    sub = filter_data.sub,
                    voi = Arrays.toArray(filter_data.voice),
                    tra = Arrays.toArray(filter_data.tracker),
                    ses = Arrays.toArray(filter_data.season),
                    yer = filter_data.year

                let test = function(search, test_index){
                    let regex = new RegExp(search)
                    
                    return test_index ? title.indexOf(search) >= 0 : regex.test(title)
                }

                let check = function(search, invert){
                    if(test(search)){
                        if(invert) nopass = true
                        else passed = true
                    } 
                    else{
                        if(invert) passed = true
                        else nopass = true
                    } 
                }

                let includes = function(type, arr){
                    if(!arr.length) return

                    let any = false

                    arr.forEach(a=>{
                        if(type == 'quality'){
                            if(a == '4k' && test('(4k|uhd)[ |\\]|,|$]|2160[pр]|ultrahd')) any = true
                            if(a == '1080p' && test('fullhd|1080[pр]')) any = true
                            if(a == '720p' && test('720[pр]')) any = true
                        }
                        if(type == 'voice'){
                            let p = filter_items.voice.indexOf(a)

                            if(p == 1){
                                if(test('дублирован|дубляж|  apple| dub| d[,| |$]|[,|\\s]дб[,|\\s|$]')) any = true
                            }
                            else if(p == 2){
                                if(test('многоголос| p[,| |$]|[,|\\s](лм|пм)[,|\\s|$]')) any = true
                            }
                            else if(p == 3){
                                if(test('двухголос|двуголос| l2[,| |$]|[,|\\s](лд|пд)[,|\\s|$]')) any = true
                            }
                            else if(p == 4){
                                if(test('любитель|авторский| l1[,| |$]|[,|\\s](ло|ап)[,|\\s|$]')) any = true
                            }
                            else if(test(a.toLowerCase(),true)) any = true
                        }
                        if(type == 'tracker'){
                            if(tracker.split(',').find(t=>t.trim().toLowerCase() == a.toLowerCase())) any = true
                        }

                        if (type == 'season') {
                            let i = finded_seasons.indexOf(a)
                            let f = finded_seasons_full[i]

                            var SES1 = title.match(/\[s(\d+)-(\d+)\]/)
                            var SES2 = title.match(/season (\d+)-(\d+)/)
                            var SES3 = title.match(/season (\d+) - (\d+).?/)
                            var SES4 = title.match(/сезон: (\d+)-(\d+) \/.?/)

                            function pad(n) {
                                return (n < 10 && n != '01') ? '0' + n : n
                            }

                            if(Array.isArray(SES1) && (f >= SES1[1] && f <= SES1[2] || pad(f) >= SES1[1] && pad(f) <= SES1[2] || f >= pad(SES1[1]) && f <= pad(SES1[2]))) any = true
                            if(Array.isArray(SES2) && (f >= SES2[1] && f <= SES2[2] || pad(f) >= SES2[1] && pad(f) <= SES2[2] || f >= pad(SES2[1]) && f <= pad(SES2[2]))) any = true
                            if(Array.isArray(SES3) && (f >= SES3[1] && f <= SES3[2] || pad(f) >= SES3[1] && pad(f) <= SES3[2] || f >= pad(SES3[1]) && f <= pad(SES3[2]))) any = true
                            if(Array.isArray(SES4) && (f >= SES4[1] && f <= SES4[2] || pad(f) >= SES4[1] && pad(f) <= SES4[2] || f >= pad(SES4[1]) && f <= pad(SES4[2]))) any = true

                            if (test('.?\\[0' + f + 'x0.?|.?\\[s' + f + '-.?|.?-' + f + '\\].?|.?\\[s0' + f + '\\].?|.?\\[s' + f + '\\].?|.?s' + f + 'e.?|.?s' + f + '-.?|.?сезон: ' + f + ' .?|.?сезон:' + f + '.?|сезон ' +f+ ',.?|\\[' +f+ ' сезон.?|.?\\(' +f+ ' сезон.?|.?season ' +f+'.?')) any = true
                        }
                    })

                    if(any) passed = true
                    else nopass = true
                }

                includes('quality', qua)
                includes('voice', voi)
                includes('tracker', tra)
                includes('season', ses)

                if(hdr) check('[\\[| ]hdr[10| |\\]|,|$]',hdr !== 1)

                if(dv) check('dolby vision',dv !== 1)

                if(sub) check(' sub|[,|\\s]ст[,|\\s|$]', sub !== 1)

                if(yer){
                    check(filter_items.year[yer])
                }

                return nopass ? false : passed
            }
            else return true
        })
    }

    this.showResults = function(){
        total_pages = Math.ceil(filtred.length / 20)

        if(filtred.length){
            this.append(filtred.slice(0,20))
        }
        else{
           this.listEmpty()
        }

        files.appendFiles(scroll.render())
    }

    this.reset = function(){
        last = false

        scroll.clear()
    }

    this.next = function(){
        if(object.page < 15 && object.page < total_pages){
            object.page++

            let offset = (object.page - 1) * 20

            this.append(filtred.slice(offset,offset + 20), true)
        }
    }

    this.loadMagnet = function(element, call){
        Parser.marnet(element,()=>{
            Modal.close()

            element.poster = object.movie.img

            this.start()

            if(call) call()
            else Torrent.start(element, object.movie)
        },(text)=>{
            Modal.update(Template.get('error',{title: Lang.translate('title_error'), text: text}))
        })

        Modal.open({
            title: '',
            html: Template.get('modal_pending',{text: Lang.translate('torrent_get_magnet')}),
            onBack: ()=>{
                Modal.close()

                network.clear()

                Controller.toggle('content')
            }
        })
    }

    this.mark = function(element, item, add){
        if(add){
            if(viewed.indexOf(element.hash) == -1){
                viewed.push(element.hash)

                item.append('<div class="torrent-item__viewed">'+Template.get('icon_viewed',{},true)+'</div>')
            }
        }
        else{
            element.viewed = true

            Arrays.remove(viewed, element.hash)

            item.find('.torrent-item__viewed').remove()
        }

        element.viewed = add

        Storage.set('torrents_view', viewed)

        if(!add) Storage.remove('torrents_view',element.hash)
    }

    this.addToBase = function(element){
        Torserver.add({
            poster: object.movie.img,
            title: object.movie.title + ' / ' + object.movie.original_title,
            link: element.MagnetUri || element.Link,
            data:{
                lampa: true,
                movie: object.movie
            }
        },()=>{
            Noty.show(object.movie.title + ' - ' + Lang.translate('torrent_parser_added_to_mytorrents'))
        })
    }

    this.append = function(items, append){
        items.forEach(element => {
            count++

            let date = Utils.parseTime(element.PublishDate)
            let bitrate = object.movie.runtime ? Utils.calcBitrate(element.Size, object.movie.runtime) : 0

            Arrays.extend(element,{
                title: element.Title,
                date: date.full,
                tracker: element.Tracker,
                bitrate: bitrate,
                size: !isNaN(parseInt(element.Size)) ? Utils.bytesToSize(element.Size) : element.size,
                seeds: element.Seeders,
                grabs: element.Peers
            })

            let item = Template.get('torrent',element)

            if (!bitrate) item.find('.bitrate').remove()

            if(element.viewed) item.append('<div class="torrent-item__viewed">'+Template.get('icon_viewed',{},true)+'</div>')

            if(!element.size || parseInt(element.size) == 0) item.find('.torrent-item__size').remove()

            item.on('hover:focus',(e)=>{
                last = e.target

                scroll.update($(e.target),true)

                Helper.show('torrents',Lang.translate('helper_torrents'),item)
            }).on('hover:hover hover:touch',(e)=>{
                last = e.target

                Navigator.focused(last)
            }).on('hover:enter',(e)=>{
                last = e.target
                
                Torrent.opened(()=>{
                    this.mark(element, item, true)
                })

                if(element.reguest && !element.MagnetUri){
                    this.loadMagnet(element)
                }
                else{
                    element.poster = object.movie.img

                    this.start()

                    Torrent.start(element, object.movie)
                }

                Lampa.Listener.send('torrent',{type:'onenter',element,item})
            }).on('hover:long',()=>{
                let enabled = Controller.enabled().name
                let menu = [
                    {
                        title: Lang.translate('torrent_parser_add_to_mytorrents'),
                        tomy: true
                    },
                    {
                        title: Lang.translate('torrent_parser_label_title'),
                        subtitle: Lang.translate('torrent_parser_label_descr'),
                        mark: true
                    },
                    {
                        title: Lang.translate('torrent_parser_label_cancel_title'),
                        subtitle: Lang.translate('torrent_parser_label_cancel_descr'),
                        unmark: true
                    }
                ]

                Lampa.Listener.send('torrent',{type:'onlong',element,item,menu})

                Select.show({
                    title: Lang.translate('title_action'),
                    items: menu,
                    onBack: ()=>{
                        Controller.toggle(enabled)
                    },
                    onSelect: (a)=>{
                        if(a.tomy){
                            if(element.reguest && !element.MagnetUri){
                                this.loadMagnet(element, ()=>{
                                    this.addToBase(element)
                                })
                            }
                            else this.addToBase(element)
                        }
                        else if(a.mark){
                            this.mark(element, item, true)
                        }
                        else if(a.unmark){
                            this.mark(element, item, false)
                        }
    
                        Controller.toggle(enabled)
                    }
                })
            })

            Lampa.Listener.send('torrent',{type:'render',element,item})

            scroll.append(item)

            if(append) Controller.collectionAppend(item)
        })
    }


    this.back = function(){
        Activity.backward()
    }

    this.start = function(){
        if(Lampa.Activity.active().activity !== this.activity) return

        if(!initialized){
            initialized = true

            this.initialize()
        }
        
        Background.immediately(Utils.cardImgBackgroundBlur(object.movie))

        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render(),files.render(true))
                Controller.collectionFocus(last || false,scroll.render(true))
            },
            update: ()=>{},
            up: ()=>{
                if(Navigator.canmove('up')){
                    Navigator.move('up')
                }
                else Controller.toggle('head')
            },
            down: ()=>{
                Navigator.move('down')
            },
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')
                else filter.render().find('.filter--filter').trigger('hover:enter')
            },
            left: ()=>{
                let poster = files.render().find('.explorer-card__head-img')

                if(poster.hasClass('focus')) Controller.toggle('menu')
                else if(Navigator.canmove('left')) Navigator.move('left')
                else Navigator.focus(poster[0])
            },
            back: this.back
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return files.render()
    }

    this.destroy = function(){
        network.clear()
        Parser.clear()

        files.destroy()

        scroll.destroy()

        results = null
        network = null
    }
}

export default component