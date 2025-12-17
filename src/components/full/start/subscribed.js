export default {
    onCreate: function(){
        if(!(this.card.source == 'tmdb' || this.card.source == 'cub')) this.html.find('.source--name').text(this.card.source.toUpperCase())
        else if(this.card.number_of_seasons && window.lampa_settings.account_use && !window.lampa_settings.disable_features.subscribe){
            this.html.find('.button--subscribe').removeClass('hide')

            this.emit('subscribed')
        }
    },
    onSubscribed: function(){
        this.event.call('subscribed',{
            card_id: this.card.id
        },(result)=>{
            if(result.result){
                this.html.find('.button--subscribe').data('voice', result.result).addClass('active').find('path').attr('fill', 'currentColor')
            }
        })
    }
}