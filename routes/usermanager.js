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

module.exports.getLoots = function getLoots(id) {
    return new Promise(function (resolve, reject) {
        connection.query(`SELECT id,loots,lootboxes FROM users WHERE id = ${id}`, function (err, result) {
            if (err) {
                reject(err);
                throw err;
            }

            var myLoot = [];
            var mappedLoot = {};
            var myLootCount = 0;
            if (result.length > 0 && result[0].loots) {
                myLoot = JSON.parse(result[0].loots);
                myLootCount = result[0].lootboxes;
            }

            Object.values(LootManager.loots).forEach(loot => {
                let index = utils.findWithAttr(myLoot, "id", loot.id);
                mappedLoot[loot.id] = index === -1 ? 0 : myLoot[index].amount;
            })

            resolve({
                map: mappedLoot,
                loot: myLoot,
                count: myLootCount
            })
        })
    });
}