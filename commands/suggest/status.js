module.exports.run = async (bot, message, args) => {
    if (!utils.hasRole(message.author.id, "trusted")) return;

    if (message.reference) {
        var args = args.join(' ').split('$');
        var status = args[0];
        var text = args.slice(1).join(' ');
        message.channel.messages.fetch(message.reference.messageId).then(msg => {
            var suggesterID = /(\d+)>/gm.exec(msg.content)[1];
            var suggester = bot.users.cache.get(suggesterID);
            if (status == "approve") {
                var embed = msg.embeds[0]
                    .setColor("GREEN")
                    .addField(`:bookmark: ${message.author.username} approved this character!`, `${text}\n\n${Date.now()}`)

                msg.edit({
                    embeds: [embed]
                });

                var cleanEmbed = msg.embeds[0];
                cleanEmbed.fields = [];
                suggester.send({
                    content: `Hey **${suggester.username}**, thank you for your character submission to SaltBot! Your suggestion has been __approved__ and will be added to the global character pool shortly :sparkles:
\nA loot box have been added to your account that you can open with the **-loot** command. 
\n${text.length > 1 ? `:envelope_with_arrow: **Approver Notes**: ${text}` : ""}`,
                    embeds: [cleanEmbed]
                })
            } else if (status == "deny") {

            }
        });


    }
}
module.exports.help = {
    name: ["status"],
    dm: false
}