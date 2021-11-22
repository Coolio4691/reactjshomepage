import * as vars from './vars.js';
import * as body from "./classes/body.js"
import * as homepage from './pages/homepage.js';
import * as custompage from "./classes/customPage.js"
import * as page from "./classes/page.js"
import * as util from "./util.js"

window.page = page;

window.vars = vars;

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

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("done")
        }, ms)
    })
}

async function doPages() {
    if(!homepage.homePage) {
        await sleep(10);

        return doPages();
    }

    while(document.getElementsByName("customPage").length >= 1) {
        document.getElementsByName("customPage")[0].remove();
    }

    vars.pages = [];
    vars.pages = [homepage.homePage];

    updateCustomPages();

    if(vars.pageContainer) {
        for(var i of vars.pageContainer.pages) {
            i.addImg();
        }
        if(vars.pageContainer.positionOffset <= vars.pageContainer.pages.length - 1) {
            
            vars.pageContainer.pages[vars.pageContainer.positionOffset].page.style.backgroundPosition = vars.currentBackgroundPos
            vars.pageContainer.pages[vars.pageContainer.positionOffset].page.scrollIntoView({ behavior: "smooth", block: "end" })
            util.doSelected(vars.pageContainer.pages[vars.pageContainer.positionOffset].pageIcon)   
        }
        else {
            vars.pageContainer.positionOffset = vars.pageContainer.pages.length - 1;
            if(vars.pageContainer.pages[vars.pageContainer.positionOffset]) {
                vars.pageContainer.pages[vars.pageContainer.positionOffset].page.style.backgroundPosition = vars.currentBackgroundPos
                vars.pageContainer.pages[vars.pageContainer.positionOffset].page.scrollIntoView({ behavior: "smooth", block: "end" })
                util.doSelected(vars.pageContainer.pages[vars.pageContainer.positionOffset].pageIcon)   
            }
        }
    }
}

async function updateCustomPages() {
    vars.customPages = await sendQuery("SELECT * FROM customPages")
    
    for(var i of vars.customPages) {
        window.page = page;

        if(!(await caches.has(i.name)) || i.hidden == "true") {
            if(!(await caches.has(i.name))) sendQuery(`DELETE FROM customPages WHERE name = '${i.name}' AND hidden = '${i.hidden}'`)
            
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
    }

    if(vars.settingsCustomPage) {
        vars.settingsCustomPage.forceUpdate();
    }

    if(vars.pageContainer) {
        vars.pageContainer.loadPages();
        vars.pageContainer.forceUpdate();
    }

    if(vars.homeP)
      vars.homeP.forceUpdate();

    if(vars.pageBody)
      vars.pageBody.forceUpdate();
}

doPages();

document.body.scrollTo(0, 0)

window.onresize = e => {
    if(vars.pageContainer == undefined) return;
    
    vars.pageContainer.pages[vars.pageContainer.positionOffset].page.scrollIntoView({ block: "end" })
}

async function init() {    
    
    //var wasm = await util.getSetImage("sql-wasm.wasm");
    
    vars.SQL = await initSqlJs({ locateFile: filename => "sql-wasm.wasm" })
    
    vars.db = await initDB()

    await sendQuery(`CREATE TABLE IF NOT EXISTS cityCodes ('cityCode' VARCHAR)`)
    await sendQuery(`CREATE TABLE IF NOT EXISTS customPages ('name' VARCHAR, 'hidden' VARCHAR);`)

    await sendQuery(`INSERT INTO cityCodes SELECT '2145461' WHERE NOT EXISTS(SELECT 1 FROM cityCodes WHERE cityCode = '2145461')`)

    ReactDOM.render(<body.Body />, document.getElementById("root"));

    vars.settingsClass.children[2] = (
        <custompage.CustomPageSettings key="customPageSettingsKey"/>
    )

    reloadCustomPageSettings()
}

async function reloadCustomPageSettings() {
    if(vars.settingsCustomPage) {
        vars.customPages = await sendQuery("SELECT * FROM customPages")

        vars.settingsCustomPage.forceUpdate();
    }
    else {
        setTimeout(() => {
            return reloadCustomPageSettings();
        }, 50);
    }
}

init()

async function initDB() {
    
    if(vars.SQL == undefined) {
        //var wasm = await util.getSetImage("sql-wasm.wasm"); 

        vars.SQL = await initSqlJs({ locateFile: filename => "sql-wasm.wasm" })
    }

    if(await caches.has("database")) {
        var cache = await caches.open("database")
        var buf = JSON.parse(await (await cache.match("database")).text())

        return await new vars.SQL.Database(new Uint8Array(buf));
    }
    else {
        return await new vars.SQL.Database()
    }
}

async function exportDB() {
    var cache = await caches.open("database")
    
    await cache.delete("database")

    var buf = vars.db.export()

    buf = Array.from(buf);

    await cache.put("database", new Response(JSON.stringify(buf)))
}

async function sendQuery(query) {
    if(!vars.db) {
        vars.db = await initDB()
    }

    var rows = vars.db.exec(query)[0]
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

export { genID, sendQuery, doPages }