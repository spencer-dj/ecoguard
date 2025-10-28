from django.contrib import admin
from .models import AnimalMovement
from .models import PredictionResult

admin.site.register(AnimalMovement)
admin.site.register(PredictionResult)