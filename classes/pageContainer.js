const getBase64 = (file) => new Promise(function (resolve, reject) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject('Error: ', error);
})

class PageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
        this.pages = [];
        this.positionOffset = 0;
        this.loadedPages = [];

        pageContainer = this;

        if(settingsClass) {
            if(!settingsClass.hasBGChanger) {
                settingsClass.hasBGChanger = true;
        
                settingsClass.children.push((
                    <div style={{ marginTop: 10 + "px"}}>
                        <h1>Background</h1>
                        <label id="backgroundLabel" htmlFor="backgroundFile">
                            <input id="backgroundFile" type="file"/>
                        </label>
                    </div>
                ))
        
                settingsClass.forceUpdate();
        
                this.addFileEvent()
            }
        }
    }

    async componentDidMount() {
        this.loadPages();
    }

    async loadPages() {
        await pages.every(async e => { 
            if(this.loadedPages.indexOf(e) <= -1) {

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

            if(!this.pages[pages.indexOf(e)]) {
                return;
            }

            this.pages[pages.indexOf(e)].name = e.name;
            this.pages[pages.indexOf(e)].addImg();

            this.loadedPages.push(e);

            if(await caches.has(e.name)) {
                var cache = await caches.open(e.name)

                this.pages[pages.indexOf(e)].background = await (await cache.match(e.name)).text()
                
                this.pages[pages.indexOf(e)].forceUpdate();
            }
            else {
                var cache = await caches.open(e.name)

                var imgData = await getBase64(await (await fetch("background.jpg")).blob())

                await cache.put(e.name, new Response(imgData))

                this.pages[pages.indexOf(e)].background = imgData

                this.pages[pages.indexOf(e)].forceUpdate();
            }
            }
        })

        if(this.pages[this.positionOffset]) {
            if(await caches.has(this.pages[this.positionOffset].name)) {
                var cache = await caches.open(this.pages[this.positionOffset].name)
          
                document.getElementById("backgroundLabel").style.backgroundImage = `url("${await (await cache.match(this.pages[this.positionOffset].name)).text()}")`
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
                    await caches.delete(this.pages[this.positionOffset].name)
        
                    var cache = await caches.open(this.pages[this.positionOffset].name)
                    await cache.put(this.pages[this.positionOffset].name, new Response(reader.result))
        
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
        return (
            <div id="pageContainer">
                {pages.map(e => e.html)}
            </div>
        )
    }
  }
  