/**
 * @file MMM-NetworkConnection.js
 *
 * @author slametps
 * @license MIT
 *
 * @see https://github.com/slametps/MMM-NetworkConnection
 */

"use strict";

Module.register('MMM-NetworkConnection', {

  // Default module config.
  defaults: {
    updateInterval: 60 * 1000,
    animationSpeed: 2.5 * 1000,
    maxTime: 5 * 1000,
		initialLoadDelay: 2.5 * 1000,
    decimal: 1,
    displayTextStatus: true,
    language: config.language || 'en',
	},

	getScripts: function() {
	  return ["moment.js"];
	},

  // Subclass getStyles method.
  getStyles: function () {
    return ['font-awesome.css', 'MMM-NetworkConnection.css'];
  },

  // Define required translations.
  getTranslations: function() {
    return {
      'en': 'translations/en.json',
      'id': 'translations/id.json'
    };
  },

	// Define start sequence.
    start: function() {
		Log.info('Starting module: ' + this.name);
    var self = this;

    // Set locale
		moment.locale(self.config.language);

    this.downloadSpeed = -1;
    this.uploadSpeed = -1;
    this.pingDelay = -1;
    this.firstLoad = true;

		setTimeout(() => {
      this.testUpdate();
      setInterval(() => {
        this.testUpdate();
      }, self.config.updateInterval);
    }, self.config.initialLoadDelay);
  },
  
  getStatElement(icon, metric, metricSuffix) {
    const statWrapper = document.createElement("span");
    statWrapper.className = 'iconify'

    const statIcon = document.createElement("span")
    statIcon.className = 'iconify ' + icon

    const statText = document.createElement("span")
    statText.className = "text"
    statText.textContent = metric > -1 
      ? metric + metricSuffix
      : this.translate("NETCONN_NA");
    
    statWrapper.appendChild(statIcon);
    statWrapper.appendChild(statText);

    return statWrapper;
  },

	// Override dom generator.
	getDom: function() {
    const self = this;
		const wrapper = document.createElement('div');

    if (self.firstLoad && self.pingDelay == -1) {
      wrapper.className = "bright small light";
      wrapper.innerHTML = this.translate("LOADING");

      return wrapper;
    }

    self.firstLoad = false;

    if (!this.checkConnection()) {
      wrapper.className = 'normal bright';
      wrapper.innerHTML = this.translate("NETCONN_NOTCONNECTED");

      return wrapper;
    }

    wrapper.className = 'small';

    if (self.config.displayTextStatus) {
      const headerText = document.createElement("div")
      headerText.innerText = this.translate("NETCONN_CONNECTED");
      wrapper.append(headerText);
    }
    wrapper.appendChild
      (this.getStatElement("fa fa-cloud", self.pingDelay, this.translate("NETCONN_MILLISECOND")),
    );
    wrapper.appendChild(this.getStatElement("fa fa-download", self.downloadSpeed, "Mbps"));
    wrapper.appendChild(this.getStatElement("fa fa-upload", self.uploadSpeed, "Mbps"));

		return wrapper;
	},

	checkConnection: function() {
		return window.navigator.onLine;
	},

  testUpdate: function() {
    this.sendSocketNotification('NETCONN_TEST_START', {'config':this.config});
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification == 'NETCONN_RESULT_DOWNLOAD') {
      this.downloadSpeed = payload;
    }
    if (notification == 'NETCONN_RESULT_UPLOAD') {
      this.uploadSpeed = payload;
    }
    if (notification == 'NETCONN_RESULT_PING') {
      this.pingDelay = payload;
    }
    this.updateDom(this.config.animationSpeed);
  }
});
