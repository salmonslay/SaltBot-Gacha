module.exports.run = async (bot, message, args) => {
    var args = args.join(' ').split('$');
    var name = args[0];
    var source = args[1];
    var free = args.slice(2).join(' ');
    if (args[0].trim() == '' && args.length == 1) {
        var help = new Discord.MessageEmbed()
            .setTitle("Suggest a character")
            .setDescription(`**Syntax**: -suggest <name>$<source>$[note]
        \n:exclamation: Important: __Attach__ an image to your suggestion message :exclamation:
        \n**name**: An official name for the character.\n**source**: The character source, use __romanji__ for Japanese titles.\n**note**: Free text to make it easier to verify and add the character, preferrebly a source link.\n**image**: Attach an image in 2:3 aspect ratio, or 225x350px.
        \n**Example submission:**
        `)
            .setImage("https://i.imgur.com/odWAEk7.png")

        message.channel.send({
            embeds: [help]
        })
    } else if (message.attachments.size > 0 && args.length > 1) {
        var image = (message.attachments).array()[0].url;

        var embed = new Discord.MessageEmbed()
            .setColor("#fff8f7")
            .setAuthor(`Suggested by ${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
            .setTitle(name)
            .setDescription(source)
            .setImage(`${image}#${message.author.id}`)
            //.addField("Message", `${message}\n${attachments}`)
            .setFooter(free)
        message.channel.send({
            content: 'This is your submission. Edit it if you feel like, or **react with :airplane:** to submit it.',
            embeds: [embed],
        }).then(msg => {
            gacha.messageInfo[msg.id] = {
                type: "suggestion",
                sent: false
            };
            msg.react('✈');
        })
    } else {
        message.channel.send(`Something went wrong trying to create your submission. Write **-suggest** if you need help.`);
    }
}

//Processes a claim reaction; checks if anyone was quicker, checks if claim is up etc
module.exports.submit = function submit(message, embed) {
    if (!gacha.messageInfo[message.id].sent) {
        gacha.messageInfo[message.id].sent = true;
        var userID = embed.image.url.split("#")[1];
        var suggestion = new Discord.MessageEmbed()
            .setAuthor(embed.author.name, embed.author.iconURL)
            .setTitle(embed.title)
            .setDescription(embed.description)
            .setImage(embed.image.url)
            .addField("Dev-link", `http://localhost:3000/add?name=${encodeURIComponent(embed.title)}&source=${encodeURIComponent(embed.description)}&pic=${encodeURIComponent(embed.image.url)}`)
            .setFooter(embed.footer.text);

        bot.channels.cache.get(config.channels.suggestions).send({
            content: `${embed.author.name}\n<@${userID}> ${userID}`,
            embeds: [suggestion],
        })
        message.channel.send(`Thank you for your suggestion! We will try to get back to you soon.`)
    }
}
module.exports.help = {
    name: ["suggest", "suggestion"],
    dm: true
}