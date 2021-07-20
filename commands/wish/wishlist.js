module.exports.run = async (bot, message, args) => {
    let target = message.mentions.users.first() || message.author;

    connection.query(`SELECT id,wishlist,characters FROM users WHERE id = ${target.id}`, function (err, result) {
        var wishlist = [];
        var characters = [];
        //wishlist already created
        if (result.length > 0 && result[0].wishlist != null) wishlist = JSON.parse(result[0].wishlist);
        if (result.length > 0 && result[0].characters != null) characters = JSON.parse(result[0].characters);

        var characterList = "";
        wishlist.forEach(wish => {
            characterList += `${characterMap[wish.id].name} ${wish.lock ? "🔒" : ""} ${characters.some(char => char.id == wish.id) ? "✅" : ""}\n`
        })

        var wishlist = new Discord.MessageEmbed()
            .setTitle(`${target.username}'s wishlist`)
            .setDescription(characterList == "" ? "*Empty~*" : characterList);

        message.channel.send(wishlist);
    })
}

module.exports.help = {
    name: ["wl", "wishlist"]
}