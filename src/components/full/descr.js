import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Utils from '../../utils/math'
import Activity from '../../interaction/activity'
import Modal from '../../interaction/modal'
import Api from '../../interaction/api'
import Arrays from '../../utils/arrays'
import Lang from '../../utils/lang'

function create(data, params = {}){
    let html,body,last
    
    this.create = function(){
        html = Template.get('items_line',{title: Lang.translate('full_detail')})

        let genres = data.movie.genres.map(a => {
            return '<div class="full-descr__tag selector" data-genre="'+a.id+'" data-url="'+a.url+'">'+Utils.capitalizeFirstLetter(a.name)+'</div>'
        }).join('')

        let companies = data.movie.production_companies.map(a => {
            return '<div class="full-descr__tag selector" data-company="'+a.id+'">'+Utils.capitalizeFirstLetter(a.name)+'</div>'
        }).join('')
        
        let isoCountries = {
            'AD' : Lang.translate('country_ad'),
            'AE' : Lang.translate('country_ae'),
            'AF' : Lang.translate('country_af'),
            //'AG' : 'Antigua And Barbuda',
            //'AI' : 'Anguilla',
            'AL' : Lang.translate('country_al'),
            'AM' : Lang.translate('country_am'),
            //'AN' : 'Netherlands Antilles',
            'AO' : Lang.translate('country_ao'),
            //'AQ' : 'Antarctica',
            'AR' : Lang.translate('country_ar'),
            //'AS' : 'American Samoa',
            'AT' : Lang.translate('country_at'),
            'AU' : Lang.translate('country_au'),
            'AW' : Lang.translate('country_aw'),
            'AZ' : Lang.translate('country_az'),
            'BA' : Lang.translate('country_ba'),
            //'BB' : 'Barbados',
            'BD' : Lang.translate('country_bd'),
            'BE' : Lang.translate('country_be'),
            //'BF' : 'Burkina Faso',
            'BG' : Lang.translate('country_bg'),
            'BH' : Lang.translate('country_bh'),
            'BI' : Lang.translate('country_bi'),
            'BJ' : Lang.translate('country_bj'),
            //'BL' : 'Saint Barthelemy',
            //'BM' : 'Bermuda',
            //'BN' : 'Brunei Darussalam',
            'BO' : Lang.translate('country_bo'),
            'BR' : Lang.translate('country_br'),
            'BS' : Lang.translate('country_bs'),
            'BT' : Lang.translate('country_bt'),
            //'BV' : 'Bouvet Island',
            'BW' : Lang.translate('country_bw'),
            'BY' : Lang.translate('country_by'),
            //'BZ' : 'Belize',
            'CA' : Lang.translate('country_ca'),
            //'CC' : 'Cocos (Keeling) Islands',
            //'CD' : 'Congo, Democratic Republic',
            //'CF' : 'Central African Republic',
            //'CG' : 'Congo',
            'CH' : Lang.translate('country_ch'),
            //'CI' : 'Cote D\'Ivoire',
            //'CK' : 'Cook Islands',
            'CL' : Lang.translate('country_cl'),
            'CM' : Lang.translate('country_cm'),
            'CN' : Lang.translate('country_cn'),
            'CO' : Lang.translate('country_co'),
            'CR' : Lang.translate('country_cr'),
            'CU' : Lang.translate('country_cu'),
            'CV' : Lang.translate('country_cv'),
            //'CX' : 'Christmas Island',
            'CY' : Lang.translate('country_cy'),
            'CZ' : Lang.translate('country_cz'),
            'DE' : Lang.translate('country_de'),
            'DJ' : 'Djibouti',
            'DK' : Lang.translate('country_dk'),
            //'DM' : 'Dominica',
            'DO' : Lang.translate('country_do'),
            'DZ' : Lang.translate('country_dz'),
            'EC' : Lang.translate('country_ec'),
            'EE' : Lang.translate('country_ee'),
            'EG' : Lang.translate('country_eg'),
            //'EH' : 'Western Sahara',
            //'ER' : 'Eritrea',
            'ES' : Lang.translate('country_es'),
            'ET' : 'Ethiopia',
            'FI' : Lang.translate('country_fi'),
            //'FJ' : 'Fiji',
            //'FK' : 'Falkland Islands (Malvinas)',
            //'FM' : 'Micronesia, Federated States Of',
            'FO' : Lang.translate('country_fo'),
            'FR' : Lang.translate('country_fr'),
            //'GA' : 'Gabon',
            'GB' : Lang.translate('country_gb'),
            //'GD' : 'Grenada',
            'GE' : Lang.translate('country_ge'),
            //'GF' : 'French Guiana',
            //'GG' : 'Guernsey',
            //'GH' : 'Ghana',
            //'GI' : 'Gibraltar',
            'GL' : Lang.translate('country_gl'),
            //'GM' : 'Gambia',
            //'GN' : 'Guinea',
            'GP' : Lang.translate('country_gp'),
            //'GQ' : 'Equatorial Guinea',
            'GR' : Lang.translate('country_gr'),
            //'GS' : 'South Georgia And Sandwich Isl.',
            //'GT' : 'Guatemala',
            //'GU' : 'Guam',
            //'GW' : 'Guinea-Bissau',
            //'GY' : 'Guyana',
            'HK' : Lang.translate('country_hk'),
            //'HM' : 'Heard Island & Mcdonald Islands',
            //'HN' : 'Honduras',
            'HR' : Lang.translate('country_hr'),
            'HT' : Lang.translate('country_ht'),
            'HU' : Lang.translate('country_hu'),
            'ID' : Lang.translate('country_id'),
            'IE' : Lang.translate('country_ie'),
            'IL' : Lang.translate('country_il'),
            //'IM' : 'Isle Of Man',
            'IN' : Lang.translate('country_in'),
            //'IO' : 'British Indian Ocean Territory',
            'IQ' : Lang.translate('country_iq'),
            'IR' : Lang.translate('country_ir'),
            'IS' : Lang.translate('country_is'),
            'IT' : Lang.translate('country_it'),
            //'JE' : 'Jersey',
            'JM' : Lang.translate('country_jm'),
            'JO' : Lang.translate('country_jo'),
            'JP' : Lang.translate('country_jp'),
            'KE' : Lang.translate('country_ke'),
            'KG' : Lang.translate('country_kg'),
            'KH' : Lang.translate('country_kh'),
            //'KI' : 'Kiribati',
            //'KM' : 'Comoros',
            //'KN' : 'Saint Kitts And Nevis',
            'KP' : Lang.translate('country_kp'),
            'KR' : Lang.translate('country_kr'),
            'KW' : Lang.translate('country_kw'),
            //'KY' : 'Cayman Islands',
            'KZ' : Lang.translate('country_kz'),
            //'LA' : 'Lao People\'s Democratic Republic',
            'LB' : Lang.translate('country_lb'),
            //'LC' : 'Saint Lucia',
            //'LI' : 'Liechtenstein',
            'LK' : Lang.translate('country_lk'),
            //'LR' : 'Liberia',
            //'LS' : 'Lesotho',
            'LT' : Lang.translate('country_lt'),
            'LU' : Lang.translate('country_lu'),
            'LV' : Lang.translate('country_lv'),
            'LY' : Lang.translate('country_ly'),
            'MA' : Lang.translate('country_ma'),
            'MC' : Lang.translate('country_mc'),
            'MD' : Lang.translate('country_md'),
            //'ME' : 'Montenegro',
            //'MF' : 'Saint Martin',
            //'MG' : 'Madagascar',
            //'MH' : 'Marshall Islands',
            'MK' : Lang.translate('country_mk'),
            //'ML' : 'Mali',
            'MM' : Lang.translate('country_mm'),
            'MN' : Lang.translate('country_mn'),
            'MO' : Lang.translate('country_mo'),
            //'MP' : 'Northern Mariana Islands',
            //'MQ' : 'Martinique',
            //'MR' : 'Mauritania',
            //'MS' : 'Montserrat',
            'MT' : Lang.translate('country_mt'),
            //'MU' : 'Mauritius',
            'MV' : Lang.translate('country_mv'),
            'MW' : Lang.translate('country_mw'),
            'MX' : Lang.translate('country_mx'),
            'MY' : Lang.translate('country_my'),
            'MZ' : Lang.translate('country_mz'),
            'NA' : Lang.translate('country_na'),
            //'NC' : 'New Caledonia',
            'NE' : Lang.translate('country_ne'),
            //'NF' : 'Norfolk Island',
            'NG' : Lang.translate('country_ng'),
            'NI' : Lang.translate('country_ni'),
            'NL' : Lang.translate('country_nl'),
            'NO' : Lang.translate('country_no'),
            'NP' : Lang.translate('country_np'),
            //'NR' : 'Nauru',
            //'NU' : 'Niue',
            'NZ' : Lang.translate('country_nz'),
            'OM' : Lang.translate('country_om'),
            'PA' : Lang.translate('country_pa'),
            'PE' : Lang.translate('country_pe'),
            //'PF' : 'French Polynesia',
            'PG' : Lang.translate('country_pg'),
            'PH' : Lang.translate('country_ph'),
            'PK' : Lang.translate('country_pk'),
            'PL' : Lang.translate('country_pl'),
            //'PM' : 'Saint Pierre And Miquelon',
            //'PN' : 'Pitcairn',
            'PR' : Lang.translate('country_pr'),
            //'PS' : 'Palestinian Territory, Occupied',
            'PT' : Lang.translate('country_pt'),
            //'PW' : 'Palau',
            'PY' : Lang.translate('country_py'),
            'QA' : Lang.translate('country_qa'),
            //'RE' : 'Reunion',
            'RO' : Lang.translate('country_ro'),
            'RS' : Lang.translate('country_rs'),
            'RU' : Lang.translate('country_ru'),
            'RW' : Lang.translate('country_rw'),
            'SA' : Lang.translate('country_sa'),
            //'SB' : 'Solomon Islands',
            //'SC' : 'Seychelles',
            'SD' : Lang.translate('country_sd'),
            'SE' : Lang.translate('country_se'),
            'SG' : Lang.translate('country_sg'),
            //'SH' : 'Saint Helena',
            'SI' : Lang.translate('country_si'),
            //'SJ' : 'Svalbard And Jan Mayen',
            'SK' : Lang.translate('country_sk'),
            //'SL' : 'Sierra Leone',
            //'SM' : 'San Marino',
            'SN' : Lang.translate('country_sn'),
            //'SO' : 'Somalia',
            //'SR' : 'Suriname',
            //'ST' : 'Sao Tome And Principe',
            'SU' : Lang.translate('country_su'),
            'SV' : Lang.translate('country_sv'),
            'SY' : Lang.translate('country_sy'),
            //'SZ' : 'Swaziland',
            //'TC' : 'Turks And Caicos Islands',
            //'TD' : 'Chad',
            //'TF' : 'French Southern Territories',
            //'TG' : 'Togo',
            'TH' : Lang.translate('country_th'),
            'TJ' : Lang.translate('country_tj'),
            //'TK' : 'Tokelau',
            //'TL' : 'Timor-Leste',
            'TM' : Lang.translate('country_tm'),
            'TN' : Lang.translate('country_tn'),
            //'TO' : 'Tonga',
            'TR' : Lang.translate('country_tr'),
            //'TT' : 'Trinidad And Tobago',
            //'TV' : 'Tuvalu',
            'TW' : Lang.translate('country_tw'),
            'TZ' : Lang.translate('country_tz'),
            'UA' : Lang.translate('country_ua'),
            'UG' : Lang.translate('country_ug'),
            //'UM' : 'United States Outlying Islands',
            'US' : Lang.translate('country_us'),
            'UY' : Lang.translate('country_uy'),
            'UZ' : Lang.translate('country_uz'),
            //'VA' : 'Holy See (Vatican City State)',
            //'VC' : 'Saint Vincent And Grenadines',
            'VE' : Lang.translate('country_ve'),
            //'VG' : 'Virgin Islands, British',
            //'VI' : 'Virgin Islands, U.S.',
            'VN' : Lang.translate('country_vn'),
            //'VU' : 'Vanuatu',
            //'WF' : 'Wallis And Futuna',
            'WS' : Lang.translate('country_ws'),
            'YE' : Lang.translate('country_ye'),
            //'YT' : 'Mayotte',
            'YU' : Lang.translate('country_yu'),
            'ZA' : Lang.translate('country_za'),
            'ZM' : Lang.translate('country_zm'),
            'ZW' : Lang.translate('country_zw')
        }

        let countries = data.movie.production_countries.map(a => {
            //let cc = 'country_' + a.iso_3166_1.toLowerCase()
            //return Lang.translate(cc) // FIXME! return a.name as fallback
            if (isoCountries.hasOwnProperty(a.iso_3166_1)) {
              return isoCountries[a.iso_3166_1]
            } else {
              return a.name
            }
        }).join(', ')

        body = Template.get('full_descr',{
            text: (data.movie.overview || Lang.translate('full_notext')) + '<br><br>',
            genres: genres,
            companies: companies,
            relise: (data.movie.release_date || data.movie.first_air_date),
            budget: '$ ' + Utils.numberWithSpaces(data.movie.budget || 0),
            countries: countries
        })

        if(!genres)    $('.full--genres', body).remove()
        if(!companies) $('.full--companies', body).remove()
        if(!data.movie.budget) $('.full--budget', body).remove()
        if(!countries) $('.full--countries', body).remove()

        body.find('.selector').on('hover:enter',(e)=>{
            let item = $(e.target)

            if(item.data('genre')){
                let tmdb = params.object.source == 'tmdb' || params.object.source == 'cub'

                Activity.push({
                    url: tmdb ? 'movie' : item.data('url'),
                    component: tmdb ? 'category' : 'category_full',
                    genres: item.data('genre'),
                    source: params.object.source,
                    page: 1
                })
            }
            if(item.data('company')){
                Api.clear()

                Modal.open({
                    title: Lang.translate('title_company'),
                    html: Template.get('modal_loading'),
                    size: 'medium',
                    onBack: ()=>{
                        Modal.close()
                        
                        Controller.toggle('full_descr')
                    }
                })

                Api.company({id: item.data('company')},(json)=>{
                    if(Controller.enabled().name == 'modal'){
                        Arrays.empty(json,{
                            homepage: '---',
                            origin_country: '---',
                            headquarters: '---'
                        })

                        Modal.update(Template.get('company',json))
                    }
                },()=>{

                })
            }
        }).on('hover:focus',(e)=>{
            last = e.target
        })

        html.find('.items-line__body').append(body)
    }

    this.toggle = function(){
        Controller.add('full_descr',{
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())
            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
                else this.onDown()
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else this.onUp()
            },
            gone: ()=>{

            },
            back: this.onBack
        })

        Controller.toggle('full_descr')
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        body.remove()
        html.remove()

        html = null
        body = null
    }
}

export default create