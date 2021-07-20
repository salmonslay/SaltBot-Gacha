module.exports.run = async (bot, message, args) => {
    createEmbed(message, parseInt(args[0]), false)
}

function createEmbed(message, page, edit) {
    var pageList = "";

    //try to take page from user
    if (Number.isNaN(page)) page = 1;

    //check if out of range
    else if (page > 1000) page = 1;
    else if (page < 1) page = 1000;

    //check if characters are enough, else take last page
    if (page * 15 > characters.length) page = Math.round(characters.length / 15)

    for (var i = (page - 1) * 15; i < (page - 1) * 15 + 15; i++) {
        if (characters[i])
            pageList += `**#${i+1}** - **${characters[i].name}** - ${characters[i].source}\n`;
    }


    var topEmbed = new Discord.MessageEmbed()
        .setColor("DARK_RED")
        .setTitle(`Top characters`)
        .setDescription(pageList)
        .setThumbnail(`${characters[(page-1) * 15].image}`)
        .setFooter(`Page ${page}`)

    if (!edit)
        message.channel.send(topEmbed).then(msg => {
            msg.react("⬅️").then(() => msg.react("➡️"))
            messageInfo[msg.id] = {
                type: "top",
                page: page
            };
        })
    else {
        messageInfo[message.id].page = page;
        message.edit(topEmbed);
    }


}

//gets an existing top-embed and changes page on it
module.exports.setPage = function (message, embed, reaction) {
    var currentPage = messageInfo[message.id].page;

    if (reaction._emoji.name == "⬅️") currentPage--;
    else if (reaction._emoji.name = "➡️") currentPage++;

    createEmbed(message, currentPage, true)
}



module.exports.help = {
    name: ["top"],
    dm: true
}