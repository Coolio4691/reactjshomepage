class Weather extends React.Component {
    constructor(props) {
      super(props);
      this.state = { time: new Date() };
      this.weatherLoop();
    }
  
    async weatherLoop() {
        this.weather = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?id=2145461&appid=51473f473ba9fc29fc3b5735dd245eff&units=metric`)).json()
        this.forecast = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?id=2145461&appid=51473f473ba9fc29fc3b5735dd245eff&units=metric`)).json()
        this.setState({ time: new Date() })

        var minutesRemaining = (60 - this.state.time.getMinutes()) * 60000;

        setTimeout(async () => {
            this.weather = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?id=2145461&appid=51473f473ba9fc29fc3b5735dd245eff&units=metric`)).json()
            this.setState({ time: new Date() })

            this.weatherLoop();
        }, minutesRemaining);
    }

    getWeather(type) {
        switch(type) {
            case "temp":
                if(this.weather == null) return "0.0C"
                return `${this.weather.main.temp}C`
            case "min":
                if(this.weather == null) return "0.0C"
                return `${this.weather.main.temp_min}C`
            case "max":
                if(this.weather == null) return "0.0C"
                return `${this.weather.main.temp_max}C`
            case "humidity":
                if(this.weather == null) return "0%"
                return `${this.weather.main.humidity}%`
            case "rain":
                if(this.weather == null) return "0mm"
                if(this.weather.precipitation) return this.weather.precipitation.value + "mm";
                return "0mm"
            case "clouds":
                if(this.weather == null) return "0"
                return `${this.weather.clouds.all}`
            case "icon":
                if(this.weather == null) return "";
                return `https://openweathermap.org/img/w/${this.weather.weather[0].icon}.png`
            case "description":
                if(this.weather == null) return "";
                return this.weather.weather[0].description
            default:
                return ""
        }
    }

    render() {
        return (
            <>
            <img title={this.getWeather("description")} src={this.getWeather("icon")} id="weatherIcon" style={{width: 40 + "px", height: 40 + "px", float: "right", zIndex: -1, marginLeft: -10 + "px", marginTop: -2 + "px", display: "none"}} onLoad={e => e.target.style.display = "block"} />
            <div id="weather" className="categoryWrapper">
                <h1 style={{pointerEvents: "auto", userSelect: "auto", cursor: "pointer"}} id="weatherText">{this.getWeather("temp")}</h1>
                <div id="weatherBox" style={{pointerEvents: "none"}}><span><span><span>
                    <span className="weatherText">Temp: </span>
                    <i style={{marginLeft: 8 + "px"}} className="arrow down"></i>
                    <span id="weatherLow" className="weatherText">{this.getWeather("min")}</span>
                    <i style={{marginLeft: 10 + "px"}} className="arrow up"></i>
                    <span id="weatherHigh" className="weatherText">{this.getWeather("max")}</span>
                    
                    <span style={{position: "absolute", top: 30 + "px"}} className="weatherText">Humidity: </span>
                    <span id="weatherHumidity" style={{position: "absolute", top: 31 + "px", left: 80 + "px"}} className="weatherText">{this.getWeather("humidity")}</span>

                    <span style={{position: "absolute", top: 60 + "px"}} className="weatherText">Rain: </span>
                    <span id="weatherRain" style={{position: "absolute", top: 61 + "px", left: 45 + "px"}} className="weatherText">0mm</span>

                    <span style={{position: "absolute", top: 210 + "px"}} className="weatherText">Clouds: </span>
                    <span id="weatherClouds" style={{position: "absolute", top: 211 + "px", left: 65 + "px"}} className="weatherText">{this.getWeather("clouds")}</span>
                    </span></span></span>
                </div>
            </div>
            </>
        )
    }
}
  

//http://api.openweathermap.org/data/2.5/weather?id=2145461&appid=51473f473ba9fc29fc3b5735dd245eff