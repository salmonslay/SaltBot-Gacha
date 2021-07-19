module.exports.createTables = function createTables() {
    connection.query(`
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(32) NOT NULL,
        username TEXT NOT NULL,
        characters TEXT NOT NULL,
        hasClaimed TINYINT(1) DEFAULT 0,
        totalCharacters MEDIUMINT DEFAULT 0,
        uniqueCharacters MEDIUMINT DEFAULT 0,
        roles TEXT,
        primary key (id)
    )
    `);
}