jQuery(document).ready(function () {
    jQuery('.socials__list-item a').on('click', function (event) {
        ga('send', {
            hitType: 'event',
            eventCategory: 'social-links',
            eventAction: 'click',
            eventLabel: 'Social Click',
            eventValue: event.target.href
        });
    });

    jQuery('.partner a').on('click', function (event) {
        ga('send', {
            hitType: 'event',
            eventCategory: 'partner-link',
            eventAction: 'click',
            eventLabel: 'Partner Click',
            eventValue: event.target.href
        });
    });

    jQuery('.faq-accordion__button').on('click', function (event) {
        ga('send', {
            hitType: 'event',
            eventCategory: 'FAQ',
            eventAction: 'click',
            eventLabel: 'Click on Question',
            eventValue: event.target.innerHtml
        });
    });

    jQuery('.promo').on('click', function (event) {
        var title = jQuery(event.target).find('promo__title').get(0);

        ga('send', {
            hitType: 'event',
            eventCategory: 'Promo',
            eventAction: 'click',
            eventLabel: 'Promo Click',
            eventValue: title
        });
    });

    jQuery('#promo-preview__download').on('click', function (event) {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Promo',
            eventAction: 'download',
            eventLabel: 'Promo Download',
            eventValue: event.target.href
        });
    });

    jQuery('#searchform').on('submit', function () {
        var request = jQuery('.search-form__search-input').value();

        ga('send', {
            hitType: 'event',
            eventCategory: 'Search',
            eventAction: 'submit',
            eventLabel: 'Search',
            eventValue: request
        });
    });
});