$(document).ready(function() {
    var friends = [];
    function search(query) {
        location.hash = "#" + encodeURIComponent(query);
        document.title = "Search" + (query ? ": " + query : "");
        $("#query").val(query);
        var matches = [];
        $("#results").empty();
        for (var i in friends) {
            var index = friends[i].name.toLowerCase().indexOf(query.toLowerCase());
            var match = index > -1;
            if (!match && friends[i].user) match = friends[i].user.toLowerCase().indexOf(query.toLowerCase()) > -1;
            if (!match && friends[i].id) friends[i].id.toLowerCase().indexOf(query.toLowerCase()) > -1;
            if (match) {
                var cell = $("<div/>").addClass("col-lg-4 col-sm-6 friend-" + friends[i].label);
                var name = $("<a/>").attr("href", friends[i].url);
                if (index > -1) {
                    name.append($("<span/>").text(friends[i].name.substr(0, index)))
                            .append($("<strong/>").text(friends[i].name.substr(index, query.length)))
                            .append($("<span/>").text(friends[i].name.substr(index + query.length)))
                } else name.text(friends[i].name);
                var user = (friends[i].user ? $("<small/>").text(friends[i].user) : null);
                cell.append($("<h3/>")
                        .append($("<i/>").addClass("text-muted fa fa-" + friends[i].label)).append(" ")
                        .append(name).append(" ").append(user)
                    );
                $("#results").append(cell);
            }
        }
        if ($("#results div").length) {
            $("#alert").hide();
            $("#results").show();
        } else {
            $("#results").hide();
            $("#alert").addClass("alert-info").text("No matches found.").show();
        }
    }
    chrome.storage.local.get(function(store) {
        var labels = ["facebook", "twitter", "google-plus"];
        ["fb-friends", "tw-follows", "gp-circled"].map(function(key, i, arr) {
            if (store[key]) {
                for (var j in store[key]) store[key][j].label = labels[i];
                friends = friends.concat(store[key]);
            }
        });
        friends.sort(function(a, b) {
            var m = a.name.toLowerCase();
            var n = b.name.toLowerCase();
            return (m === n ? 0 : (m > n ? 1 : -1));
        });
        search(location.hash ? decodeURIComponent(location.hash.substr(1)) : "");
    });
    $("#query").on("input", function(e) {
        search($(this).val());
    }).focus();
    $("#networks li").click(function(e) {
        e.preventDefault();
        if ($(this).attr("id") === "networks-all") {
            $("#results div").show();
        } else {
            $("#results div").hide();
            $("#results .friend-" + $(this).attr("id").substr(9)).show();
        }
        $("#networks li").removeClass("active");
        $(this).addClass("active");
    });
});
