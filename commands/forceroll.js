module.exports.run = async (bot, message, args) => {
    if (!utils.hasRole(message.author.id, "trusted")) return;

    //query user searched for
    var query = args.join(' ');
    var result = utils.findCharacter(query);

    console.log(result)
    if (result.best) bot.commands.get("roll").roll(message, 0, result.best);
    else if (result.matches.length == 0) message.channel.send(`${message.author.toString()}, no character found.`)
    else message.channel.send(result.text);
}
module.exports.help = {
    name: ["forceroll", "fr"]
}