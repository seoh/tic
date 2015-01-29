#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
import { Tistory } from '../lib/tistory'

///
/// #TODO: refactor callbacks to Promise
/// #TODO: Accept more command options
///     1. View lastest history of url (for instance, via tail ~/.thistory)
///     2. Copy img tags to clipboard
///     3. or result will be printed as img tag.
///     4. --verbose option (to show failed event.)
if( process.argv.length > 2 ){
  console.log([
"╔╦╗┬┌─┐┌┬┐┌─┐┬─┐┬  ┬  ╦┌┬┐┌─┐┌─┐┌─┐",
"  ║  │└─┐  │  │  │├┬┘└┬┘  ║│││├─┤│  ┬├┤ ",
"  ╩  ┴└─┘  ┴  └─┘┴└─  ┴    ╩┴  ┴┴  ┴└─┘└─┘",
"          ┬┌┐┌  ╔═╗╦    ╦",
"          ││││  ║    ║    ║",
"          ┴┘└┘  ╚═╝╩═╝╩"
  ].join('\n'));
  let files = process.argv.slice(2);
  const t = new Tistory();

  let tokenPath = path.join(process.env.HOME, '.tistory');
  if(!fs.existsSync(tokenPath)){
    fs.createWriteStream(tokenPath).close();
  }
  let tokens = fs.readFileSync(tokenPath).toString();

  if(tokens.length > 0) {
    let {token, id} = JSON.parse(tokens);
    t.token = token;
    t.id = id;

    upload(t, files);
  } else {
    t.once('login', (token) => {
      t.token = token;
      t.blog.info((data)=>{

        let url = data.item.filter((item)=>item["default"] == "Y")[0].url;
        url = url.replace(/^http:\/\//, "").replace(/\.tistory\.com$/, "");

        fs.writeFileSync(tokenPath, JSON.stringify({
          token: token, id: url
        }));
        t.id = url;
        upload(t, files);
      });
    });
    t.requestAccessToken();
  }
}

///
/// #TODO: Convert simple log(console.log) to seamless feedback. (for example, \|/-)
function upload(t, files) {
  if(!Array.isArray(files)) {
    if(files) files = [files];
    else      return; // do nothing if not passed
  }
  t.once('uploaded', (array) => array.filter((a)=>a).map((r)=>console.log(r.url)));
  t.on('upload', (index, size, ret)=> {
    if(ret && ret.status === '200')
      console.log("Complete to upload", `[${index+1}/${size}]`, ret.url);
    else
      console.log("Failed to upload", ret && ret.status);

    if(index < size-1){
      console.log("Start to upload", `[${index+1}/${size}]`);
    }
  });
  console.log("Start to upload", `[0/${files.length}]`);
  t.post.attach(files);
}