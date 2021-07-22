var lootboxes = require("./../../routes/lootboxes.js");
module.exports.run = async (bot, message, args) => {
    var embed = new Discord.MessageEmbed()
    .setTitle("Loot box info")
    .setDescription("Loots can be obtained from voting on the bot, suggesting characters, and daily with premium. They can be opened with the **-loot** command in any server.\n\u200B")


    Object.values(lootboxes.loots).forEach((loot) => {
        embed.addField(`${loot.emote} ${loot.name}`, loot.description)
    })

    message.channel.send(embed)
}

module.exports.help = {
    name: ["lootinfo", "infoloot", "loothelp", "lootboxinfo", "klinfo"],
    dm: true
}