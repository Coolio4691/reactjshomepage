class Page extends React.Component {
  constructor(props) {
    super(props);
    pageContainer.pages.push(this)
    this.state = { position: pageContainer.pages.indexOf(this), hidden: false };
    
    this.pageIconElem = React.createRef()

    this.pageIcon = <img onLoad={this.onLoad} ref={this.pageIconElem} src={this.props.icon} position={pageContainer.pages.indexOf(this)} onClick={handleClick}/>

    pageBody.setState({ pageIcons: pageBody.state.pageIcons += 1 })

    pageIcons.push(this.pageIcon)
    
    if(!settingsClass.hasBGChanger) {
      settingsClass.hasBGChanger = true;

      settingsClass.children.push((
        <label id="backgroundLabel" htmlFor="backgroundFile">
          <input id="backgroundFile" type="file"/>
        </label>
      ))

      settingsClass.forceUpdate();

      this.addFileEvent()
    }

  }

  addFileEvent() {
    if(document.getElementById("backgroundFile")) {
      document.getElementById("backgroundFile").addEventListener("change", e => {
        var file = e.target.files[0]

        if(!file.type.includes("image")) return;

        var reader = new FileReader();
        reader.addEventListener("load", async () => {
            //await queryDB(`UPDATE backgroundImages SET image = '${reader.result}' WHERE id = '${localStorage.getItem("uid")}' AND page = '${currentPage.attributes["name"].value.toLowerCase()}'`)
            
            await caches.delete(pageContainer.pages[pageContainer.positionOffset].name)

            var cache = await caches.open(pageContainer.pages[pageContainer.positionOffset].name)
            await cache.put(pageContainer.pages[pageContainer.positionOffset].name, new Response(reader.result))

            pageContainer.pages[pageContainer.positionOffset].background = reader.result

            document.getElementById("backgroundLabel").style.backgroundImage = `url("${reader.result}")`
        
            pageContainer.pages[pageContainer.positionOffset].forceUpdate();
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

  onLoad(e) {
    if(e.target.getAttribute("position") == 0) e.target.setAttribute("selected", "")
  }

  render() {
    if(this.state.hidden) return null;
    
    return ( 
        <div style={{ backgroundImage: (this.background ? `url("${this.background}")` : ``) }} ref={elem => this.page = elem} className="page">
            {this.props.children}
        </div>
    );
  }
}
