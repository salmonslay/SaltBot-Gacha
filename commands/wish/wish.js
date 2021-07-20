module.exports.run = async (bot, message, args) => {
    this.parseCharacters(message, args, false);
}

module.exports.parseCharacters = function parseCharacters(message, args, autodel) {
    //args found, add to wl
    if (args.length > 0) {
        var characterNames = args.join(" ").split("$");
        var characters = [];
        var invalid;
        characterNames.forEach(char => {
            var result = utils.findCharacter(char);
            if (result.best) characters.push(result.best);
            else {
                invalid = char;
                return;
            }
        })
        if (characters.length > 0 && !invalid) this.addWish(message, characters, autodel);
        else message.channel.send(`${message.author.toString()}, character **${invalid}** could not found.`);
        //no args found, send help
    } else {
        var embed = new Discord.MessageEmbed()
            .setTitle("Wishlisting")
            .setDescription(`**Syntax**: -wish <character(s)>\n
        Wishlisted characters will increase your odds of rolling them.\nIf you want to add multiple characters, separate them with a $.\n
        **-wishlist [user]** will show your wishlist\n**-wishremove <character(s)>** will remove a character from your wishlist\n**-wishd <character(s)>** will wishlist a character and remove the message\n**-wishpurge** will remove all wishlisted characters that you already own`)

        message.channel.send(embed);
    }
}

module.exports.addWish = function addWish(message, characters, autodel) {
    connection.query(`SELECT id,wishlist FROM users WHERE id = ${message.author.id}`, function (err, result) {
        if (err) throw err;
        var wishlist = [];
        //wishlist already created
        if (result.length > 0 && result[0].wishlist != null) wishlist = JSON.parse(result[0].wishlist);

        characters.forEach(char => {
            if (wishlist.length < config.counts.wishlistSlots && !wishlist.some(wl => wl.id === char.id)) wishlist.push({
                id: char.id,
                lock: false
            })
        })

        var query = `
                INSERT INTO users (id, username, characters, wishlist)
                VALUES (${message.author.id}, ${connection.escape(message.author.username)}, "[]", ${connection.escape(JSON.stringify(wishlist))}) 
                ON DUPLICATE KEY UPDATE 
                username = ${connection.escape(message.author.username)}, 
                wishlist = ${connection.escape(JSON.stringify(wishlist))}`;

        connection.query(query, function (err, result) {
            if (err) throw err;

            if (autodel) message.delete();
            else message.react("✅")
        })
    })
}
module.exports.help = {
    name: ["wish", "wishadd", "wishlistadd", "addwish", "wladd"],
    dm: true
}