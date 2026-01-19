from django.urls import path
from . import views

urlpatterns = [
    # Main pages
    path('', views.home, name='home'),  # Weather homepage
    path('explore/', views.explore, name='explore'),
    path('locations/', views.locations_view, name='locations'),
    path('upload/', views.upload_view, name='upload'),
    path('about/', views.about_view, name='about'),
    path('community/', views.community_view, name='community'),
    path('contact/', views.contact_view, name='contact'),
    
    # API endpoints
    path('api/weather/', views.get_weather_api, name='get_weather'),
    path('api/search/', views.search_location, name='search_location'),
    
    # Notes (if needed)
    path('note/<int:note_id>/', views.note_details_view, name='note_details'),
]