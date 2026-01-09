from django.db import models

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Note(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='media/notes', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='notes')
    user = models.CharField(max_length=100)  # Placeholder for user association
    def __str__(self):
        return self.title
