const net = require('net');

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-central-1',
  'eu-central-2',
  'ca-central-1',
  'sa-east-1'
];

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2500);

    socket.connect(6543, host, () => {
      // Connect payload for postgres startup message
      // We send a mock startup message containing the database username
      const user = `postgres.uumzcjsvysgofcyvbkkm`;
      const db = 'postgres';
      
      const userBytes = Buffer.from(user, 'utf8');
      const dbBytes = Buffer.from(db, 'utf8');
      
      const length = 4 + 4 + 4 + userBytes.length + 1 + 3 + dbBytes.length + 1 + 1;
      const buf = Buffer.alloc(length);
      buf.writeInt32BE(length, 0);
      buf.writeInt32BE(196608, 4); // Protocol version 3.0
      
      let offset = 8;
      buf.write('user\0', offset);
      offset += 5;
      userBytes.copy(buf, offset);
      offset += userBytes.length;
      buf.write('\0database\0', offset);
      offset += 10;
      dbBytes.copy(buf, offset);
      offset += dbBytes.length;
      buf.write('\0\0', offset);
      
      socket.write(buf);
    });

    socket.on('data', (data) => {
      const responseStr = data.toString('utf8');
      socket.destroy();
      // If it returns tenant not found, it's the wrong region
      if (responseStr.includes('tenant') || responseStr.includes('ENOTFOUND')) {
        resolve({ region, status: 'not_found' });
      } else {
        resolve({ region, status: 'found', msg: responseStr });
      }
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ region, status: 'error', error: err.message });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ region, status: 'timeout' });
    });
  });
}

async function run() {
  console.log('Testing regions...');
  for (const r of regions) {
    const res = await checkRegion(r);
    if (res.status === 'found') {
      console.log(`🎉 SUCCESS: Found project region: ${r}! Response:`, res.msg);
      process.exit(0);
    } else {
      console.log(`Region ${r}: ${res.status} ${res.error || ''}`);
    }
  }
  console.log('Finished testing all regions.');
}

run();
