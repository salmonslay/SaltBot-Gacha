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