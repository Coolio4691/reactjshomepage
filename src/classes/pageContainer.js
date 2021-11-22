import * as vars from '../vars.js'
import * as util from '../util.js'

class PageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
        this.pages = [];
        this.positionOffset = 0;
        this.loadedPages = [];

        vars.pageContainer = this;

        if(vars.settingsClass) {
            if(!vars.settingsClass.hasBGChanger) {
                vars.settingsClass.hasBGChanger = true;
        
                vars.settingsClass.children.push((
                    <div key="pageContainerBackgroundSettingsKey" style={{ marginTop: 10 + "px"}}>
                        <h1>Background</h1>
                        <label id="backgroundLabel" htmlFor="backgroundFile">
                            <input id="backgroundFile" type="file"/>
                        </label>
                    </div>
                ))
        
                vars.settingsClass.forceUpdate();
        
                this.addFileEvent()
            }
        }
    }

    async addPage(page) {
        if(this.pages.indexOf(page) <= -1)
            this.pages.push(page)

        this.loadPages()
    }

    async removePage(page) {
        if(this.pages.indexOf(page) <= -1)
            this.pages = this.pages.filter(i => i != page)

        this.loadPages()
    }

    async removePageFromName(page) {
        this.pages = this.pages.filter(i => i.name != page)

        this.loadPages()
    }

    async componentDidMount() {
        vars.pageContainer = this;

        this.loadPages();
    }

    async loadPages() {
        for(var i in vars.pages) { 
            var e = vars.pages[i];

            if(this.pages[i]) {
                this.pages[i].name = e.name;
            }
            
            if(this.loadedPages.indexOf(e) <= -1) {

            if(!this.pages[i]) {
                return;
            }

            if(e.init) e.init() 
            if(e.css) {
                var style = document.createElement("style")

                style.rel = "stylesheet";

                if (style.styleSheet){
                    style.styleSheet.cssText = e.css;
                } else {
                    style.appendChild(document.createTextNode(e.css));
                }

                document.head.appendChild(style)
            }

            this.pages[i].addImg();

            this.loadedPages.push(e);

            if(await caches.has(`${e.name}Img`)) {
                var cache = await caches.open(`${e.name}Img`)

                this.pages[i].background = await (await cache.match(`${e.name}Img`)).text()
                
                this.pages[i].forceUpdate();
            }
            else {
                var cache = await caches.open(`${e.name}Img`)

                var imgData = await util.getSetImage("background.jpg");

                await cache.put(`${e.name}Img`, new Response(imgData))

                this.pages[i].background = imgData

                this.pages[i].forceUpdate();
            }   
            }
        }

        if(this.pages[this.positionOffset]) {
            if(await caches.has(`${this.pages[this.positionOffset].name}Img`)) {
                var cache = await caches.open(`${this.pages[this.positionOffset].name}Img`)
          
                document.getElementById("backgroundLabel").style.backgroundImage = `url("${await (await cache.match(`${this.pages[this.positionOffset].name}Img`)).text()}")`
            }
        }
    }
      
    addFileEvent() {
        if(document.getElementById("backgroundFile")) {
            document.getElementById("backgroundFile").addEventListener("change", e => {
                var file = e.target.files[0]
        
                if(!file.type.includes("image")) return;
        
                var reader = new FileReader();
                reader.addEventListener("load", async () => {
                    await caches.delete(`${this.pages[this.positionOffset].name}Img`)
        
                    var cache = await caches.open(`${this.pages[this.positionOffset].name}Img`)
                    await cache.put(`${this.pages[this.positionOffset].name}Img`, new Response(reader.result))
        
                    this.pages[this.positionOffset].background = reader.result
        
                    document.getElementById("backgroundLabel").style.backgroundImage = `url("${reader.result}")`
                
                    this.pages[this.positionOffset].forceUpdate();
                })
        
                reader.readAsDataURL(file)
            })
        }
        else {
            setTimeout(() => {
                this.addFileEvent();
            }, 50);
        }
    }
  
    render() {
        vars.pageContainer = this;
        
        return (
            <div id="pageContainer">
                {vars.pages.map(x => x.html)}
            </div>
        )
    }
  }
  

export { PageContainer }