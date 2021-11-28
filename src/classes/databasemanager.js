import { doPages } from "../index";
import * as vars from "../vars"
import * as homepage from "../pages/homepage"

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.getElementById("settingsMenu").appendChild(element);
  
    element.click();
  
    document.getElementById("settingsMenu").removeChild(element);
}

class DatabaseSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
        vars.settingsDatabase = this;
    }

    componentDidMount() {
        document.getElementById("databaseUploadInputText").addEventListener("click", e => { document.getElementById("databaseUploadInputFile").click() })        

        document.getElementById("databaseUploadInputFile").addEventListener("change", e => {
            var file = e.target.files[0]

            console.log(file)

            var reader = new FileReader();
            reader.addEventListener("load", async () => {
                var cache = await caches.open("database")

                await cache.delete("database")
                await caches.delete("database")

                cache = await caches.open("database")
                
                await cache.put("database", new Response(JSON.stringify(reader.result.replace(/["\[\]]/gi, "").split(","))))

                vars.db = await new vars.SQL.Database(new Uint8Array(reader.result.replace(/["\[\]]/gi, "").split(",")));

                homepage.homePage.init();

                vars.settingsCustomPage.forceUpdate();
                doPages();
            })
    
            reader.readAsText(file)
        })

        document.getElementById("databaseResetText").addEventListener("click", async e => {
            if(confirm("Are you sure you want to reset the database?")) {
                download("olddatabase", JSON.stringify(Array.from(vars.db.export())))
                var cache = await caches.open("database")
    
                await cache.delete("database")
                await caches.delete("database")

                vars.db = await new vars.SQL.Database();

                homepage.homePage.init();

                vars.settingsCustomPage.forceUpdate();
                doPages();
            }
        })

        document.getElementById("databaseExportText").addEventListener("click", e => {
            download("database", JSON.stringify(Array.from(vars.db.export())))
        })
    }

    render() {
        return (
            <>
            <div style={{ marginTop: 10 + "px"}}>
                <h1>Database</h1>
                <div className="databaseContainer">
                    <div className="databaseUploadInput">
                        <input id="databaseUploadInputFile" type="file" />
                        <h1 id="databaseUploadInputText">Import</h1>    
                    </div>

                    <div className="databaseReset">
                        <h1 id="databaseResetText">Reset</h1>    
                    </div>

                    <div className="databaseExport">
                        <h1 id="databaseExportText">Export</h1>    
                    </div>
                </div>
            </div>
            </>
        )
    }
}

export { DatabaseSettings }