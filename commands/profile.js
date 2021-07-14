module.exports.run = async (bot, message, args) => {

    let target = message.mentions.users.first() || message.author;

    connection.query(`SELECT characters FROM users WHERE id = '${target.id}'`, function (err, result) {
        if (err) throw err;
        else {
            var unique = 0;
            var total = 0;
            var header = "https://i.imgur.com/ILbATq4.jpg";
            //user found
            if (result.length > 0) {
                var characters = JSON.parse(result[0].characters);
                if (characterMap[characters[0]])
                    header = characterMap[characters[0].id.toString()].image;
                characters.forEach(char => {
                    unique++;
                    total += char.amount;
                })
            }

            var dupes = total == 0 ? 100 : Math.round((total - unique) / total * 100);

            var characterEmbed = new Discord.MessageEmbed()
                .setAuthor(target.username, target.displayAvatarURL({
                    format: 'png',
                    dynamic: true,
                    size: 256
                }))
                .setThumbnail(header)
                .setDescription(`
                **Total characters**: ${total}
                
                **Unique characters**: ${unique} (${100-dupes}%)
                **Duplicate characters**: ${total-unique} (${dupes}%)
                
                ${roles.dev.includes(target.id) ? "<:developer:864950526549426216>" : ""} ${roles.trusted.includes(target.id) ? "<:trusted:864950543562833940>" : ""}
                `)

            message.channel.send(characterEmbed)
        }
    })
}
module.exports.help = {
    name: ["profile", "pr"]
}