module.exports.run = async (bot, message, args) => {
    connection.query(`SELECT id,wishlist,characters FROM users WHERE id = ${message.author.id}`, function (err, result) {
        var wishlist = [];
        var characters = [];
        //wishlist already created
        if (result.length > 0 && result[0].wishlist != null) wishlist = JSON.parse(result[0].wishlist);
        if (result.length > 0 && result[0].characters != null) characters = JSON.parse(result[0].characters);

        characters.forEach(myCharacters => {
            wishlist = wishlist.filter(function (wish) {
                return wish.id != myCharacters.id;
            });
        });

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
    name: ["wishpurge", "wp"],
    dm: true
}