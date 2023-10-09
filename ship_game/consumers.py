"""Here Websocket Consumers are defined.
"""
import datetime
from http.cookies import SimpleCookie
import secrets

from channels.generic.websocket import JsonWebsocketConsumer

from .models import Room, Player, RoomPlayerLink

# 3 years
SECONDS_COOKIE_LIVE = int(
    datetime.timedelta(
        days=365*3
    ).total_seconds()
)


class RoomConsumer(JsonWebsocketConsumer):
    """Websocket Consumer that work with users in room.
    """

    # region Websocket Events
    def connect(self):
        """On user connect.
        """
        accept_kwargs = {}

        room_rec = self.cur_room_rec()

        if 'player_token' in self.scope['cookies']:
            cur_player_token = self.scope['cookies']['player_token']

            found_player = self.one_cur_player_rec(cur_player_token)

            if found_player:

                cur_player_in_cur_room = RoomPlayerLink.objects.filter(
                    player=found_player,
                    room=room_rec,
                )
                if not cur_player_in_cur_room:
                    RoomPlayerLink(
                        player=found_player,
                        room=room_rec,
                    ).save()
            else:
                self.add_not_registered_player(
                    room_rec, cur_player_token
                )
        else:
            if room_rec.allow_player_creation:

                new_player_token = secrets.token_urlsafe()

                cookie_obj = SimpleCookie()
                cookie_obj['player_token'] = new_player_token
                cookie_obj['player_token'].update({
                    'HttpOnly': True,
                    'SameSite': 'Strict',
                    'Path': '/',
                    'Max-Age': SECONDS_COOKIE_LIVE,
                })

                accept_kwargs['subprotocol'] = (
                    None, {
                        'Set-Cookie': cookie_obj.output(header='').strip()
                    }
                )
                # Modify scope, as if cookie were changed, because Consumer does
                # not see cookie change, until socket disconnect+connect.
                self.scope['cookies']['player_token'] = new_player_token

                self.add_not_registered_player(
                    room_rec, new_player_token
                )

        self.accept(
            **accept_kwargs
        )

    def disconnect(self, code):
        """On user disconnect.
        """

    def receive_json(self, content, **kwargs):
        """On receiving message from user.
        """
        is_admin = self.scope['user'].is_superuser
        cur_player_token = self.scope['cookies'].get('player_token')

        room_rec = self.cur_room_rec()
        found_player = (
            self.one_cur_player_rec(cur_player_token)
            if cur_player_token

            else None
        )

        match content['type']:
            case 'need_init_data':
                players2register = []

                if is_admin:
                    if room_rec.unknown_player_token_list:
                        # need special branch, because ''.split(',')==['']
                        players2register = [
                            {'id': token}
                            for token in room_rec.unknown_player_token_list.split(',')
                        ]
                else:
                    if (
                        cur_player_token and
                        (not found_player)
                    ):
                        # you:
                        # 1) are not admin
                        # 2) have token
                        # 3) are not registered as player
                        # then show your temporary profile anyway
                        players2register = [{
                            'id': cur_player_token
                        }]

                msg_list = [
                    {
                        'type': 'config/set_your_id',
                        'payload': found_player and found_player.id or cur_player_token,
                    },
                    {
                        'type': 'players/add_many',
                        'payload': [
                            {
                                'id': p_n_r.player.id,
                                'name': p_n_r.player.name,
                                'color': p_n_r.player.color,
                                'ready': p_n_r.ready,
                            }
                            for p_n_r in room_rec.player_n_ready_set.all()
                        ]+players2register,
                    }
                ]

                if is_admin:
                    msg_list.append({
                        'type': 'config/set_admin',
                    })

                self.send_json(msg_list)
            case 'player_token2player':
                if is_admin:
                    new_name = content['name']
                    new_player = Player(
                        token=content['p_token'],
                        name=new_name,
                        name_for_admin=new_name,
                    )
                    new_player.save()

                    RoomPlayerLink(
                        player=new_player,
                        room=room_rec,
                    ).save()

                    current_token_list = room_rec.unknown_player_token_list.split(
                        ','
                    )
                    current_token_list.remove(
                        content['p_token']
                    )
                    room_rec.unknown_player_token_list = ','.join(
                        current_token_list
                    )
                    room_rec.save()

                    self.send_json([
                        {
                            'type': 'players/remove_one',
                            'payload': content['p_token'],
                        },
                        {
                            'type': 'players/add_one',
                            'payload': {
                                'id': new_player.id,
                                'name': new_name,
                                'color':new_player.color,
                                'ready': False,
                            },
                        },
                    ])
                else:
                    # js Should prevent this message to be send from not admin
                    raise Exception(
                        'Not enough permissions'
                    )
            case 'player_profile_update':
                if found_player:
                    found_player.name=content['name']
                    found_player.color=content['color']
                    found_player.save()

                    self.send_json([
                        {
                            'type': 'players/update_one',
                            'payload': {
                                'id': found_player.id,
                                'changes': {
                                    'name': content['name'],
                                    'color': content['color'],
                                }
                            },
                        },
                    ])
                else:
                    # js Should prevent this message to be send from not player
                    raise Exception(
                        'Not enough permissions'
                    )
            case _:
                raise NotImplementedError(
                    'Unknown client message type',
                    content['type']
                )

    # endregion

    # region Helpers

    def cur_room_rec(self):
        """Get current room record.
        """
        return Room.objects.get(
            pk=int(
                self.scope["url_route"]["kwargs"]["room_id"]
            )
        )

    def one_cur_player_rec(self, token):
        """Get exactly one current player record or empty query-set.
        """
        player_recs = Player.objects.filter(
            token=token
        )

        match len(player_recs):
            case 0:
                return player_recs
            case 1:
                return player_recs[0]
            case _:
                # constraint should limit DB to have same token players
                raise NotImplementedError()

    def add_not_registered_player(self, room_rec, token):
        """Add semi created player token to unknown_player_token_list.
        """
        token_str = room_rec.unknown_player_token_list

        if token_str:
            # already has tokens in list

            current_token_list = token_str.split(',')

            if token not in current_token_list:
                current_token_list.append(token)
                room_rec.unknown_player_token_list = ','.join(
                    current_token_list
                )
                room_rec.save()
        else:
            # storing first token

            # need special branch, because ''.split(',')==['']

            room_rec.unknown_player_token_list = token
            room_rec.save()

    # endregion
