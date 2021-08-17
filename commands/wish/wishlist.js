module.exports.run = async (bot, message, args) => {
    let target = message.mentions.users.first() || message.author;

    UserManager.getWishlist(target.id).then(wishlist => {
        var characterList = "";

        wishlist.forEach(wish => {
            characterList += `${wish.text}\n`;
        })

        var wishlist = new Discord.MessageEmbed()
            .setTitle(`${target.username}'s wishlist (${wishlist.length}/${config.counts.wishlistSlots})`)
            .setDescription(characterList == "" ? "*Empty~*" : characterList);

        message.channel.send({
            embeds: [wishlist]
        });
    })
}

module.exports.help = {
    name: ["wl", "wishlist"],
    dm: true
}