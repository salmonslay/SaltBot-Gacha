module.exports.loots = {
    wishlist_slot: {
        id: "wishlist_slot",
        name: "Wishlist slot",
        plural: "Wishlist slots",
        description: "An additional slot for your character wishlist.",
        weight: 10,
        max_amount: 2,
        emote: "🌠"
    },
    superroll: {
        id: "superroll",
        name: "Super roll",
        plural: "Super rolls",
        description: "A super roll have 25% chance of rolling someone from your wishlist.",
        weight: 50,
        max_amount: 5,
        emote: "🪄"
    },
    roll: {
        id: "roll",
        name: "Roll token",
        plural: "Roll tokens",
        description: "Bonus rolls to use whenever you want to.",
        weight: 200,
        max_amount: 20,
        emote: "🪙"
    },
    permaroll: {
        id: "permaroll",
        name: "Permanent roll",
        plural: "Permanent rolls",
        description: "An additional roll to spend every hour.",
        weight: 10,
        max_amount: 1,
        emote: "✨"
    },
    badge: {
        id: "badge",
        name: "Profile badge",
        plural: "Profile badges",
        description: "A permanent badge on your profile.",
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
    return {
        id: item.id,
        item: item,
        amount: Math.floor(Math.random() * item.max_amount) + 1
    };
}