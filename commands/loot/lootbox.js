module.exports.run = async (bot, message, args) => {
    var id = message.author.id;

    LootManager.getUserLoot(id).then(res => {
        if (res.count > 0) {
            var msg = "";
            var newLoot = Object.values(LootManager.getLoot());
            newLoot.forEach(loot => {
                msg += `x${loot.amount} ${loot.emote} **${loot.amount > 1 ? loot.plural : loot.name}!** ${loot.description}\n`
            })
            message.channel.send(msg);

            LootManager.addUserLoot(id, message.author.username, newLoot);
        } else {
            message.channel.send("You don't have any loots! Type **-lootinfo** to see info about loot boxes.")
        }
    })
}

module.exports.help = {
    name: ["lootbox", "loot", "openloot", "kl", "kakeraloot"],
    dm: false // show ppl your rewards :D
}