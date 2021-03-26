var Discord = require("discord.js");
var config = require("../config.json");
const filter = (reaction, user) => {
    return true;
};

module.exports.run = async (bot, message, args) => {

    var character = characters[Math.floor(Math.random() * characters.length)];

    var characterEmbed = new Discord.RichEmbed()
        .setColor("#FFFFFF")
        .setTitle(character.parsedName)
        .setDescription(character.source)
        .setImage(character.largeImage)

    message.channel.send(characterEmbed).then(msg => {
        msg.react('🦍');
    })
}

module.exports.help = {
    name: "r"
}