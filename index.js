#!/usr/bin/env node

const fs = require('fs');
const fetch = require('node-fetch');
const webtorrent = require('webtorrent-hybrid');
const getJSON = require('get-json');
const pretty = require('prettier-bytes');
const chalk = require('chalk');

var seeder = new webtorrent();

var magnets = [];
var directs = [];

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
      var url = response.distros[i].versions[j]["magnet-url"] + "&tr=" + response.trackers.join("&tr=") + "&ws=" + response.distros[i].versions[j]["direct-download-url"];
      // console.log(url + '\n');
      // fs.appendFileSync('./magnets.txt', url + '\n');
      magnets.push(url);
      directs.push(response.distros[i].versions[j]["direct-download-url"]);
    }
  }

  const requests = directs.map(fetch);
  
  directs.map(file => {
    fetch(file).then(response => {
      response.body.pipe(fs.createWriteStream('/tmp/' + file))
    });
  });

});

function seed() {

  console.log("Starting seeding of " + magnets.length + " torrents...");

  for (var i in magnets) {
    // console.log(magnets[i] + "\n");
    seeder.add(magnets[i], { "path": "/tmp" });
  }

  setInterval(checkProgress, 2000);

}

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
