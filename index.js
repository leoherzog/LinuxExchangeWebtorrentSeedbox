#!/usr/bin/env node

const fs = require('fs');
const Webtorrent = require('webtorrent-hybrid');
const getJSON = require('get-json');
const pretty = require('prettier-bytes');

var downloader = new Webtorrent();

var urls = [];

if (!fs.existsSync('./downloads')) {
  fs.mkdirSync('./downloads');
}

getJSON('https://linux.exchange/distros.json', function (error, response) {

  if (error) {
    console.log(error.message);
    process.exit();
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
    // console.log(urls[i] + "\n");
    downloader.add(urls[i], { "path": "./downloads" });
  }

  setInterval(checkProgress, 2000);

});

function checkProgress() {
  console.log("Total Torrents: " + downloader.torrents.length + ", Download: " + pretty(downloader.downloadSpeed) + "/s, Upload: " + pretty(downloader.uploadSpeed) + "/s");
  var individualprogress = "";
  for (var i in downloader.torrents) {
    individualprogress += "[" + i + ": " + (downloader.torrents[i].progress * 100).toFixed(1) + "%] ";
  }
  console.log(individualprogress);
}