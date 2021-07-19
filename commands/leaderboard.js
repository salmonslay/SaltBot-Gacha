module.exports.run = async (bot, message, args) => {
    let flag = args[0].replace("-lb", "").toLowerCase();
    checkData(message, parseInt(args[0]), false, flag)
}
var usersCache = {};
var lastCache = null;

function checkData(message, page, edit, flag) {
    if ((Date.now() - lastCache > 1000 * 60 * 60) || !lastCache) {
        connection.query(`SELECT id,username,totalCharacters,uniqueCharacters FROM users ORDER BY uniqueCharacters DESC LIMIT 15000`, function (err, result) {
            if (err) throw err;
            usersCache["uniqueCharacters"] = result;
            connection.query(`SELECT id,username,totalCharacters,uniqueCharacters FROM users ORDER BY totalCharacters DESC LIMIT 15000`, function (err, result) {
                if (err) throw err;
                usersCache["totalCharacters"] = result;
                lastCache = Date.now();
                createEmbed(message, page, edit, flag)
            })
        })
    } else {
        createEmbed(message, page, edit, flag)
    }
}

function createEmbed(message, page, edit, flag) {
    var pageList = "";
    var mode = flag == "t" ? "totalCharacters" : "uniqueCharacters"
    var data = usersCache[mode];
    //try to take page from user
    if (Number.isNaN(page)) page = 1;

    //check if out of range
    else if (page > 1000) page = 1;
    else if (page < 1) page = 1000;

    //check if characters are enough, else take last page
    if (page * 15 > data.length) page = Math.round(data.length / 15)

    for (var i = (page - 1) * 15; i < (page - 1) * 15 + 15; i++) {
        if (data[i])
            pageList += `**#${i+1}** - ${data[i].username}: **${data[i][mode]}**\n`;
    }


    var topEmbed = new Discord.MessageEmbed()
        .setColor("DARK_RED")
        .setTitle(`Top ${flag == "t" ? "total" : "unique"} characters`)
        .setDescription(pageList)
        .setFooter(`Page ${page}`)

    if (!edit)
        message.channel.send(topEmbed).then(msg => {
            msg.react("⬅️").then(() => msg.react("➡️"))
            messageInfo[msg.id] = {
                type: "top",
                page: page,
                flag: flag
            };
        })
    else message.edit(topEmbed);
}


//gets an existing top-embed and changes page on it
module.exports.setPage = function (message, embed, reaction) {
    var currentPage = messageInfo.page;
    var flag = messageInfo.flag;
    if (reaction._emoji.name == "⬅️") currentPage--;
    else if (reaction._emoji.name = "➡️") currentPage++;

    createEmbed(message, currentPage, true, flag)
}



module.exports.help = {
    name: ["lb"]
}