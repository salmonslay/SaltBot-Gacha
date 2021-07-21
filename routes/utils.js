module.exports.hasRole = function hasRole(id, role) {
    if (userCache[id.toString()])
        if (userCache[id.toString()].roles.includes(role))
            return true;
    return false;
}

module.exports.getBadges = function getBadges(id) {
    if (userCache[id.toString()]) {
        var badges = "";
        var roles = userCache[id.toString()].roles
        if (roles.includes("trusted")) badges += "<:trusted:864950543562833940> ";
        if (roles.includes("dev")) badges += "<:developer:864950526549426216> ";
        return badges;
    } else return "";
}

//get a random character with wishlist odds
module.exports.generateCharacter = function generateCharacter(user) {
    if (userCache[user.id]) {
        var wishlist = userCache[user.id].wishlist;
        if (wishlist.length / characters.length * config.counts.wishlistOdds > Math.random()) {
            var wishedCharacter = characterMap[wishlist[Math.floor(Math.random() * wishlist.length)].id];
            if (wishedCharacter){}
                return wishedCharacter;
        }
    }

    return characters[Math.floor(Math.random() * characters.length)];
}

module.exports.findCharacter = function findCharacter(query) {
    query = query.toLowerCase().replace(/(\r\n|\n|\r)/gm, "").trim();

    //list of potential matches
    var matches = [];
    //list of matches where name is raw
    var secondaryMatches = [];
    //character with exact matching name
    var exactMatch;
    //exact or highest rated potential
    var bestGuess;

    ///Checks through all characters till a direct match is found
    characters.some(char => {
        var parsedName = char.name.toLowerCase();
        var rawName = char.rawName.toLowerCase().replace(",", "");
        if (parsedName == query || rawName == query || char.nativeName == query) { //direct match found
            exactMatch = char;
            return true;
        } else if (parsedName.startsWith(query) || char.nativeName.startsWith(query)) matches.push(char);
        else if (rawName.startsWith(query)) secondaryMatches.push(char);
    })

    if (typeof exactMatch != "undefined") bestGuess = exactMatch;
    else if (matches.length == 1) bestGuess = matches[0];
    else if (matches.length == 0 && secondaryMatches.length > 0) bestGuess = secondaryMatches[0];

    var text = `Matches for **${query}**:\n\n`;
    for (var i = 0; i < matches.length; i++) {
        text += `**${matches[i].name}** - ${matches[i].source}\n`;
        if (i == 25) {
            text += `\nAnd __${matches.length-25}__ more...`
            break;
        }
    }

    return {
        query: query,
        matches: matches,
        secondary: secondaryMatches,
        exact: exactMatch,
        best: bestGuess,
        text: text
    }
}