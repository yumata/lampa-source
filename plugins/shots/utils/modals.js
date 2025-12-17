import Api from "./api.js"

function shotsReport(id, callback) {
    Lampa.Modal.open({
        html: Lampa.Template.get('shots_modal_report'),
        size: 'small',
        scroll: {
            nopadding: true
        },
        buttons: [
            {
                name: Lampa.Lang.translate('shots_button_report'),
                onSelect: ()=>{
                    Lampa.Modal.close()

                    callback && callback()

                    let reports = Lampa.Storage.get('shots_reports', '[]')

                    if(reports.indexOf(id) == -1){
                        Api.shotsReport(id, ()=>{
                            reports.push(id)

                            Lampa.Storage.set('shots_reports', reports)

                            Lampa.Bell.push({
                                icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                                text: Lampa.Lang.translate('shots_modal_report_bell')
                            })
                        })
                    }
                    else{
                        Lampa.Bell.push({
                            icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                            text: Lampa.Lang.translate('shots_modal_report_bell_alreadyed')
                        })
                    }
                }
            }
        ],
        onBack: ()=>{
            Lampa.Modal.close()

            callback && callback()
        }
    })
}

function shotsDelete(id, callback) {
    Lampa.Modal.open({
        html: Lampa.Template.get('shots_modal_delete'),
        size: 'small',
        scroll: {
            nopadding: true
        },
        buttons: [
            {
                name: Lampa.Lang.translate('shots_button_delete_video'),
                onSelect: ()=>{
                    Lampa.Modal.close()

                    callback && callback()

                    let deleted = Lampa.Storage.get('shots_deleted', '[]')

                    if(deleted.indexOf(id) == -1){
                        Api.shotsDelete(id, ()=>{
                            deleted.push(id)

                            Lampa.Storage.set('shots_deleted', deleted)

                            Lampa.Bell.push({
                                icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                                text: Lampa.Lang.translate('shots_modal_deleted_bell')
                            })
                        })
                    }
                    else{
                        Lampa.Bell.push({
                            icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                            text: Lampa.Lang.translate('shots_modal_deleted_bell')
                        })
                    }
                }
            }
        ],
        onBack: ()=>{
            Lampa.Modal.close()

            callback && callback()
        }
    })
}

export default {
    shotsReport,
    shotsDelete
}