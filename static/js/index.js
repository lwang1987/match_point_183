// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        add_mode: false,
        player_name: "",
        t1_name:"",
        t2_name:"",
        inputid: "",
        rows: [],
        t1rows: [],
        t2rows: [],
        t1len: 0,
        t2len: 0,
        team1_name: team1name,
        team2_name: team2name,
        team1_state: "clean",
        team2_state: "clean",
    };

    app.enumerate = (a) => {
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.addstats = (rows) => {
        rows.map((row) => {
            row.level = "N/A",
            row.kd = 0,
            row.hs = 0,
            row.wl = 0,
            row.image = "N/A"
        });
    };

    app.set_add_mode = function (new_status) {
        app.vue.add_mode = new_status;
    };
    app.start_edit_tname = function (team_idx) {
        if (team_idx == 1) {
            app.vue.team1_state = "edit";
        }
        else {
            app.vue.team2_state = "edit";
        }
    };
    app.stop_edit_tname = function (team_idx, realteamid) {
        if (team_idx == 1) {
            if (app.vue.team1_state === "edit") {
                app.vue.team1_state = "pending";
                axios.post(edit_tname_url,
                    {
                        team_id: realteamid,
                        value: app.vue.team1_name, 
                    }).then(function (result) {
                    app.vue.team1_state = "clean";
                });
            }
        }
        else {
            if (app.vue.team2_state === "edit") {
                app.vue.team2_state = "pending";
                axios.post(edit_tname_url,
                    {
                        team_id: realteamid,
                        value: app.vue.team2_name, 
                    }).then(function (result) {
                    app.vue.team2_state = "clean";
                });
            }
        }
        // If I was not editing, there is nothing that needs saving.
    }
    app.add_player = function (game_id) {
        axios.post(add_player_url,
        {
            game_id: game_id,
            player_name: app.vue.player_name,
            input_id: app.vue.inputid,
        }).then(function (response) {
            if (response.data.input_id == ""){
                app.vue.rows.push({
                    id: response.data.id,
                    player_name: app.vue.player_name,
                    level: "N/A",
                    kd: 0,
                    hs: 0,
                    wl: 0,
                    image: "N/A",
                });
                app.enumerate(app.vue.rows);
                app.fetch(app.vue.rows[app.vue.rows.length -  1], app.vue.player_name);
            }
            else {
                if (response.data.input_id == team1id){
                    app.vue.t1rows.push({
                        id: response.data.id,
                        player_name: app.vue.player_name,
                        level: "N/A",
                        kd: 0,
                        hs: 0,
                        wl: 0,
                        image: "N/A",
                    });
                    app.vue.t1len = app.vue.t1rows.length;
                    app.enumerate(app.vue.t1rows);
                    app.fetch(app.vue.t1rows[app.vue.t1rows.length -  1], app.vue.player_name);
                }
                else {
                    app.vue.t2rows.push({
                        id: response.data.id,
                        player_name: app.vue.player_name,
                        level: "N/A",
                        kd: 0,
                        hs: 0,
                        wl: 0,
                        image: "N/A",
                    });
                    app.vue.t2len = app.vue.t2rows.length;
                    app.enumerate(app.vue.t2rows);
                    app.fetch(app.vue.t2rows[app.vue.t2rows.length -  1], app.vue.player_name);
                }
            }
            app.reset_form();
            app.set_add_mode(false);
        });

    };

    app.reset_form = function() {
        app.vue.player_name = "";
        app.vue.inputid = "";
    };

    app.delete_player = function(row_idx, team_idx) {
        if (team_idx == 0) {
            let id = app.vue.rows[row_idx].id;
            axios.get(delete_player_url, {params: {id: id}}).then(function (response) {
                for (let i = 0; i < app.vue.rows.length; i++) {
                    if (app.vue.rows[i].id == id) {
                        app.vue.rows.splice(i, 1);
                        app.enumerate(app.vue.rows);
                        break;
                    }
                }
            });
        }
        else if (team_idx == 1) {
            let id = app.vue.t1rows[row_idx].id;
            axios.get(delete_player_url, {params: {id: id}}).then(function (response) {
                for (let i = 0; i < app.vue.t1rows.length; i++) {
                    if (app.vue.t1rows[i].id == id) {
                        app.vue.t1rows.splice(i, 1);
                        app.enumerate(app.vue.t1rows);
                        app.vue.t1len = app.vue.t1rows.length;
                        break;
                    }
                }
            });
        }
        else {
            let id = app.vue.t2rows[row_idx].id;
            axios.get(delete_player_url, {params: {id: id}}).then(function (response) {
                for (let i = 0; i < app.vue.t2rows.length; i++) {
                    if (app.vue.t2rows[i].id == id) {
                        app.vue.t2rows.splice(i, 1);
                        app.enumerate(app.vue.t2rows);
                        app.vue.t2len = app.vue.t2rows.length;
                        break;
                    }
                }
            });
        }
    };

    app.pop_player = function(row_idx, team_idx) {
        if (team_idx == 1) {
            let id = app.vue.t1rows[row_idx].id;
            let lvl = app.vue.t1rows[row_idx].level;
            let kd = app.vue.t1rows[row_idx].kd;
            let hs = app.vue.t1rows[row_idx].hs;
            let wl = app.vue.t1rows[row_idx].wl;
            let image = app.vue.t1rows[row_idx].image;
            axios.get(pop_player_url, {params: {id: id}}).then(function (response) {
                for (let i = 0; i < app.vue.t1rows.length; i++) {
                    if (app.vue.t1rows[i].id == id) {
                        app.vue.t1rows.splice(i, 1);
                        app.enumerate(app.vue.t1rows);
                        app.vue.t1len = app.vue.t1rows.length;
                        break;
                    }
                }
                app.vue.rows.push({
                    id: id,
                    player_name: response.data.player_name,
                    level: lvl,
                    kd: kd,
                    hs: hs,
                    wl: wl,
                    image: image,
                });
                app.enumerate(app.vue.rows);
            });
        }
        else {
            let id = app.vue.t2rows[row_idx].id;
            let lvl = app.vue.t2rows[row_idx].level;
            let kd = app.vue.t2rows[row_idx].kd;
            let hs = app.vue.t2rows[row_idx].hs;
            let wl = app.vue.t2rows[row_idx].wl;
            let image = app.vue.t2rows[row_idx].image;
            axios.get(pop_player_url, {params: {id: id}}).then(function (response) {
                for (let i = 0; i < app.vue.t2rows.length; i++) {
                    if (app.vue.t2rows[i].id == id) {
                        app.vue.t2rows.splice(i, 1);
                        app.enumerate(app.vue.t2rows);
                        app.vue.t2len = app.vue.t2rows.length;
                        break;
                    }
                }
                app.vue.rows.push({
                    id: id,
                    player_name: response.data.player_name,
                    level: lvl,
                    kd: kd,
                    hs: hs,
                    wl: wl,
                    image: image,
                });
                app.enumerate(app.vue.rows);
            });     
        }
    };

    app.set_teamid = function (row_idx) {
        let id = app.vue.rows[row_idx].id;
        let lvl = app.vue.rows[row_idx].level;
        let kd = app.vue.rows[row_idx].kd;
        let hs = app.vue.rows[row_idx].hs;
        let wl = app.vue.rows[row_idx].wl;
        let image = app.vue.rows[row_idx].image;
        let team_idx = app.vue.inputid;
        axios.post(update_player_url,{team_id: team_idx,player_id: id,})
        .then(function (response) {
            for (let i = 0; i < app.vue.rows.length; i++) {
                if (app.vue.rows[i].id == id) {
                    app.vue.rows.splice(i, 1);
                    app.enumerate(app.vue.rows);
                    break;
                }
            }
            if (team_idx == team1id) {
                app.vue.t1rows.push({
                    id: id,
                    player_name: response.data.player_name,
                    level: lvl,
                    kd: kd,
                    hs: hs,
                    wl: wl,
                    image: image,
                });
                app.enumerate(app.vue.t1rows);
                app.vue.t1len = app.vue.t1rows.length;
            }
            else {
                app.vue.t2rows.push({
                    id: id,
                    player_name: response.data.player_name,
                    level: lvl,
                    kd: kd,
                    hs: hs,
                    wl: wl,
                    image: image,
                });
                app.enumerate(app.vue.t2rows);
                app.vue.t2len = app.vue.t2rows.length;
            }
        });
        app.reset_form();
    };
    
    app.fetch = function (row, username) { 
        axios.get(fetch_player_url, {params:{username: username}
        }).then((response) => {
            console.log(response);
            if (response.data.response[0].status != "error") {
                row.level = response.data.response[0].progression.level;
                row.kd = response.data.response[0].stats.general.kd;
                row.hs = ((Number(response.data.response[0].stats.general.headshots) / Number(response.data.response[0].stats.general.kills))*100).toFixed(2) + "%";
                row.wl = response.data.response[0].stats.general.wl;
                row.image = response.data.response[0].avatar_url_256;
            }
        });
    };

    app.methods = {
        add_player: app.add_player,
        set_add_mode: app.set_add_mode,
        delete_player: app.delete_player,
        pop_player: app.pop_player,
        set_teamid: app.set_teamid,
        fetch: app.fetch,
        start_edit_tname: app.start_edit_tname,
        stop_edit_tname: app.stop_edit_tname,

    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        // Do any initializations (e.g. networks calls) here.
        axios.get(load_players_url, {params:{game_id: game_id}}).then(function (response) {
            let rows = response.data.rows;
            app.enumerate(rows);
            app.addstats(rows)
            app.vue.rows = rows;
        }).then(() => {
            test = "";
            for(let row of app.vue.rows) {
                test = test.concat(row.player_name + ",");
            }
            test = test.slice(0, -1); 
            console.log(test)
            if (test.length > 0) {
                axios.get(fetch_player_url, {params:{username: test}
                }).then((response) => {
                    for (let row of response.data.response) {
                        if (row.status != "error") {
                            found = app.vue.rows.find(element => (element.player_name).toLowerCase() === row.username.toLowerCase());
                            found.level = row.progression.level;
                            found.kd = row.stats.general.kd;
                            found.hs = ((Number(row.stats.general.headshots) / Number(row.stats.general.kills))*100).toFixed(2) + "%";
                            found.wl = row.stats.general.wl;
                            found.image = row.avatar_url_256;
                        }
                    }
                });
            }
        });
        axios.get(load_players_url, {params:{game_id: game_id, team_id: team1id}}).then(function (response) {
            let rows = response.data.rows;
            app.enumerate(rows);
            app.addstats(rows)
            app.vue.t1rows = rows;
            app.vue.t1len = app.vue.t1rows.length;
        }).then(() => {
            test = "";
            for(let row of app.vue.t1rows) {
                test = test.concat(row.player_name + ",");
            }
            test = test.slice(0, -1); 
            console.log(test)
            if (test.length > 0) {
                axios.get(fetch_player_url, {params:{username: test}
                }).then((response) => {
                    for (let row of response.data.response) {
                        if (row.status != "error") {
                            found = app.vue.t1rows.find(element => (element.player_name).toLowerCase() === row.username.toLowerCase());
                            found.level = row.progression.level;
                            found.kd = row.stats.general.kd;
                            found.hs = ((Number(row.stats.general.headshots) / Number(row.stats.general.kills))*100).toFixed(2) + "%";
                            found.wl = row.stats.general.wl;
                            found.image = row.avatar_url_256;
                        }
                    }
                });
            }
        });
        axios.get(load_players_url, {params:{game_id: game_id, team_id: team2id}}).then(function (response) {
            let rows = response.data.rows;
            app.enumerate(rows);
            app.addstats(rows)
            app.vue.t2rows = rows;
            app.vue.t2len = app.vue.t2rows.length;
        }).then(() => {
            test = "";
            for(let row of app.vue.t2rows) {
                test = test.concat(row.player_name + ",");
            }
            test = test.slice(0, -1); 
            console.log(test)
            if (test.length > 0) {
                axios.get(fetch_player_url, {params:{username: test}
                }).then((response) => {
                    for (let row of response.data.response) {
                        if (row.status != "error") {
                            found = app.vue.t2rows.find(element => (element.player_name).toLowerCase() === row.username.toLowerCase());
                            found.level = row.progression.level;
                            found.kd = row.stats.general.kd;
                            found.hs = ((Number(row.stats.general.headshots) / Number(row.stats.general.kills))*100).toFixed(2) + "%";
                            found.wl = row.stats.general.wl;
                            found.image = row.avatar_url_256;
                        }
                    }
                });
            }
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
