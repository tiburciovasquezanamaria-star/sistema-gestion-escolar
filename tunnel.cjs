const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  const tunnel = await localtunnel({ port: 3001 });
  fs.writeFileSync('tunnel_url.txt', tunnel.url);
  console.log('Tunnel started:', tunnel.url);
  
  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();
