var settings = ["background"];
var settingsClass

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
        settingsClass = this;
        this.children = [];
    }

    componentDidMount() {
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
    }

    render() {
        return (
            <>
                <div id="settings">
                    <img className="button" src="settings.png"/>
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