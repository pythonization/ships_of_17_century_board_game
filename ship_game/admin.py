"""Register models to show in admin interface.
"""
from django.contrib import admin

from . import models

admin.site.register(models.Player)
admin.site.register(models.Room)
