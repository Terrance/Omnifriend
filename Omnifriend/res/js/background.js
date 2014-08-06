chrome.runtime.onInstalled.addListener(function (object) {
    chrome.tabs.create({url: chrome.runtime.getURL("/res/html/options.html")});
});
var friends;
chrome.omnibox.onInputStarted.addListener(function() {
    friends = [];
    chrome.storage.local.get(function(store) {
        var srcs = {
            "fb": "Facebook",
            "tw": "Twitter"
        };
        ["fb-friends", "tw-follows"].map(function(key, i, arr) {
            if (store[key]) {
                var src = srcs[key.substr(0, 2)];
                for (var j in store[key]) store[key][j].src = src;
                friends = friends.concat(store[key]);
            }
        });
    });
});
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    var matches = [];
    for (var i in friends) {
        var source = friends[i].name.toLowerCase();
        var index = source.indexOf(text.toLowerCase());
        if (index > -1) {
            var desc = friends[i].name.substr(0, index)
                     + "<match>" + friends[i].name.substr(index, text.length) + "</match>"
                     + friends[i].name.substr(index + text.length)
                     + "  <url>" + friends[i].src + "</url>";
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
    // press Enter on "run extension command", try to match to friend
    if (!text.match(/^.*?:(\/\/)?/)) {
        for (var i in friends) {
            var source = friends[i].name.toLowerCase();
            if (source.indexOf(text.toLowerCase()) > -1) {
                url = friends[i].url;
                break;
            }
        }
        // no match, do nothing
        return;
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
