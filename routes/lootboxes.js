module.exports.loots = {
    wishlist_slot: {
        id: "wishlist_slot",
        name: "Wishlist slot",
        plural: "Wishlist slots",
        description: "An additional slot for your character wish list.",
        weight: 15,
        max_amount: 2,
        emote: "🌠"
    },
    super_roll: {
        id: "super_roll",
        name: "Super roll",
        plural: "Super rolls",
        description: "A super roll has a 25% chance of rolling someone from your wish list.",
        weight: 50,
        min_amount: 2,
        max_amount: 5,
        emote: "🪄"
    },
    roll: {
        id: "roll",
        name: "Roll token",
        plural: "Roll tokens",
        description: "Bonus rolls to use whenever you want to.",
        weight: 200,
        min_amount: 10,
        max_amount: 25,
        emote: "🪙"
    },
    perma_roll: {
        id: "perma_roll",
        name: "Permanent roll",
        plural: "Permanent rolls",
        description: "An additional roll to spend every hour.",
        weight: 5,
        max_amount: 1,
        emote: "✨"
    },
    badge: {
        id: "badge",
        name: "Profile badge",
        plural: "Profile badges",
        description: "A permanent badge for your profile.",
        weight: 1,
        max_amount: 1,
        emote: "🛡️"
    }
};

var weighted = [].concat(...Object.values(this.loots).map((obj) => Array(Math.ceil(obj.weight)).fill(obj)));
var totalWeight = weighted.length;

module.exports.getLoot = function getLoot() {
    var boxes = 1 + Math.round(Math.random())
    var myLoot = {};
    for (var i = 0; i < boxes; i++) {
        var newItem = getItem();
        if (newItem.id in myLoot) {
            myLoot[newItem.id].amount += newItem.amount;
        } else {
            myLoot[newItem.id] = newItem.item;
            myLoot[newItem.id].amount = newItem.amount;
        }
    }
    return myLoot;
}

function getItem() {
    var item = weighted[Math.floor(Math.random() * totalWeight)];
    var min = item.min_amount ? item.min_amount : 1;
    return {
        id: item.id,
        item: item,
        amount: Math.floor(Math.random() * (item.max_amount - min)) + min
    };
}


module.exports.getUserLoot = function getUserLoot(id, bypassCache = false) {
    return new Promise(function (resolve, reject) {
        if (userCache[id] && !bypassCache)
            if (userCache[id].loot) return resolve(userCache[id].loot);

        connection.query(`SELECT id,loots,lootboxes FROM users WHERE id = ${id}`, function (err, result) {
            if (err) {
                reject(err);
                throw err;
            }

            var myLoot = [];
            var myLootCount = 1;
            if (result.length > 0) {
                if (result[0].loots)
                    myLoot = JSON.parse(result[0].loots);
                myLootCount = result[0].lootboxes;
            }

            var lootdata = {
                map: createLootMap(myLoot),
                loot: myLoot,
                count: myLootCount
            }

            //create usercache for this user
            if (!userCache[id]) userCache[id] = {};
            userCache[id].loot = lootdata;

            resolve(lootdata);
        })
    });
}

function createLootMap(myLoot) {
    var mappedLoot = {};
    Object.values(LootManager.loots).forEach(loot => {
        let index = utils.findWithAttr(myLoot, "id", loot.id);
        mappedLoot[loot.id] = index === -1 ? 0 : myLoot[index].amount;
    })

    return mappedLoot;
}

module.exports.addUserLoot = function addUserLoot(id, username, gainedLoots) {
    this.getUserLoot(id).then(res => {
        var myLoot = res.loot;

        //add all gained loot
        gainedLoots.forEach(loot => {
            if (!myLoot.some(l => l.id === loot.id))
                myLoot.push({
                    id: loot.id,
                    amount: loot.amount
                })
            //increase amount if user already got this
            else myLoot[utils.findWithAttr(myLoot, "id", loot.id)].amount += loot.amount;
        })

        var query = `
                    INSERT INTO users (id, username, characters, loots, lootboxes)
                    VALUES (${id}, ${connection.escape(username)}, "[]", ${connection.escape(JSON.stringify(myLoot))}, 0) 
                    ON DUPLICATE KEY UPDATE 
                    username = ${connection.escape(username)}, 
                    loots = ${connection.escape(JSON.stringify(myLoot))},
                    lootboxes = ${res.count-1}`;

        connection.query(query, function (err, result) {
            if (err) throw err;

            //force cache update
            LootManager.getUserLoot(id, true);
        })
    })
}

module.exports.removeUserLoot = function removeUserLoot(id, loot, amount = 1) {
    this.getUserLoot(id).then(res => {
        res.loot[utils.findWithAttr(res.loot, "id", loot)].amount -= amount;

        connection.query(`UPDATE users SET loots = ${connection.escape(JSON.stringify(res.loot))}`, function (err, res) {
            //force cache update
            LootManager.getUserLoot(id, true);
        })
    });
}

module.exports.getUserLootCount = function getUserLootCount(id, loot) {
    return new Promise(function (resolve, reject) {
        LootManager.getUserLoot(id).then(res => {
            console.log(res.map)
            resolve(res.map[loot]);
        });
    });
}