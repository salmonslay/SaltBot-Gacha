module.exports.run = async (bot, message, args) => {
    var id = message.author.id.toString();

    connection.query(`SELECT loots FROM users WHERE id = ${id}`, function (err, result) {
        if (err) throw err;

        //get loot list
        var loots = [];
        if (result.length > 0 && result[0].loots != null) loots = JSON.parse(result[0].loots);

        //check if loot list contains any super rolls
        var i = utils.findWithAttr(loots, "id", "super_roll");
        if (i != -1 && loots[i].amount-- > 0) {
            var character = utils.generateCharacter(message.author, true);
            bot.commands.get("roll").roll(message, 0, character);

            connection.query(`UPDATE users SET loots = ${connection.escape(JSON.stringify(loots))} WHERE id = ${id}`, function (err, result) {
                console.log(`${id} used a super roll.`)
            });
        } else {
            message.channel.send(`You don't have any Super Rolls ${message.author}! Use the **-lootinfo** command to get information about how you can obtain them.`);
        }
    });
}

module.exports.help = {
    name: ["superroll", "sr"],
    dm: true
}