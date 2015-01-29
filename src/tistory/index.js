import { importer } from './importer'
import { Blog } from './blog'
import { Post } from './post'



/// private variables
/// Symbol is not yet supported in 6to5

///
/// * EventTable
/// 
/// login: (token="") =>
/// upload: (index, size, uploadedUrl="") =>
/// uploaded: ([uploadedUrl]) =>
var events = { 
  login:    {},
  upload:   {},
  uploaded: {}
}; 


///
/// Tistory Class
///
export class Tistory {
  constructor(options = {}) {
    var { clientId, secretKey, redirectedUrl } = options;
    this.clientId      = clientId      || '';
    this.secretKey     = secretKey     || '';
    this.redirectedUrl = redirectedUrl || '';

    // pragma mark - APIs
    this.blog = new Blog(this);
    this.post = new Post(this);
  };

  requestAccessToken() {
    importer({
      port: 2256 // just coded at 22:56 
    }, (err, ret="")=>{
      if(err) return
      this.emit('login', ret.trim());
    });
  };

  emit(name, ...params) {
    var ev = events[name];
    if( ev ){
      ev[this] = ev[this] || [];
      ev[this].forEach((h)=>h(...params));
    }
  };

  once(name, handler) {
    var self = this;
    var fn = (...params)=> {
      self.off(name, fn);
      handler(...params);
    }

    this.on(name, fn);
  };

  on(name, handler) {
    var ev = events[name];
    if( ev ){
      ev[this] = ev[this] || [];
      ev[this].push(handler);
    } else {
      /// warn: invalid event name
    }
    return this;
  };

  off(name, handler) {
    var ev = events[name];
    if( ev && handler && ev[this] ){
      ev[this] = ev[this].filter((h)=> h !== handler);
    } else if( ev && !handler ){
      ev[this] = [];
    } else {
      /// warn: invalid event name
    }
    return this;
  };
}