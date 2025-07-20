class Module{
    onCreate(){
        let release_year = ((this.data.release_date || this.data.birthday || '0000') + '').slice(0,4)

        if(release_year == '0000'){
            this.card.find('.card__age')?.remove()
        }
        else{
            this.card.find('.card__age')?.text(release_year)
        }
    }
}

export default Module