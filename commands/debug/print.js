module.exports.run = async (bot, message, args) => {
    if (!utils.hasRole(message.author.id, "trusted")) return;
    console.log(userCache)

}
module.exports.help = {
    name: ["print"],
    dm: true
}