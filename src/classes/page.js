import * as vars from "../vars.js"
import { handleClick } from "../util.js"

const removeByIndex = (list, index) =>
      [
        ...list.slice(0, index),
        ...list.slice(index + 1)
      ];
         

class Page extends React.Component {
  constructor(props) {
    super(props);
    
    vars.pageContainer.addPage(this);

    this.state = { position: vars.pageContainer.pages.indexOf(this), hidden: false };

    this.addImg();
  }

  addImg() {
      
    this.removeImg();
    
    this.pageIconElem = React.createRef()

    this.pageIcon = <img key={`${this.name}Key`} id={this.name} onLoad={this.onLoad} ref={this.pageIconElem} src={this.props.icon} position={vars.pageContainer.pages.indexOf(this)} onClick={handleClick}/>
    
    vars.pageIcons.push(this.pageIcon)

    vars.pageBody.forceUpdate();
  }

  removeImg() {
    vars.setIcons(vars.pageIcons.filter(e => e.props.id != this.name))

    vars.pageBody.forceUpdate();
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    vars.pageContainer.pages = vars.pageContainer.pages.filter(i => i != this)
    vars.pageContainer.removePage(this);
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


export { Page }