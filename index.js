/*
page structure

var namePage = {
    html: (

    ),
    css: `

    `,
    init() {

    }
}
*/


var secondPage = {
    html: (
        <Page icon="search.png">

        </Page>
    )
}

var thirdPage = {
    html: (
        <Page icon="trash.png">

        </Page>
    )
}

pages = [homePage, secondPage, thirdPage]

document.body.scrollTo(0, 0)

window.onresize = e => {
    if(pageContainer == undefined) return;
    
    pageContainer.pages[pageContainer.positionOffset].page.scrollIntoView({ block: "end" })
}

async function init() {    
    SQL = await initSqlJs({ locateFile: filename => `sql-wasm.wasm` })

    db = await initDB()

    await sendQuery(`CREATE TABLE IF NOT EXISTS cityCodes ('cityCode' VARCHAR)`)

    await sendQuery(`INSERT INTO cityCodes SELECT '2145461' WHERE NOT EXISTS(SELECT 1 FROM cityCodes WHERE cityCode = '2145461')`)

    ReactDOM.render(<Body />, document.getElementById("root"));

}

init()

async function initDB() {
    if(await caches.has("database")) {
        var cache = await caches.open("database")
        var buf = JSON.parse(await (await cache.match("database")).text())

        return await new SQL.Database(new Uint8Array(buf));
    }
    else {
        return await new SQL.Database()
    }
}

async function exportDB() {
    var cache = await caches.open("database")
    
    await cache.delete("database")

    var buf = db.export()

    buf = Array.from(buf);

    await cache.put("database", new Response(JSON.stringify(buf)))
}

async function sendQuery(query) {
    if(!db) {
        db = await initDB()
    }

    var rows = db.exec(query)[0]
    var newRows = []

    exportDB();

    if(!rows) return newRows;
    if(rows.length <= 0) return newRows

    for(var values of rows.values) {
        var obj = {}

        for(var i in values) {
            obj[rows.columns[i]] = values[i];
        }
        
        newRows.push(obj)
    }

    return newRows
}

function genID(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz-=[];,./_+{}|:<>?~!@#$%^&*()0123456789"
    var id = ""
    for(var i = 0; i < length; i++) {
        var char = chars[Math.floor(Math.random() * chars.length)]
        id += (Math.random() < 0.5 ? char : char.toUpperCase())
    }

    return id;
}