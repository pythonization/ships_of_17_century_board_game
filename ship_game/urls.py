"""Here URLs are configured.
"""
from django.urls import path
from ship_game import views

urlpatterns = [
    path("", views.home_list_view, name="home"),
    path("rules", views.rules, name="rules"),

    path("room/<int:room_id>", views.room, name="room"),

    path("editor", views.map_editor, name="map_editor"),
]
