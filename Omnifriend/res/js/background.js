chrome.runtime.onInstalled.addListener(function (object) {
    chrome.tabs.create({url: chrome.runtime.getURL("/res/html/options.html")});
});
var friends;
chrome.omnibox.onInputStarted.addListener(function() {
    friends = [];
    chrome.storage.local.get(function(store) {
        var networks = ["Email", "Facebook", "Twitter", "Google+"];
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
    });
});
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    var matches = [];
    var regex = new RegExp(text.toLowerCase().split("").join(".*?"), "i");
    for (var i in friends) {
        var friend = friends[i];
        var test = friend.name + " " + (friend.user ? friend.user : "")
                + " " + (friend.id ? friend.id : "") + " " + friend.network;
        if (test.match(regex)) {
            var desc = friend.name + "  <url>" + friend.network
                    + (friend.user ? ": " + friend.user : "") + "</url>";
            var match = {
                content: friend.url,
                description: desc.replace(/&/g, "&amp;")
            };
            matches.push(match);
        }
    }
    suggest(matches);
});
chrome.omnibox.onInputEntered.addListener(function(text, disposition) {
    var url = text;
    // press Enter on "run extension command", show search page
    if (!text.match(/^.*?:(\/\/)?/)) {
        url = chrome.runtime.getURL("/res/html/search.html#" + encodeURIComponent(text));
    }
    switch (disposition) {
        case "currentTab":
            chrome.tabs.update({url: url});
            break;
        case "newForegroundTab":
            chrome.tabs.create({url: url});
            break;
        case "newBackgroundTab":
            chrome.tabs.create({url: url, active: false});
            break;
    }
});
