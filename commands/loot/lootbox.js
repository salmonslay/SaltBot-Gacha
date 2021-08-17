module.exports.run = async (bot, message, args) => {
    connection.query(`SELECT loots,lootboxes FROM users WHERE id = ${message.author.id}`, function (err, result) {
        if (result.length == 0 || result[0].lootboxes > 0) {
            var msg = "";
            var newLoot = Object.values(LootManager.getLoot());
            newLoot.forEach(loot => {
                msg += `x${loot.amount} ${loot.emote} **${loot.amount > 1 ? loot.plural : loot.name}!** ${loot.description}\n`
            })
            message.channel.send(msg);

            var myLoot = result.length == 0 ? [] : JSON.parse(result[0].loots);
            var lootCount = result.length == 0 ? 0 : result[0].lootboxes - 1;
            saveLoots(message, newLoot, myLoot, lootCount);
        } else {
            message.channel.send("You don't have any loots! Type **-lootinfo** to see info about loot boxes.")
        }
    })

}

function saveLoots(message, gainedLoots, myLoot, lootCount) {
    gainedLoots.forEach(loot => {
        if (!myLoot.some(l => l.id === loot.id))
            myLoot.push({
                id: loot.id,
                amount: loot.amount
            })
        else myLoot[utils.findWithAttr(myLoot, "id", loot.id)].amount += loot.amount;
    })
    if (!userCache[message.author.id]) userCache[message.author.id] = {};
    userCache[message.author.id].lootlist = myLoot;
    userCache[message.author.id].loots = lootCount;

    var query = `
                INSERT INTO users (id, username, characters, loots, lootboxes)
                VALUES (${message.author.id}, ${connection.escape(message.author.username)}, "[]", ${connection.escape(JSON.stringify(myLoot))}, 0) 
                ON DUPLICATE KEY UPDATE 
                username = ${connection.escape(message.author.username)}, 
                loots = ${connection.escape(JSON.stringify(myLoot))},
                lootboxes = ${lootCount}`;

    connection.query(query, function (err, result) {
        if (err) throw err;
    })
}

module.exports.help = {
    name: ["lootbox", "loot", "openloot", "kl", "kakeraloot"],
    dm: false // show ppl your rewards :D
}