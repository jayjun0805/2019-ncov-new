// pages/detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    wx.cloud.callFunction({
      name: 'ncov',
      data: {
        $url: 'detail',
        id
      }
    }).then((res)=>{
      console.log(res);

      this.setData({
        data: res.result.data,
        collectFlag: res.result.data.collect_id ? false : true
      })
    })
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

  onSetClipboardTap: function (e) {
    let source = e.currentTarget.dataset.source;
    wx.setClipboardData({
      data: source,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
            wx.showToast({
              title: '复制成功',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  onCollectAddTap: function(e){
    let id = e.currentTarget.dataset.id;
    console.log(id);
    wx.cloud.callFunction({
      name: 'collect',
      data: {
        $url: 'add',
        id
      }
    }).then((res) => {
      console.log(res)
      let data = this.data.data;
      this.data.data.collect_id = res.result._id;
      wx.showToast({
        title: '成功收藏'
      })
      this.setData({
        collectFlag: false,
        data
      })
    })
  },

  onCollectRemoveTap: function (e) {
    let id = e.currentTarget.dataset.id;
    // console.log(id);
    wx.cloud.callFunction({
      name: 'collect',
      data: {
        $url: 'remove',
        id
      }
    }).then((res) => {
      console.log(res)
      wx.showToast({
        title: '取消收藏'
      })
      this.setData({
        collectFlag: true
      })
    })
  }
})