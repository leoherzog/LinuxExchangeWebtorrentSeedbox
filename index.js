#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const webtorrent = require('webtorrent-hybrid');
const getJSON = require('get-json');
const pretty = require('prettier-bytes');
const chalk = require('chalk');

var downloader = new webtorrent();

const dir = "./cache"
var names = [];
var urls = [];

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

var timeInBase64 = new Buffer(new Date().getTime().toString()).toString('base64');

getJSON('https://linux.exchange/distros.json', function (error, response) {

  if (error) {
    console.log(error.message);
    process.exit();
  }

  response.distros.forEach(function(distro) {
    distro.versions.forEach(function(version) {
      var url = version["magnet-url"];
      var name = version["direct-download-url"].substring(version["direct-download-url"].lastIndexOf('/') + 1);
      names.push(name);
      if (distro.trackers.length) {
        url += "&tr=" + distro.trackers.join("&tr=");
      }
      url += "&tr=" + response.trackers.join("&tr=");
      url += "&ws=" + version["direct-download-url"];
      // console.log(url + '\n');
      // fs.appendFileSync('./magnets.txt', url + '\n');
      urls.push(url);
    });
  });

  fs.readdir(dir, function(err, cache) {
    var toRemove = cache.diff(names);
    toRemove.forEach(function(filename) {
      fs.unlink(dir + "/" + filename, function(){});
    });
    console.log("Removed " + toRemove.length +  " old cached file(s)");
  });
  
  console.log("Starting seeding of " + magneturls.length + " torrents...");
  
  urls.forEach(function(url) {
    // console.log(url + "\n");
    downloader.add(url, { "path": dir });
  });

  setInterval(checkProgress, 2000);

});

function checkProgress() {
  var percentage = 0;
  var individualprogress = "";
  downloader.torrents.forEach(function(torrent, i) {
    percentage = percentage + torrent.progress;
    individualprogress += "[" + (new Number(i) + 1) + ": " + (torrent.progress * 100).toFixed(1) + "%] ";
  });
  percentage = percentage / downloader.torrents.length;
  var summary = "";
  summary += chalk.green((percentage * 100).toFixed(1) + "% Done") + " Seeding " + chalk.green(downloader.torrents.length) + " WebTorrents ";
  summary += "↓ " + chalk.green(pretty(downloader.downloadSpeed) + "/s") + " ↑ " + chalk.green(pretty(downloader.uploadSpeed) + "/s");
  summary += " - Free Memory: " + chalk.green(pretty(os.freemem())) + " of " + chalk.green(pretty(os.totalmem()));
  console.log(summary);
  console.log(individualprogress);
}

Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};