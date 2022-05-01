## 内容发布应用

Node Koa框架搭建的内容发布应用，前端使用Vue+Antd Vue


[前端在线演示地址](http://106.55.228.251:40011/#/home)  


### 一、服务端

#### 1. 安装mysql数据库，并修改配置文件

安装mysql请参考网上教程，安装完成后，打开server文件夹中 `config/default.js`，修改成自己的数据库信息：

```
const config = {
    // 启动端口
    port: 4001,

    // 数据库配置
    database: {
        DATABASE: 'node_notes',
        USERNAME: 'root2',
        PASSWORD: 'root',
        PORT: '3306',
        HOST: 'localhost'
    }
}
module.exports = config
```

#### 2. 进入server文件夹，执行如下命令启动服务

```
npm install 或 yarn install
```

```
npm start 或 yarn start
```


### 二、客户端

#### 1. 进入client文件夹，执行如下命令启动项目

```
npm install 或 yarn install
```

```
npm run serve 或 yarn serve
```
