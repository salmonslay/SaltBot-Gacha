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

characters = [];
claimedIds = [];
haremCache = [];

connection.connect(function (e) {
    if (e) {
        return console.error('error: ' + e.message);
    }

    console.log(`\nConnected to MySQL (${process.env.mysql_database})\n`);
    connection.query(`SELECT id,parsedName,largeImage,source FROM characters LIMIT 5`, function (err, result) {
        if (err) throw err;
        else {
            characters = result;
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
    console.log(`${bot.user.username}Gacha is now online on ${bot.guilds.size} servers!`)
    if (bot.user.username == "SaltDev") {
        bot.channels.get("556801338550386688").send(`${bot.user.username}Gacha is now online on ${bot.guilds.size} servers!`)
    } else {
        bot.channels.get(config.statuschannel).send(`${bot.user.username}Gacha is now online on ${bot.guilds.size} servers!`)
    }
});

bot.on('messageReactionAdd', (reaction, user) => {
    console.log(user.username + " reacted")
    if (user.bot) return;
    var message = reaction.message;
    var time = Date.now() - message.createdTimestamp;

    if (message.author.id == bot.user.id && time < 180000 && message.embeds) {
        var embed = message.embeds[0];

        //r
        if (embed.color == 15844367 && time < 60000) processMessage_claim(message, user, embed)

        //mm
        if (embed.color == 10038562) processMessage_harem(message, user, embed, reaction)
    }
});

bot.on('messageReactionRemove', (reaction, user) => {
    if (user.bot) return;
    var message = reaction.message;
    var time = Date.now() - message.createdTimestamp;

    if (message.author.id == bot.user.id && time < 180000 && message.embeds) {
        var embed = message.embeds[0];

        //mm
        if (embed.color == 10038562) processMessage_harem(message, user, embed, reaction);
    }
});

function processMessage_harem(message, user, embed, reaction) {
    var regex = /jpg#(\d+)#(\d+)/;
    var data = (embed.thumbnail.url.match(regex) || []).map(e => e.replace(regex, '$1'));
    var userID = data[1];
    var currentPage = data[2];
    var oldPage = currentPage;
    var characters = haremCache[userID];

    if (reaction._emoji.name == "⬅️") currentPage--;
    else if (reaction._emoji.name = "➡️") currentPage++;

    if (currentPage == -1) currentPage = characters.length-1;
    else if (currentPage == characters.length) currentPage = 0;

    var newEmbed = new Discord.RichEmbed()
        .setColor("DARK_RED")
        .setTitle(embed.title)
        .setDescription(characters[currentPage])
        .setFooter(`Page ${currentPage+1}/${characters.length}`)
        .setThumbnail(embed.thumbnail.url.replace(`${userID}#${oldPage}`, `${userID}#${currentPage}`))

    message.edit(newEmbed)
}

function processMessage_claim(message, user, embed) {
    var regex = /http:\/\/example\.com\/(\d+)/;
    var claimedId = (embed.thumbnail.url.match(regex) || []).map(e => e.replace(regex, '$1'))[0];
    var claimedName = embed.title;
    if (!claimedIds.includes(message.id)) {

        connection.query(`SELECT hasClaimed,characters FROM users WHERE id = '${user.id}'`, function (err, result) {
            if (err) throw err;
            else {
                if (result.length == 0) tryClaim(user, claimedId, claimedName, "[]", message, embed);
                else if (result[0].hasClaimed == 0) tryClaim(user, claimedId, claimedName, result[0].characters, message, embed);
                else message.channel.send(`${user.toString()}, you have already claimed someone this hour!`)
            }
        });
    }
}

function tryClaim(user, characterID, characterName, myCharacters, message, embed) {
    if (!claimedIds.includes(message.id)) {
        claimedIds.push(message.id);

        message.channel.send(`**${user.username}** claimed **${characterName}**`);


        var charArray = JSON.parse(myCharacters);
        var updated = false;
        for(var i = 0; i < charArray.length; i++){
            if(charArray[i].id == characterID){
                charArray[i].amount++;
                updated =true;
                break;
            }
        }
        if(!updated) charArray.push( {"amount": 1, "id": characterID, "name": characterName})

        var query = `INSERT INTO users VALUES (${user.id}, ${connection.escape(user.username)}, '${JSON.stringify(charArray)}', 1) 
        ON DUPLICATE KEY UPDATE username = ${connection.escape(user.username)}, characters = '${JSON.stringify(charArray)}', hasClaimed = 1;`;
        connection.query(query, function (err, result) {
            if (err) throw err;
            else {
                console.log(`${user.username} claimed ${characterName}`)
                const newEmbed = new Discord.RichEmbed()
                .setColor("#3D0000")
                .setTitle(embed.title)
                .setDescription(embed.description)
                .setImage(embed.image.url)
                .setThumbnail(embed.thumbnail.url)
                .setFooter(`Belongs to ${user.username}`, user.avatarURL)

    message.edit(newEmbed)
            }
        });
    }
}

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