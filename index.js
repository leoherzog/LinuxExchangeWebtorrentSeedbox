#!/usr/bin/env node

const fs = require('fs');
const Webtorrent = require('webtorrent-hybrid');
const getJSON = require('get-json');
const prettyBytes = require('pretty-bytes');

var downloader = new Webtorrent();

var index = 0;
var urls = [];

if (!fs.existsSync('./downloads')) {
  fs.mkdirSync('./downloads');
}

getJSON('https://linux.exchange/distros.json', function (error, response) {

  if (error) {
    console.log(error);
  }

  var trackerString = "";
  for (var i in response.trackers) {
    trackerString += "&tr=" + encodeURIComponent(response.trackers[i]);
  }

  for (var i in response.distros) {
    for (var j in response.distros[i].versions) {
      //console.log(response.distros[i].versions[j].url + trackerString + "\n");
      urls.push(response.distros[i].versions[j].url + trackerString);
    }
  }

  console.log("Starting seeding of " + urls.length + " torrents...");

  for (var i in urls) {
    console.log(urls[i]);
    downloader.add(urls[i], { "path": "./downloads" });
  }

  //startTorrent(urls[index]);

});

// recursively go through each torrent and add them when done with the previous
function startTorrent(url) {

  //console.log("Adding " + url);

  downloader.add(url, { "path": "./downloads" }, function (torrent) {

    torrent.on('done', function () {
      index++;
      setTimeout(function () { startTorrent(urls[index]); }, 5000);
    });

  });

}

setInterval(function () {
  console.log("Active Torrents: " + downloader.torrents.length + ", Active Downloads Progress: " + (downloader.progress * 100).toFixed(2) + "%, Download: " + prettyBytes(downloader.downloadSpeed) + "/s, Upload: " + prettyBytes(downloader.uploadSpeed) + "/s");
  var individualprogress = "";
  for (var i in downloader.torrents) {
    individualprogress += "[" + i + ": " + (downloader.torrents[i].progress * 100).toFixed(1) + "%] ";
  }
  console.log(individualprogress);
}, 2000);
