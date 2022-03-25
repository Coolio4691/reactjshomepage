import * as vars from "../vars.js"
import * as util from "../util.js"

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
        vars.settingsClass = this;
        this.children = [];
    }

    async componentDidMount() {
        window.disabledScrollElements.push(document.getElementById("settingsMenu"))

        document.addEventListener("click", e => {
            var settingsMenu = document.getElementById("settingsMenu");

            if(settingsMenu.classList.contains("scale-up-bl")) {
                var a = e.target;
                while(a) {
                    if(a.id == "settings" || a.id == "settingsMenu") {
                        return;
                    }
                    a = a.parentNode
                }
                
                settingsMenu.classList.remove("scale-up-bl")
                settingsMenu.classList.add("scale-down-left")
            }
        })

        document.getElementById("settings").addEventListener("click", e => {
            var settingsMenu = document.getElementById("settingsMenu")

            if(settingsMenu.classList.contains("scale-up-bl")) {
                settingsMenu.classList.remove("hidden")
                settingsMenu.classList.remove("scale-up-bl")
                settingsMenu.classList.add("scale-down-left")
            } 
            else {
                settingsMenu.classList.remove("hidden")
                settingsMenu.classList.remove("scale-down-left")
                settingsMenu.classList.add("scale-up-bl")
            }
        })
        
        document.getElementById("settingsBtnImg").src = await util.getSetImage("settings.png");
    }

    render() {
        return (
            <>
                <div id="settings">
                    <img id="settingsBtnImg" style={{ display: "none" }} onLoad={e => e.target.style.display = "block" } className="button"/>
                </div>
                <div id="settingsMenu" className="hidden scale-down-left" style={{position: "absolute", overflow: "hidden"}}>
                    <div style={{overflow: "visible"}}>
                        {this.props.children}
                        {this.children.map(e => e) /* not sure why but i have to do this */}
                    </div>
                </div>
            </>
        )
    }
}

export { Settings }