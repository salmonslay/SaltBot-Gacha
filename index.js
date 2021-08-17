require('dotenv').config();
Discord = require("discord.js");
config = require("./config.json");
utils = require("./routes/utils.js");
LootManager = require("./routes/lootboxes.js");
UserManager = require("./routes/usermanager.js");
bot = new Discord.Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGES']
});
var fs = require("fs");
var mysql2 = require("mysql2");
var schedule = require('node-schedule');
var glob = require("glob")
bot.disabledMembers = new Map();
bot.commands = new Discord.Collection();
require('events').EventEmitter.prototype._maxListeners = 250;


connection = mysql2.createConnection({
    host: process.env.mysql_host || 'localhost',
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: process.env.mysql_database
});


gacha = {
    //characters
    characters: [],
    characterMap: [],

    //saves an users harem
    haremCache: [],

    //saves user info from mysql
    userCache: [],

    //Holds info about what a message is doing
    messageInfo: []
}

connection.connect(function (e) {
    if (e) {
        return console.error('error: ' + e.message);
    }
    require('./routes/database.js').createTables();
    console.log(`\nConnected to MySQL (${process.env.mysql_database})\n`);
    connection.query(`SELECT id,parsedName,rawName,nativeName,largeImage,source,characterPage,claims FROM characters ORDER BY claims DESC`, function (err, result) {
        if (err) throw err;
        else {
            var i = 1;
            result.forEach(char => {
                if (!gacha.characterMap[char.id.toString()]) {
                    var fixedCharacter = {
                        id: char.id,
                        name: char.parsedName,
                        rawName: char.rawName,
                        nativeName: char.nativeName,
                        image: char.largeImage,
                        source: char.source,
                        rank: i++,
                        claims: char.claims,
                        characterPage: char.characterPage
                    }

                    gacha.characters.push(fixedCharacter);
                    gacha.characterMap[char.id.toString()] = fixedCharacter;
                }
            })
            console.log(`Character list loaded. Found ${gacha.characters.length} entries.`)
        }
    });

    //add roles to userCache
    connection.query(`SELECT id,roles,loots,lootboxes,wishlist FROM users`, function (err, result) {
        userCache = result.reduce(
            (obj, item) => Object.assign(obj, {
                [item.id.toString()]: {
                    roles: item.roles ? JSON.parse(item.roles) : [],
                    wishlist: item.wishlist ? JSON.parse(item.wishlist) : [],
                }
            }), {});
    })
});

//Read commands
glob("./commands/**/*.js", function (err, files) {
    if (err) console.log(err);

    //Load commands
    files.forEach((f, i) => {
        let props = require(f)
        console.log(`File ${f.replace("./commands/", "")} loaded!`);
        props.help.name.forEach(name => bot.commands.set(name, props))
    });
})

//Bot started
bot.on("ready", () => {
    console.log(`${bot.user.username}Gacha is now online on ${bot.guilds.cache.size} servers!`)

    if (bot.user.username == "SaltDev") {
        bot.channels.cache.get(config.channels.dev).send(`${bot.user.username}Gacha is now online on ${bot.guilds.cache.size} servers!`)
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
        if (gacha.messageInfo[message.id].type == "roll" && time < 60000) bot.commands.get("roll").processClaim(message, user, embed, reaction)

        //update harem (mm)
        else if (gacha.messageInfo[message.id].type == "mm") bot.commands.get("mm").updatePage(message, user, embed, reaction)

        //update top characters (top)
        if (gacha.messageInfo[message.id].type == "top") bot.commands.get("top").setPage(message, embed, reaction)

        //update top characters (top)
        if (gacha.messageInfo[message.id].type == "suggestion") bot.commands.get("suggest").submit(message, embed)

        //update leaderboard page (lb)
        if (gacha.messageInfo[message.id].type == "leaderboard") bot.commands.get("leaderboard").setPage(message, embed, reaction)
    }
});

bot.on('messageReactionRemove', (reaction, user) => {
    if (user.bot) return;
    var message = reaction.message;
    var time = Date.now() - message.createdTimestamp;

    if (message.author.id == bot.user.id && time < 180000 && message.embeds) {
        var embed = message.embeds[0];

        //update harem (mm)
        if (gacha.messageInfo[message.id].type == "mm") bot.commands.get("mm").updatePage(message, user, embed, reaction)

        //update top characters (top)
        if (gacha.messageInfo[message.id].type == "top") bot.commands.get("top").setPage(message, embed, reaction)

        //update leaderboard page (lb)
        if (gacha.messageInfo[message.id].type == "leaderboard") bot.commands.get("leaderboard").setPage(message, embed, reaction)
    }
});

//Command detection
bot.on("messageCreate", message => {
    if (message.author.bot) return;
    let prefix = config.prefix;
    if (message.content.indexOf(prefix) !== 0) return;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    let commandfile = bot.commands.get(cmd.slice(prefix.length));

    if (cmd.slice(prefix.length).startsWith("mm")) bot.commands.get("mm").run(bot, message, messageArray);
    else if (cmd.slice(prefix.length).startsWith("lb")) bot.commands.get("lb").run(bot, message, messageArray);
    else if (cmd.slice(prefix.length).startsWith("leaderboard")) bot.commands.get("leaderboard").run(bot, message, messageArray);

    //only run command if channel type is NOT dm or if command allows dm
    else if (commandfile && (message.channel.type != "dm" || commandfile.help.dm)) commandfile.run(bot, message, args);

});

//Update claim reset 
var j = schedule.scheduleJob('0 0 */3 * * *', function () {
    connection.query(`UPDATE users SET hasClaimed = 0`, function (err, result) {
        console.log(`Added claim to ${result.changedRows}/${result.affectedRows} users.`)
    })
});


//Get token from config.json
bot.login(process.env.BOT_TOKEN);