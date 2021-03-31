var Discord = require("discord.js");
var config = require("../config.json");

module.exports.run = async (bot, message, args) => {

    var character = characters[Math.floor(Math.random() * characters.length)];

    var characterEmbed = new Discord.RichEmbed()
        .setColor("GOLD")
        .setTitle(character.parsedName)
        .setDescription(character.source)
        .setImage(character.largeImage)
        .setThumbnail(`http://example.com/${character.id}`)

    message.channel.send(characterEmbed).then(msg => {
        msg.react('🧂');
        messageInfo[msg.id.toString()] = "roll";
    })
}

module.exports.processClaim = function processClaim(message, user, embed) {
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
        for (var i = 0; i < charArray.length; i++) {
            if (charArray[i].id == characterID) {
                charArray[i].amount++;
                updated = true;
                break;
            }
        }
        if (!updated) charArray.push({
            "amount": 1,
            "id": characterID,
            "name": characterName
        })

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

module.exports.help = {
    name: ["r", "roll", "ma", "m"]
}