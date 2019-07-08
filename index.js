#!/usr/bin/env node

const fs = require('fs');
const webtorrent = require('webtorrent-hybrid');
const getJSON = require('get-json');
const pretty = require('prettier-bytes');
const chalk = require('chalk');

var downloader = new webtorrent();

var urls = [];

if (!fs.existsSync('/tmp')) {
  throw "/tmp does not exist";
}

getJSON('https://linux.exchange/distros.json', function (error, response) {

  if (error) {
    console.log(error.message);
    process.exit();
  }

  for (var i in response.distros) {
    for (var j in response.distros[i].versions) {
      var url = response.distros[i].versions[j]["magnet-url"];
      if (response.distros[i].trackers.length) {
        url += "&tr=" + response.distros[i].trackers.join("&tr=");
      }
      url += "&tr=" + response.trackers.join("&tr=");
      url += "&ws=https://cors.linux.exchange/" + response.distros[i].versions[j]["magnet-url"].split("dn=")[1];
      // console.log(url + '\n');
      // fs.appendFileSync('./magnets.txt', url + '\n');
      urls.push(url);
    }
  }

  console.log("Starting seeding of " + urls.length + " torrents...");

  for (var i in urls) {
    // console.log(urls[i] + "\n");
    downloader.add(urls[i], { "path": "/tmp" });
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
  summary += chalk.green((percentage * 100).toFixed(1) + "% Done") + " Seeding " + chalk.green(downloader.torrents.length) + " WebTorrents ";
  summary += "↓ " + chalk.green(pretty(downloader.downloadSpeed) + "/s") + " ↑ " + chalk.green(pretty(downloader.uploadSpeed) + "/s");
  console.log(summary);
  console.log(individualprogress);
}