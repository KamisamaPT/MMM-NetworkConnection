/**
 * @file node_helper.js for MMM-NetworkConnection
 *
 * @author slametps
 * @license MIT
 *
 * @see https://github.com/slametps/MMM-NetworkConnection
 */

"use strict";

const NodeHelper = require('node_helper');
const speedtest = require('speedtest-net');

module.exports = NodeHelper.create({
  start: function(){
    //console.log(this.name + ' helper started ...');
  },

  socketNotificationReceived : function(notification, payload){
    const self = this;
    if (notification === 'CONFIG') {
      this.config = payload;
      self.getStats();
      setInterval(
        function () {
        self.getStats();
        }, 
        this.config.updateInterval,
      );
    }
  },

  getStats: function () {
    // console.log('starting network connection testing')
    const self = this;
    const st = speedtest({ maxTime: self.config.maxTime || 5000 });
    st.once('testserver', function (server) {
      //console.log("ping : " + Math.round(server.bestPing));
      self.sendSocketNotification(
        'NETCONN_RESULT_PING',
        Math.round(server.bestPing),
      );
    });

    st.on('downloadspeed', function (speed) {
      //console.log("download : " + speed.toFixed(payload.config.decimal));
      self.sendSocketNotification(
        'NETCONN_RESULT_DOWNLOAD',
        speed.toFixed(self.config.decimal),
      );
    });

    st.on('uploadspeed', function (speed) {
      //console.log("upload : " + speed.toFixed(payload.config.decimal));
      self.sendSocketNotification(
        'NETCONN_RESULT_UPLOAD',
        speed.toFixed(self.config.decimal),
      );
    });
  },
});
