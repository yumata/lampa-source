import vttFormatter from './format/vtt'
import lrcFormatter from './format/lrc'
import smiFormatter from './format/smi'
import ssaFormatter from './format/ssa'
import assFormatter from './format/ass'
import subFormatter from './format/sub'
import srtFormatter from './format/srt'
import sbvFormatter from './format/sbv'
import jsonFormatter from './format/json'

const supportedFormats = {
  vtt : vttFormatter,
  lrc : lrcFormatter,
  smi : smiFormatter,
  ssa : ssaFormatter,
  ass : assFormatter,
  sub : subFormatter,
  srt : srtFormatter,
  sbv : sbvFormatter,
  json : jsonFormatter
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/******************************************************************************************
 * Gets a list of supported subtitle supportedFormats.
 ******************************************************************************************/
function list() {
  return Object.keys(supportedFormats);
}

/******************************************************************************************
 * Detects a subtitle supportedFormats from the content.
 ******************************************************************************************/
function detect(content) {
  const formats = Object.keys(supportedFormats)
  for (let i = 0; i < formats.length; i++) {
    const formatName = formats[i];
    const handler = supportedFormats[formatName];
    if (handler === undefined) {
      continue;
    }
    if (typeof handler.detect != "function") {
      continue;
    }
    //Function 'detect' can return true or supportedFormats name
    const d = handler.detect(content);
    if (d === true) { //Logical true
      return formatName;
    }
    if (formatName === d) { //Format name
      return d;
    }
  }
}

/******************************************************************************************
 * Parses a subtitle content.
 ******************************************************************************************/
function parse(content, options) {
  options = options || { };
  var format = options.format || detect(content);
  if (!format || format.trim().length == 0) {
    throw new Error("Cannot determine subtitle supportedFormats!");
  }
  
  var handler = supportedFormats[format];
  if (handler === undefined) {
    throw new Error("Unsupported subtitle supportedFormats: " + format);
  }

  const func = handler.parse;
  if (typeof func != "function") {
    throw new Error("Subtitle supportedFormats does not support 'parse' op: " + format);
  }
  
  return func(content, options);
}

/******************************************************************************************
 * Builds a subtitle content
 ******************************************************************************************/
function build(captions, options) {
  options = options || { };
  var format = options.format || "srt";
  if (!format || format.trim().length == 0) {
    throw new Error("Cannot determine subtitle supportedFormats!");
  }
  
  var handler = supportedFormats[format];
  if (typeof handler == "undefined") {
    throw new Error("Unsupported subtitle supportedFormats: " + format);
  }

  const func = handler.build;
  if (typeof func != "function") {
    throw new Error("Subtitle supportedFormats does not support 'build' op: " + format);
  }
  
  return func(captions, options);
}

/******************************************************************************************
 * Converts subtitle supportedFormats
 ******************************************************************************************/
function convert(content, options) {
  if (typeof options == "string") {
    options = { to: options };
  }
  options = options || { };
  
  var opt = clone(options);
  delete opt.format;
  
  if (opt.from) {
    opt.format = opt.from;
  }
  
  var captions = parse(content, opt);
  if (opt.resync) {
    captions = resync(captions, opt.resync);
  }
  
  opt.format = opt.to || options.format;
  return build(captions, opt);
}

/******************************************************************************************
 * Shifts the time of the captions.
 ******************************************************************************************/
function resync(captions, options) {
  options = options || { };
  
  var func, ratio, frame, offset;
  if (typeof options == "function") {
    func = options; //User's function to handle time shift
  }
  else if (typeof options == "number") {
    offset = options; //Time shift (+/- offset)
    func = function(a) {
      return [ a[0] + offset, a[1] + offset ];
    };
  }
  else if (typeof options == "object") {
    offset = (options.offset || 0) * (options.frame ? options.fps || 25 : 1);
    ratio = options.ratio || 1.0;
    frame = options.frame;
    func = function(a) {
      return [ Math.round(a[0] * ratio + offset), Math.round(a[1] * ratio + offset) ];
    };
  }
  else {
    throw new Error("Argument 'options' not defined!");
  }
  
  var resynced = [ ];
  for (var i = 0; i < captions.length; i++) {
    var caption = clone(captions[i]);
    if (typeof caption.type === "undefined" || caption.type == "caption") {
      if (frame) {
        var shift = func([ caption.frame.start, caption.frame.end ]);
        if (shift && shift.length == 2) {
          caption.frame.start = shift[0];
          caption.frame.end = shift[1];
          caption.frame.count = caption.frame.end - caption.frame.start;
        }
      }
      else {
        var shift = func([ caption.start, caption.end ]);
        if (shift && shift.length == 2) {
          caption.start = shift[0];
          caption.end = shift[1];
          caption.duration = caption.end - caption.start;
        }
      }
    }
    resynced.push(caption);
  }
  
  return resynced;
}

export default {
    list,
    detect,
    parse,
    build,
    convert,
    resync
}
