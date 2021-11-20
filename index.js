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
var customPages = [];
var settingsCustomPage;

function doPages() {
    while(document.getElementsByName("customPage").length >= 1) {
        document.getElementsByName("customPage")[0].remove();
    }

    pages = []

    pages.push(homePage)

    updateCustomPages();

    if(pageContainer) {
        for(var i of pageContainer.pages) {
            i.addImg();
        }

        if(pageContainer.positionOffset <= pageContainer.pages.length) {
            
            pageContainer.pages[pageContainer.positionOffset].page.style.backgroundPosition = currentBackgroundPos
            pageContainer.pages[pageContainer.positionOffset].page.scrollIntoView({ behavior: "smooth", block: "end" })
            doSelected(pageContainer.pages[pageContainer.positionOffset].pageIcon)   
        }
    }
}

async function updateCustomPages() {
    customPages = await sendQuery("SELECT * FROM customPages")
    
    for(var i of customPages) {
        if(!(await caches.has(i.name)) || i.hidden == "true") {
            //sendQuery(`DELETE FROM customPages WHERE name = '${i.name}' AND hidden = '${i.hidden}'`)
            continue; 
        }

        var cache = await caches.open(i.name)
        cache = await cache.match(i.name)

        var text = await cache.text()

        var script = document.createElement("script")
        script.text = `${text}`
        script.name = "customPage"

        script.type = "application/x-javascript"

        document.body.appendChild(script);

        if(homeP)
            homeP.forceUpdate();

        if(pageContainer)
            pageContainer.forceUpdate();
    }
}

doPages();

document.body.scrollTo(0, 0)

window.onresize = e => {
    if(pageContainer == undefined) return;
    
    pageContainer.pages[pageContainer.positionOffset].page.scrollIntoView({ block: "end" })
}

async function init() {    
    SQL = await initSqlJs({ locateFile: filename => `sql-wasm.wasm` })

    db = await initDB()

    await sendQuery(`CREATE TABLE IF NOT EXISTS cityCodes ('cityCode' VARCHAR)`)
    await sendQuery(`CREATE TABLE IF NOT EXISTS customPages ('name' VARCHAR, 'hidden' VARCHAR);`)

    await sendQuery(`INSERT INTO cityCodes SELECT '2145461' WHERE NOT EXISTS(SELECT 1 FROM cityCodes WHERE cityCode = '2145461')`)

    ReactDOM.render(<Body />, document.getElementById("root"));

    settingsClass.children[2] = (
        <CustomPageSettings />
    )

    reloadCustomPageSettings()
}

async function reloadCustomPageSettings() {
    if(settingsCustomPage) {
        customPages = await sendQuery("SELECT * FROM customPages")

        settingsCustomPage.forceUpdate();
    }
    else {
        setTimeout(() => {
            return reloadCustomPageSettings();
        }, 50);
    }
}

init()

async function initDB() {
    if(!SQL)
        SQL = await initSqlJs({ locateFile: filename => `sql-wasm.wasm` })

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