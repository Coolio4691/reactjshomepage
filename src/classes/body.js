import * as vars from '../vars.js'
import * as time from "./time.js"
import * as weather from "./weather.js"
import * as settings from "./settings.js"
import * as pagecontainer from "./pageContainer.js"

class Body extends React.Component {
    constructor(props) {
      super(props);
      vars.pageBody = this;
      this.state = { pageIcons: 0 };
    }
  
    render() {
        return (
            <>
                <div id="topbar">
                    <time.Time />
                    <weather.Weather />
                </div>
                <div id="sidebar">
                    <div id="pageList">
                        {vars.pageIcons}
                    </div>

                    <settings.Settings>
                    </settings.Settings>
                </div>
                <pagecontainer.PageContainer/>
            </>
        )
    }
  }
  

export { Body }