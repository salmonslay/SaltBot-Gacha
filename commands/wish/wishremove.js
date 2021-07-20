module.exports.run = async (bot, message, args) => {
    var characterNames = args.join(" ").split("$");
    var characters = [];
    characterNames.forEach(char => {
        var result = utils.findCharacter(char);
        if (result.best) characters.push(result.best.id);
    })
    this.removeWish(message, characters);
}

module.exports.removeWish = function removeWish(message, characters) {
    connection.query(`SELECT id,wishlist FROM users WHERE id = ${message.author.id}`, function (err, result) {
        if (err) throw err;
        var wishlist = [];
        //wishlist already created
        if (result.length > 0 && result[0].wishlist != null) wishlist = JSON.parse(result[0].wishlist);

        characters.forEach(id => {
            wishlist = wishlist.filter(function (wish) {
                return wish.id != id;
            });
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
    name: ["wishremove", "wishdelete", "wr"],
    dm: true
}