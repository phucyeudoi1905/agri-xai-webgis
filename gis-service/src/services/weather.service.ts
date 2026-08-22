import { Injectable, Logger } from '@nestjs/common';

export interface WeatherCondition {
  label: string;
  icon: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  rain: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  weatherCode: number;
  condition: string;
  icon: string;
  isDay: boolean;
  time: string;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  condition: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
}

export interface WeatherReport {
  location: { lat: number; lng: number };
  current: CurrentWeather;
  daily: DailyForecast[];
  agriAdvice: string;
}

const WMO_CODES: Record<number, WeatherCondition> = {
  0: { label: 'Trời quang đãng', icon: 'sun' },
  1: { label: 'Nắng nhẹ, ít mây', icon: 'sun' },
  2: { label: 'Mây rải rác', icon: 'cloud' },
  3: { label: 'Trời nhiều mây', icon: 'cloud' },
  45: { label: 'Sương mù', icon: 'cloud' },
  48: { label: 'Sương mù đọng sương', icon: 'cloud' },
  51: { label: 'Mưa phùn nhẹ', icon: 'cloud-rain' },
  53: { label: 'Mưa phùn vừa', icon: 'cloud-rain' },
  55: { label: 'Mưa phùn dày hạt', icon: 'cloud-rain' },
  61: { label: 'Mưa rào nhẹ', icon: 'cloud-rain' },
  63: { label: 'Mưa vừa', icon: 'cloud-rain' },
  65: { label: 'Mưa to', icon: 'cloud-rain' },
  80: { label: 'Mưa rào rải rác', icon: 'cloud-rain' },
  81: { label: 'Mưa rào vừa', icon: 'cloud-rain' },
  82: { label: 'Mưa rào rất to', icon: 'cloud-rain' },
  95: { label: 'Dông sét', icon: 'cloud-rain' },
  96: { label: 'Dông có mưa đá nhẹ', icon: 'cloud-rain' },
  99: { label: 'Dông bão dữ dội', icon: 'cloud-rain' },
};

function getCondition(code: number): WeatherCondition {
  return WMO_CODES[code] ?? { label: 'Nhiều mây', icon: 'cloud' };
}

function generateAgriAdvice(temp: number, humidity: number, rain: number, wind: number): string {
  if (rain > 10) {
    return 'Mưa lớn: Tạm hoãn bón phân và phun thuốc; kiểm tra hệ thống thoát nước bờ bao.';
  }
  if (temp > 35) {
    return 'Nhiệt độ cao: Tăng cường tưới giữ ẩm buổi sáng sớm và chiều mát, tránh để đất khô nứt.';
  }
  if (humidity > 85 && temp > 28) {
    return 'Độ ẩm và nhiệt độ cao: Điều kiện thuận lợi nấm khuẩn phát triển, cần thăm đồng thường xuyên.';
  }
  if (wind > 25) {
    return 'Gió mạnh: Không nên phun thuốc bảo vệ thực vật, chằng chống cây ăn trái có trái nặng.';
  }
  return 'Thời tiết thuận lợi cho các hoạt động canh tác, tưới tiêu và chăm sóc cây trồng.';
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  async getWeather(lat: number, lng: number): Promise<WeatherReport> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FBangkok`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) {
        throw new Error(`Open-Meteo responded with status ${res.status}`);
      }
      const data = await res.json();
      const curr = data.current;
      const dailyData = data.daily;

      const condition = getCondition(curr.weather_code);

      const daily: DailyForecast[] = (dailyData.time ?? []).slice(0, 4).map((date: string, i: number) => {
        const dCode = dailyData.weather_code[i] ?? 0;
        const dCond = getCondition(dCode);
        return {
          date,
          weatherCode: dCode,
          condition: dCond.label,
          icon: dCond.icon,
          tempMax: Number(dailyData.temperature_2m_max[i] ?? 0),
          tempMin: Number(dailyData.temperature_2m_min[i] ?? 0),
          precipitationSum: Number(dailyData.precipitation_sum[i] ?? 0),
          precipitationProbability: Number(dailyData.precipitation_probability_max[i] ?? 0),
          windSpeedMax: Number(dailyData.wind_speed_10m_max[i] ?? 0),
        };
      });

      const temp = Number(curr.temperature_2m ?? 30);
      const humidity = Number(curr.relative_humidity_2m ?? 75);
      const rain = Number(curr.precipitation ?? 0);
      const wind = Number(curr.wind_speed_10m ?? 10);

      return {
        location: { lat, lng },
        current: {
          temperature: temp,
          apparentTemperature: Number(curr.apparent_temperature ?? temp),
          humidity,
          precipitation: rain,
          rain: Number(curr.rain ?? 0),
          windSpeed: wind,
          windDirection: Number(curr.wind_direction_10m ?? 0),
          pressure: Number(curr.surface_pressure ?? 1010),
          weatherCode: curr.weather_code ?? 0,
          condition: condition.label,
          icon: condition.icon,
          isDay: Boolean(curr.is_day),
          time: curr.time ?? new Date().toISOString(),
        },
        daily,
        agriAdvice: generateAgriAdvice(temp, humidity, rain, wind),
      };
    } catch (err: any) {
      this.logger.warn(`Failed to fetch Open-Meteo weather for [${lat}, ${lng}]: ${err.message}. Using fallback.`);
      return this.getFallbackWeather(lat, lng);
    }
  }

  private getFallbackWeather(lat: number, lng: number): WeatherReport {
    const now = new Date();
    return {
      location: { lat, lng },
      current: {
        temperature: 20.5,
        apparentTemperature: 21.0,
        humidity: 82,
        precipitation: 0,
        rain: 0,
        windSpeed: 8.5,
        windDirection: 120,
        pressure: 1014,
        weatherCode: 1,
        condition: 'Nắng nhẹ, mát mẻ',
        icon: 'sun',
        isDay: true,
        time: now.toISOString(),
      },
      daily: [
        {
          date: now.toISOString().slice(0, 10),
          weatherCode: 1,
          condition: 'Nắng nhẹ, sương sớm',
          icon: 'sun',
          tempMax: 24,
          tempMin: 16,
          precipitationSum: 0,
          precipitationProbability: 10,
          windSpeedMax: 10,
        },
      ],
      agriAdvice: 'Khí hậu mát mẻ đặc trưng cao nguyên Đà Lạt, rất lý tưởng cho rau thủy canh, hoa và dâu tây phát triển.',
    };
  }
}
