// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

const ncovCollection = db.collection('ncov');

const collectCollection = db.collection('collect');

const TcbRouter = require('tcb-router');

exports.main = async (event, context) => {

  const app = new TcbRouter({ event });

  const openid = event.userInfo.openId;

  app.router('total', async (ctx, next) => {
    ctx.body = await ncovCollection
      .count()
      .then(res => {
        return res;
      })
  })
  
  app.router('search', async (ctx, next) => {
    let _where = {};

    if (event.condition.date) {
      _where.t_date = event.condition.date;
    }

    if (event.condition.no) {
      _where.t_no = db.RegExp({
        regexp: event.condition.no,
        options: 'i',
      })
    } 
    ctx.body = await ncovCollection
        .where(_where)
        .skip(event.start)
        .limit(event.count)
        .orderBy('t_date', 'desc')
        .get()
        .then((res) => {
          return res;
        })
  })

  app.router('detail', async (ctx, next) => {

    ctx.body = await ncovCollection
      .doc(event.id)
      .get()
      .then((res) => {
        return res;
      })

    await next();
  }, async (ctx) => {

    ctx.body.data.collect_id = await collectCollection
      .where({
        openid,
        ncov_id: ctx.body.data.id
      })
      .get()
      .then(res => {
        return res.data.length == 0 ? "" : res.data[0]._id;
      });
  })

  return app.serve();
}