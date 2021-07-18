module.exports.run = async (bot, message, args) => {

    message.author.send(help);
    message.react("📫")
}

var help = new Discord.MessageEmbed()
    .setColor("#fff8f7")
    .setTitle("Gacha")
    .addField(
        "Commands 💵",
        `**-roll** Roll a random character to claim
        **-mm [user]** Check your claimed characters
        **-im <character>** Search for a character
        **-top [page]** See the most claimed characters
        **-profile [user]** Check your profile stats
        **-suggest** Suggest a character and get a reward
        \u200B`)
    .addField(
        "Flags 🚩",
        `*Add these flags to commands to sort your claimed characters and show additional info about them, for example **-mma**.*
        \u200B
        **a (amount)** Shows how many times you have claimed the character
        **n (name)** Sorts the characters by their name
        **r (rank)** Shows the characters claim rank
        `)

module.exports.help = {
    name: ["help"]
}