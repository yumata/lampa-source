var utils = {
	uid: function() {return UID},
	timestamp: unixtime,
	token: function() {return generateSigForString(Lampa.Storage.field('account_email').toLowerCase())},
	hash: Lampa.Utils.hash,
	hash36: function(s) {return (this.hash(s) * 1).toString(36)}
};

function generateSigForString(string) {
	var sigTime = unixtime();
	return sigTime.toString(36) + ':' + utils.hash36((string || '') + sigTime + utils.uid());
}

function strReplace(str, key2val) {
	for (let key in key2val) {
		str = str.replace(
			new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
			key2val[key]
		);
	}
	return str;
}

function tf(t, format, u, tz) {
	format = format || '';
	tz = parseInt(tz || '0');
	var thisOffset = 0;
	thisOffset += tz;
	if (!u) thisOffset += parseInt(Lampa.Storage.get('time_offset', 'n0').replace('n','')) * 60 - new Date().getTimezoneOffset();
	var d = new Date((t + thisOffset) * 6e4);
	var r = {yyyy:d.getUTCFullYear(),MM:('0'+(d.getUTCMonth()+1)).substr(-2),dd:('0'+d.getUTCDate()).substr(-2),HH:('0'+d.getUTCHours()).substr(-2),mm:('0'+d.getUTCMinutes()).substr(-2),ss:('0'+d.getUTCSeconds()).substr(-2),UTF:t*6e4};
	return strReplace(format, r);
}

function unixtime() {
	return Math.floor((new Date().getTime() + 0)/1000);
}


class Url{
    static prepareUrl(url, program){
        let m = [], val = '', r = {start:unixtime,offset:0};
        
        if (program) {
            let start = program.start / 1000
            let end   = program.stop / 1000
            let duration =  end - start
            
            
            r = {
                start: start,
                utc: start,
                end: end,
                utcend: end,
                offset: unixtime() - start,
                duration: duration,
                now: unixtime,
                lutc: unixtime,
                d: function(m){return strReplace(m[6]||'',{M:duration/60,S:end,h:Math.floor(duration/60/60),m:('0'+((duration/60) % 60)).substr(-2),s:'00'})},
                b: function(m){return tf(start, m[6], m[4], m[5])},
                e: function(m){return tf(end, m[6], m[4], m[5])},
                n: function(m){return tf(unixtime(), m[6], m[4], m[5])}
            };
        }
        while (!!(m = url.match(/\${(\((([a-zA-Z\d]+?)(u)?)([+-]\d+)?\))?([^${}]+)}/))) {
            if (!!m[2] && typeof r[m[2]] === "function") val = r[m[2]](m);
            else if (!!m[3] && typeof r[m[3]] === "function") val = r[m[3]](m);
            else if (m[6] in r) val = typeof r[m[6]] === "function" ? r[m[6]]() : r[m[6]];
            else if (!!m[2] && typeof utils[m[2]] === "function") val = utils[m[2]](m[6]);
            else if (m[6] in utils) val = typeof utils[m[6]] === "function" ? utils[m[6]]() : utils[m[6]];
            else val = m[1];
            url = url.replace(m[0], encodeURIComponent(val));
        }
        return url;
    }

    static catchupUrl(url, type, source){
        type = (type || '').toLowerCase();
        source = source || '';
        if (!type) {
            if (!!source) {
                if (source.search(/^https?:\/\//i) === 0) type = 'default';
                else if (source.search(/^[?&/][^/]/) === 0) type = 'append';
                else type = 'default';
            }
            else if (url.indexOf('${') < 0) type = 'shift';
            else type = 'default';
            console.log('IPTV', 'Autodetect catchup-type "' + type + '"');
        }
        var newUrl = '';
        switch (type) {
            case 'append':
                if (source) {
                    newUrl = (source.search(/^https?:\/\//i) === 0 ? '' : url) + source;
                    break; // так и задумано
                }
            case 'timeshift': // @deprecated
            case 'shift': // + append
                newUrl = (source || url);
                newUrl += (newUrl.indexOf('?') >= 0 ? '&' : '?') + 'utc=${start}&lutc=${timestamp}';
                return newUrl;
            case 'flussonic':
            case 'flussonic-hls':
            case 'flussonic-ts':
            case 'fs':
                // Example stream and catchup URLs
                // stream:  http://ch01.spr24.net/151/mpegts?token=my_token
                // catchup: http://ch01.spr24.net/151/timeshift_abs-{utc}.ts?token=my_token
                // stream:  http://list.tv:8888/325/index.m3u8?token=secret
                // catchup: http://list.tv:8888/325/timeshift_rel-{offset:1}.m3u8?token=secret
                // stream:  http://list.tv:8888/325/mono.m3u8?token=secret
                // catchup: http://list.tv:8888/325/mono-timeshift_rel-{offset:1}.m3u8?token=secret
                // stream:  http://list.tv:8888/325/live?token=my_token
                // catchup: http://list.tv:8888/325/{utc}.ts?token=my_token
                return url
                    .replace(/\/video\.(m3u8|ts)/, '/video-\${start}-\${duration}.$1')
                    .replace(/\/(index|playlist)\.(m3u8|ts)/, '/archive-\${start}-\${duration}.$2')
                    .replace(/\/mpegts/, '/timeshift_abs-\${start}.ts')
                ;
            case 'xc':
                // Example stream and catchup URLs
                // stream:  http://list.tv:8080/my@account.xc/my_password/1477
                // catchup: http://list.tv:8080/timeshift/my@account.xc/my_password/{duration}/{Y}-{m}-{d}:{H}-{M}/1477.ts
                // stream:  http://list.tv:8080/live/my@account.xc/my_password/1477.m3u8
                // catchup: http://list.tv:8080/timeshift/my@account.xc/my_password/{duration}/{Y}-{m}-{d}:{H}-{M}/1477.m3u8
                newUrl = url
                    .replace(
                        /^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)\.m3u8?$/,
                        '$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.m3u8'
                    )
                    .replace(
                        /^(https?:\/\/[^/]+)(\/live)?(\/[^/]+\/[^/]+\/)([^/.]+)(\.ts|)$/,
                        '$1/timeshift$3\${(d)M}/\${(b)yyyy-MM-dd:HH-mm}/$4.ts'
                    )
                ;
                break;
            case 'default':
                newUrl = source || url;
                break;
            case 'disabled':
                return false;
            default:
                console.log('IPTV', 'Err: no support catchup-type="' + type + '"');
                return false;
        }
        if (newUrl.indexOf('${') < 0) return this.catchupUrl(newUrl,'shift');
        return newUrl;
    }
}

export default Url