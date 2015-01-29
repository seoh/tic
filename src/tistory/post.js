const fs = require('fs');
const url = require("url");
const https = require('https');

/// private variables

// mapping extenstion to mime-type
// otherwise will be rejected.
const mime = (function(types) {
  var map = {};
  for(var type in types) {
    types[type].forEach(function(ext){
      map[ext] = type;
    });
  }
  return map;
})({
  'image/bmp':      ['bmp'],
  'image/gif':      ['gif'],
  'image/jpeg':     ['jpeg', 'jpg', 'jpe'],
  'image/png':      ['png'],
  'image/tiff':     ['tiff', 'tif'],
  'image/x-icon':   ['ico']   
});
const boundary = "WW91IGtub3cgbm90aGluZw=="; // you know nothing



export class Post {
  constructor(t) {
    this.tistory = t;
  };

  list() {

  };

  write() {

  };

  modify() {

  };

  read() {

  };

  attach(files, callback) {
    let t = this.tistory;
    const kUrl = `https://www.tistory.com/apis/post/attach?
                    output=json&access_token=${t.token}&targetUrl=${t.id}
                  `.replace(/[\s\n]/gm, '');

    let results = [];
    let cleanup = (r) => r && JSON.parse(r).tistory;
    let uploadHandler = () => 
      t.emit('upload', results.length-2, files.length, results[results.length-1]);

    files.reduce((sequence, file)=> {
      return sequence.then((result)=> {
        if(results.push(cleanup(result)) > 1)
          uploadHandler();

        var ext = file.substring(file.lastIndexOf('.')+1);
        var type = mime[ext.toLowerCase()];
        if( !type ) return Promise.resolve();
        if( !fs.existsSync(file) ) return Promise.resolve();
        const parsedUrl = url.parse(kUrl, true);
        parsedUrl.query.file = [file, type];
        return requestSync({
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname,
          port: 443,
          method: 'POST',
          headers: { 
            'Content-Type': `multipart/form-data; charset=utf-8; boundary=${boundary}` 
          }
        }, encode(parsedUrl.query));
      });
    }, Promise.resolve())
    .then(function(result){
      // emit last upload event
      results.push(cleanup(result));
      uploadHandler();

      // emit uploaded event
      t.emit('uploaded', results.slice(1));
    });
  }

  remove() {

  }
}

function requestSync(option, data) {
  return new Promise((resolve, reject)=> {
    let req = https.request(option, (res)=> {
      let body = [];
      res.on("data", (chunck)=> body.push(chunck.toString()));
      res.on("end", (p)=> resolve(body.join()));
    });

    // write body if need
    if(data)
      data.map((datum)=> req.write(datum));
    req.end();
  });
};

function encode(data) {
  function normal(name, value) {
    return new Buffer(
      `--${boundary}
      Content-Disposition: form-data; name="${name}"

      ${value}
      `.replace(/^[ ]+/mg, "").replace(/\n/g, "\r\n"), 'utf-8');
  }
  function file(name, type) {
    return [ // [Buffer(formdata), Binary, Buffer(newline)]
      new Buffer(
        `--${boundary}
        Content-Disposition: form-data; name="uploadedfile"; filename="file://${name}"
        Content-Type: ${type}

        `.replace(/^[ ]+/mg, "").replace(/\n/g, "\r\n"), 'utf-8'),
      fs.existsSync(name) && fs.readFileSync(name),
      new Buffer(`\r\n`, 'utf-8')
    ];
  }

  return Object.keys(data).filter((key) => key !== "file")
      .map((key) => normal(key, data[key]))
      .concat(file(data.file[0], data.file[1]))
      .concat([new Buffer(`\r\n--${boundary}--`, 'utf-8')]);
};