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
        var regex = new RegExp(query.toLowerCase().split("").join(".*?"), "i");
        $(friends).each(function(i, friend) {
            var test = friend.name + " " + (friend.user ? friend.user : "")
                    + " " + (friend.id ? friend.id : "") + " " + friend.network.name;
            if (test.match(regex)) {
                var index = -1;
                var cell = $("<div/>").addClass("col-lg-4 col-sm-6 friend-" + friend.network.label)
                        .append($("<h3/>")
                            .append($("<a/>").attr("href", friend.url).text(friend.name))
                            .append($("<br/>"))
                            .append($("<small/>")
                                .append($("<i/>").addClass("text-muted fa fa-" + friend.network.label))
                                .append(" ")
                                .append(friend.user ? friend.user : $("<em/>").text(friend.network.name))
                            )
                        );
                $("#networks-" + friend.network.label).show();
                if (active !== "all" && active !== friend.network.label) cell.hide();
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
        var networks = [
            {
                name: "Email",
                label: "envelope"
            },
            {
                name: "Facebook",
                label: "facebook"
            },
            {
                name: "Twitter",
                label: "twitter"
            },
            {
                name: "Google+",
                label: "google-plus"
            },
        ];
        ["em-addresses", "fb-friends", "tw-follows", "gp-circled"].map(function(key, i, arr) {
            if (store[key]) {
                for (var j in store[key]) store[key][j].network = networks[i];
                friends = friends.concat(store[key]);
            }
        });
        friends.sort(function(a, b) {
            var m = a.name.toLowerCase();
            var n = b.name.toLowerCase();
            if (m === n) {
                m = a.user ? a.user.toLowerCase() : "";
                n = b.user ? b.user.toLowerCase() : "";
            }
            return (m === n ? 0 : (m > n ? 1 : -1));
        });
        search(location.hash ? decodeURIComponent(location.hash.substr(1)) : "");
    });
    var timeout = -1;
    $("#query").on("input", function(e) {
        if (timeout >= 0) clearTimeout(timeout);
        timeout = setTimeout(function() {
            search($("#query").val());
        }, 300);
    }).focus();
    $(window).on("hashchange", function(e) {
        var query = decodeURIComponent(location.hash.substr(1));
        if ($("#query").val() !== query) $("#query").val(query).focus().trigger("input");
    }).keypress(function(e) {
        if (e.keyCode === 13) $("#query").blur().focus();
    });
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
