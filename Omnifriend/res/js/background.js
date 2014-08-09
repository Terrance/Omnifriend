chrome.runtime.onInstalled.addListener(function (object) {
    chrome.tabs.create({url: chrome.runtime.getURL("/res/html/options.html")});
});
var friends;
chrome.omnibox.onInputStarted.addListener(function() {
    friends = [];
    chrome.storage.local.get(function(store) {
        var srcs = ["Facebook", "Twitter", "Google+"];
        ["fb-friends", "tw-follows", "gp-circled"].map(function(key, i, arr) {
            if (store[key]) {
                for (var j in store[key]) store[key][j].src = srcs[i];
                friends = friends.concat(store[key]);
            }
        });
    });
});
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    var matches = [];
    for (var i in friends) {
        var source = friends[i].name.toLowerCase();
        var index = friends[i].name.toLowerCase().indexOf(text.toLowerCase());
        var match = index > -1;
        if (!match && friends[i].user) match = friends[i].user.toLowerCase().indexOf(text.toLowerCase()) > -1;
        if (!match && friends[i].id) friends[i].id.toLowerCase().indexOf(text.toLowerCase()) > -1;
        if (match) {
            var desc = friends[i].name;
            if (index > -1) {
                desc = friends[i].name.substr(0, index)
                     + "<match>" + friends[i].name.substr(index, text.length) + "</match>"
                     + friends[i].name.substr(index + text.length);
            }
            desc += "  <url>" + friends[i].src + (friends[i].user ? ": " + friends[i].user : "") + "</url>";
            var match = {
                content: friends[i].url,
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
