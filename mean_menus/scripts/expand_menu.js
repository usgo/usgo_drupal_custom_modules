/*
 * Copyright 2010, Joshua Simmons
 *
 * Implements a menu with clickable expanding parts.  Requires jQuery.
 *
 */

/* get a fingerprint of information about .expandings
 *
 * this is important for the next function, where we need to
 * discard the cookie info if something has changed
 */
function fingerprint() {
    var temp = jQuery('.expanding');
    var res = temp.length * 255;
    
    /* just do various things to capture a little bit of info from
     * every .expanding that exists
     */
    temp.each(function(i) {
            var str = jQuery(this).attr('class') + jQuery(this).attr('id');
            res += str.length * (i+1);
            for (var j = 0; j < str.length; ++j) {
                res += str.charCodeAt(j) * (i+1) * (j+1) % 467;
            }

            res += jQuery('.opener', this).length * (i+1);
            res += jQuery('a', this).length * (i+1) * 7;
            res += jQuery('ul', this).length * (i+1) * 17;
            res %= 100003;
        });

    return res;
}

/* reads from cookie the list of open .hidable elements that are sub
 * a .expanding
 *
 * this is used to keep state of the menus between pages.
 */
function init_expanding_menu() {
    // IMPORTANT!: increment this version if you change anything about
    // the cookie storage mechanism that is not backwards compatible.
    //
    // If in doubt, increment it!
    var menu_version = 4;

    jQuery.cookies.setOptions({path: '/'});

    // ensure cookies are enabled, otherwise return false
    // this should signal that some other menu system should be used
    // instead, since that doesn't require cookies

    if (!jQuery.cookies.test()) {
        return false;
    }
    

    // set hidable for matching uls, and shower for matching a's
    jQuery('.expanding .opener + ul')
        .addClass("hidable")
        .prev().addClass("shower")
                .click(function() { jQuery(this).toggleClass("shower");
                                    jQuery(this).toggleClass("hider");
                                    });

    // get cookie.  check main version.  throw out data if old, skip to hiding
    // all.

    // stores the status that will also be put into a cookie (in JSON)
    window.menu_status = null;

    window.cached_showhide = jQuery('.expanding .shower + .hidable').prev();
    var fp = fingerprint();

    try {
        var temp = jQuery.cookies.get('saved_menu');
        
        /* convert from compact array to expanded one */
        window.menu_status = {};
        window.menu_status.version = temp.version;
        window.menu_status.fp = temp.fp;
        window.menu_status.shown = [];
        for (var i = 0; i < window.cached_showhide.length; ++i) {
            window.menu_status.shown[i] = false;
        }
        for (var i = 0; i < temp.shown.length; ++i) {
            if (temp.shown[i] >= window.menu_status.shown.length) {
                jQuery.cookies.del('saved_menu');
                throw("saved menu cookie corrupted");
            } else {
                window.menu_status.shown[temp.shown[i]] = true;
            }
        }

        if (window.menu_status.version != menu_version ||
            window.menu_status.fp != fp ||
            window.menu_status.shown.length != window.cached_showhide.length)
        {
            throw("delete cookie");
        }
    } catch (e) {
        jQuery.cookies.del('saved_menu');
        window.menu_status = null;
    }

    if (window.menu_status != null) {
        // for ones that match, change classes from shower to hider for
        // the ones that are shown

        for (var i = 0; i < window.menu_status.shown.length; ++i) {
            //window.cached_showhide.eq(window.menu_status.shown[i]).removeClass('shower').addClass('hider');
            if (window.menu_status.shown[i]) {
                window.cached_showhide.eq(i).removeClass('shower').addClass('hider');
            }
        }
    } else {
        window.menu_status = {};
        window.menu_status.version = menu_version;
        window.menu_status.fp = fp;
        window.menu_status.shown = [];
        
        for (var i = 0; i < window.cached_showhide.length; ++i)
        {
            window.menu_status.shown[i] = false;
        }
    }

    window.cached_showhide
        .click(function() { 
                var i = window.cached_showhide.index(jQuery(this));
                window.menu_status.shown[i] = !window.menu_status.shown[i];

                /* convert to slightly more compact format
                 * don't want cookies thing to be huge
                 */
                var to_write = {};
                to_write.version = window.menu_status.version;
                to_write.fp = window.menu_status.fp;
                to_write.shown = [];
                for (var j = 0; j < window.menu_status.shown.length; ++j) {
                    if (window.menu_status.shown[j]) {
                        to_write.shown.push(j);
                    }
                }

                jQuery.cookies.set('saved_menu', to_write);
            });

    // add toggles (opposite ways for each case)

    jQuery('.shower').toggle(function() { jQuery(this).nextAll('.hidable').first().slideDown("fast"); },
                        function() { jQuery(this).nextAll('.hidable').first().slideUp("fast"); });

    jQuery('.hider' ).toggle(function() { jQuery(this).nextAll('.hidable').first().slideUp("fast"); },
                        function() { jQuery(this).nextAll('.hidable').first().slideDown("fast"); });

    // hide what should be hiden
    jQuery('.expanding .shower + .hidable').hide();

    return true;
}
