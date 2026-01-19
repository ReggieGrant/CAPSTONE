from django.urls import path
from . import views




urlpatterns = [
    # Define user-related URL patterns here
   path('login/', views.UserLoginView.as_view(), name='login'),
   path('logout/', views.UserLogoutView.as_view(), name='logout'),
   path('register/', views.UserRegisterView.as_view(), name='register'),
]