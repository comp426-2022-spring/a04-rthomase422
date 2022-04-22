const database = require('better-sqlite3')

const logdb = new database('log.db')
const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and 'access';`)
let row = stmt.get();

if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')

    const sqlInit = `
        CREATE TABLE access ( id INTEGER PRIMARY KEY, remote-addr VARCHAR, remote-user VARCHAR, datetime VARCHAR, method VARCHAR, url VARCHAR, http-version NUMERIC, status INTEGER, content-length NUMERIC)
    `

    logdb.exec(sqlInit)
} else {
    console.log('Log database exists.')
}

module.exports = logdb