import parse from '../src/components/torrents/parser'

import {expect, suite, test} from 'vitest'

function testTitle(title, season, episodes) {
    test(title, () => {
        const result = parse.general(title)
        expect(result.season, "Season").toBe(season);
        expect(result.episodes, "Episodes").toBe(episodes);
    })
}

suite('Title tests', () => {
    testTitle('Извне / From [4 сезон: 1-4 серия из 10] (2026) WEB-DL 1080p', 4, '1-4')
    testTitle('Извне / From [04x01-07 из 10] (2026) WEBRip от Kerob | L', 4, '1-7')
    testTitle('Извне / From [S01-02] (2022-2023) WEB-DLRip | LostFilm', '1-2', null)

    testTitle('Меч и жезл Вистории (ТВ-1) / Tsue to Tsurugi no Wistoria / Wistoria: Wand and Sword (Есихара Тацуя) [TV] [12 из 12] [JAP+Sub] [2024, приключения, сенэн, фэнтези, экшен, WEB-DL] [1080p]', 1, '1-12')
    testTitle('Tsue to Tsurugi no Wistoria / Меч и жезл Вистории (12 из 12) Complete [1080p]', 1, '1-12')
    testTitle('Меч и жезл Вистории (ТВ-1) / Tsue to Tsurugi no Wistoria / Wistoria: Wand and Sword [TV] [12 из 12] [RUS(int), ENG, JAP+Sub] [2024, Сенэн, Экшен, Фэнтези, BDRip] [1080p]', 1, '1-12')

    testTitle('Рік та Морті (Сезон 1-7) / Rick and Morty (Season 1-7) (2013-2023) BDRip-AVC/WEBRip-AVC 5xUkr/Eng | Sub Ukr/Eng', '1-7', null)
    testTitle('Рик и Морти / Rick and Morty / Сезон: 1, 2 / Серии: 1-21 из 21 (Пит Мишелс, Брайан Ньютон, Джон Райс) [2013-2015, США, комедия, фантастика, BDRip 720p] VO (Сыендук) + Original + Sub (Rus, Eng)', 1, '1-21')

    testTitle('Рик и Морти (6 сезон: 1-10 серии из 10) / Rick and Morty / 2022 / ПО (Сыендук) / WEB-DL (1080p) | Сыендук', 6, '1-10')

    testTitle('Рик и Морти / Rick and Morty / Сезон: 5 / Серии: 1-10 из 10 (Уэсли Арчер) [2021, США, мультфильм, комедия, фантастика, приключения, WEB-DL 1080p] MVO (TVShows) + Original + Sub (Rus, Eng)', 5, '1-10')

    testTitle('Рик и Морти / Rick and Morty (2019) WEBRip [H.264/720p-LQ] (сезон 4, серии 10 из 10) Сыендук [Обновляемая]', 4, '1-10')

    testTitle('Добро пожаловать в класс превосходства (ТВ-2) / Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e 2nd Season (Киси Сэйдзи) [13 из 13] [RUS(ext), JAP+Sub] [2022, драма, повседневность, WEBRip] [1080p]', 2, '1-13')

    testTitle('Паук-Нуар / Spider-Noir (2026) WEB-DL [H.265/2160p] [4K, HDR10, DV 8.1, 10-bit] (сезон 1, серии 1-8 из 8) HDrezka, Dragon Money [Noir version]', 1, '1-8')

    testTitle('Павук-Нуар Кольорова (Сезон 1, Серія 4 з 8) / Spider-Noir (Season 1) (2026) WEB-DL 1080p 3xUkr/Eng | Sub Ukr/Eng', 1, '1-4')

    testTitle('Игра престолов 1-8 сезон (1-73 из 73) / Game of Thrones (2011-2019) BDRemux 2160p | HEVC | HDR, 10-bit @ Amedia', '1-8', '1-73')

    testTitle('Игра престолов (1-8 сезоны: 1-73 серии из 73) / Game of Thrones / 2011-2019 / ПМ (LostFilm) / BDRip | LostFilm', '1-8', '1-73')

    testTitle('Игра Престолов / Game Of Thrones [1-8 сезон] (2011-2019) UHD BDRemux 2160p | 4K | HDR | D', '1-8', null)

    testTitle('Yomi no Tsugai | Daemons of the Shadow Realm | Цугаи загробного мира [2026, TV, 9 из 24] WEBRip', 1, '1-9')

    testTitle('Теория большого взрыва / The Big Bang Theory [S03] (2009-2010) BDRip-AVC от HQCLUB', 3, null)

    testTitle('Теория большого взрыва / The Big Bang Theory [S07] (2013) HDTVRip | Кураж-Бамбей', 7, null)

})