class Body extends React.Component {
    constructor(props) {
      super(props);
      pageBody = this;
      this.state = { pageIcons: 0 };
    }
  
    render() {
        return (
            <>
                <div id="topbar">
                    <Time />
                    <Weather />
                </div>
                <div id="sidebar">
                    <div id="pageList">
                        {pageIcons}
                    </div>
                </div>
                <PageContainer/>
            </>
        )
    }
  }
  