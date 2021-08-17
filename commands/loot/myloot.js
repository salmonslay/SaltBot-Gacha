module.exports.run = async (bot, message, args) => {
    let target = message.mentions.users.first() || message.author;
    LootManager.getUserLoot(target.id).then(res => {
        var desc = `Loot boxes saved: **${res.count}**\n\n`;
        res.loot.forEach(loot => {
            desc += `${LootManager.loots[loot.id].emote} ${LootManager.loots[loot.id].plural}: **${loot.amount}**\n`
        })

        var embed = new Discord.MessageEmbed()
            .setTitle(`${target.username} - Loots`)
            .setDescription(desc)

        message.channel.send({
            embeds: [embed]
        })
    })
}

module.exports.help = {
    name: ["myloot", "lkl", "myloots"],
    dm: true
}