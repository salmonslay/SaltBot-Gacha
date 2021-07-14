module.exports.run = async (bot, message, args) => {
    var id = message.author.id.toString();
    var date = new Date();
    var thisInterval = `${date.getDay()}-${date.getHours()}`;

    //user exists in cache
    if (userCache[id]) {
        //reset rolls if user haven't rolled this hour
        if (userCache[id].lastInterval != thisInterval) userCache[id].rolls = 10;
        if (userCache[id].rolls > 0) {
            userCache[id].rolls--;
            userCache[id].lastInterval = thisInterval;
            roll(message, userCache[id].rolls, characters[Math.floor(Math.random() * characters.length)]);
        } else {
            var minutesLeft = 59 - date.getMinutes();
            message.channel.send(`You're out of rolls ${message.author}! Your rolls will reset in **${minutesLeft} ${minutesLeft == 1 ? "minute" : "minutes"}**.`)
        }
        //user does not exist in cache
    } else {
        userCache[id] = {
            rolls: 9,
            lastInterval: thisInterval
        }
        roll(message, 9, characters[Math.floor(Math.random() * characters.length)]);
    }
}

var roll = function (message, left, character) {
    var characterEmbed = new Discord.MessageEmbed()
        .setColor("GOLD")
        .setTitle(character.name)
        .setDescription(character.source)
        .setImage(character.image)
        .setThumbnail(`http://example.com/${character.id}`)
        .setFooter("React to claim! " + left)

    message.channel.send(characterEmbed).then(msg => {
        messageInfo[msg.id.toString()] = "roll";
    })
}

module.exports.roll = roll;
//Processes a claim reaction; checks if anyone was quicker, checks if claim is up etc
module.exports.processClaim = function processClaim(message, user, embed) {
    var regex = /http:\/\/example\.com\/(\d+)/;
    var claimedId = (embed.thumbnail.url.match(regex) || []).map(e => e.replace(regex, '$1'))[0];
    var claimedName = embed.title;
    if (!claimedIds.includes(message.id)) {

        connection.query(`SELECT hasClaimed,characters FROM users WHERE id = '${user.id}'`, function (err, result) {
            if (err) throw err;
            else {
                if (result.length == 0) tryClaim(user, claimedId, claimedName, "[]", message, embed);
                else if (result[0].hasClaimed == 0) tryClaim(user, claimedId, claimedName, result[0].characters, message, embed);
                else message.channel.send(`${user.toString()}, you have already claimed someone this hour!`)
            }
        });
    }
}

//Tries to actually claim a character after verifying in processClaim() that user got claim 
function tryClaim(user, characterID, characterName, myCharacters, message, embed) {
    if (!claimedIds.includes(message.id)) {
        claimedIds.push(message.id);

        message.channel.send(`**${user.username}** claimed **${characterName}:heart_exclamation:**`);


        var charArray = JSON.parse(myCharacters);
        var updated = false;

        //try to update existing entry
        for (var i = 0; i < charArray.length; i++) {
            if (charArray[i].id == characterID) {
                charArray[i].amount++;
                updated = true;
                break;
            }
        }

        //add new entry
        var character = characterMap[characterID.toString()]
        if (!updated) {
            console.log(character)
            charArray.push({
                "amount": 1,
                "id": characterID,
            })
        }
        var query = `INSERT INTO users VALUES (${user.id}, ${connection.escape(user.username)}, ${connection.escape(JSON.stringify(charArray))}, 1) 
                ON DUPLICATE KEY UPDATE username = ${connection.escape(user.username)}, characters = ${connection.escape(JSON.stringify(charArray))}, hasClaimed = 1;`;

        connection.query(query, function (err, result) {
            if (err) throw err;
            else {
                console.log(`${user.username} claimed ${characterName}`)
                const newEmbed = new Discord.MessageEmbed()
                    .setColor("#3D0000")
                    .setTitle(embed.title)
                    .setDescription(embed.description)
                    .setImage(embed.image.url)
                    .setThumbnail(embed.thumbnail.url)
                    .setFooter(`Belongs to ${user.username}`, user.displayAvatarURL({
                        format: 'png',
                        dynamic: true,
                        size: 256
                    }))

                message.edit(newEmbed)
            }
        });
    }
}


module.exports.help = {
    name: ["r", "roll", "ma", "m", "wa", "w", "ha", "h"]
}