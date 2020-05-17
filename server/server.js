// /**
//  * Created by Administrator on 2020/5/4 0004.
//  */
// const ws = require("nodejs-websocket");
//
// const centerServer = ws.createServer(conn => {
//   conn.on('connect', code => {
//     console.log('开启连接', code)
//   })
//   conn.on("text", str => {
//     console.log(str)
//     let data
//     try {
//       data = JSON.parse(str)
//     } catch (err) {
//       console.log('不合法的數據')
//     }
//     if (data.type === 'linkIn') {
//       conn.uid = data.uid
//     }
//     // 分發給多用戶
//     if (data.type === 'spreadOut') {
//       broadcast(centerServer, data)
//     }
//     // 获取帮助爬取的信息
//     if (data.type.split('@')[0] === 'scrapeBack') {
//       console.log('backed')
//       let fromConn = findConn(centerServer, data.fromUid)
//       if (fromConn) { // 如果链接还存在
//         fromConn.sendText(JSON.stringify({
//           type: 'helpBack',
//           helpUid: data.uid,
//           emails: data.emails,
//           hrefs: data.hrefs
//         }))
//         // 根据deep决定是否要broadcast
//         console.log(data.deep)
//         if (parseInt(data.deep) - 1 > 0) {
//           broadcast(centerServer, {
//             deep: data.deep - 1,
//             uid: data.fromUid,
//             hrefs: data.hrefs
//           })
//         }
//       } else {
//         console.log('发起人链接已断开')
//       }
//     }
//   })
//   conn.on("close", (code, reason) => {
//     console.log("用户关闭连接")
//   });
//   conn.on("error", (code, reason) => {
//     console.log("异常关闭")
//   });
// }).listen(11881)
//
// // 分发方法
// const broadcast = (server, data) => {
//   console.log('broadcast', data)
//   server.connections.forEach(conn => {
//     // 排除发起者自身, 每个用户分摊5个
//     let hrefs = []
//     if (conn.uid !== data.uid) {
//       if (data.hrefs.length < 5) {
//         hrefs = data.hrefs
//       } else {
//         hrefs = data.hrefs.splice(0, 5)
//       }
//       conn.sendText(JSON.stringify({
//         type: `scrape@${data.deep}`,
//         fromUid: data.uid,
//         hrefs,
//         deep: data.deep
//       }))
//     }
//   })
// }
//
// const findConn = (server, uid) => {
//   let fromConn = ''
//   server.connections.forEach(conn => {
//     // 排除发起者自身
//     if (conn.uid === uid) {
//       fromConn = conn
//     }
//   })
//   return fromConn
// }
//
// const showConnections = (server, info) => {
//   console.log(server.connections)
// }
// console.log('This websocket-server is running at localhost:' + 11881)

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('close',()=>{
  console.log('socket已关闭');
});

server.on('error',(err)=>{
  console.log(err);
});

server.on('listening',()=>{
  console.log('socket正在监听中...');
});

server.on('message',(msg,rinfo)=>{
  console.log(`receive message from ${rinfo.address}:${rinfo.port}`);
server.send('exit',rinfo.port,rinfo.address)
});

server.bind('11881');