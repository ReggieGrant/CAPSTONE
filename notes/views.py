from django.shortcuts import render
from django.views.generic import ListView

from notes.models import Note

# Create your views here.

class NoteListView(ListView):
    model = Note
    template_name = 'notes/list.html'
    context_object_name = 'notes'