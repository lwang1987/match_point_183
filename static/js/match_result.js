// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        add_mode: false,
        email_state: "clean",
        email: "",
        target_email: entered_email,
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
            row.hs = 0
        });
    };

    app.set_add_mode = function (new_status) {
        app.vue.add_mode = new_status;
    };
    app.start_edit_email = function () {
        
        app.vue.email_state = "edit";
    };
    app.stop_edit_email = function () {
        if (app.vue.email_state === "edit") {
            
            app.vue.team1_state = "clean";
            
        }
        
        // If I was not editing, there is nothing that needs saving.
    }
    
    app.share_match = function (realgame_id){

        axios.post(share_email_url,
            {
                game_id: realgame_id,
                value: document.getElementById('enter_email').value, 
            }).then(function (result) {
            app.vue.email_state = "clean";
        });
    }

    app.methods = {
        
        set_add_mode: app.set_add_mode,
        start_edit_tname: app.start_edit_tname,
        stop_edit_tname: app.stop_edit_tname,
        share_match: app.share_match,

    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        // Do any initializations (e.g. networks calls) here.
       
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);