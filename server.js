var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号!例如: node server.js 8888')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method


  console.log('含查询字符串的路径\n' + pathWithQuery)

  if(path === '/'){
    let string = fs.readFileSync('./index.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_up' && method === 'GET'){ 
    let string = fs.readFileSync('./sign_up.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if (path === '/sign_up' && method === 'POST') {
    readBody(request).then((body)=>{
      console.log(body)
      let strings = body.split('&')
      let hash={} //hash存储key-value值
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value)
      })
      let {email, password, password_confirmation} = hash
      
      if (email.indexOf('@') === -1) {
        console.log(email.indexOf('@'))
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json;charset=utf-8')
        response.write(`{
          "errors": {
            "email": "invalid"
          }
        }`)
      } else if (password !== password_confirmation) {
        response.statusCode = 400
        response.write(`{
	        "password": "Not Match"
        }`)
      } else {
        response.statusCode = 200
      }
      
    })
    
    response.end()
  } else {
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
    let callback = query.callback
    response.write(`
      {
        "error": "Not Found"
      }
    `)
    response.end()
  }

})

function readBody(request) {
  return new Promise((resolve, reject)=>{
    let body = [] //请求体
    request.on('data', (chunk)=>{
      // 监听data事件
      body.push(chunk);
    }).on('end', ()=>{
      // 监听end事件, 当服务器接收POST请求中的全部数据触发
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请在浏览器打开 http://localhost:' + port)

