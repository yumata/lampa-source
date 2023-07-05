import parse from '../src/interaction/episodes_parser'

import {expect, suite, test} from 'vitest'

function parseTitle(title, singleMovie) {
    const movie = singleMovie ? {} : {number_of_seasons: 1}
    return parse.parse({
        movie: movie,
        files: [],
        filename: title,
        path:  title,
        is_file: true,
    })
}

function testTitle(title, season, episode) {
    test(title, () => {
        const result = parseTitle(title, episode === 0)
        expect(result.season, "Season").toBe(season);
        expect(result.episode, "Episode").toBe(episode);
    })
}

suite('Title tests', () => {
    testTitle('Anime Name - Studio.Name [WEBRip 1080p HEVC]/Anime_Name_[01]_[Studio.Name]_[WEBRip_1080p_HEVC].mkv', 1, 1)
    testTitle('Anime Name - Studio.Name [WEBRip 1080p HEVC]/Anime_Name_[05]_[Studio.Name]_[WEBRip_1080p_HEVC].mkv', 1, 5)
    testTitle('The.SerialName.2023.S03.1080p.NF.WEB-DL.DDP5.1.x264/The.SerialName.2023.S03.EP01.1080p.WEB-DL.DDP5.1.x264.mkv', 3, 1)
    testTitle('The.SerialName.2023.S05.1080p.NF.WEB-DL.DDP5.1.x264/The.SerialName.2023.S05.EP03.1080p.WEB-DL.DDP5.1.x264.mkv', 5, 3)
    testTitle('Movie.Name.2023.1080p.AMZN_от Studio.Name.mkv', 0, 0)
    testTitle('SerialName.S01.1080p.WEB-DL.DDP5.1.H.264/SerialName.S01E04.EpisodeName.1080p.WEB-DL.DDP5.1.H.264.mkv', 1, 4)
    testTitle('SerialName.2023.S02.WEB-DL.1080p.STUDIO.NAME/SerialName.2023.S02E05.WEB-DL.1080p.STUDIO.NAME.mkv', 2, 5)
    testTitle('Long Serial Name, Without Episodes - 01.mkv', 1, 1)
    testTitle('Long Serial Name, Without Episodes - 06.mkv', 1, 6)
    testTitle('Anime Name [TV-1] [2021] [AT-X] [1080p] [RUS + JAP]/Anime Name - 05 (AT-X 1920x1080 x265 AAC Rus + Jap).mkv', 1, 5)
    testTitle('Anime.Name.S03.1080p.Studio.Name/Anime.Name.S03E06.mp4', 3, 6)
    testTitle('Mashle/[SubsPlease] Mashle - 12 (1080p) [D6484514].mkv', 1, 12)
    testTitle('Mashle/[SubsPlease] Mashle - 11 (1080p) [E89F8C78].mkv', 1, 11)
    testTitle('One.Punch.Man.S01E01-12.MPEG4.2015.SATRip/One.Punch.Man.S01E03.MPEG4.2015.SATRip.mkv',1,3)
    testTitle('One Punch Man/[anti-raws]One Punch Man ep.12[BDRemux].mkv',1,12)
    testTitle('One Punch Man S2/[anti-raws]One Punch Man S2 ep.12[BDRemux].mkv',2,12)
})