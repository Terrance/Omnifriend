$(document).ready(function() {
    var query;
    if (location.search) {
        var params = location.search.substr(1).split("&");
        for (var i in params) {
            var parts = params[i].split("=");
            if (parts[0] === "q") {
                query = parts[1];
                break;
            }
        }
    }
    if (!query) {
        $("#query, #results").hide();
        $("#alert").addClass("alert-danger").text("No query specified!");
        return;
    }
    chrome.storage.local.get(function(store) {
        var friends = [];
        var icons = ["facebook", "twitter", "google-plus"];
        ["fb-friends", "tw-follows", "gp-circled"].map(function(key, i, arr) {
            if (store[key]) {
                for (var j in store[key]) store[key][j].icon = icons[i];
                friends = friends.concat(store[key]);
            }
        });
        $("#query").text(query);
        var matches = [];
        for (var i in friends) {
            var index = friends[i].name.toLowerCase().indexOf(query.toLowerCase());
            var match = index > -1;
            if (!match) {
                match = friends[i].user.toLowerCase().indexOf(query.toLowerCase()) > -1;
            }
            if (match) {
                var cell = $("<div/>").addClass("col-lg-4 col-sm-6");
                var name = $("<a/>").attr("href", friends[i].url);
                if (index > -1) {
                    name.append($("<span/>").text(friends[i].name.substr(0, index)))
                            .append($("<strong/>").text(friends[i].name.substr(index, query.length)))
                            .append($("<span/>").text(friends[i].name.substr(index + query.length)))
                } else name.text(friends[i].name);
                var user = (friends[i].icon === "twitter" ? $("<small/>").text(friends[i].user) : null);
                cell.append($("<h2/>")
                        .append($("<i/>").addClass("text-muted fa fa-" + friends[i].icon)).append(" ")
                        .append(name).append(" ").append(user)
                    );
                $("#results").append(cell);
            }
        }
        if ($("#results").length) {
            $("#alert").hide();
        } else {
            $("#alert").addClass("alert-info").text("No matches found.");
        }
    });
});
