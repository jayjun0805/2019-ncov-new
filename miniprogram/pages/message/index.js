// miniprogram/pages/message/index.js
import Config from "../../utils/config";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeArray: [
      {
        id: 1,
        text: "飞机"
      },
      {
        id: 2,
        text: "火车"
      },
      {
        id: 3,
        text: "地铁"
      },
      {
        id: 4,
        text: "长途客车/大巴"
      },
      {
        id: 5,
        text: "公交车"
      },
      {
        id: 6,
        text: "出租车"
      },
      {
        id: 7,
        text: "轮船"
      },
      {
        id: 8,
        text: "其它公共场所"
      }
    ],
    currentTypeIndex: 0,
    date: "",
    no: "",
    subscribeData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: (res) => {
        console.log(res)
        if (res.model == 'iPhone X' || res.model == 'iPhone XS Max' || res.model == 'iPhone XR') {
          this.setData({
            isIphoneX: true
          })
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this._getMessageList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  onNoInput: function (e) {
    this.setData({
      no: e.detail
    })
  },

  onTypeChange: function (e) {
    this.setData({
      currentTypeIndex: e.detail.value
    });
  },

  onSubscribeTap: function () {
    let date = this.data.date;
    let no = this.data.no;
    let type = this.data.typeArray[this.data.currentTypeIndex].id;

    if (date == "") {
      wx.showToast({
        title: '请输入出行日期',
        icon: 'none'
      })

      return;
    }

    if (no == "") {
      wx.showToast({
        title: '请输入车次/航班',
        icon: 'none'
      })

      return;
    }

    let data = {
      date,
      type,
      no
    };

    wx.requestSubscribeMessage({
      // 传入订阅消息的模板id，模板 id 可在小程序管理后台申请
      tmplIds: [Config.messageTmplId],
      success: res => {
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          wx.cloud
            .callFunction({
              name: 'message',
              data: {
                $url: 'subscribe',
                data,
                templateId: Config.messageTmplId
              },
            })
            .then((res) => {
              console.log(res);
              if (res.result.total && res.result.total > 0) 
              {
                wx.showToast({
                  title: '您已订阅相关信息，请勿重复订阅！',
                  icon: 'none'
                })
              }
              else
              {
                this._getMessageList();
                wx.showToast({
                  title: '订阅成功',
                  icon: 'success',
                  duration: 2000,
                });
              }
            })
            .catch(() => {
              wx.showToast({
                title: '订阅失败',
                icon: 'success',
                duration: 2000,
              });
            });
        }
      },
      fail: res => {
        console.log(res);
      }
    });
  },

  _getMessageList: function () {

    wx.showLoading({
      title: 'loading'
    });
    
    wx.cloud
      .callFunction({
        name: 'message',
        data: {
          $url: 'list'
        }
      })
      .then((res) => {
        console.log(res);

        this.setData({
          subscribeData: res.result.list
        })

        wx.stopPullDownRefresh();
        wx.hideLoading();
      })

  },

  onUnSubscribeTap: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '操作提示',
      content: '你确定取消该条订阅消息吗？',
      success: (res) => {

        if (res.confirm) {

          console.log('用户点击确定');

          wx.cloud.callFunction({
            name: 'message',
            data: {
              $url: 'unsubscribe',
              id
            }
          }).then(res => {
            this._getMessageList();
            wx.showToast({
              title: '取消成功',
              icon: 'success',
              duration: 2000
            });
          })

        }
      }
    })
  },

  onScrolltoupper: function () {
    console.log("滚动到顶部时触发");
    this._fetchDataList();
  }

})