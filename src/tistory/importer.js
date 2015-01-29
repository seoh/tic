const https = require('https');
import { Server } from 'http'
import { execFile as exec } from 'child_process'

var keys = require('../../keys.json');
const kTistoryAccessTokenRequestUri = `https://www.tistory.com/oauth/authorize?client_id=${keys.clientId}&redirect_uri=${keys.callback}&response_type=code`
const kTistoryAccessTokenWithCodeRequestUri = `https://www.tistory.com/oauth/access_token/?grant_type=authorization_code&client_id=${keys.clientId}&client_secret=${keys.secretKey}&redirect_uri=${keys.callback}&code=`

export function importer(options = {}, callback) {
  exec('/usr/bin/open', [kTistoryAccessTokenRequestUri]);

  var port = options.port || 3333;
  var server = new Server(function(req, res){
    /**
     * Handle 2 cases.
     *
     * 1. http://redirectUri:port/?code=${code}
     *   -> redirect to kTistoryAccessTokenWithCodeRequestUri with code
     * 2. http://redirectUri:port/?access_token=${token}
     *   -> return token and close server. (@deprecated?)
     *   -> Oops. Does not redirect with token as decribed in Document. 
     *      just put token in body.
     */
    var query = require('url').parse(req.url, true).query;
    if( 'code' in query ){
      // Originally tried for Case 1. but it doesnt work as manual.
      // res.writeHead(301, {
      //   Location: kTistoryAccessTokenWithCodeRequestUri + query.code
      // });
      https.get(kTistoryAccessTokenWithCodeRequestUri + query.code, function(res){
        res.on('data', function (chunk) {
          chunk = chunk.toString();
          callback(null, chunk.substring(
            chunk.indexOf('access_token=') + 'access_token='.length, 
            chunk.length
          ));
          server.close();
        });
      });
      res.end(`
        <script>window.close();</script>
        <body>Close this window.</body>
      `);
    } else {
      // error at otherwise excluding favicon.
      // console.log("error", req.url, query);
    }
    res.end();
  }).listen(port);
};