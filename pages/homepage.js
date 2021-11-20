var editingElement;

class ContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {xPos: "0px", yPos: "0px", showMenu: false}
    }

    componentDidMount() {
        document.addEventListener("click", this.handleClick);
        document.addEventListener("contextmenu", this.handleContextMenu);   
    }

    ctEditClick() {
        if(document.getElementById("contextEdit")) {
            document.getElementById("contextEdit").addEventListener("click", async e => {
                this.setState({ xPos: this.state.xPos, yPos: this.state.yPos, showMenu: false });

                var sql = await sendQuery(`SELECT * FROM containerPages WHERE url = '${editingElement.id}' AND container = '${editingElement.parentNode.parentNode.id.replace("WebsiteContainer", "")}'`)
                sql = sql[0]

                var url = prompt("Enter the website URL")
                if(url == null || url == "") return;

                var name = prompt("Enter the website name(leave blank if default)")

                await sendQuery(`UPDATE containerPages SET url = '${url}', overrideName = '${name}' WHERE id = '${sql.id}' AND container = '${sql.container}'`)
                    
                websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

                websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

                homeP.forceUpdate();
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

                var sql = await sendQuery(`SELECT * FROM containerPages WHERE url = '${editingElement.id}' AND container = '${editingElement.parentNode.parentNode.id.replace("WebsiteContainer", "")}'`)
                sql = sql[0]

                await sendQuery(`DELETE FROM containerPages WHERE id = '${sql.id}' AND url = '${sql.url}' AND container = '${sql.container}' AND overrideName = '${sql.overrideName}'`)
                    
                websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

                websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

                homeP.forceUpdate();
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
                
            <div className="menu-container" style={{top: this.state.yPos, left: this.state.xPos}}>
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
                    <h1 id={this.props.link} draggable="true" ref={ele => this.element = ele}>
                        <img src={this.props.image}/>
                        <a className="linkText" href={this.props.link.split("//").length <= 1 ? "//" + this.props.link : this.props.link}>{this.props.name}</a>
                    </h1>
                </div>
            )
        }
        else {
            return (
                <div id="website" className="website">
                    <h1 id={this.props.link} ref={ele => this.element = ele}>
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

        await sendQuery(`UPDATE containerPages SET 
            id = CASE WHEN id = '${dropToSQL.id}' THEN '${toDropSQL.id}' ELSE '${dropToSQL.id}' END,
            url = CASE WHEN url = '${dropToSQL.url}' THEN '${toDropSQL.url}' ELSE '${dropToSQL.url}' END,
            overrideName = CASE WHEN overrideName = '${dropToSQL.overrideName}' THEN '${toDropSQL.overrideName}' ELSE '${dropToSQL.overrideName}' END
            WHERE (id = '${dropToSQL.id}' OR id = '${toDropSQL.id}')`)

        websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);
        websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

        homeP.forceUpdate();
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

    componentDidMount() {
        document.getElementById(this.props.id + "AddButton").addEventListener("click", async e => {
            var url = prompt("Enter the website URL")
            if(url == null || url == "") return;

            var name = prompt("Enter the website name(leave blank if default)")

            await sendQuery(`INSERT INTO containerPages VALUES('${genID(25)}', '${url}', '${this.props.id}', '${name}')`)

            websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);
            websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

            homeP.forceUpdate();
            this.forceUpdate();
        })

        document.getElementById(this.props.id + "EditButton").addEventListener("click", e => {
            this.setState({ rerender: !this.state.rerender, editing: this.state.editing, editingPages: !this.state.editingPages })
        })

        document.getElementById(this.props.id + "DeleteButton").addEventListener("click", async e => {
            await sendQuery(`DELETE FROM containerPages WHERE container = '${this.props.id}'`)
            await sendQuery(`DELETE FROM pageContainers WHERE id = '${this.props.id}'`)

            websiteContainer = websiteContainer.filter(x => x != this)

            websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

            websiteLinks = await sendQuery(`SELECT * FROM containerPages`);
            
            homeP.forceUpdate();
            this.forceUpdate();
        })
        
        this.pageNameElement.addEventListener("dblclick", async e => {
            var newName = prompt("Enter the new name")
            
            if(!newName || newName == "") return;

            await sendQuery(`UPDATE pageContainers SET containerName = '${newName}' WHERE id = '${this.props.id}'`)
        
            websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

            homeP.forceUpdate();
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
            if(!pageContainer) return;

            pageContainer.pages[pageContainer.positionOffset].page.style.backgroundPosition = e.pageX * lookSpeed * -1 / 6 + 'px ' + e.pageY * lookSpeed * -1 / 6 + 'px ';
            
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
                if(!pageContainer) return;
    
                pageContainer.pages[pageContainer.positionOffset].page.style.backgroundPosition = e.pageX * lookSpeed * -1 / 6 + 'px ' + e.pageY * lookSpeed * -1 / 6 + 'px ';
            }
        }
    }

    render() {
        if(this.state.editing) {
            return (
                <div id={this.props.id + "WebsiteContainer"} style={{ left: this.props.position.split(",")[0] + "px", top: this.props.position.split(",")[1] + "px" }} className="websiteContainer">
                    <div editing="" className="containerName">
                        <h1 ref={ele => this.pageNameElement = ele}>{this.props.name}</h1>
                    </div>
                    <div className="buttonContainer" editing="">
                        <img id={this.props.id + "EditButton"} src="edit.png" className="button pageEdit"/>
                        <img id={this.props.id + "AddButton"} src="add.png" className="button pageAdd"/>
                        <img id={this.props.id + "DeleteButton"} src="trash.png" className="button pageDel"/>
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
                        <img id={this.props.id + "EditButton"} src="edit.png" className="button pageEdit"/>
                        <img id={this.props.id + "AddButton"} src="add.png" className="button pageAdd"/>
                        <img id={this.props.id + "DeleteButton"} src="trash.png" className="button pageDel"/>
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
                pageName = getWebName(extractHostname(e.url)).sld;
                pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
            }

            if(this.state.editingPages) {
                return <Website container={this.props.id} name={pageName} editing="" link={e.url} image={"https://favicon.yandex.net/favicon/" + e.url} />
            }

            return <Website container={this.props.id} name={pageName} link={e.url} image={"https://favicon.yandex.net/favicon/" + e.url} />
        })

        return links
    }
}

//{websiteContainers.map(e => <Website name={e.containerName} link="https://www.google.com" image="add.png" />)}
  //<Website name={e.containerName} link="https://www.google.com" image="add.png" />
/*
<Website name="test" link="https://www.google.com" image="add.png"/>
<Website name="ye" link="https://www.youtube.com" image="edit.png"/>
*/

const CustomMenu = () => (
    <>
        <div id="contextEdit">
            <span>Edit</span>
        </div>
        <div id="contextDelete">
            <span>Delete</span>
        </div>
    </>
);

class HomePage extends React.Component {
    constructor(props) {
      super(props);
      this.state = { rerender: false };
      homeP = this;
    }

    render() {
        return (
            <Page icon="home.webp">
                <ContextMenu ><CustomMenu /></ContextMenu>
                {websiteContainers.map(e => <WebsiteContainer id={e.id} name={e.containerName} position={e.containerPosition} />)}
                <img id="editContainer" className="button" src="edit.png"/>
                <img id="addContainer" className="button" src="add.png"/>
            </Page>
        )
    }

    
}

var pageHtml = (
    <HomePage/>
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
    position: absolute;
    left: 38%;
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
var homeP;
var websiteContainers = []
var websiteLinks = []
var editing = false;

function editContainers() {
    editing = !editing;
    for(var e of websiteContainer) {
        e.setState({ rerender: e.state.rerender, editing: editing, editingPages: e.state.editingPages })
    }
}

async function addContainer() {
    var name = prompt("Please enter a container name")

    if(name == null || name == "") return;

    await sendQuery(`INSERT INTO pageContainers VALUES('${genID(25)}', '${name}', '800, 400')`)

    websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);
    websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

    homeP.forceUpdate();
}

async function pageInit() {
    await sendQuery(`CREATE TABLE IF NOT EXISTS containerPages ('id' VARCHAR, 'url' VARCHAR, 'container' VARCHAR, 'overrideName' VARCHAR);`)
    await sendQuery(`CREATE TABLE IF NOT EXISTS pageContainers ('id' VARCHAR, 'containerName' VARCHAR, 'containerPosition' VARCHAR);`)

    document.getElementById("editContainer").addEventListener("click", e => { editContainers(); })
    document.getElementById("addContainer").addEventListener("click", e => { addContainer(); })

    websiteContainers = await sendQuery(`SELECT * FROM pageContainers`);

    websiteLinks = await sendQuery(`SELECT * FROM containerPages`);

    homeP.setState({ rerender: !homeP.state.rerender })
    websiteContainer.every(e => {
        e.setState({ rerender: !e.state.rerender, editing: e.state.editing, editingPages: e.state.editingPages })
    })
}

var homePage = {
    name: "homepage",
    html: pageHtml,
    css: pageCSS,
    init: pageInit
};

function doHomepage() {
}