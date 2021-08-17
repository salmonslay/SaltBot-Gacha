module.exports.run = async (bot, message, args) => {
    let target = message.mentions.users.first() || message.author;
    connection.query(`SELECT id,loots,lootboxes FROM users WHERE id = ${target.id}`, function (err, result) {
        var myLoot = [];
        var myLootCount = 0;
        if (result.length > 0 && result[0].loots) {
            myLoot = JSON.parse(result[0].loots);
            myLootCount = result[0].lootboxes;
        }

        var desc = `Loot boxes saved: **${myLootCount}**\n\n`;
        myLoot.forEach(loot => {
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