var Discord = require("discord.js");
var config = require("../config.json");
module.exports.run = async (bot, message, args) => {
    var fixedCharacters = [
        []
    ];
    let target = message.mentions.users.first() || message.author;
    connection.query(`SELECT characters FROM users WHERE id = '${target.id}'`, function (err, result) {
        if (err) throw err;
        else {
            if (result.length>0 && result[0].characters != "[]") {
                var myCharacters = JSON.parse(result[0].characters);
                for (var i = 0; i < myCharacters.length; i++) {
                    if (fixedCharacters.length == (i - (i % 15)) / 15) fixedCharacters.push([]);
                    fixedCharacters[(i - (i % 15)) / 15].push(`**x${myCharacters[i].amount}** ${myCharacters[i].name}`);
                }
                haremCache[target.id] = fixedCharacters;
                

                console.log(myCharacters)
                connection.query(`SELECT largeImage FROM characters WHERE id = '${myCharacters[0].id}'`, function (err, result2) {
                    if (err) throw err;
                    else {
                        createEmbed(target, fixedCharacters[0], message, fixedCharacters, result2[0].largeImage);
                }})
                
            } else {
                createEmbed(target, ["*So empty ~*"], message, fixedCharacters,"https://i.imgur.com/ILbATq4.jpg");
            }
        }
    });
}

function createEmbed(user, data, message, fixedCharacters, link) {
    var characterEmbed = new Discord.RichEmbed()
        .setColor("DARK_RED")
        .setTitle(`${user.username}'s harem`)
        .setDescription(data)
        .setThumbnail(`${link}#${user.id}#0`)
        .setFooter(`Page 1/${fixedCharacters.length}`)
    message.channel.send(characterEmbed).then(msg => {
        if (fixedCharacters.length > 1) msg.react("⬅️").then(() => msg.react("➡️"))
    })
}

module.exports.help = {
    name: ["mm", "harem", "characters", "mycharacters"]
}