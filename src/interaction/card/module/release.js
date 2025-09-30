export default {
    onCreate: function(){
        let release_year = ((this.data.release_date || this.data.birthday || '0000') + '').slice(0,4)

        if(release_year == '0000'){
            this.html.find('.card__age')?.remove()
        }
        else{
            this.html.find('.card__age')?.text(release_year)
        }
    }
}