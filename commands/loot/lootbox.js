var lootboxes = require("./../../routes/lootboxes.js");
module.exports.run = async (bot, message, args) => {
    var msg = "";
    Object.values(lootboxes.getLoot(args[0])).forEach(loot => {
        msg += `x${loot.amount} ${loot.emote} **${loot.amount > 1 ? loot.plural : loot.name}!** ${loot.description}\n`
    })
    message.channel.send(msg);
}

module.exports.help = {
    name: ["lootbox", "loot", "openloot", "kl", "kakeraloot"],
    dm: false // show ppl your rewards :D
}