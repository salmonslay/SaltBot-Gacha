module.exports.run = async (bot, message, args) => {
    if (message.author.id != config.ownerID) return;
    const data = [{
            name: 'ping',
            description: 'Replies with Pong!',
        },
        {
            name: 'pong',
            description: 'Replies with Ping!',
        },
    ];

    const commands = await bot.application.commands.set(data);
    var embed = new Discord.MessageEmbed()
        .setTitle("Commands deployed.")
        .setDescription(JSON.stringify(commands))
    message.channel.send({
        embeds: [embed]
    });
}
module.exports.help = {
    name: ["deploy"],
    dm: false
}