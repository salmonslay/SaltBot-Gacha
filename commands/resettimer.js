module.exports.run = async (bot, message, args) => {

    connection.query(`update users set hasClaimed = 0 where id = ${message.author.id};`, function (err, result) {
        if (err) throw err;
        else {
            message.react("✅")
        }
    })
}
module.exports.help = {
    name: ["rt", "resettimer"],
    dm: true
}