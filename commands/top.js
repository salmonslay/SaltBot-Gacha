var Discord = require("discord.js");
var config = require("../config.json");

module.exports.run = async (bot, message, args) => {
    createEmbed(message, parseInt(args[0]), false)
}

function createEmbed(message, page, edit) {
    var pageList = "";
    if (Number.isNaN(page) || page < 1) page = 1;
    else if (page > 1000) page = 1000;
    for (var i = (page - 1) * 15; i < (page - 1) * 15 + 15; i++) {
        pageList += `**#${i+1}** - **${characters[i].parsedName}** - ${characters[i].source}\n`;
    }


    var topEmbed = new Discord.MessageEmbed()
        .setColor("DARK_RED")
        .setTitle(`Top characters`)
        .setDescription(pageList)
        .setThumbnail(`${characters[(page-1) * 15].largeImage}#${page}`)
        .setFooter(`Page ${page}`)

    if (!edit)
        message.channel.send(topEmbed).then(msg => {
            msg.react("⬅️").then(() => msg.react("➡️"))
            messageInfo[msg.id.toString()] = "top";
        })
    else message.edit(topEmbed);
}

//gets an existing top-embed and changes page on it
module.exports.setPage = function (message, embed, reaction) {
    var regex = /jpg#(\d+)/;
    var data = (embed.thumbnail.url.match(regex) || []).map(e => e.replace(regex, '$1'));
    var currentPage = data[0];
    var oldPage = currentPage;
    if (reaction._emoji.name == "⬅️") currentPage--;
    else if (reaction._emoji.name = "➡️") currentPage++;

    if (currentPage < 1 || currentPage > 1000) return;
    createEmbed(message, currentPage, true)
}



module.exports.help = {
    name: ["top"]
}