module.exports.hasRole = function hasRole(id, role) {
    if (userCache[id.toString()])
        if (userCache[id.toString()].roles.includes(role))
            return true;
    return false;
}