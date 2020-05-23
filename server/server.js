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
//     let data
//     try {
//       data = JSON.parse(str)
//     } catch (err) {
//       console.log('不合法的數據')
//     }
//     if (data.type === 'linkIn') {
//       console.log(conn.headers.host)
//       console.log(conn.headers.origin)
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
//     console.log(`用户关闭連接:${conn.uid}`)
//   });
//   conn.on("error", (code, reason) => {
//     console.log(`用户关闭連接:${conn.uid}`)
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


// const WebSocket = require("ws");
//
// const wss = new WebSocket.Server({
//   port: 11881
// });
//
// wss.on('connection', function connection(ws, req) {
//   const ip = req.socket.remoteAddress;
//   console.log(req.socket)
//   console.log(ip)
// });
//
// console.log('This websocket-server is running at localhost:' + 11881)

const dgram = require('dgram');
//创建 udp server

const udp_server = dgram.createSocket('udp4');
udp_server.bind(11881); // 绑定端口

let users = {}

// 监听端口
udp_server.on('listening', () => {
  console.log('udp server linstening 11881.');
})

// 關閉鏈接
udp_server.on('close', (msg) => {
  console.log('udp client closed');
  console.log(msg);
})

// 接收消息
udp_server.on('message', (msg, rinfo) => {
  let rmsg = JSON.parse(msg)
  if (rmsg.type === 'linkIn' || rmsg.type === 'ping') {
    if (!users[`${rinfo.address}:${rinfo.port}`]) { // 如果是首次登陸注冊
      users[`${rinfo.address}:${rinfo.port}`] = {}
    }
    users[`${rinfo.address}:${rinfo.port}`].time = new Date().getTime()
    users[`${rinfo.address}:${rinfo.port}`].isOnline = true
  } else if (rmsg.type === 'getOnlineUserList') { // 如果收到的信息是或許user列表
    // 首先掃描在綫列表
    let cloneList = JSON.parse(JSON.stringify(users)),
        terminals = []
    let nowTime = new Date().getTime()
    Object.keys(cloneList).forEach(key => {
      // 不在綫的用戶 直接從列表裏面刪掉
      if (!users[key].isOnline || nowTime - users[key].time > 60000) {
        delete users[key]
        terminals.push(key)
      }
    })
    let data = {type:'returnUserList', data:terminals}
    udp_server.send(JSON.stringify(data), rinfo.port, rinfo.address); //将接收到的消息返回给客户端
    console.log(`udp server received data: ${msg} from ${rinfo.address}:${rinfo.port}`)
  } else if (rmsg.type === 'close') {
    // 觸發了斷開連接，從列表中刪掉該項目
    delete users[`${rinfo.address}:${rinfo.port}`]
  }
  console.log(`udp server received data: ${msg} from ${rinfo.address}:${rinfo.port}`)
})
//错误处理
udp_server.on('error', err => {
  console.log('some error on udp server.')
  udp_server.close();
})


