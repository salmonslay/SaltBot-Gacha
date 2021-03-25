require('dotenv').config();
var Discord = require("discord.js");
var config = require("./config.json");
var bot = new Discord.Client();
var fs = require("fs");
var mysql2 = require("mysql2");
var schedule = require('node-schedule');
bot.disabledMembers = new Map();
bot.commands = new Discord.Collection();
require('events').EventEmitter.prototype._maxListeners = 250;


connection = mysql2.createConnection({
    host: process.env.mysql_host || 'localhost',
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: process.env.mysql_database
});

connection.connect(function (e) {
    if (e) {
        return console.error('error: ' + e.message);
    }

    console.log(`\nConnected to MySQL (${process.env.mysql_database})\n`);
});

//Read commands
fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if (jsfile.length <= 0) {
        console.log("No commands found :(");
        return;
    }

    //Load commands
    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`)
        console.log(`File ${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
})

//Bot started
bot.on("ready", () => {
    if (bot.user.username == "SaltDev") {
        bot.channels.get("556801338550386688").send(`${bot.user.username}Gacha is now online on ${bot.guilds.size} servers!`)
    } else {
        bot.channels.get(config.statuschannel).send(`${bot.user.username}Gacha is now online on ${bot.guilds.size} servers!`)
    }
});


//Command detection
bot.on("message", message => {
    if (message.author.bot) return;
    let prefix = config.prefix;
    if (message.content.indexOf(prefix) !== 0) return;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args);
});


//Get token from config.json
bot.login(process.env.BOT_TOKEN);