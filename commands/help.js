module.exports.run = async (bot, message, args) => {

    message.author.send(help);
    message.react("📫")
}

var help = new Discord.MessageEmbed()
    .setColor("#fff8f7")
    .addField(
        "Gacha 💵",
        `**-roll** Roll a random character to claim
        **-mm [user]** Check your claimed characters
        **-im <character>** Search for a character
        **-top [page]** See the most claimed characters
        **-profile [user]** Check your profile stats
        `)

module.exports.help = {
    name: ["help"]
}