from django.urls import path
from . import views       

urlpatterns = [
    path('', views.home_view, name='root'),
    path('home/', views.home_view, name='home'),
    path('about/', views.about_view, name='about'),
    path('explore/', views.explore_view, name='explore'),
    path('locations/', views.locations_view, name='locations'),
    path('upload/', views.upload_view, name='upload'),
    path('api/weather/', views.get_weather_api, name='get_weather'),
    path('api/search/', views.search_location, name='search_location'),

]