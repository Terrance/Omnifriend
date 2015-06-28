$(document).ready(function() {
    chrome.storage.local.get(function(store) {
        var friends = [];
        function search(query) {
            location.hash = "#" + encodeURIComponent(query);
            document.title = "Search" + (query ? ": " + query : "");
            $("#query").val(query);
            query = query.toLowerCase();
            var matches = [];
            $("#networks li").hide();
            $("#networks-all, #networks-starred, #networks li.active").show();
            $("#results").empty().show();
            var active = $("#networks li.active").attr("id").substr(9);
            var regex = new RegExp(query.toLowerCase().split("").join(".*?"), "i");
            $(friends).each(function(i, friend) {
                var test = friend.name + (friend.user ? " " + friend.user : "")
                        + (friend.id ? " " + friend.id : "") + " " + friend.network.name;
                if (store.search.fuzzy && test.match(regex) || !store.search.fuzzy && test.toLowerCase().indexOf(query) >= 0) {
                    var index = -1;
                    var star = $("<i/>").addClass("fa fa-star" + (friend.star ? "" : "-o") + " hover-btn text-muted")
                            .attr("title", "Toggle star");
                    if (friend.star) star.show().addClass("text-muted");
                    var node = $("<h3/>")
                            .append($("<a/>").attr("href", friend.url).text(friend.name))
                            .append(" ").append(star);
                    if (store.search.editControls) {
                        var edit = $("<i/>").addClass("fa fa-pencil hover-btn text-muted").attr("title", "Rename");
                        var del = $("<i/>").addClass("fa fa-trash-o hover-btn text-muted").attr("title", "Delete");
                        node.append(" ").append(edit).append(" ").append(del);
                    }
                    node.append($("<br/>"))
                            .append($("<small/>")
                                .append($("<i/>").addClass("text-muted fa fa-" + friend.network.label))
                                .append(" ").append(friend.user ? friend.user : $("<em/>").text(friend.network.name))
                            );
                    var cell = $("<div/>").addClass("col-lg-4 col-sm-6 friend-" + friend.network.label)
                            .addClass(friend.star ? " friend-starred" : "")
                            .append(node);
                    star.click(function(e) {
                        friend.star = !friend.star;
                        var toSet = {};
                        toSet[friend.network.key] = store[friend.network.key];
                        chrome.storage.local.set(toSet);
                        cell.toggleClass("friend-starred");
                        $(this).toggleClass("fa-star fa-star-o");
                        if ($("#networks li.active").attr("id") === "networks-starred" && !friend.star) cell.hide();
                    }).mouseover(function(e) {
                        $(this).removeClass("text-muted");
                    }).mouseout(function(e) {
                        $(this).addClass("text-muted");
                    });
                    if (store.search.editControls) {
                        edit.click(function(e) {
                            var name = prompt("Enter a new name for this friend:", friend.name);
                            if (name && name !== friend.name) {
                                friend.name = name;
                                var toSet = {};
                                toSet[friend.network.key] = store[friend.network.key];
                                chrome.storage.local.set(toSet);
                                $("h3 a", cell).text(name);
                            }
                        }).mouseover(function(e) {
                            $(this).removeClass("text-muted");
                        }).mouseout(function(e) {
                            $(this).addClass("text-muted");
                        });
                        del.click(function(e) {
                            if (confirm("Remove " + friend.name + " from your cached friends?")) {
                                var cached = store[friend.network.key];
                                cached.splice(cached.indexOf(friend), 1);
                                var toSet = {};
                                toSet[friend.network.key] = cached;
                                chrome.storage.local.set(toSet);
                                cell.remove();
                            }
                        }).mouseover(function(e) {
                            $(this).removeClass("text-muted");
                        }).mouseout(function(e) {
                            $(this).addClass("text-muted");
                        });
                    }
                    cell.mouseover(function(e) {
                        star.show();
                        if (store.search.editControls) {
                            edit.show();
                            del.show();
                        }
                    }).mouseout(function(e) {
                        if (!friend.star) star.hide();
                        if (store.search.editControls) {
                            edit.hide();
                            del.hide();
                        }
                    });
                    $("#networks-" + friend.network.label).show();
                    if (active !== "all" && active !== friend.network.label) cell.hide();
                    if (active === "starred" && friend.star) cell.show();
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
        var networks = [
            {
                name: "Email",
                key: "em-addresses",
                label: "envelope"
            },
            {
                name: "Facebook",
                key: "fb-friends",
                label: "facebook"
            },
            {
                name: "Google+",
                key: "gp-circled",
                label: "google-plus"
            },
            {
                name: "Reddit",
                key: "rd-mates",
                label: "reddit"
            },
            {
                name: "Steam",
                key: "st-friends",
                label: "steam"
            },
            {
                name: "Twitter",
                key: "tw-follows",
                label: "twitter"
            }
        ];
        networks.map(function(network, i, arr) {
            if (store[network.key]) {
                for (var j in store[network.key]) store[network.key][j].network = networks[i];
                friends = friends.concat(store[network.key]);
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
        search(location.hash ? decodeURIComponent(location.hash.substr(1)) : "");
    });
});
