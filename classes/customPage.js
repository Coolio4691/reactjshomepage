var editingElement;

var pageDropTo;
var pageToDrop;

var uploading = false;

class CustomPageContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {xPos: "0px", yPos: "0px", showMenu: false}
    }

    componentDidMount() {
        document.addEventListener("click", this.handleClick);
        document.addEventListener("contextmenu", this.handleContextMenu);   


        this.ctUploadFile();
        this.ctHiddenClick();
        this.ctDeleteClick();
    }

    ctUploadFile() {
        if(document.getElementById("pageContextUploadInput")) {

            document.getElementById("pageContextUploadInput").addEventListener("click", async e => {
                uploading = true;
            });

            document.getElementById("pageContextUploadInput").addEventListener("change", async e => {

                var file = e.target.files[0]

                console.log(editingElement)
                
                console.log(file)

                if(!file.type.includes("text") && !file.type.includes("application")) return;
        
                var reader = new FileReader();
                reader.addEventListener("load", async () => {
                    await caches.delete(editingElement.getAttribute("name"))
        
                    var cache = await caches.open(editingElement.getAttribute("name"))
                    await cache.put(editingElement.getAttribute("name"), new Response(reader.result))

                    editingElement = null;
                    uploading = false;

                    doPages();
                })
        
                reader.readAsText(file)
            });
        }
        else {
            setTimeout(() => {
                this.ctUploadFile();
            }, 50);
        }
    }

    ctHiddenClick() {
        if(document.getElementById("pageContextHidden")) {
            document.getElementById("pageContextHidden").addEventListener("click", async e => {
                this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

                await sendQuery(`UPDATE customPages SET hidden = '${editingElement.getAttribute("ishidden") == "false" ? "true" : "false"}' WHERE name = '${editingElement.getAttribute("name")}' AND hidden = '${editingElement.getAttribute("ishidden")}'`)
            
                customPages = await sendQuery(`SELECT * FROM customPages`);
                
                /*if(editingElement.getAttribute("ishidden") == "false")
                    pageIcons = pageIcons.filter(e => e.ref.current.id != editingElement.getAttribute("name"))

                pageIcons = pageIcons.filter(e => e.ref.current.id != "")*/

                if(pageContainer) {
                    for(var i of pageContainer.pages) {
                        i.removeImg();
                    }
                }

                pageBody.forceUpdate();
                settingsCustomPage.forceUpdate();
                doPages();
            })
        }
        else {
            setTimeout(() => {
                this.ctHiddenClick();
            }, 50);
        }
    }

    ctDeleteClick() {
        if(document.getElementById("pageContextDelete")) {
            document.getElementById("pageContextDelete").addEventListener("click", async e => {
                this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

                await caches.delete(editingElement.getAttribute("name"))

                await sendQuery(`DELETE FROM customPages WHERE name = '${editingElement.getAttribute("name")}' AND hidden = '${editingElement.getAttribute("ishidden")}'`)
            
                customPages = await sendQuery(`SELECT * FROM customPages`);

                settingsCustomPage.forceUpdate();
                doPages();
            })
        }
        else {
            setTimeout(() => {
                this.ctDeleteClick();
            }, 50);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClick);
        document.removeEventListener("contextmenu", this.handleContextMenu);
    }

    handleClick = (e) => {
        if (this.state.showMenu) {
            
            if(!uploading)
                editingElement = null;

            this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

            this.forceUpdate();
        }
    };

    handleContextMenu = (e) => {
        editingElement = null;

        if(e.target.parentNode.id == "customPage")
            editingElement = e.target;
        
        if(editingElement) {
            e.preventDefault();


            console.log(e)

            this.setState({xPos: `${e.x - editingElement.getBoundingClientRect().x}px`, yPos: `${e.y - document.getElementById("settingsMenu").getBoundingClientRect().top}px`, showMenu: true, });

            document.getElementById("pageContextHiddenText").textContent = (editingElement.getAttribute("ishidden") == "false" ? "Hide" : "Show" ) 

            this.forceUpdate();
        }
    };

    render() {
        if(!this.state.showMenu) {
            return (
                <div className="menu-container" style={{top: this.state.yPos, left: this.state.xPos, display: "none", height: 82.5 + "px"}}>
                {this.props.children}
            </div>
            )
        }
        return (
                
            <div className="menu-container" style={{top: this.state.yPos, left: this.state.xPos, height: 82.5 + "px" }}>
                {this.props.children}
            </div>
                
        ); 
    }
}

class AddCustomPageContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {xPos: "0px", yPos: "0px", showMenu: false}
    }

    componentDidMount() {
        document.addEventListener("click", this.handleClick);
        document.addEventListener("contextmenu", this.handleContextMenu);   

        this.ctUploadFile();
    }

    ctUploadFile() {
        if(document.getElementById("customPageContextUploadInput")) {
            document.getElementById("customPageContextUploadInput").addEventListener("change", async e => {

                var file = e.target.files[0]

                console.log(file)

                if(!file.type.includes("text") && !file.type.includes("application")) return;
        
                var reader = new FileReader();
                reader.addEventListener("load", async () => {
                    if(await caches.has(file.name.split(".")[0])) return;

                    var cache = await caches.open(file.name.split(".")[0])
                    await cache.put(file.name.split(".")[0], new Response(reader.result))

                    await sendQuery(`INSERT INTO customPages VALUES('${file.name.split(".")[0]}', 'false')`)

                    doPages();
                })
        
                reader.readAsText(file)
            });
        }
        else {
            setTimeout(() => {
                this.ctUploadFile();
            }, 50);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClick);
        document.removeEventListener("contextmenu", this.handleContextMenu);
    }

    handleClick = (e) => {
        if (this.state.showMenu) {
            this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

            this.forceUpdate();
        }
    };

    handleContextMenu = (e) => {
        if(e.target.classList.contains("customPageContainer")) {
            e.preventDefault();

            this.setState({xPos: `${e.x - e.target.getBoundingClientRect().x}px`, yPos: `${e.y - document.getElementById("settingsMenu").getBoundingClientRect().top}px`, showMenu: true, });

            this.forceUpdate();
        }
    };

    render() {
        if(!this.state.showMenu) {
            return (
                <div className="menu-container" style={{top: this.state.yPos, left: this.state.xPos, display: "none", height: 27.5 + "px"}}>
                {this.props.children}
            </div>
            )
        }
        return (
                
            <div className="menu-container" style={{top: this.state.yPos, left: this.state.xPos, height: 27.5 + "px" }}>
                {this.props.children}
            </div>
                
        ); 
    }
}

class CustomPageSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
    }

    componentDidMount() {
        document.getElementById(`${this.props.name}Container`).ondragstart = e => { this.drag(e)}
        document.getElementById(`${this.props.name}Container`).ondrop = e => this.drop(e)
        document.getElementById(`${this.props.name}Container`).ondragover = e => this.allowDrop(e)
    }

    allowDrop(ev) { ev.preventDefault() }  

    drag(ev) { 
        pageToDrop = ev.target
    }  

    async drop(ev) {  
        pageDropTo = ev.target

        var toDropSQL = (await sendQuery(`SELECT * FROM customPages WHERE name = '${pageToDrop.getAttribute("name")}'`))[0]
        var dropToSQL = (await sendQuery(`SELECT * FROM customPages WHERE name = '${pageDropTo.getAttribute("name")}'`))[0]

        await sendQuery(`UPDATE customPages SET 
            name = CASE WHEN name = '${dropToSQL.name}' THEN '${toDropSQL.name}' ELSE '${dropToSQL.name}' END,
            hidden = CASE WHEN hidden = '${dropToSQL.hidden}' THEN '${toDropSQL.hidden}' ELSE '${dropToSQL.hidden}' END
            WHERE (name = '${dropToSQL.name}' OR name = '${toDropSQL.name}') AND (hidden = '${dropToSQL.hidden}' OR hidden = '${toDropSQL.hidden}')`)
        
        pageToDrop = null
        pageDropTo = null

        customPages = await sendQuery(`SELECT * FROM customPages`)

        settingsCustomPage.forceUpdate();
    } 

    render() {
        return (
            <div id="customPage">
                <div draggable="true" id={`${this.props.name}Container`} ishidden={this.props.hidden.toString()} name={this.props.name} className="customPage">
                    <span>{this.props.name}</span>
                </div>
            </div>
        )
    }
}

class CustomPageSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
        settingsCustomPage = this;
    }

    componentDidMount() {
    }

    render() {
        return (
            <>
            <CustomPageContextMenu >
                <div id="pageContextUpload" style={{ width: 100 + "%", height: 18 + "px" }}>
                    <input id="pageContextUploadInput" type="file" style={{ opacity: 0, width: 100 + "%", position: "absolute", left: 0 }}/>
                    <span style={{ pointerEvents: "none" }}>Upload</span>
                </div>
                <div id="pageContextHidden">
                    <span id="pageContextHiddenText">Hide</span>
                </div>
                <div id="pageContextDelete">
                    <span>Delete</span>
                </div>
            </CustomPageContextMenu>

            <AddCustomPageContextMenu>
            <div id="customPageContextUpload" style={{ width: 100 + "%", height: 18 + "px" }}>
                    <input id="customPageContextUploadInput" type="file" style={{ opacity: 0, width: 100 + "%", position: "absolute", left: 0 }}/>
                    <span style={{ pointerEvents: "none" }}>Upload</span>
                </div>
            </AddCustomPageContextMenu>

            <div style={{ marginTop: 10 + "px"}}>
                <h1>Custom Pages</h1>
                <div className="customPageContainer">
                    {customPages.map(e => <CustomPageSetting name={e.name} hidden={e.hidden == "false" ? false : true} />)}
                </div>
            </div>
            </>
        )
    }
}