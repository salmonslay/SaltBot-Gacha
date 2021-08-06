var lootboxes = require("./../../routes/lootboxes.js");
module.exports.run = async (bot, message, args) => {
    connection.query(`SELECT lootboxes FROM users WHERE id = ${message.author.id}`, function (err, result) {
        if (result.length == 0 || result[0].lootboxes > 0) {
            var msg = "";
            var loots = Object.values(lootboxes.getLoot());
            loots.forEach(loot => {
                msg += `x${loot.amount} ${loot.emote} **${loot.amount > 1 ? loot.plural : loot.name}!** ${loot.description}\n`
            })
            message.channel.send(msg);
            saveLoots(message, loots);
        } else {
            message.channel.send("You don't have any loots! Type **-lootinfo** to see info about loot boxes.")
        }
    })

}

function saveLoots(message, gainedLoots) {
    connection.query(`SELECT id,loots FROM users WHERE id = ${message.author.id}`, function (err, result) {
        if (err) throw err;
        var lootlist = [];
        //wishlist already created
        if (result.length > 0 && result[0].loots != null) lootlist = JSON.parse(result[0].loots);

        gainedLoots.forEach(loot => {
            if (!lootlist.some(l => l.id === loot.id))
                lootlist.push({
                    id: loot.id,
                    amount: loot.amount
                })
            else lootlist[utils.findWithAttr(lootlist, "id", loot.id)].amount += loot.amount;
        })

        userCache[message.author.id].lootlist = lootlist;

        var query = `
                INSERT INTO users (id, username, characters, loots, lootboxes)
                VALUES (${message.author.id}, ${connection.escape(message.author.username)}, "[]", ${connection.escape(JSON.stringify(lootlist))}, 0) 
                ON DUPLICATE KEY UPDATE 
                username = ${connection.escape(message.author.username)}, 
                loots = ${connection.escape(JSON.stringify(lootlist))},
                lootboxes = lootboxes - 1`;
console.log(query)
        connection.query(query, function (err, result) {
            if (err) throw err;
            message.react("✅");
        })
    })
}

module.exports.help = {
    name: ["lootbox", "loot", "openloot", "kl", "kakeraloot"],
    dm: false // show ppl your rewards :D
}