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
            if (result.length>0) {
                var myCharacters = JSON.parse(result[0].characters);
                for (var i = 0; i < myCharacters.length; i++) {
                    if (fixedCharacters.length == (i - (i % 15)) / 15) fixedCharacters.push([]);
                    fixedCharacters[(i - (i % 15)) / 15].push(myCharacters[i][1]);
                    console.log(myCharacters[i][1])
                }
                haremCache[target.id] = fixedCharacters;

                createEmbed(target, fixedCharacters[0], message, fixedCharacters,0);
            } else {
                createEmbed(target, ["*So empty ~*"], message, fixedCharacters,0);
            }
        }
    });
}

function createEmbed(user, data, message, fixedCharacters, page) {
    var characterEmbed = new Discord.RichEmbed()
        .setColor("DARK_RED")
        .setTitle(`${user.username}'s harem`)
        .setDescription(data)
        .setThumbnail(`http://s.se/${user.id}/0`)
        .setFooter(`Page 1/${fixedCharacters.length}`)
    message.channel.send(characterEmbed).then(msg => {
        if (fixedCharacters.length > 1) msg.react("⬅️").then(() => msg.react("➡️"))
    })
}

module.exports.help = {
    name: "mm"
}