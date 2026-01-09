import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from datetime import datetime, timedelta

# Create your views here.
def home_view(request):
    return render(request, 'pages/home.html')

def about_view(request):
    return render(request, 'pages/about.html')

def explore_view(request):
    return render(request, 'pages/explore.html')

def locations_view(request):
    return render(request, 'pages/locations.html')

def upload_view(request):
    return render(request, 'pages/upload.html')

def search_location(request):
    """Search for a location and return weather data"""
    
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse({'error': 'Search query is required'}, status=400)
    
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', 'YOUR_API_KEY_HERE')
    
    # Use geocoding API to search for locations
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct"
    geo_params = {
        'q': query,
        'limit': 5,
        'appid': api_key
    }
    
    try:
        response = requests.get(geo_url, params=geo_params, timeout=5)
        response.raise_for_status()
        locations = response.json()
        
        results = []
        for loc in locations:
            results.append({
                'name': loc['name'],
                'state': loc.get('state', ''),
                'country': loc['country'],
                'lat': loc['lat'],
                'lon': loc['lon'],
                'display_name': f"{loc['name']}, {loc.get('state', '')}, {loc['country']}".replace(', ,', ',')
            })
        
        return JsonResponse({'results': results})
        
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': 'Unable to search locations'}, status=500)

def get_weather_icon(weather_code, is_day=True):
    """Convert OpenWeatherMap icon code to FontAwesome icon class"""
    icon_mapping = {
        '01': 'fa-sun' if is_day else 'fa-moon',
        '02': 'fa-cloud-sun' if is_day else 'fa-cloud-moon',
        '03': 'fa-cloud',
        '04': 'fa-cloud',
        '09': 'fa-cloud-showers-heavy',
        '10': 'fa-cloud-rain',
        '11': 'fa-bolt',
        '13': 'fa-snowflake',
        '50': 'fa-smog'
    }
    code_prefix = weather_code[:2]
    return icon_mapping.get(code_prefix, 'fa-cloud')

def home(request):
    """Home page with weather data"""
    
    # Default location (can be changed based on user's IP or preferences)
    city = request.GET.get('city', 'Temecula')
    country = request.GET.get('country', 'US')
    
    # OpenWeatherMap API key - Add this to your settings.py
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', 'YOUR_API_KEY_HERE')
    
    # Current weather API call
    current_weather_url = f"http://api.openweathermap.org/data/2.5/weather"
    current_params = {
        'q': f"{city},{country}",
        'appid': api_key,
        'units': 'imperial'  # Use 'metric' for Celsius
    }
    
    # 7-day forecast API call
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast"
    forecast_params = {
        'q': f"{city},{country}",
        'appid': api_key,
        'units': 'imperial',
        'cnt': 40  # Get 5 days of data (8 readings per day)
    }
    
    context = {
        'weather': None,
        'forecast': [],
        'error': None
    }
    
    try:
        # Fetch current weather
        current_response = requests.get(current_weather_url, params=current_params, timeout=5)
        current_response.raise_for_status()
        current_data = current_response.json()
        
        # Parse current weather
        context['weather'] = {
            'city': current_data['name'],
            'country': current_data['sys']['country'],
            'temp': round(current_data['main']['temp']),
            'feels_like': round(current_data['main']['feels_like']),
            'condition': current_data['weather'][0]['description'].title(),
            'icon': get_weather_icon(current_data['weather'][0]['icon']),
            'humidity': current_data['main']['humidity'],
            'wind_speed': round(current_data['wind']['speed']),
            'visibility': round(current_data.get('visibility', 10000) / 1609.34),  # Convert to miles
            'updated': datetime.fromtimestamp(current_data['dt']).strftime('%I:%M %p')
        }
        
        # Fetch forecast
        forecast_response = requests.get(forecast_url, params=forecast_params, timeout=5)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()
        
        # Parse forecast - get one reading per day (noon reading)
        daily_forecasts = {}
        for item in forecast_data['list']:
            date = datetime.fromtimestamp(item['dt']).date()
            hour = datetime.fromtimestamp(item['dt']).hour
            
            # Get the midday reading (closest to noon)
            if date not in daily_forecasts or abs(hour - 12) < abs(daily_forecasts[date]['hour'] - 12):
                daily_forecasts[date] = {
                    'date': date,
                    'hour': hour,
                    'day': date.strftime('%a') if date != datetime.now().date() else 'Today',
                    'temp': round(item['main']['temp']),
                    'condition': item['weather'][0]['main'],
                    'icon': get_weather_icon(item['weather'][0]['icon'])
                }
        
        # Convert to list and sort by date
        context['forecast'] = sorted(daily_forecasts.values(), key=lambda x: x['date'])[:7]
        
    except requests.exceptions.RequestException as e:
        context['error'] = "Unable to fetch weather data. Please try again later."
        print(f"Weather API Error: {e}")
    except KeyError as e:
        context['error'] = "Error parsing weather data."
        print(f"Weather Data Parse Error: {e}")
    
    return render(request, 'home.html', context)


def get_weather_api(request):
    """AJAX endpoint for getting weather data for any location"""
    
    city = request.GET.get('city', '')
    if not city:
        return JsonResponse({'error': 'City parameter is required'}, status=400)
    
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', 'YOUR_API_KEY_HERE')
    
    url = f"http://api.openweathermap.org/data/2.5/weather"
    params = {
        'q': city,
        'appid': api_key,
        'units': 'imperial'
    }
    
    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        weather_data = {
            'city': data['name'],
            'country': data['sys']['country'],
            'temp': round(data['main']['temp']),
            'feels_like': round(data['main']['feels_like']),
            'condition': data['weather'][0]['description'].title(),
            'icon': get_weather_icon(data['weather'][0]['icon']),
            'humidity': data['main']['humidity'],
            'wind_speed': round(data['wind']['speed']),
            'visibility': round(data.get('visibility', 10000) / 1609.34)
        }
        
        return JsonResponse(weather_data)
        
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': 'Unable to fetch weather data'}, status=500)
    except KeyError as e:
        return JsonResponse({'error': 'Error parsing weather data'}, status=500)


def explore(request):
    """Explore page with community weather moments"""
    
    context = {
        'page': 'explore',
        # In production, fetch actual user posts from database
        # moments = Post.objects.filter(is_public=True).order_by('-created_at')
    }
    
    return render(request, 'explore.html', context)
    """Search for a location and return weather data"""
    
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse({'error': 'Search query is required'}, status=400)
    
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', 'YOUR_API_KEY_HERE')
    
    # Use geocoding API to search for locations
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct"
    geo_params = {
        'q': query,
        'limit': 5,
        'appid': api_key
    }
    
    try:
        response = requests.get(geo_url, params=geo_params, timeout=5)
        response.raise_for_status()
        locations = response.json()
        
        results = []
        for loc in locations:
            results.append({
                'name': loc['name'],
                'state': loc.get('state', ''),
                'country': loc['country'],
                'lat': loc['lat'],
                'lon': loc['lon'],
                'display_name': f"{loc['name']}, {loc.get('state', '')}, {loc['country']}".replace(', ,', ',')
            })
        
        return JsonResponse({'results': results})
        
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': 'Unable to search locations'}, status=500)