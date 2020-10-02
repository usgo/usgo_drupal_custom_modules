jQuery(document).ready(function() {
    if (init_expanding_menu()) {
        jQuery('.expanding').removeClass('flyout')
                            .addClass('expand');
        /* ie7fix only needed for flyout, so removeClass if javascript works */
        jQuery('.ie7fix').removeClass('ie7fix');
        jQuery('.mainnav .opener').has('a').each(function(index) {
            $lnk = jQuery('a', this);
            jQuery(this).append($lnk.html());
            jQuery(this).append($lnk);
            $lnk.empty();
            $lnk.append('<img src="/theme/images/forward.png" alt="-&nbsp;Go" />');
            $lnk.addClass('openerGoer');
            $lnk.click(function(event) {
                event.stopPropagation();
            });
        });
    }
    /* backups for browsers that don't support those css3 selectors yet */
    jQuery('tr:nth-child(odd)').addClass('odd');
    jQuery('tr:nth-child(even)').addClass('even');
});
