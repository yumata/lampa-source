let lgbt = [
    "bisexual man",
    "bisexuality",
    "black lgbt",
    "closeted homosexual",
    "drag queen",
    "female homosexuality",
    "gay  hardcore",
    "gay adoption",
    "gay artist",
    "gay bar",
    "gay club",
    "gay couple",
    "gay erotica",
    "gay for pay",
    "gay friend",
    "gay history",
    "gay interest",
    "gay kiss",
    "gay love",
    "gay love story",
    "gay man",
    "gay marriage",
    "gay men",
    "gay muslim",
    "gay parent",
    "gay pornography",
    "gay pride",
    "gay priest",
    "gay relationship",
    "gay rights",
    "gay romance",
    "gay sauna",
    "gay sex",
    "gay son",
    "gay teenager",
    "gay theme",
    "gay youth",
    "gender transition",
    "homoerotic",
    "homoeroticism",
    "homoerotism",
    "homofobia",
    "homophobia",
    "homophobic",
    "homophobic attack",
    "homosexual",
    "homosexual father",
    "homosexuality",
    "indigenous lgbt",
    "intersex",
    "intersexuality",
    "lesbian",
    "lesbian couple",
    "lesbian love",
    "lesbian maid",
    "lesbian nun",
    "lesbian relationship",
    "lesbian sex",
    "lgbt",
    "lgbt activist",
    "lgbt athlete",
    "lgbt history",
    "lgbt in africa",
    "lgbt in the military",
    "lgbt parenting",
    "lgbt rights",
    "lgbt teen",
    "male homosexuality",
    "queer",
    "queer cinema",
    "queer history",
    "queer loneliness",
    "queer love",
    "queer romance",
    "queer sexuality",
    "repressed gay",
    "teenage lesbian romance",
    "trans man",
    "trans woman",
    "transgender",
    "transgender rights",
    "transition",
    "transsexual",
    "transsexuality",
    "transvestism",
    "transvestite",
    "boys' love",
    "boys love"
]

/**
 * Ключевые слова для взрослых. Сравниваются с ключевыми словами TMDB по целым словам:
 * 'sex' — только слово sex (sex scene, teen sex), но не homosexuality / sexual abuse;
 * '*' в конце — начало слова: 'porn*' — porn, porno, pornography.
 */
let adult = [
    'porn*',
    'sex',
    'sexploitation',
    'xxx',
    'erotic*',
    'fetish*',
    'bdsm',
    'bondage',
    'sado*',
    'masochism',
    'voyeurism',
    'exhibitionism',
    'incest*',
    'softcore',
    'nude',
    'nudity',
    'nudism',
    'naked',
    'pink film',
]

let adult_regexp

function adultRegexp(){
    if(!adult_regexp){
        adult_regexp = new RegExp(adult.map(word=>{
            let prefix = word.charAt(word.length - 1) == '*'
            let clean  = (prefix ? word.slice(0, -1) : word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            return '\\b' + clean + (prefix ? '' : '\\b')
        }).join('|'))
    }

    return adult_regexp
}

/**
 * Ключевое слово TMDB относится к контенту для взрослых
 * @param {string} name - название ключевого слова
 * @returns {boolean}
 */
function adultKeyword(name){
    return typeof name == 'string' && adultRegexp().test(name.toLowerCase())
}

let filter = [
    'путин',
    'россия',
    'putin',
    'russia',
    'лукашенко',
    'lukashenko',
    'навальный',
    'navalny',
    '^буча',
    'мариуполь',
    'гомосекс',
	'homosex',
    'кремль'
]

export default {
    lgbt,
    adult,
    adultKeyword,
    filter
}