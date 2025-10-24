import Activity from '../../../interaction/activity/activity'
import Lang from '../../../core/lang'
import Storage from '../../../core/storage/storage'

export default {
    onCreate: function(){
        let status = Storage.field('parser_use')
        let button = this.html.find('.view--torrent')

        if(window.lampa_settings.torrents_use) button.toggleClass('selector', status).toggleClass('hide',!status)

        button.on('hover:enter',()=>{
            let year = ((this.card.first_air_date || this.card.release_date || '0000') + '').slice(0,4)
            let combinations = {
                'df': this.card.original_title,
                'df_year': this.card.original_title + ' ' + year,
                'df_lg': this.card.original_title + ' ' + this.card.title,
                'df_lg_year': this.card.original_title + ' ' + this.card.title + ' ' + year,

                'lg': this.card.title,
                'lg_year': this.card.title + ' ' + year,
                'lg_df': this.card.title + ' ' + this.card.original_title,
                'lg_df_year': this.card.title + ' ' + this.card.original_title + ' ' + year,
            }

            Activity.push({
                url: '',
                title: Lang.translate('title_torrents'),
                component: 'torrents',
                search: combinations[Storage.field('parse_lang')],
                search_one: this.card.title,
                search_two: this.card.original_title,
                movie: this.card,
                page: 1
            })
        })
    }
}