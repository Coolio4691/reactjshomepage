class Page extends React.Component {
  constructor(props) {
    super(props);
    pageContainer.pages.push(this)
    this.state = { position: pageContainer.pages.indexOf(this), hidden: false };
    
    this.pageIconElem = React.createRef()

    this.pageIcon = <img onLoad={this.onLoad} ref={this.pageIconElem} src={this.props.icon} position={pageContainer.pages.indexOf(this)} onClick={handleClick}/>

    pageBody.setState({ pageIcons: pageBody.state.pageIcons += 1 })

    pageIcons.push(this.pageIcon)
  }

  onLoad(e) {
    if(e.target.getAttribute("position") == 0) e.target.setAttribute("selected", "")
  }

  render() {
    if(this.state.hidden) return null;
    
    return ( 
        <div ref={elem => this.page = elem} className="page">
            {this.props.children}
        </div>
    );
  }
}
