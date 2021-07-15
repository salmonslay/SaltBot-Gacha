module.exports.createTables = function createTables() {
    connection.query(`
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(32) NOT NULL,
        username TEXT,
        characters TEXT,
        hasClaimed TINYINT(1) DEFAULT 0,
        totalCharacters MEDIUMINT DEFAULT 0,
        uniqueCharacters MEDIUMINT DEFAULT 0,
        primary key (id)
    )
    `);
}