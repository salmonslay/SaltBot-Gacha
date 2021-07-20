module.exports.run = async (bot, message, args) => {
    bot.commands.get("wish").parseCharacters(message, args, true);
}

module.exports.help = {
    name: ["wishd"],
    dm: true
}