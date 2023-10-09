"""Django models defined here.
"""
from django.db import models


class Player(models.Model):
    """Player of a game.
    """
    token = models.CharField(
        max_length=255,
        unique=True
        # to be filled indirectly via secrets.token_urlsafe()
        # for now 43 characters is expected, but default on token_urlsafe may
        # later change
    )

    name = models.CharField(
        max_length=50,
        unique=True
    )
    name_for_admin = models.CharField(
        max_length=50,
        unique=True
    )

    color = models.CharField(
        max_length=6,
        default='77767B',
    )

    can_rename = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return self.name


class Room(models.Model):
    """Room where a game is prepared.

    Players should enter room first to start a game.
    """
    name = models.CharField(
        max_length=50,
        unique=True
    )
    active = models.BooleanField(
        default=True,
    )
    allow_player_creation = models.BooleanField()

    unknown_player_token_list = models.TextField(
        editable=False,
        blank=True,
    )

    # maybe not need
    participants = models.ManyToManyField(
        Player,
        through='RoomPlayerLink',
    )

    def __str__(self):
        return self.name


class RoomPlayerLink(models.Model):
    """Link between room and player with additional fields.
    """
    player = models.ForeignKey(
        Player, models.CASCADE,
    )
    room = models.ForeignKey(
        Room,
        models.CASCADE,
        related_name="player_n_ready_set",
    )

    ready = models.BooleanField(
        default=False,
    )

    class Meta:
        """Create unique constraint.
        """
        constraints = [
            models.UniqueConstraint(
                fields=['player', 'room'],
                name="unique_player_room"
            )
        ]
