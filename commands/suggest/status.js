module.exports.run = async (bot, message, args) => {
    if (!utils.hasRole(message.author.id, "trusted")) return;

    if (message.reference) {
        var args = args.join(' ').split('$');
        var status = args[0];
        var text = args.slice(1).join(' ');
        message.channel.messages.fetch(message.reference.messageId).then(msg => {
            var suggesterID = /(\d+)>/gm.exec(msg.content)[1];
            var suggester = bot.users.cache.get(suggesterID);

            //APPROVE suggestion
            if (status == "approve") {
                var embed = msg.embeds[0]
                    .setColor("GREEN")
                    .addField(`:white_check_mark: ${message.author.username} __approved__ this character!`, `${text}\n\n${Date.now()}`)

                msg.edit({
                    embeds: [embed]
                });

                var cleanEmbed = msg.embeds[0];
                cleanEmbed.fields = [];
                suggester.send({
                    content: `Hey **${suggester.username}**, thank you for your character submission to SaltBot! Your suggestion has been __approved__ and will be added to the global character pool shortly :sparkles:
\nA loot box have been added to your account that you can open with the **-loot** command. 
\n${text.length > 1 ? `:envelope_with_arrow: **Approver Notes**: ${text}\n\u200B` : ""}`,
                    embeds: [cleanEmbed]
                })
                message.react("✅");

                //grant lootbox
                connection.query(`UPDATE users SET lootboxes = lootboxes + 1 WHERE id = ${suggester.id}`, function (err, result) {
                    if (err) throw err;
                });

                //DENY suggestion
            } else if (status == "deny") {
                var embed = msg.embeds[0]
                    .setColor("RED")
                    .addField(`:x: ${message.author.username} __denied__ this character!`, `${text}\n\n${Date.now()}`)

                msg.edit({
                    embeds: [embed]
                });

                var cleanEmbed = msg.embeds[0];
                cleanEmbed.fields = [];
                suggester.send({
                    content: `Hey **${suggester.username}**, thank you for your character submission to SaltBot! Unfortunately your suggestion has been __denied__ and will not be added to the global character pool for now.
\n${text.length > 1 ? `:envelope_with_arrow: **Approver Notes**: ${text}\n\u200B` : ""}`,
                    embeds: [cleanEmbed]
                })
                message.react("✅");
            }
        });


    }
}
module.exports.help = {
    name: ["status"],
    dm: false
}