module.exports.run = async (bot, message, args) => {
    var id = message.author.id.toString();

    LootManager.getUserLootCount(id, "super_roll").then(count => {
        if (count > 0) {
            var character = utils.generateCharacter(message.author, true);
            bot.commands.get("roll").roll(message, 0, character);

            LootManager.removeUserLoot(id, "super_roll", 1);
        } else {
            message.channel.send(`You don't have any Super Rolls ${message.author}! Use the **-lootinfo** command to get information about how you can obtain them.`);
        }
    });
}


module.exports.help = {
    name: ["superroll", "sr"],
    dm: true
}