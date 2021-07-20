module.exports.run = async (bot, message, args) => {
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
    if (characters.length > 0 && !invalid) this.addWish(message, characters);
    else message.channel.send(`${message.author.toString()}, character **${invalid}** could not found.`);

}

module.exports.addWish = function addWish(message, characters) {
    connection.query(`SELECT id,wishlist FROM users WHERE id = ${message.author.id}`, function (err, result) {
        if (err) throw err;
        var wishlist = [];
        //wishlist already created
        if (result.length > 0 && result[0].wishlist != null) wishlist = JSON.parse(result[0].wishlist);

        console.log(wishlist)
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
            message.react("✅")
        })
    })
}
module.exports.help = {
    name: ["wish", "wishadd", "wishlistadd", "addwish", "wladd"]
}