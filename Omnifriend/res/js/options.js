$(document).ready(function() {
    chrome.storage.local.get(function(store) {
        chrome.permissions.contains({
            origins: ["https://www.facebook.com/"]
        }, function(has) {
            if (has) {
                $("#fb-perms").addClass("btn-success").find("span").text("Enabled");
                if (store["fb-friends"] && store["fb-friends"].length) {
                    $("#fb-status").addClass("alert-success").text(store["fb-friends"].length + " friends saved.");
                } else {
                    $("#fb-status").addClass("alert-info").text("Press \"Sync\" to update from Facebook.");
                    $("#fb-clear").prop("disabled", true);
                }
            } else {
                $("#fb-perms").addClass("btn-danger").find("span").text("Disabled");
                $("#fb-sync").prop("disabled", true);
                $("#fb-status").addClass("alert-danger").text("No permissions to get Facebook data.");
            }
        });
        $("#fb-perms").click(function(e) {
            if ($("#fb-perms").hasClass("btn-danger")) {
                chrome.permissions.request({
                    origins: ["https://www.facebook.com/"]
                }, function(success) {
                    if (success) {
                        $("#fb-perms").removeClass("btn-danger").addClass("btn-success").find("span").text("Enabled");
                        $("#fb-sync").prop("disabled", false);
                        $("#fb-status").removeClass("alert-danger").addClass("alert-info").text("Press \"Sync\" to update from Facebook.");
                    }
                });
            } else {
                chrome.permissions.remove({
                    origins: ["https://www.facebook.com/"]
                }, function(success) {
                    if (success) {
                        $("#fb-perms").removeClass("btn-success").addClass("btn-danger").find("span").text("Disabled");
                        $("#fb-sync").prop("disabled", true);
                        $("#fb-status").removeClass("alert-info").addClass("alert-danger").text("No permissions to get Facebook data.");
                    }
                });
            }
        });
        $("#fb-sync").click(function(e) {
            $("#fb-perms, #fb-sync").prop("disabled", true);
            $("#fb-status").removeClass("alert-info alert-danger alert-success").addClass("alert-warning").text("Fetching from Facebook...");
            chrome.cookies.get({
                url: "https://www.facebook.com",
                name: "c_user"
            }, function(cookie) {
                if (!cookie) {
                    $("#fb-perms, #fb-sync").prop("disabled", false);
                    $("#fb-status").removeClass("alert-warning").addClass("alert-danger").text("No cookie found, are you logged in?");
                    return;
                }
                $.ajax({
                    url: "https://www.facebook.com/ajax/typeahead/first_degree.php?viewer=" + cookie.value + "&filter[0]=user&__a=1",
                    dataType: "text",
                    success: function(resp, stat, xhr) {
                        resp = JSON.parse(resp.substr(9));
                        var friends = [];
                        $.each(resp.payload.entries, function(i, friend) {
                            friends.push({
                                name: friend.names.shift() + (friend.names.length ? " (" + friend.names.join(", ") + ")" : ""),
                                url: "https://www.facebook.com" + friend.path
                            });
                        });
                        chrome.storage.local.set({"fb-friends": friends}, function() {
                            $("#fb-perms, #fb-sync").prop("disabled", false);
                            $("#fb-status").removeClass("alert-warning").addClass("alert-success").text(friends.length + " friends saved.");
                            $("#fb-clear").prop("disabled", false);
                        });
                    },
                    error: function(xhr, stat, err) {
                        console.err(arguments);
                    }
                });
            })
        });
        $("#fb-clear").click(function(e) {
            if (confirm("Remove all cached Facebook friends?")) {
                $("#fb-clear").prop("disabled", true);
                chrome.storage.local.remove("fb-friends", function() {
                    $("#fb-status").removeClass("alert-danger").addClass("alert-info").text("Press \"Sync\" to update from Facebook.");
                })
            }
        });
        chrome.permissions.contains({
            origins: ["https://twitter.com/", "https://mobile.twitter.com/"]
        }, function(has) {
            if (has) {
                $("#tw-perms").addClass("btn-success").find("span").text("Enabled");
                if (store["tw-follows"] && store["tw-follows"].length) {
                    $("#tw-status").addClass("alert-success").text(store["tw-follows"].length + " follows saved.");
                } else {
                    $("#tw-status").addClass("alert-info").text("Press \"Sync\" to update from Twitter.");
                    $("#tw-clear").prop("disabled", true);
                }
            } else {
                $("#tw-perms").addClass("btn-danger").find("span").text("Disabled");
                $("#tw-sync").prop("disabled", true);
                $("#tw-status").addClass("alert-danger").text("No permissions to get Twitter data.");
            }
        });
        $("#tw-perms").click(function(e) {
            if ($("#tw-perms").hasClass("btn-danger")) {
                chrome.permissions.request({
                    origins: ["https://twitter.com/", "https://mobile.twitter.com/"]
                }, function(success) {
                    if (success) {
                        $("#tw-perms").removeClass("btn-danger").addClass("btn-success").find("span").text("Enabled");
                        $("#tw-sync").prop("disabled", false);
                        $("#tw-status").removeClass("alert-danger").addClass("alert-info").text("Press \"Sync\" to update from Twitter.");
                    }
                });
            } else {
                chrome.permissions.remove({
                    origins: ["https://twitter.com/", "https://mobile.twitter.com/"]
                }, function(success) {
                    if (success) {
                        $("#tw-perms").removeClass("btn-success").addClass("btn-danger").find("span").text("Disabled");
                        $("#tw-sync").prop("disabled", true);
                        $("#tw-status").removeClass("alert-info").addClass("alert-danger").text("No permissions to get Twitter data.");
                    }
                });
            }
        });
        $("#tw-sync").click(function(e) {
            $("#tw-perms, #tw-sync").prop("disabled", true);
            $("#tw-status").removeClass("alert-info alert-danger alert-success").addClass("alert-warning").text("Fetching from Twitter...");
            $.ajax({
                // mobile site loads much faster than desktop
                url: "https://mobile.twitter.com/settings",
                success: function(resp, stat, xhr) {
                    var username = $(".setting-value", resp)[14];
                    if (username) {
                        username = $(username).text().trim();
                        $("#tw-status").text("Fetching followers for " + username + "...");
                        var follows = [];
                        function iter(cursor) {
                            $.ajax({
                                url: "https://twitter.com/" + username + "/following/users" + (cursor ? "?cursor=" + cursor : ""),
                                success: function(resp, stat, xhr) {
                                    $(".ProfileNameTruncated-link", resp.items_html).each(function(i, follow) {
                                        var user = follow.href.split("/").pop();
                                        follows.push({
                                            name: follow.text.trim() + " (@" + user + ")",
                                            url: "https://twitter.com/" + user
                                        });
                                    });
                                    if (resp.cursor === "0") {
                                        chrome.storage.local.set({"tw-follows": follows}, function() {
                                            $("#tw-perms, #tw-sync").prop("disabled", false);
                                            $("#tw-status").removeClass("alert-warning").addClass("alert-success").text(follows.length + " follows saved.");
                                            $("#tw-clear").prop("disabled", false);
                                        });
                                    } else {
                                        iter(resp.cursor);
                                        $("#tw-status").text("Fetching followers for " + username + "... (" + follows.length + " so far)");
                                    }
                                },
                                error: function(xhr, stat, err) {
                                    console.err(arguments);
                                }
                            });
                        }
                        iter();
                    } else {
                        $("#tw-perms, #tw-sync").prop("disabled", false);
                        $("#tw-status").removeClass("alert-warning").addClass("alert-danger").text("Failed to get username, are you logged in?");
                    }
                },
                error: function(xhr, stat, err) {
                    $("#tw-perms, #tw-sync").prop("disabled", false);
                    $("#tw-status").removeClass("alert-warning").addClass("alert-danger").text("Failed to get username, are you logged in?");
                }
            });
        });
        $("#tw-clear").click(function(e) {
            if (confirm("Remove all cached Twitter follows?")) {
                $("#tw-clear").prop("disabled", true);
                chrome.storage.local.remove("tw-follows", function() {
                    $("#tw-status").removeClass("alert-danger").addClass("alert-info").text("Press \"Sync\" to update from Twitter.");
                })
            }
        });
    });
});
