// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

const collectCollection = db.collection('collect');

const TcbRouter = require('tcb-router');

exports.main = async (event, context) => {

  const app = new TcbRouter({ event });

  const openid = event.userInfo.openId;

  app.router('add', async (ctx, next) => {
    
    ctx.body = await collectCollection
      .add({
        data: {
          ncov_id: event.id,
          openid
        }
      })
      .then(res => {
        return res;
      })

  })

  app.router('remove', async (ctx, next) => {

    ctx.body = await collectCollection
      .doc(event.id)
      .remove()
      .then(res => {
        return res;
      })

  })

  app.router('list', async (ctx, next) => {

    ctx.body = await collectCollection
      .aggregate()
      .match({
        openid
      })
      .lookup({
        from: 'ncov',
        localField: 'ncov_id',
        foreignField: 'id',
        as: 'ncovList',
      })
      .end()
      .then(res => {
        return res;
      })

  })

  return app.serve();
}