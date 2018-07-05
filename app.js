const get = require('./util').get;
// const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');

const port = process.env.PORT || 8200;
const app = new Koa();
const router = new Router();

// 静态资源目录对于相对入口文件app.js的路径
// const staticPath = './public'
// const staticOpts = {
//   setHeaders: function (res, path, stats) {
//     // 添加Service-Worker-Allowed，扩展service worker的scope
//     console.log(path)
//     if (path.indexOf('/sw.js') > -1) {
//       console.log(path)
//       res.setHeader('Content-Type', 'application/javascript')
//       res.setHeader('Service-Worker-Allowed', '/public')
//     }
//   }
// }

router.get('/book', async (ctx, next) => {
  let query = ctx.request.query;
  let {q, fields} = query; // 对象的解构赋值
  let url = `https://api.douban.com/v2/book/search?q=${q}&fields=${fields}&count=10`;
  let res = await get(url); // 代理一个请求
  ctx.response.body = res;
});

app.use(router.routes());
app.use(serve(__dirname + '/public'));
app.listen(port, () => {
  console.log(`listen on port: ${port}`);
});