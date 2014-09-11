Introduction
============

Omnifriend adds a suggestion-based search provider to Chrome's omnibox, allowing searches for friends' profiles on social networks.


Running from source
===================

This project requires the following libraries:

* [Bootstrap](http://getbootstrap.com)
* [Font Awesome](http://fontawesome.io)
* [jQuery](http://jquery.com)
* [jquery-csv](http://code.google.com/p/jquery-csv)

Batteries are not included - the CSS and JavaScript files need to be placed in a `lib` folder with appropriate `css` and `js` subfolders (check the HTML file for where files are linked to).


Fuzzy search
============

Search queries are tested against each friend in the format `<name> <username> <id> <network>`, and match if all the characters fit in the given order (e.g. initials, start of email address plus `email` for network, first name plus network).


Sync providers
==============

Email
-----

Any CSV export of contacts can be imported.  Only name and email fields will be added.

Facebook
--------

Friends are gathered from the AJAX typeahead API (used to suggest friends' names when tagging), sorted by edge rank.

Twitter
-------

The current session username is scraped from the settings page, then follows are repeatedly read by following cursors to retrieve the next page.

Google+
-------

The current user ID is scraped from the profile link in the mobile menu, then circled users are gathered from the social graph API used when rendering the "your circles" page.

Steam
-----

Friends are read from `/my/friends`, which redirects to the current user's friends list if logged in.
