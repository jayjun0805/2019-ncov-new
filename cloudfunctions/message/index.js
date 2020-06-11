const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

const messageCollection = db.collection('message');

const _ = db.command;

const $ = _.aggregate;

const TcbRouter = require('tcb-router');

exports.main = async (event, context) => {

  const app = new TcbRouter({ event });

  const { OPENID } = cloud.getWXContext();

  app.router('list', async (ctx, next) => {
    ctx.body = await messageCollection
      .aggregate()
      .match({
        touser: OPENID
      })
      .sort({
        addtime: -1
      })
      .lookup({
        from: "ncov",
        let: {
          message_date: '$date',
          message_type: '$type',
          message_no: '$no'
        },
        pipeline: $.pipeline()
          .match(_.expr($.and([
            $.eq(['$t_date', '$$message_date']),
            $.eq(['$t_no', '$$message_no']),
            $.eq(['$t_type', '$$message_type'])
          ])))
          .project({
            _id: 1
          })
          .done()
        ,
        as: "ncovList"
      })
      .project({
        _id: 1,
        date: 1,
        no: 1,
        type: 1,
        done: 1,
        ncovList: 1,
        addtime: $.dateToString({
          date: '$addtime',
          format: '%Y-%m-%d %H:%M:%S',
          timezone: 'Asia/Shanghai'
        })
      })
      .end();
  })

  app.router('subscribe', async (ctx, next) => {

    // 判断是否重复订阅
    const subscribeCountResult = await messageCollection
      .where({
        touser: OPENID,
        no: db.RegExp({
          regexp: event.data.no,
          options: 'i',
        }),
        date: event.data.date,
        type: event.data.type
      })
      .count();
    
    if (subscribeCountResult.total == 0){

      app.body = await messageCollection
        .add({
          data: {
            touser: OPENID, // 订阅者的openid
            page: '/pages/detail/index', // 订阅消息卡片点击后会打开小程序的哪个页面
            date: event.data.date,
            no: event.data.no.toUpperCase(),
            type: event.data.type,
            templateId: event.templateId, // 订阅消息模板ID
            done: false, // 消息发送状态设置为 false,
            addtime: new Date()
          }
        })
        .then(res => {
          return res;
        })

    }
    else
    {
      app.body = subscribeCountResult;
    }
  })

  app.router('unsubscribe', async (ctx, next) => {
    app.body = await messageCollection
      .doc(event.id)
      .remove()
      .then(res => {
        return res;
      })
  })

  return app.serve();
}