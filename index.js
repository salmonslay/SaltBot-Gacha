require('dotenv').config();
Discord = require("discord.js");
config = require("./config.json");
roles = require("./roles.json");
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

//characters
characters = [];
characterMap = [];

//roll messages that are claimed
claimedIds = [];

//saves an users harem
haremCache = [];

//saves user info from mysql
userCache = [];

//Holds info about what a message is doing
messageInfo = [];

connection.connect(function (e) {
    if (e) {
        return console.error('error: ' + e.message);
    }
    require('./routes/database.js').createTables();
    console.log(`\nConnected to MySQL (${process.env.mysql_database})\n`);
    connection.query(`SELECT id,parsedName,rawName,nativeName,largeImage,source,characterPage,likes FROM characters ORDER BY likes DESC`, function (err, result) {
        if (err) throw err;
        else {
            var i = 1;
            result.forEach(char => {
                if (!characterMap[char.id.toString()]) {
                    var fixedCharacter = {
                        id: char.id,
                        name: char.parsedName,
                        rawName: char.rawName,
                        nativeName: char.nativeName,
                        image: char.largeImage,
                        source: char.source,
                        likeRank: i++,
                        likes: char.likes,
                        characterPage: char.characterPage
                    }

                    characters.push(fixedCharacter);
                    characterMap[char.id.toString()] = fixedCharacter;
                }
            })
            console.log(`Character list loaded. Found ${result.length} entries.`)
        }
    });
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
        props.help.name.forEach(name => bot.commands.set(name, props))

    });
})

//Bot started
bot.on("ready", () => {
    console.log(`${bot.user.username}Gacha is now online on ${bot.guilds.cache.size} servers!`)

    if (bot.user.username == "SaltDev") {
        bot.channels.cache.get("556801338550386688").send(`${bot.user.username}Gacha is now online on ${bot.guilds.cache.size} servers!`)
    } else {
        bot.channels.cache.get(config.channels.status).send(`${bot.user.username}Gacha is now online on ${bot.guilds.cache.size} servers!`)
    }
});


bot.on('messageReactionAdd', (reaction, user) => {
    if (user.bot) return;
    var message = reaction.message;
    var time = Date.now() - message.createdTimestamp;

    if (message.author.id == bot.user.id && time < 180000 && message.embeds) {
        var embed = message.embeds[0];

        //r
        if (messageInfo[message.id.toString()] == "roll" && time < 60000) bot.commands.get("roll").processClaim(message, user, embed, reaction)

        //update harem (mm)
        else if (messageInfo[message.id.toString()] == "mm") bot.commands.get("mm").updatePage(message, user, embed, reaction)

        //update top characters (top)
        if (messageInfo[message.id.toString()] == "top") bot.commands.get("top").setPage(message, embed, reaction)
    }
});

bot.on('messageReactionRemove', (reaction, user) => {
    if (user.bot) return;
    var message = reaction.message;
    var time = Date.now() - message.createdTimestamp;

    if (message.author.id == bot.user.id && time < 180000 && message.embeds) {
        var embed = message.embeds[0];

        //update harem (mm)
        if (messageInfo[message.id.toString()] == "mm") bot.commands.get("mm").updatePage(message, user, embed, reaction)

        //update top characters (top)
        if (messageInfo[message.id.toString()] == "top") bot.commands.get("top").setPage(message, embed, reaction)
    }
});

//Command detection
bot.on("message", message => {
    if (message.author.bot) return;
    let prefix = config.prefix;
    if (message.content.indexOf(prefix) !== 0) return;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (cmd.slice(prefix.length).startsWith("mm")) bot.commands.get("mm").run(bot, message, messageArray);
    else if (cmd.slice(prefix.length).startsWith("lb")) bot.commands.get("lb").run(bot, message, messageArray);

    else if (commandfile) commandfile.run(bot, message, args);

});

//Update claim reset 
var j = schedule.scheduleJob('0 0 */3 * * *', function () {
    connection.query(`UPDATE users SET hasClaimed = 0`, function (err, result) {
        console.log(`Added claim to ${result.changedRows}/${result.affectedRows} users.`)
    })
});


//Get token from config.json
bot.login(process.env.BOT_TOKEN);