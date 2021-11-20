class Page extends React.Component {
  constructor(props) {
    super(props);
    
    if(pageContainer.pages.indexOf(this) <= -1)
      pageContainer.pages.push(this)

    this.state = { position: pageContainer.pages.indexOf(this), hidden: false };

    this.addImg();
  }

  addImg() {
    this.removeImg();
    
    this.pageIconElem = React.createRef()

    this.pageIcon = <img id={this.name} onLoad={this.onLoad} ref={this.pageIconElem} src={this.props.icon} position={pageContainer.pages.indexOf(this)} onClick={handleClick}/>

    pageBody.forceUpdate();
    
    pageIcons.push(this.pageIcon)
  }

  removeImg() {
    pageIcons = pageIcons.filter(e => e.props.src != this.props.icon)
  }

  componentDidMount() {
    if(pageContainer.pages.indexOf(this) <= -1)
      pageContainer.pages.push(this)
  }

  componentWillUnmount() {
    pageContainer.pages = pageContainer.pages.filter(i => i != this)
  }

  onLoad(e) {
    if(e.target.getAttribute("position") == 0) e.target.setAttribute("selected", "")
  }

  render() {
    if(this.state.hidden) return null;
    
    if(pageContainer.pages.indexOf(this) <= -1)
      pageContainer.pages.push(this)

    return ( 
        <div style={{ backgroundImage: (this.background ? `url("${this.background}")` : ``) }} ref={elem => this.page = elem} className="page">
            {this.props.children}
        </div>
    );
  }
}
