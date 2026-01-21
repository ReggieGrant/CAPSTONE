from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic.edit import CreateView
from django.contrib.auth.models import User
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy


class UserLoginView(LoginView):
    template_name = 'users/login.html'

    def get_success_url(self):
        return reverse_lazy('profile')

class UserLogoutView(LogoutView):
    next_page = reverse_lazy('login')



class UserRegisterView(CreateView, forms.ModelForm):
    form_class = UserCreationForm
    template_name = 'users/register.html'
    success_url = reverse_lazy('login')
    model = User

    def get_form_class(self):
        return UserCreationForm

    def form_valid(self, form):
        user = form.save(commit=False)
        pass_text = form.cleaned_data['password1']
        user.save()

        return super().form_valid(form)