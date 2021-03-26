var Discord = require("discord.js");
var config = require("../config.json");

module.exports.run = async (bot, message, args) => {

    var character = characters[Math.floor(Math.random() * characters.length)];

    var characterEmbed = new Discord.RichEmbed()
        .setColor("GOLD")
        .setTitle(character.parsedName)
        .setDescription(character.source)
        .setImage(character.largeImage)
        .setThumbnail(`http://${character.id}.com`)

    message.channel.send(characterEmbed).then(msg => {
        msg.react('🧂');
    })
}

module.exports.help = {
    name: "r"
}