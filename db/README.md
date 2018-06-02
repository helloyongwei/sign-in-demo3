# 说明
这是一个cookie的简单例子, 有一下结构

`index.html`: 首页

`sign_in.html`: 登录页面

`sign_up.html`: 注册页面

`server.js`: 服务器

`db/users`: 模拟数据库, 实质上是一个数组, 每个数组项是一个对象, 表示一个用户

# 运行
程序运行需要使用`node`作为服务器

克隆到本地, 并进入文件夹:
```
git clone git@github.com:helloyongwei/sign-in-demo2.git
cd sign-in-demo2 
```

执行以下命令:
```
node server.js 8888
```
`8888` 是一个端口号, 你也可以自己指定

在浏览器中如何`localhost:8888`, 你就可以看到`index.html`页面.

# 注册
在地址栏输入`localhost:8888/sign_up`, 你会进入注册页面, 即`sign_up.html`
输入你要注册的邮箱即密码, 若已注册过则显示已注册, 没有注册则会注册成功

# 登录
在地址栏输入`localhost:8888/sign_in`, 得到登录页面`sign_in.html`, 输入你刚才注册的账号, 会进入首页`index.html`, 还会显示你的账户. 

# cookie
当输入`localhost:8888`直接进入`index.html`页面时, 没有用户登录. 此时就没有设置`cookie`, 首页不会显示你的`cookie`.
若通过用户登录进入首页, 则会设置`cookie`. 首页也会显示你的账户.