from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView
from notes.models import Note
from .forms import NoteForm

# Create your views here.

class NoteListView(ListView):
    model = Note
    template_name = 'notes/list.html'
    context_object_name = 'notes'

class NoteCreateView(CreateView):
    model = Note
    template_name = 'notes/create.html'
    form_class = NoteForm
    success_url = reverse_lazy('notes_list')