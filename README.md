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

The current session username is scraped from the mobile settings page (loads the fastest), then follows are repeatedly read by following cursors to retrieve the next page.

Google+
-------

The current user ID is scraped from the profile link in the mobile menu, then circled users are gathered from the social graph API used when rendering the "your circles" page.
