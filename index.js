#!/usr/bin/env node

const fs = require('fs');
const Webtorrent = require('webtorrent');
const WebtorrentHybrid = require('webtorrent-hybrid');
const getJSON = require('get-json');
const pretty = require('prettier-bytes');
const chalk = require('chalk');

var downloader = new Webtorrent();
var seeder = new WebtorrentHybrid();

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
      var url = response.distros[i].versions[j]["magnet-url"] + trackerString + "&ws=" + encodeURIComponent(response.distros[i].versions[j]["direct-download-url"]);
      // console.log(url + '\n');
      // fs.appendFileSync('./downloads/magnets.txt', url + '\n\n');
      urls.push(url);
    }
  }

  console.log("Starting seeding of " + urls.length + " torrents...");

  for (var i in urls) {
    // console.log(urls[i] + "\n");
    downloader.add(urls[i], { "path": "./downloads" }, function(torrent) {
      torrent.on('done', function() {
        console.log("Transferring " + torrent.infoHash + " from Downloader to Seeder...");
        torrent.destroy(function () {
          seeder.add(torrent.magnetURI, { "path": "./downloads" });
        });
      });
    });
  }

  setInterval(checkProgress, 2000);

});

function checkProgress() {
  var percentage = 0;
  var individualprogress = "";
  for (var i in downloader.torrents) {
    percentage = percentage + downloader.torrents[i].progress;
    individualprogress += "[" + (new Number(i) + 1) + ": " + (downloader.torrents[i].progress * 100).toFixed(1) + "%] ";
  }
  percentage = percentage / downloader.torrents.length;
  var summary = "";
  summary += chalk.green((percentage * 100).toFixed(1) + "% Done") + " Downloading " + chalk.green(downloader.torrents.length) + " Torrents, Seeding " + chalk.green(seeder.torrents.length) + " WebTorrents ";
  summary += "↓ " + chalk.green(pretty(downloader.downloadSpeed + seeder.downloadSpeed) + "/s") + " ↑ " + chalk.green(pretty(downloader.uploadSpeed + seeder.uploadSpeed) + "/s");
  console.log(summary);
  console.log(individualprogress);
}
