class PageContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = { };
      this.pages = [];
      this.positionOffset = 0;

      pageContainer = this;
    }

    componentDidMount() {
        pages.every(e => { 
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
        })
    }
  
    render() {
        return (
            <div id="pageContainer">
                {pages.map(e => e.html)}
            </div>
        )
    }
  }
  