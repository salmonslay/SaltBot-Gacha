module.exports.run = async (bot, message, args) => {
    if (!utils.hasRole(message.author.id, "trusted")) return;

    //query user searched for
    var id = parseInt(args[0]);
    var item = args[1];
    var count = args[2];
    if (!isNaN(id)) {
        if (item == "loot") {
            connection.query(`UPDATE users SET lootboxes = lootboxes + ${count} WHERE id = ${id}`, function (err, result) {
                if (err) throw err;
                message.react("✅");
            });
        }
    }

}
module.exports.help = {
    name: ["grant"],
    dm: true
}