from django.urls import path
from . import views



urlpatterns = [
    # Define note-related URL patterns here
    path("", views.NoteListView.as_view(), name='notes_list'),
    path("create/", views.NoteCreateView.as_view(), name='notes_create'),
]