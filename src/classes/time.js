class Time extends React.Component {
    constructor(props) {
      super(props);
      this.state = { time: new Date() };
      this.timeLoop();
    }
  
    timeLoop() {
        var secondsRemaining = (60 - this.state.time.getSeconds()) * 1000;

        setTimeout(() => {
            this.setState({ time: new Date() })

            this.timeLoop();
        }, secondsRemaining);
    }

    render() {
        return (
            <div id="time" className="time">
                <h1>{`${this.state.time.toLocaleString('default', { month: 'long' }).substr(0, 3)} ${this.state.time.getDate()} ${this.state.time.getHours()}:${(this.state.time.getMinutes() < 10 ? '0' : '') + this.state.time.getMinutes()}`}</h1>
            </div>
        )
    }
  }
  

export { Time }