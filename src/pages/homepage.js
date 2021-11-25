import { sendQuery, genID } from "../index.js";
import * as vars from "../vars.js"
import * as page from "../classes/page.js"
import * as util from "../util.js"

var editingElement;

var keybinds = {};
var keyStates = {}
var listenKeys = [];

var removeTimeout; 

window.onkeydown = e => {
    if(!e.key) return;

    keyStates[e.key.toLowerCase()] = "down"

    clearTimeout(removeTimeout);
    
    removeTimeout = setTimeout(() => {
        if(keyStates[e.key.toLowerCase()])
            delete keyStates[e.key.toLowerCase()];
    }, 250);
}

window.onkeyup = e => {
    if(!e.key) return;

    console.log(keyStates)

    for(var i of Object.keys(keybinds)) {
        var success = true;

        for(var f of Object.keys(keyStates)) {
            if(success == false) break;
                
            if(keyStates[f.toLowerCase()] == "down") {
                if(i.indexOf(f.toLowerCase()) < 0) {
                    success = false;
                    break;
                }
            }
            else {
                if(i.indexOf(f.toLowerCase()) >= 0) {
                    success = false;
                    break;
                }
            }
        }

        for(var f of i.split(",")) {
            if(success == false) break;
                
            if(keyStates[f.toLowerCase()] != "down") {
                success = false;
                break;
            }
        }

        if(success) {
            window.location.href = `${keybinds[i].split("//").length <= 1 ? "//" + keybinds[i] : keybinds[i]}`
        }
    }

    if(keyStates[e.key.toLowerCase()])
        delete keyStates[e.key.toLowerCase()];
    
    
}

class ContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {xPos: "0px", yPos: "0px", showMenu: false}
    }

    componentDidMount() {
        document.addEventListener("click", this.handleClick);
        document.addEventListener("contextmenu", this.handleContextMenu);   
    }

    ctKeybindClick() {
        if(document.getElementById("contextKeybind")) {
            document.getElementById("contextKeybind").addEventListener("click", async e => {
                this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

                //page id editingElement.id

                var pageKeybindSQL = await sendQuery(`SELECT keybind FROM pageKeybinds WHERE id = '${editingElement.id}'`)

                var keybind;

                var stmt;

                if(pageKeybindSQL[0]) {
                    keybind = prompt("Enter the keybind string (eg shift,f)", pageKeybindSQL[0].keybind)

                    if(keybind == null) return;
                    if(keybind == "") await sendQuery(`DELETE FROM pageKeybinds WHERE id = '${editingElement.id}'`);


                   stmt = `UPDATE pageKeybinds SET keybind = '${keybind}' WHERE id = '${editingElement.id}'`
                }
                else {

                    keybind = prompt("Enter the keybind string (eg shift,f)")
                    if(keybind == null || keybind == "") return;

                    stmt = `INSERT INTO pageKeybinds VALUES('${editingElement.id}', '${keybind}')`
                }

                if((await sendQuery(`SELECT * FROM pageKeybinds WHERE keybind = '${keybind}'`)).length > 0) return;

                await sendQuery(stmt);
                    
                doKeybinds();
                
            })
        }
        else {
            setTimeout(() => {
                this.ctEditClick();
            }, 50);
        }
    }

    ctEditClick() {
        if(document.getElementById("contextEdit")) {
            document.getElementById("contextEdit").addEventListener("click", async e => {
                this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

                var sql = await sendQuery(`SELECT * FROM containerPages WHERE id = '${editingElement.id}' AND container = '${editingElement.parentNode.parentNode.id.replace("WebsiteContainer", "")}'`)
                sql = sql[0]

                var url = prompt("Enter the website URL")
                if(url == null || url == "") return;

                var name = prompt("Enter the website name(leave blank if default)")

                await sendQuery(`UPDATE containerPages SET url = '${url}', overrideName = '${name}' WHERE id = '${sql.id}' AND container = '${sql.container}'`)
                    
                websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

                websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

                vars.homeP.forceUpdate();
                websiteContainer.every(e => {
                    e.forceUpdate()
                })
            })
        }
        else {
            setTimeout(() => {
                this.ctEditClick();
            }, 50);
        }
    }

    ctDeleteClick() {
        if(document.getElementById("contextDelete")) {
            document.getElementById("contextDelete").addEventListener("click", async e => {
                this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

                var sql = await sendQuery(`SELECT * FROM containerPages WHERE id = '${editingElement.id}' AND container = '${editingElement.parentNode.parentNode.id.replace("WebsiteContainer", "")}'`)
                sql = sql[0]

                await sendQuery(`DELETE FROM containerPages WHERE id = '${sql.id}' AND url = '${sql.url}' AND container = '${sql.container}' AND overrideName = '${sql.overrideName}'`)
                    
                websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

                websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

                vars.homeP.forceUpdate();
                websiteContainer.every(e => {
                    e.forceUpdate()
                })
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
            
            editingElement = null;

            this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

            this.forceUpdate();
        }
    };

    handleContextMenu = (e) => {
        editingElement = null;

        if(e.target.parentNode.classList.contains("website"))
            editingElement = e.target;
        else if(e.target.parentNode.parentNode.classList.contains("website"))
            editingElement = e.target.parentNode;

        if(editingElement) {
            e.preventDefault();

            this.setState({xPos: `${e.pageX}px`, yPos: `${e.pageY}px`, showMenu: true, });

            this.forceUpdate();

            this.ctKeybindClick();
            this.ctEditClick();
            this.ctDeleteClick();
        }
    };

    render() {
        if(!this.state.showMenu) {
            return (
                <></>
            )
        }
        return (
                
            <div className="menu-container" style={{top: this.state.yPos, left: this.state.xPos, height: "77.5px"}}>
                {this.props.children}
            </div>
                
        ); 
    }
  
}

var toDrop;
var dropTo;

class Website extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    async componentDidMount() {
        this.sql = sendQuery(`SELECT * FROM containerPages WHERE id = '${this.element.id}' AND container = '${this.element.parentNode.parentNode.id.replace("WebsiteContainer", "")}'`)
        
        this.element.ondragstart = e => { this.drag(e)}
        this.element.ondrop = e => this.drop(e)
        this.element.ondragover = e => this.allowDrop(e)
    }

    render() {
        if(this.props.editing == "") {
            return (
                <div id="website" className="website editingPage">
                    <h1 id={this.props.id} draggable="true" ref={ele => this.element = ele}>
                        <img src={this.props.image}/>
                        <a className="linkText" href={this.props.link.split("//").length <= 1 ? "//" + this.props.link : this.props.link}>{this.props.name}</a>
                    </h1>
                </div>
            )
        }
        else {
            return (
                <div id="website" className="website">
                    <h1 id={this.props.id} ref={ele => this.element = ele}>
                        <img src={this.props.image}/>
                        <a className="linkText" href={this.props.link.split("//").length <= 1 ? "//" + this.props.link : this.props.link}>{this.props.name}</a>
                    </h1>
                </div>
            )
        }
    }

    allowDrop(ev) { ev.preventDefault() }  

    drag(ev) { 
        toDrop = ev.target
    }  

    async drop(ev) {  
        dropTo = ev.target
        var container = toDrop.parentNode.parentNode.id.replace("WebsiteContainer", "");

        var toDropSQL = (await sendQuery(`SELECT * FROM containerPages WHERE id = '${toDrop.id}' AND container = '${container}'`))[0]
        var dropToSQL = (await sendQuery(`SELECT * FROM containerPages WHERE id = '${dropTo.id}' AND container = '${container}'`))[0]

        console.log(container)
        console.log(toDrop)
        console.log(toDropSQL)

        await sendQuery(`UPDATE containerPages SET 
            id = CASE WHEN id = '${dropToSQL.id}' THEN '${toDropSQL.id}' ELSE '${dropToSQL.id}' END,
            url = CASE WHEN url = '${dropToSQL.url}' THEN '${toDropSQL.url}' ELSE '${dropToSQL.url}' END,
            overrideName = CASE WHEN overrideName = '${dropToSQL.overrideName}' THEN '${toDropSQL.overrideName}' ELSE '${dropToSQL.overrideName}' END
            WHERE (id = '${dropToSQL.id}' OR id = '${toDropSQL.id}')`)

        websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);
        websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

        vars.homeP.forceUpdate();
        this.forceUpdate();

        dropTo = null
        toDrop = null
    } 

}

class WebsiteContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = { rerender: false, editing: editing, editingPages: false };
      websiteContainer.push(this);
    }

    async componentDidMount() {
        document.getElementById(this.props.id + "AddButton").addEventListener("click", async e => {
            var url = prompt("Enter the website URL")
            if(url == null || url == "") return;

            var name = prompt("Enter the website name(leave blank if default)")

            await sendQuery(`INSERT INTO containerPages VALUES('${genID(25)}', '${url}', '${this.props.id}', '${name}')`)

            websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);
            websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

            vars.homeP.forceUpdate();
            this.forceUpdate();
        })

        document.getElementById(this.props.id + "DeleteButton").addEventListener("click", async e => {
            await sendQuery(`DELETE FROM containerPages WHERE container = '${this.props.id}'`)
            await sendQuery(`DELETE FROM pageContainers WHERE id = '${this.props.id}'`)

            websiteContainer = websiteContainer.filter(x => x != this)

            websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

            websiteLinks = await sendQuery(`SELECT * FROM containerPages`);
            
            vars.homeP.forceUpdate();
            this.forceUpdate();
        })
        
        document.getElementById(this.props.id + "AddButton").src = await util.getSetImage("add.png")
        document.getElementById(this.props.id + "DeleteButton").src = await util.getSetImage("trash.png")

        this.pageNameElement.addEventListener("dblclick", async e => {
            var newName = prompt("Enter the new name")
            
            if(!newName || newName == "") return;

            await sendQuery(`UPDATE pageContainers SET containerName = '${newName}' WHERE id = '${this.props.id}'`)
        
            websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

            vars.homeP.forceUpdate();
            this.forceUpdate();
        })

        this.dragElement(document.getElementById(this.props.id + "WebsiteContainer"))
    }

    dragElement(ele) {
        var that = this;
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        if(ele != null) ele.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            if(that.state.editing && e.target.id == ele.id) {
                e = e || window.event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }
        }
    
        function elementDrag(e) {
            if(!vars.pageContainer) return;

            vars.pageContainer.pages[vars.pageContainer.positionOffset].page.style.backgroundPosition = e.pageX * vars.lookSpeed * -1 / 6 + 'px ' + e.pageY * vars.lookSpeed * -1 / 6 + 'px ';
            
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            ele.style.top = Number(ele.style.top.replace(/[a-z]/gi, "")) - pos2 + "px";
            ele.style.left = Number(ele.style.left.replace(/[a-z]/gi, "")) - pos1 + "px";
        }
        
        function closeDragElement() {
            var toEditContainerStr = `${ele.style.left.replace("px", "")}, ${ele.style.top.replace("px", "")}`;
    
            sendQuery(`UPDATE pageContainers SET containerPosition = '${toEditContainerStr}' WHERE id = '${that.props.id}'`)
    
            document.onmouseup = null;
            document.onmousemove = e => {
                if(!vars.pageContainer) return;
    
                vars.pageContainer.pages[vars.pageContainer.positionOffset].page.style.backgroundPosition = e.pageX * vars.lookSpeed * -1 / 6 + 'px ' + e.pageY * vars.lookSpeed * -1 / 6 + 'px ';
            }
        }
    }

    render() {
        if(!this.state.editing && this.state.editingPages) this.state.editingPages = false;
        
        if(this.state.editing) {
            return (
                <div id={this.props.id + "WebsiteContainer"} style={{ left: this.props.position.split(",")[0] + "px", top: this.props.position.split(",")[1] + "px" }} className="websiteContainer">
                    <div editing="" className="containerName">
                        <h1 ref={ele => this.pageNameElement = ele}>{this.props.name}</h1>
                    </div>
                    <div className="buttonContainer" editing="">
                        <img id={this.props.id + "AddButton"} style={{ display: "none" }} onLoad={e => e.target.style.display = "block" } className="button pageAdd"/>
                        <img id={this.props.id + "DeleteButton"} style={{ display: "none" }} onLoad={e => e.target.style.display = "block" } className="button pageDel"/>
                    </div>
                    {this.formatLinks(websiteLinks)}
                </div>
            )
        }
        else {
            return (
                <div id={this.props.id + "WebsiteContainer"} style={{ left: this.props.position.split(",")[0] + "px", top: this.props.position.split(",")[1] + "px" }} className="websiteContainer">
                    <div className="containerName">
                        <h1 ref={ele => this.pageNameElement = ele}>{this.props.name}</h1>
                    </div>
                    <div className="buttonContainer">
                        <img id={this.props.id + "AddButton"} style={{ display: "none" }} onLoad={e => e.target.style.display = "block" } className="button pageAdd"/>
                        <img id={this.props.id + "DeleteButton"} style={{ display: "none" }} onLoad={e => e.target.style.display = "block" } className="button pageDel"/>
                    </div>
                    {this.formatLinks(websiteLinks)}
                </div>
            )
        }
    }

    formatLinks(links) {
        var links = links.map(e => {
            if(e.container != this.props.id) return;

            var pageName;
            if(e.overrideName != "" && e.overrideName != "null") {
                pageName = e.overrideName;
            }  
            else {
                pageName = util.getWebName(util.extractHostname(e.url)).sld;
                if(pageName && pageName.length >= 1)
                    pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
                else pageName = "Invalid"
            }

            if(this.state.editingPages) {
                return <Website key={`${e.id}Key`} container={this.props.container} id={e.id} name={pageName} editing="" link={e.url} image={"https://www.google.com/s2/favicons?domain=" + e.url} />
            }

            return <Website key={`${e.id}Key`} container={this.props.container} id={e.id} name={pageName} link={e.url} image={"https://www.google.com/s2/favicons?domain=" + e.url} />
        })

        return links
    }
}

const CustomMenu = () => (
    <>
        <div id="contextKeybind">
            <span>Keybind</span>
        </div>
        <div id="contextEdit">
            <span>Edit</span>
        </div>
        <div id="contextDelete">
            <span>Delete</span>
        </div>
    </>
);

//#region icon
var homeIcon = "data:application/octet-stream;base64,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"
//#endregion

class HomePage extends React.Component {
    constructor(props) {
      super(props);
      this.state = { editing: false };
      vars.homeP = this; 
      if(!this.children) this.children = [];
    }

    async componentDidMount() {
        document.getElementById("editContainer").src = await util.getSetImage("edit.png")
        document.getElementById("addContainer").src = await util.getSetImage("add.png")
    }

    render() {
        return (
            <page.Page ref={ele => this.element = ele} icon={homeIcon}>
                {this.children.map(e => e)}
                <ContextMenu><CustomMenu /></ContextMenu>
                {websiteContainers.map(e => <WebsiteContainer key={`${e.id}Key`} id={e.id} name={e.containerName} position={e.containerPosition} />)}
                <img id="editContainer" className="button" style={{ display: "none" }} onLoad={e => e.target.style.display = "block" }/>
                <img id="addContainer" className="button" style={{ display: "none" }} onLoad={e => e.target.style.display = "block" }/>
            </page.Page>
        )
    }

    
}

var pageHtml = (
    <HomePage key="homePageKey"/>
)

var pageCSS = `

.menu-container {
    position: absolute;
    background-color: #2b2b2b;
    outline: 1px solid #1b1b1b;
    width: 75px;
    border-radius: 12px;
    height: 55px;
    z-index: 9999;
}

.menu-container > div {
    cursor: pointer;
    margin-top: 5px;
    text-align: center;
}

.menu-container > div:hover {
    background-color: #4c4c4c;
}

.containerName {
    text-align: center;
    padding-top: 10px;   
    pointer-events: none;
}

.containerName > h1 {
    pointer-events: all;
}

.containerName[editing=""] > h1 {
    pointer-events: none !important;
}

.buttonContainer {
    width: 100%;
    height: 25px;
    display: none;
    pointer-events: none;
}

.buttonContainer img {
    width: 25px;
    height: 25px;
    float: left;
    padding-left: 5px;
    padding-right: 5px;
    pointer-events: all;
}

.pageAdd {
    float: left !important;
}


.pageDel {
    float: right !important;
}

.buttonContainer[editing] {
    display: block;
}

.containerName h1 {
    margin-bottom: 5px;
    
}

.linkText:hover {
    filter: brightness(1.8);
}

a {
    text-decoration: none;
    color: inherit;
}

.websiteContainer {
    background-color: #1b1b1bb4;
    outline: 1px solid #252525;
    color: #4b4b4b;
    font-size: 12px;
    width: max-content;
    border-radius: 12px;
    position: absolute;
    left: 800px;
    top: 200px;
    min-width: 100px;
    user-select: none;
}

.website img {
    float: left;
    pointer-events: all;

    width: 25px;
    height: 25px;
    padding-right: 5px;
    border-radius: 20px !important;
}

.website {
    pointer-events: none;
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    height: 30px;
    padding-bottom: 5px;
}

.editingPage h1 {
    
    border-radius: 15px;
    outline: 1px solid #353535;
    background-color: #2c2c2c44;
    cursor: pointer;
    user-select: all !important;
}

.editingPage > h1 > a {
    pointer-events: none;
}

.editingPage > h1 > img {
    pointer-events: none;
}

.website h1 {
    pointer-events: all;
}

#editContainer {
    position: absolute;
    right: 10px;
    top: 40px;
    width: 50px;
    height: 50px;
}

#addContainer {
    position: absolute;
    right: 70px;
    top: 40px;
    width: 50px;
    height: 50px;
}

.button {
    cursor: pointer;

    transition: transform 0.1s ease-in-out;
}

.button:hover {
    transform: scale(1.05);
    transition: transform 0.1s ease-in-out;
}
`

var websiteContainer = [];
var websiteContainers = []
var websiteLinks = []
var editing = false;

function editContainers() {
    editing = !editing;
    vars.homeP.setState({ editing: editing })
    for(var e of websiteContainer) {
        e.setState({ rerender: e.state.rerender, editing: editing, editingPages: editing })
    }
}

async function addContainer() {
    var name = prompt("Please enter a container name")

    if(name == null || name == "") return;

    await sendQuery(`INSERT INTO pageContainers VALUES('${genID(25)}', '${name}', '800, 400')`)

    websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);
    websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

    vars.homeP.forceUpdate();
}

async function pageInit() {
    await sendQuery(`CREATE TABLE IF NOT EXISTS containerPages ('id' VARCHAR, 'url' VARCHAR, 'container' VARCHAR, 'overrideName' VARCHAR);`)
    await sendQuery(`CREATE TABLE IF NOT EXISTS pageContainers ('id' VARCHAR, 'containerName' VARCHAR, 'containerPosition' VARCHAR);`)
    await sendQuery(`CREATE TABLE IF NOT EXISTS pageKeybinds ('id' VARCHAR, 'keybind' VARCHAR);`)

    document.getElementById("editContainer").addEventListener("click", e => { editContainers(); })
    document.getElementById("addContainer").addEventListener("click", e => { addContainer(); })

    websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

    websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

    vars.homeP.setState({ editing: editing })
    websiteContainer.every(e => {
        e.setState({ rerender: !e.state.rerender, editing: e.state.editing, editingPages: e.state.editing })
    })

    doKeybinds();
}

async function doKeybinds() {
    keybinds = {};
    listenKeys = [];
    keyStates = {};

    var keybindsSQL = await sendQuery(`SELECT * FROM pageKeybinds`);

    for(var i of keybindsSQL) {
        if(!websiteLinks.filter(x => x.id == i.id)[0]) continue;

        for(var e of i.keybind.split(",")) {
            listenKeys.push(e)
        }

        keybinds[i.keybind.toLowerCase()] = websiteLinks.filter(x => x.id == i.id)[0].url
    }
}

var homePage = {
    name: "homepage",
    html: pageHtml,
    css: pageCSS,
    init: pageInit
};

export { homePage };