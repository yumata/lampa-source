let tags = [
    {
        id: 1,
        slug: 'action'
    },
    {
        id: 2,
        slug: 'comedy'
    },
    {
        id: 3,
        slug: 'drama'
    },
    {
        id: 4,
        slug: 'fantasy'
    },
    {
        id: 5,
        slug: 'horror'
    },
    {
        id: 6,
        slug: 'thriller'
    },
    {
        id: 7,
        slug: 'anime'
    },
    {
        id: 8,
        slug: 'sci_fi'
    }
]

function load(){
    tags = translate(tags)
}

function translate(list){
    return list.map(t=>{
        t.title = Lampa.Lang.translate('shots_tag_'+t.slug)

        return t
    })
}

function list(){
    return tags
}

export default {
    load,
    list,
    translate
}