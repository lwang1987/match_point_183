// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
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
    };

    app.enumerate = (a) => {
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.addstats = (rows) => {
        rows.map((row) => {
            row.kills = 0,
            row.assists = 0,
            row.deaths = 0,
            row.plant_defuse = 0,
            row.clutch = 0
        });
    };

    app.set_add_mode = function (new_status) {
        app.vue.add_mode = new_status;
    };
    
    app.decorate = (a) => {
        a.map((e) => {e._state = {kills: "clean", assists: "clean",deaths: "clean",plant_defuse: "clean",clutch:"clean"} ;});
        return a;
    }

    app.reset_form = function() {
        app.vue.player_name = "";
        app.vue.inputid = "";
    };

    app.start_edit_tstat = function(row_idx, fn, team_idx){
        if (team_idx == 1) {
            app.vue.t1rows[row_idx]._state[fn] = "edit";
        }else{
            app.vue.t2rows[row_idx]._state[fn] = "edit";
        }
    };

    app.stop_edit_tstat = function (row_idx, fn, team_idx) {
        if(team_idx == 1){
            let row = app.vue.t1rows[row_idx];
            if (row._state[fn] === "edit") {
                row._state[fn] = "pending";
                axios.post(edit_tstat_url,
                    {
                        id: row.id,
                        field: fn,
                        value: row[fn], // row.first_name
                    }).then(function (result) {
                    row._state[fn] = "clean";
                });
            }
        }else{
            let row = app.vue.t2rows[row_idx];
            if (row._state[fn] === "edit") {
                row._state[fn] = "pending";
                axios.post(edit_tstat_url,
                    {
                        id: row.id,
                        field: fn,
                        value: row[fn], // row.first_name
                    }).then(function (result) {
                    row._state[fn] = "clean";
                });
            }
        }
        // If I was not editing, there is nothing that needs saving.
    }

    

    app.fetch = function (username) { 
        new Promise(function (resolve, reject){
            axios.get(fetch_player_url, {params:{username: username}})
            .then((response) => {
                resolve(response)
            })
        }).then((stats) => {
            console.log(stats)
            return stats
        })
    };

    app.methods = {
        set_add_mode: app.set_add_mode,
        fetch: app.fetch,
        start_edit_tstat:app.start_edit_tstat,
        stop_edit_tstat:app.stop_edit_tstat,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        // Do any initializations (e.g. networks calls) here.
        axios.get(load_players_url, {params:{game_id: game_id, team_id: team1id}}).then(function (response) {
            let rows = response.data.rows;
            app.decorate(app.enumerate(rows));
            app.vue.t1rows = rows;
            app.vue.t1len = app.vue.t1rows.length;
            console.log(response);
        });

        axios.get(load_players_url, {params:{game_id: game_id, team_id: team2id}}).then(function (response) {
            let rows = response.data.rows;
            app.decorate(app.enumerate(rows));
            app.vue.t2rows = rows;
            app.vue.t2len = app.vue.t2rows.length;
            console.log(response);

        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);