import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from datetime import datetime

from notes.models import Note

# ==================== EXISTING VIEWS ====================
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

def note_details_view(request, note_id):
    note = Note.objects.get(id=note_id)
    return render(request, 'pages/note_details.html', {'note': note})

def community_view(request):
    return render(request, 'pages/community.html')

# ==================== HELPER FUNCTIONS ====================
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
    code_prefix = weather_code[:2] if len(weather_code) >= 2 else weather_code
    return icon_mapping.get(code_prefix, 'fa-cloud')

# ==================== MAIN HOME VIEW ====================
def home(request):
    """Home page with weather data"""
    
    print("=" * 50)
    print("HOME VIEW CALLED")
    print("=" * 50)
    
    # Default location
    city = request.GET.get('city', 'Temecula')
    country = request.GET.get('country', 'US')
    
    print(f"Requested city: {city}, {country}")
    
    # Get API key from settings
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', '')
    
    print(f"API Key found: {'Yes' if api_key else 'NO - THIS IS THE PROBLEM!'}")
    if api_key:
        print(f"API Key (first 10 chars): {api_key[:10]}...")
    
    # API endpoints
    current_weather_url = "http://api.openweathermap.org/data/2.5/weather"
    forecast_url = "http://api.openweathermap.org/data/2.5/forecast"
    
    current_params = {
        'q': f"{city},{country}",
        'appid': api_key,
        'units': 'imperial'
    }
    
    forecast_params = {
        'q': f"{city},{country}",
        'appid': api_key,
        'units': 'imperial',
        'cnt': 40
    }
    
    context = {
        'weather': None,
        'forecast': [],
        'error': None
    }
    
    try:
        print("Making API request for current weather...")
        
        # Fetch current weather
        current_response = requests.get(current_weather_url, params=current_params, timeout=5)
        
        print(f"API Response Status: {current_response.status_code}")
        
        if current_response.status_code != 200:
            print(f"API Error Response: {current_response.text}")
            raise requests.exceptions.RequestException(f"API returned {current_response.status_code}")
        
        current_data = current_response.json()
        
        print(f"Weather data received for: {current_data.get('name', 'Unknown')}")
        
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
            'visibility': round(current_data.get('visibility', 10000) / 1609.34),
            'updated': datetime.fromtimestamp(current_data['dt']).strftime('%I:%M %p')
        }
        
        print(f"Weather object created successfully!")
        print(f"Temperature: {context['weather']['temp']}°F")
        print(f"Condition: {context['weather']['condition']}")
        
        # Fetch forecast
        print("Making API request for forecast...")
        forecast_response = requests.get(forecast_url, params=forecast_params, timeout=5)
        
        if forecast_response.status_code == 200:
            forecast_data = forecast_response.json()
            
            # Parse forecast
            daily_forecasts = {}
            for item in forecast_data['list']:
                date = datetime.fromtimestamp(item['dt']).date()
                hour = datetime.fromtimestamp(item['dt']).hour
                
                if date not in daily_forecasts or abs(hour - 12) < abs(daily_forecasts[date]['hour'] - 12):
                    daily_forecasts[date] = {
                        'date': date,
                        'hour': hour,
                        'day': date.strftime('%a') if date != datetime.now().date() else 'Today',
                        'temp': round(item['main']['temp']),
                        'condition': item['weather'][0]['main'],
                        'icon': get_weather_icon(item['weather'][0]['icon'])
                    }
            
            context['forecast'] = sorted(daily_forecasts.values(), key=lambda x: x['date'])[:7]
            print(f"Forecast loaded: {len(context['forecast'])} days")
        else:
            print(f"Forecast request failed with status {forecast_response.status_code}")
        
        print("✓ SUCCESS: Weather data loaded!")
        
    except requests.exceptions.RequestException as e:
        error_msg = f"Unable to fetch weather data. Please check your internet connection."
        context['error'] = error_msg
        print(f"✗ REQUEST ERROR: {str(e)}")
        
    except KeyError as e:
        error_msg = f"Error parsing weather data from API."
        context['error'] = error_msg
        print(f"✗ PARSE ERROR: Missing key {str(e)}")
        
    except Exception as e:
        error_msg = f"An unexpected error occurred."
        context['error'] = error_msg
        print(f"✗ UNEXPECTED ERROR: {str(e)}")
    
    print("=" * 50)
    print(f"Final Context:")
    print(f"  - weather: {'✓ Available' if context['weather'] else '✗ None'}")
    print(f"  - forecast: {len(context['forecast'])} days")
    print(f"  - error: {context['error'] if context['error'] else 'None'}")
    print("=" * 50)
    
    return render(request, 'pages/home.html', context)


# ==================== API ENDPOINTS ====================
def get_weather_api(request):
    """AJAX endpoint for getting weather data for any location"""
    
    city = request.GET.get('city', '')
    if not city:
        return JsonResponse({'error': 'City parameter is required'}, status=400)
    
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', '')
    
    url = "http://api.openweathermap.org/data/2.5/weather"
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
        
    except requests.exceptions.RequestException:
        return JsonResponse({'error': 'Unable to fetch weather data'}, status=500)
    except KeyError:
        return JsonResponse({'error': 'Error parsing weather data'}, status=500)


def search_location(request):
    """Search for a location and return results"""
    
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse({'error': 'Search query is required'}, status=400)
    
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', '')
    
    geo_url = "http://api.openweathermap.org/geo/1.0/direct"
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
        
    except requests.exceptions.RequestException:
        return JsonResponse({'error': 'Unable to search locations'}, status=500)


# ==================== EXPLORE PAGE ====================
def explore(request):
    """Explore page with community weather moments"""
    
    context = {
        'page': 'explore',
    }
    
    return render(request, 'pages/explore.html', context)