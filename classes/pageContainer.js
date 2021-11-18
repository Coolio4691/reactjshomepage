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

      pageContainer = this;
    }

    async componentDidMount() {

        await pages.every(async e => { 
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

            this.pages[pages.indexOf(e)].name = e.name;

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
        })

        if(await caches.has(this.pages[this.positionOffset].name)) {
            var cache = await caches.open(this.pages[this.positionOffset].name)
      
            document.getElementById("backgroundLabel").style.backgroundImage = `url("${await (await cache.match(this.pages[this.positionOffset].name)).text()}")`
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
  