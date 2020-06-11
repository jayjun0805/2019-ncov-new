const cloud = require('wx-server-sdk');

const moment = require('moment');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

const _ = db.command;

const $ = _.aggregate;

const messageCollection = db.collection('message');

exports.main = async (event, context) => {

  try {
    // 从云开发数据库中查询等待发送的消息列表
    const messages = await messageCollection
      .aggregate()
      .match({
        done: false
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
            _id: 1,
            t_no: 1,
            t_date: 1,
            t_type: 1
          })
          .done()
        ,
        as: "ncovList"
      })
      .end();

    console.log(messages);


    // 循环消息列表
    const sendPromises = messages.list.map(async message => {
      if(message.ncovList.length > 0){
        console.log(message.ncovList)
        try {
          // 发送订阅消息
          await cloud.openapi.subscribeMessage.send({
            touser: message.touser,
            page: `${message.page}?id=${message.ncovList[0]._id}`,
            data: {
              date2: {
                value: moment(message.addtime).format('YYYY-MM-DD HH:mm:ss')
              },
              phrase3: {
                value: '成功'
              },
              thing6: {
                value: message.date.replace('2020-', '') + ' | ' + formatType(message.type) + ' ' + message.no
              }
            },
            templateId: message.templateId
          });
          // 发送成功后将消息的状态改为已发送
          return db
            .collection('message')
            .doc(message._id)
            .update({
              data: {
                done: true,
              },
            });
        } catch (e) {
          console.log(e);
          return e;
        }
      }
    });

    return Promise.all(sendPromises);
  } catch (err) {
    console.log(err);
    return err;
  }
  
};

let formatType = (type) => {
    switch(type){
      case 1:
          return "飞机";
            break;
      case 2:
          return "火车";
        break;
      case 3:
          return "地铁";
        break;
      case 4:
          return "长途客车/大巴";
        break;
      case 5:
          return "公交车";
        break;
      case 6:
          return "出租车";
        break;
      case 7:
          return "轮船";
        break;
      case 8:
          return "其它公共场所";
        break;
    }
 
}