// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });

  // 公共路由
  app.use(async (ctx, next) => {
    console.log('进入全局中间件');
    ctx.data = {};
    ctx.data.openId = event.userInfo.openId;
    await next(); // 执行下一中间件
    console.log('退出全局中间件');
  })

  // user 路由
  app.router('user', async (ctx, next) => {
    console.log('进入user中间件');
    ctx.data.name = 'Zhanglijun';
    await next(); // 执行下一中间件
  }, async (ctx, next) => {
    ctx.data.sex = 'Male';
    await next(); // 执行下一中间件
  }, async (ctx) => {
    ctx.data.city = 'BeiJing';
    ctx.body = { code: 0, data: ctx.data };
    console.log('退出user中间件');
  })

  return app.serve();
}