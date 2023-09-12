import { DateTime } from "luxon";

const API_KEY="a636c17a84e9ff2a5367daa1c5762308";
const BASE_URL='https://api.openweathermap.org/data/2.5';


const getWeatherData=(infoType, searchParams)=>{
  const url = new URL(BASE_URL+'/'+infoType);
  url.search= new URLSearchParams({...searchParams,appid:API_KEY})

  return fetch(url)
  .then((res)=>res.json()
  .then((data)=>data))

}

const formattedCurrentWeather =(data)=>{
  const{
    coord: {lat, lon},
    main: {temp, feels_like, temp_min, temp_max, humidity},
    name,
    dt,
    sys: {country,sunrise, sunset},
    weather,
    wind:{speed}
  }=data

  const {main:details,icon}=weather[0]

  return{lat, lon, temp, feels_like, temp_min, temp_max,humidity,name,dt,country,sunrise,sunset,details,icon, speed}

}

const formatToLocalTime=(secs, zone, 
  format="cccc, dd LLL yyyy |  HH:mm  ")=>DateTime.fromSeconds(secs).setZone(zone).toFormat(format)

const formatForecastWeather =(data)=>{
  // console.log(data);
  let {timezone, daily, hourly}=data;
  daily=daily.slice(1,6).map(d=>{
    return{
      title: formatToLocalTime(d.dt, timezone, 'ccc'),
      temp: d.temp.day,
      icon: d.weather[0].icon
    }
  })


  hourly=hourly.slice(1,6).map(d=>{
    return{
      title: formatToLocalTime(d.dt, timezone, 'HH:mm'),
      temp: d.temp,
      icon: d.weather[0].icon
    }
  })

  return {timezone, daily, hourly};
}

const getFormattedWeatherData= async(searchParams)=>{
  const formattedData = await getWeatherData('weather',searchParams).then((data) =>formattedCurrentWeather(data))

  const {lat, lon} = formattedData;

  const formattedForecastWeather = await getWeatherData('onecall',{
    lat,lon,exclude:'current,minutely,alerts',units:searchParams.units
  }).then(formatForecastWeather)

  return {...formattedData, ...formattedForecastWeather}
}

const iconUrlFromCode=(code)=>`http://openweathermap.org/img/wn/${code}@2x.png`;



export default getFormattedWeatherData;

export {formatToLocalTime, iconUrlFromCode}