//processes a main command (-mm)
module.exports.run = async (bot, message, args) => {
    var fixedCharacters = [
        []
    ];
    let target = message.mentions.users.first() || message.author;
    let flag = args[0].replace("-mm", "");
    connection.query(`SELECT characters FROM users WHERE id = '${target.id}'`, function (err, result) {
        if (err) throw err;
        else {
            if (result.length > 0 && result[0].characters != "[]") {
                var myCharacters = [];
                JSON.parse(result[0].characters).forEach(char => {
                    var entry = characterMap[char.id];
                    if (entry) {
                        entry.amount = char.amount;
                        myCharacters.push(entry);
                    }
                })
                myCharacters = sortData(myCharacters, flag);

                for (var i = 0; i < myCharacters.length; i++) {
                    if (fixedCharacters.length == (i - (i % 15)) / 15) fixedCharacters.push([]);

                    var prefix = `${(flag.includes("r")) ? `**#${myCharacters[i].likeRank}**` : ""}`
                    var suffix = `${(flag.includes("a")) ? `**${myCharacters[i].amount}**x` : ""}`
                    fixedCharacters[(i - (i % 15)) / 15].push(`${prefix} ${myCharacters[i].name} ${suffix}`);
                }
                if (myCharacters.length > 0)
                    createEmbed(target, fixedCharacters[0], message, fixedCharacters, characterMap[myCharacters[0].id.toString()].image);
                else
                    createEmbed(target, ["*So empty ~*"], message, fixedCharacters, "https://i.imgur.com/ILbATq4.jpg");

            } else {
                createEmbed(target, ["*So empty ~*"], message, fixedCharacters, "https://i.imgur.com/ILbATq4.jpg");
            }
        }
    });
}
// characterMap[myCharacters[i].id].likeRank
/* 

DATA SORT

*/

//Starts data sorting after flag
function sortData(data, flag) {

    //name (a -> b -> c)
    if (flag.includes("n") && !flag.includes("n-"))
        return data.sort(dynamicSort("name"))

    //name reversed (c -> b -> a)
    else if (flag.includes("n-"))
        return data.sort(dynamicSort("name")).reverse()

    //rank (1 -> 2 -> 3)
    else if (flag.includes("r") && !flag.includes("r-"))
        return data.sort(dynamicSort("likeRank"))

    //rank reversed (3 -> 2 -> 1)
    else if (flag.includes("r-"))
        return data.sort(dynamicSort("likeRank")).reverse()

    //amount  (3 -> 2 -> 1)
    else if (flag.includes("a") && !flag.includes("a-"))
        return data.sort(dynamicSort("amount")).reverse()

    //amount reversed (1 -> 2 -> 3)
    else if (flag.includes("a-"))
        return data.sort(dynamicSort("amount"))

    else
        return data;
}


//Sorts data by property
function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

/* 

EMBEDS

*/

//Creates and sends a harem embed
function createEmbed(user, data, message, fixedCharacters, link) {
    var characterEmbed = new Discord.MessageEmbed()
        .setColor("DARK_RED")
        .setTitle(`${user.username}'s harem`)
        .setDescription(data)
        .setThumbnail(`${link}#${user.id}#0`)
        .setFooter(`Page 1/${fixedCharacters.length}`)
    message.channel.send(characterEmbed).then(msg => {
        if (fixedCharacters.length > 1) msg.react("⬅️").then(() => msg.react("➡️"))
        messageInfo[msg.id.toString()] = "mm";
        haremCache[msg.id] = fixedCharacters;
    })
}

//Updates harem embed
module.exports.updatePage = function updatePage(message, user, embed, reaction) {
    var regex = /jpg#(\d+)#(\d+)/;
    var data = (embed.thumbnail.url.match(regex) || []).map(e => e.replace(regex, '$1'));
    var userID = data[1];
    var currentPage = data[2];
    var oldPage = currentPage;
    var characters = haremCache[message.id];

    if (reaction._emoji.name == "⬅️") currentPage--;
    else if (reaction._emoji.name = "➡️") currentPage++;
    
    if (currentPage == -1) currentPage = characters.length - 1;
    else if (currentPage == characters.length) currentPage = 0;

    var newEmbed = new Discord.MessageEmbed()
        .setColor("DARK_RED")
        .setTitle(embed.title)
        .setDescription(characters[currentPage])
        .setFooter(`Page ${currentPage+1}/${characters.length}`)
        .setThumbnail(embed.thumbnail.url.replace(`${userID}#${oldPage}`, `${userID}#${currentPage}`))

    message.edit(newEmbed)
}


module.exports.help = {
    name: ["mm", "harem", "characters", "mym"]
}