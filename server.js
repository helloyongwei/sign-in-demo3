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


  console.log('含查询字符串的路径: ' + pathWithQuery + '\n请求方法为: ' + method)

  if(path === '/'){
    let string = fs.readFileSync('./index.html', 'utf8')
    if (request.headers.cookie) {
      //存在cookie
      let cookies = request.headers.cookie.split('; ')
      let hash = {}
      for (let i = 0; i < cookies.length; i++) {
        let parts = cookies[i].split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] = value
      }
      let email = hash.sign_in_email
      let users = fs.readFileSync('./db/users', 'utf8')
      users = JSON.parse(users)
      let foundUser
      for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
          foundUser = users[i]
          break
        }
      }
      if (foundUser) {
        string = string.replace('__user__', foundUser.email)
      }
    } else {
     string = string.replace('__user__', '同学')
    }
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if(path === '/sign_up' && method === 'GET'){ 
    let string = fs.readFileSync('./sign_up.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if (path === '/sign_up' && method === 'POST') {
    readBody(request).then((body)=>{
      console.log('请求体body为: '+decodeURIComponent(body))
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
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json;charset=utf-8')
        response.write(`{
          "errors": {
            "email": "invalid"
          }
        }`)
      } else if (password !== password_confirmation) {
        //密码一致性
        response.statusCode = 400
        
        response.write(`{
	        "password": "Not Match"
        }`)
      } else {
        var users = fs.readFileSync('./db/users', 'utf8')
        
        try {
          users = JSON.parse(users)
        } catch(exception) {
          users = []
        }
        let inUse = false
        for (let i = 0; i < users.length; i++) {
          let user = users[i]
          if (user.email === email) {
            inUse =  true
            break;
          }
        }
        if (inUse) {
          console.log('此用户已注册, 请重新输入\n')
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json;charset=utf-8')
          response.write(`{
            "errors": {
              "email": "used"
            }
          }`)
        } else {
          users.push({email: email, password: password})
          var usersString = JSON.stringify(users)
          fs.writeFileSync('./db/users', usersString)
          console.log('写入数据库, 用户注册成功\n')
          response.statusCode = 200
        }
      }
      response.end()
    })
    
  } else if (path === '/sign_in' && method === 'GET') {
    let string = fs.readFileSync('./sign_in.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if (path === '/sign_in' && method === "POST") {
    readBody(request).then((body)=>{
      console.log('请求体body为: '+decodeURIComponent(body))
      let strings = body.split('&')
      let hash={} //hash存储key-value值
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value)
      })
      let {email, password} = hash
      var users = fs.readFileSync('./db/users', 'utf8')
      try {
        users = JSON.parse(users)
      } catch(exception) {
        users = []
      }
      let found 
      for (let i = 0; i < users.length; i++) {
        if (users[i].email === email && users.password === password) {
          found = true
          break
        }
      }
      if (found) {
        response.setHeader('Set-Cookie', `sign_in_email=${email}`)
        console.log('设置cookie')
        response.statusCode = 200
      } else {
        response.statusCode = 401
      }
      response.end()
    })
  } else {
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
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
      console.log('服务器正在接收请求体')
      // 监听data事件
      body.push(chunk);
    }).on('end', ()=>{
      // 监听end事件, 当服务器接收POST请求中的全部数据触发
      console.log('服务器接收完毕请求体')
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请在浏览器打开 http://localhost:' + port + '\n')

