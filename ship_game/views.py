"""Here views are defined.
"""
from django.shortcuts import get_object_or_404, render
from django.views.generic import ListView
# from django.http import HttpResponse

from ship_game.models import Room


class HomeListView(ListView):
    """Home page with available rooms.
    """
    model = Room

    # def get_context_data(self, **kwargs):
    #     context = super(HomeListView, self).get_context_data(**kwargs)
    #     print(context, kwargs)
    #     return context


home_list_view = HomeListView.as_view(
    queryset=Room.objects.all(),
    context_object_name='room_list',
    template_name='ship_game/home.html',
)


def rules(request):
    """Rule page.
    """
    return render(
        request,
        'ship_game/rules.html',
        {}
    )


def map_editor(request):
    """Map editor page.
    """
    return render(
        request,
        'ship_game/map_editor.html',
        {}
    )


def room(request, room_id):
    """View room page.
    """
    room_rec = get_object_or_404(Room, pk=room_id)
    return render(
        request,
        "ship_game/room.html",
        {
            "room_d": {
                'id': room_rec.id,
                'name': room_rec.name,
            }
        }
    )
