$(document).ready(function() {
    var friends = [];
    function search(query) {
        location.hash = "#" + encodeURIComponent(query);
        document.title = "Search" + (query ? ": " + query : "");
        $("#query").val(query);
        var matches = [];
        $("#networks li").hide();
        $("#networks-all, #networks li.active").show();
        $("#results").empty().show();
        var active = $("#networks li.active").attr("id").substr(9);
        $(friends).each(function(i, friend) {
            var index = friend.name.toLowerCase().indexOf(query.toLowerCase());
            var match = index > -1;
            if (!match && friend.user) match = friend.user.toLowerCase().indexOf(query.toLowerCase()) > -1;
            if (!match && friend.id) friend.id.toLowerCase().indexOf(query.toLowerCase()) > -1;
            if (match) {
                var cell = $("<div/>").addClass("col-lg-4 col-sm-6 friend-" + friend.label);
                var name = $("<a/>").attr("href", friend.url);
                if (index > -1) {
                    name.append($("<span/>").text(friend.name.substr(0, index)))
                            .append($("<strong/>").text(friend.name.substr(index, query.length)))
                            .append($("<span/>").text(friend.name.substr(index + query.length)))
                } else name.text(friend.name);
                var user = (friend.user ? $("<small/>").text(friend.user) : null);
                cell.append($("<h3/>")
                        .append($("<i/>").addClass("text-muted fa fa-" + friend.label)).append(" ")
                        .append(name).append(" ").append(user)
                    );
                $("#networks-" + friend.label).show();
                if (active !== "all" && active !== friend.label) cell.hide();
                $("#results").append(cell);
            }
        });
        if ($("#results div:visible").length) {
            $("#alert").hide();
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
