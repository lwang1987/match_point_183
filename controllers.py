
"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:
    http://127.0.0.1:8000/{app_name}/{path}
If app_name == '_default' then simply
    http://127.0.0.1:8000/{path}
If path == 'index' it can be omitted:
    http://127.0.0.1:8000/
The path follows the bottlepy syntax.
@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object
session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""
import time
from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email
from py4web.utils.form import Form, FormStyleBulma
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import defaultdict
from .private.secret_settings import API_KEY
url_signer = URLSigner(session)

@action('index')
@action.uses(db, auth.user, url_signer, 'front.html')

def front():
    games = db(db.game.user_email == get_user_email()).select()
    shared_games = db(db.shared_games.shared_email == get_user_email()).select()
    return dict(games = games, shared_games = shared_games, url_signer=url_signer)

@action('share_email', method="POST")
@action.uses(url_signer.verify(), db)
def edit_tname():
    # Updates the db record.
    print("HERE")
    game_id = request.json.get("game_id")
    game_title = request.json.get("game_title")
    value = request.json.get("value")
    assert game_id is not None and value is not None
    db.shared_games.insert(
        game_id = game_id,
        game_title = game_title,
        shared_email = value,
    )
    return "ok"

@action('check_match/<game_id:int>', method = ["GET","POST"])
@action.uses(db, session, auth.user, 'match_result.html')
def check_match(game_id = None):
    assert game_id is not None
    print(game_id)
    game_title = db.game[game_id].title
    teams = db(db.team.game_id == game_id).select()
    team1 = db(db.player.team_id == teams[0].id).select()
    team2 = db(db.player.team_id == teams[1].id).select()
    print(team1)
    print(team2)
    return dict(game_title=game_title, team1 = team1, team2 = team2, game_id = game_id, team1name = teams[0].team_name, 
                team2name = teams[1].team_name, team1id = teams[0].id, team2id = teams[1].id,
                share_email_url = URL('share_email', signer=url_signer), load_email_url = URL('load_email', signer = url_signer))






@action('create_game',method = ["GET","POST"])
@action.uses(db, auth.user, url_signer, 'create_game.html')
def create_match():
    form = Form(db.game, csrf_session = session, formstyle = FormStyleBulma)
    if form.accepted:
        print("accepted!")
        games = db(db.game.user_email == get_user_email()).select().as_list()
        new_game = games[-1]
        id = new_game["id"]

        redirect(URL('front', id, signer=url_signer))
    return dict(form=form)

@action('delete_game/<game_id>',method = ["GET"])
@action.uses(db,session,auth.user,url_signer.verify())
def delete_player(game_id=None):
    assert game_id is not None
    p = db.game[game_id]
    if p is None:
        redirect(URL('index'))
    p.delete_record()
    redirect(URL('index'))

@action('front/<game_id:int>', method=["GET","POST"])
@action.uses(db, session, auth.user, url_signer.verify(), 'index.html')
def index(game_id = None):
    assert game_id is not None
    games = db(db.game.user_email == get_user_email()).select().as_list()
    game = db.game[game_id]
    print("game:")
    print(game)
    print("")

    teams = db(db.team.game_id == game['id']).select()
    if db(db.team.game_id == game['id']).isempty():
        print("no teams yet")
        db.team.insert(game_id = game['id'])
        db.team.insert(game_id = game['id'])
        teams = db(db.team.game_id == game['id']).select()
        team1 = db(db.player.team_id == teams[0].id).select()
        print("team1:")
        print(team1)
        print("")
        team2 = db(db.player.team_id == teams[1].id).select()
        print("team2:")
        print(team2)
        print("")
        
    else:
        print("there are teams")
        print(teams)
        team1 = db(db.player.team_id == teams[0].id).select()
        print("team1:")
        print(team1)
        print("")
        team2 = db(db.player.team_id == teams[1].id).select()
        print("team2:")
        print(team2)
        print("")
   
    return dict(game_id = game['id'], team1name = teams[0].team_name, team2name = teams[1].team_name, team1id = teams[0].id, team2id = teams[1].id, 
                url_signer=url_signer, load_players_url = URL('load_players', signer=url_signer), add_player_url = URL('add_player', signer=url_signer), delete_player_url = URL('delete_player', signer=url_signer),
                pop_player_url = URL('pop_player', signer=url_signer), update_player_url = URL('update_player', signer=url_signer), edit_tname_url = URL('edit_tname', signer = url_signer), 
                fetch_player_url = URL('fetch_player', signer=url_signer),)

@action('edit_tname', method="POST")
@action.uses(url_signer.verify(), db)
def edit_tname():
    # Updates the db record.
    print("HERE")
    team_id = request.json.get("team_id")
    value = request.json.get("value")
    db(db.team.id == team_id).update(
        team_name = value,
    )
    return "ok"


def fetch_async(username):
    response = requests.get("https://api2.r6stats.com/public-api/stats/" + username + "/pc/generic", headers = {'Access-Control-Allow-Origin': '*','Authorization': 'Bearer ' + API_KEY})
    return response


@action('fetch_player')
@action.uses(url_signer.verify(), db)
def fetch_player():
    username = request.params.get('username')
    print(username)
    print(type(username))
    username = username.split(",")
    print(username)
    threads= []
    results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        for name in username:
            threads.append(executor.submit(fetch_async, name))
        for task in as_completed(threads):
            print(task.result())
            results.append(task.result().json())
    #response = requests.get("https://api2.r6stats.com/public-api/stats/" + username + "/pc/generic", headers = {'Access-Control-Allow-Origin': '*','Authorization': 'Bearer ' + API_KEY})
    #assert response.status_code != 404
    #response2 = requests.get("https://api2.r6stats.com/public-api/stats/" + username + "/pc/seasonal", headers = {'Access-Control-Allow-Origin': '*','Authorization': 'Bearer ' + API_KEY})
    #print(response.json())
    #print(response.status_code)
    return dict(response=results)

@action('update_player', method="POST")
@action.uses(url_signer.verify(), db)
def update_player():
    team_id = request.json.get('team_id')
    player_id = request.json.get('player_id')
    assert team_id is not None
    assert player_id is not None
    print("PLAYER ID: " + str(player_id))
    print("TEAM ID: " + str(team_id))
    row = db(db.player.id == player_id).select().first()
    id = db(db.player.id == player_id).update(
        team_id = team_id,
    )
    return dict(id=id, player_name = row.player_name)



@action('load_players')
@action.uses(url_signer.verify(), db)
def load_players():
    game_id = request.params.get('game_id')
    team_id = request.params.get('team_id')
    rows = db((db.player.team_id == team_id) & (db.player.game_id == game_id)).select().as_list()
    return dict(rows=rows)

@action('add_player', method="POST")
@action.uses(url_signer.verify(), db)
def add_player():
    game_id = request.json.get('game_id')
    player_name = request.json.get('player_name')
    input_id = request.json.get('input_id')
    assert player_name is not None
    assert player_name is not ""
    id = db.player.insert(
        game_id = game_id,
        player_name = player_name,
        team_id = input_id
    )
    return dict(id=id, input_id=input_id)

@action('delete_player')
@action.uses(url_signer.verify(), db)
def delete_post():
    id = request.params.get('id')
    assert id is not None
    db(db.player.id == id).delete()
    return "ok"

@action('pop_player')
@action.uses(url_signer.verify(), db)
def delete_post():
    id = request.params.get('id')
    assert id is not None
    row = db(db.player.id == id).select().first()
    id = db(db.player.id == id).update(
        team_id = None,
    )
    return dict(id=id, player_name = row.player_name)

@action('edit_tstat', method="POST")
@action.uses(url_signer.verify(), db)
def edit_contact():
    # Updates the db record.
    id = request.json.get("id")
    field = request.json.get("field")
    value = request.json.get("value")
    db(db.player.id == id).update(**{field: value})
    time.sleep(1) # debugging
    return "ok"

@action('live_match/<game_id:int>', method=["GET","POST"])
@action.uses(db, session, auth.user, 'match_live.html')
def live_match(game_id = None):
    assert game_id is not None
    games = db(db.game.user_email == get_user_email()).select().as_list()
    game = db.game[game_id]
    teams = db(db.team.game_id == game['id']).select()
    team1 = db(db.player.team_id == teams[0].id).select()
    team2 = db(db.player.team_id == teams[1].id).select()
    return dict(team1 = team1, team2 = team2, game_id = game['id'], team1name = teams[0].team_name, team2name = teams[1].team_name, team1id = teams[0].id, team2id = teams[1].id, 
                url_signer=url_signer, load_players_url = URL('load_players', signer=url_signer), add_player_url = URL('add_player', signer=url_signer), delete_player_url = URL('delete_player', signer=url_signer),
                pop_player_url = URL('pop_player', signer=url_signer), update_player_url = URL('update_player', signer=url_signer),fetch_player_url = URL('fetch_player', signer=url_signer),edit_tstat_url = URL('edit_tstat', signer=url_signer))