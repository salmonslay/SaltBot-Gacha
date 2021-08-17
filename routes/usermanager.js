module.exports.getWishlist = function getWishlist(id) {
    return new Promise(function (resolve, reject) {
        connection.query(`SELECT id,wishlist,characters FROM users WHERE id = ${id}`, function (err, result) {
            if (err) {
                reject(err);
                throw err;
            }

            var wishlist = [];
            var characters = [];
            //wishlist already created
            if (result.length > 0 && result[0].wishlist != null) wishlist = JSON.parse(result[0].wishlist);
            if (result.length > 0 && result[0].characters != null) characters = JSON.parse(result[0].characters);

            var fixedWishlist = [];
            for (let i = 0; i < wishlist.length; i++) {
                var entry = gacha.characterMap[wishlist[i].id];

                if (entry) {
                    var wish = wishlist[i];
                    wish.name = entry.name;
                    wish.owned = characters.some(char => char.id == wish.id);
                    wish.text = `${wish.name} ${wish.lock ? "🔒" : ""} ${characters.some(char => char.id == wish.id) ? "✅" : ""}`

                    fixedWishlist.push(wish);
                }
            }
            resolve(fixedWishlist);
        })
    })
}