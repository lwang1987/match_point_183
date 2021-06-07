"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth, T
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later


db.define_table(
    'game',
    Field('title'),
    Field('date'),
    Field('moderator'),
    Field('scores'),
    Field('user_email', default=get_user_email),
)
db.game.user_email.readable = db.game.user_email.writable = False

db.define_table(
    'team',
    Field('game_id', 'reference game'),
    Field('team_name'),
    Field('avg_mmr'),
    Field('avg_kd'),
)

db.define_table(
    'player',
    Field('game_id', 'reference game'),
    Field('team_id', 'reference team'),
    Field('player_name'),
    Field('level'),
    Field('rank'),
    Field('mmr'),
    Field('kd'),
    Field('win_rate'),

    Field('kills', default = 0),
    Field('assists', default = 0),
    Field('deaths', default = 0),
    Field('plant_defuse', default = 0),
    Field('clutch', default = 0),
)

db.define_table(
    'shared_games',
    Field('game_id', 'reference game'),
    Field('game_title'),
    Field('shared_email'),
)


db.team.game_id.readable = db.team.game_id.writable = False
db.team.avg_mmr.readable = db.team.avg_mmr.writable = False
db.team.avg_kd.readable = db.team.avg_kd.writable = False

db.commit()
