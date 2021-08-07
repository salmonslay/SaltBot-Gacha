module.exports.run = async (bot, message, args) => {

    message.author.send({
        embeds: [help]
    });
    message.react("📫")
}

var help = new Discord.MessageEmbed()
    .setColor("#fff8f7")
    .setTitle("Gacha")
    .addField(
        "Rolling 💵",
        `**-roll** Roll a random character to claim
**-mm [user]** Check your claimed characters
**-im <character>** Search for a character
**-top [page]** See the most claimed characters
**-profile [user]** Check your profile stats
**-suggest** Suggest a character and get a reward
\u200B`)
    .addField(
        "Wishlisting 🌟",
        `**-wish <character(s)>** will give you higher odds of rolling them
**-wishlist [user]** will show your wishlist
**-wishremove <character(s)>** will remove a character from your wishlist
**-wishd <character(s)>** will wishlist a character and then delete the message
**-wishpurge** will remove all wishlisted characters that you already own
\u200B`
    )
    .addField(
        "Loot boxes 📦",
        `**-loot** will open a loot box
**-myloot [user]** will show your gained loot
**-lootinfo** will show info about all available loots and how to get them
\u200B`
    )
    .addField(
        "Flags 🚩",
        `*Add these flags to commands to sort your claimed characters and show additional info about them, for example **-mma**.*
\u200B
**a (amount)** Shows how many times you have claimed the character
**n (name)** Sorts the characters by their name
**r (rank)** Shows the characters claim rank
`)

module.exports.help = {
    name: ["help"],
    dm: true
}