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
		animationSpeed: 10000,
    maxTime: 5 * 1000,
		initialLoadDelay: 2.5 * 1000,
    decimal: 1,
    displayTextStatus: true,
    useSmallIcons: false,
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
		//Log.info('Starting module: ' + this.name);
    var self = this;

    // Set locale
		moment.locale(self.config.language);
    this.firstLoad = true;
    this.stats = {
      downloadSpeed: -1,
      uploadSpeed: -1,
      pingDelay: -1,
    }

    this.sendSocketNotification('CONFIG', this.config);
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'NETCONN_RESULT_DOWNLOAD':
        this.stats.downloadSpeed = payload;
      case 'NETCONN_RESULT_UPLOAD':
        this.stats.uploadSpeed = payload;
      case 'NETCONN_RESULT_PING':
        this.stats.pingDelay = payload;
    }
    this.updateDom(this.firstLoad ? 10000 : this.config.animationSpeed);
  },

  getFAIconClass(icon) {
    return 'iconify ' + icon + (this.config.useSmallIcons ? ' fa-sm' : '');
  },

  getHeaderElement() {
    const statIcon = document.createElement("i")
    statIcon.className = this.getFAIconClass('far fa-check-circle');

    const headerText = document.createElement("span")
    headerText.innerText = this.translate("NETCONN_CONNECTED");

    const header = document.createElement("div")
    header.appendChild(statIcon);
    header.appendChild(headerText);

    return header;
  },

  getStatElement(icon, metric, metricSuffix) {
    const statIcon = document.createElement("i")
    statIcon.className = this.getFAIconClass(icon);

    const statText = document.createElement("span")
    statText.className = "text"
    statText.textContent = metric > -1
      ? metric + metricSuffix
      : this.translate("NETCONN_NA");

    const statWrapper = document.createElement("span");
    statWrapper.className = 'statText';

    statWrapper.appendChild(statIcon);
    statWrapper.appendChild(statText);

    return statWrapper;
  },

	// Override dom generator.
	getDom: function() {
    const self = this;
    const wrapper = document.createElement('div');

    // Display Loading warning until al stats load
    if (this.firstLoad && Object.values(this.stats).includes(-1)) {
      wrapper.className = "bright small light";
      wrapper.innerHTML = this.translate("LOADING");
      return wrapper;
    } 

    this.firstLoad = false;
    
    if (!this.checkConnection()) {
      wrapper.className = 'normal bright';
      wrapper.innerHTML = this.translate("NETCONN_NOTCONNECTED");
      return wrapper;
    }

    wrapper.className = 'small';

    if (this.config.displayTextStatus) {
      wrapper.append(this.getHeaderElement());
    }

    const connectionStats = {
      ping: {
        icon: 'fa fa-cloud',
        metric: self.stats.pingDelay,
        text: this.translate("NETCONN_MILLISECOND"),
      },
      download: {
        icon: 'fa fa-download',
        metric: self.stats.downloadSpeed,
        text: "Mbps",
      },
      upload: {
        icon: 'fa fa-upload',
        metric: self.stats.uploadSpeed,
        text: "Mbps",
      },
    };

    Object.keys(connectionStats).forEach(stat => {
      const entry = connectionStats[stat];
      wrapper.appendChild(
        this.getStatElement(entry.icon, entry.metric, entry.text),
      );
    });

    return wrapper;
  },

	checkConnection: function() {
		return window.navigator.onLine;
	},
});
