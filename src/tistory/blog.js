require('6to5/polyfill');
const https = require('https');

export class Blog {
  constructor(t) {
    this.tistory = t;
  }

  // #TODO: change get to post.
  info(callback) {
    const kUrl = `https://www.tistory.com/apis/blog/info?output=json&access_token=${this.tistory.token}`
    https.get(kUrl, (res)=>{
      res.on('data', (chunk)=> 
        callback && callback(JSON.parse(chunk.toString()).tistory));
    });
  }
}