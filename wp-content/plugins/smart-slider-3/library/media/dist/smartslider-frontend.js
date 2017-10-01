N2Require('SmartSliderBackgroundImages', [], [], function ($, scope, undefined) {

    function SmartSliderBackgroundImages(slider) {
        this.device = null;

        //this.load = $.Deferred();

        this.slider = slider;

        this.lazyLoad = slider.parameters.lazyLoad;
        this.lazyLoadNeighbor = slider.parameters.lazyLoadNeighbor;

        this.deviceDeferred = $.Deferred();

        this.slider.sliderElement.one('SliderDevice', $.proxy(this.onSlideDeviceChangedFirst, this));
        this.slider.sliderElement.on('visibleSlidesChanged', $.proxy(this.onVisibleSlidesChanged, this));
        this.slider.sliderElement.on('slideCountChanged', $.proxy(this.onVisibleSlidesChanged, this));

    }

    SmartSliderBackgroundImages.prototype.whenWithProgress = function (arrayOfPromises) {
        var cntr = 0, deferred = $.Deferred();
        for (var i = 0; i < arrayOfPromises.length; i++) {
            $.when(arrayOfPromises[i]).done(function () {
                deferred.notify(++cntr, arrayOfPromises.length);
            });
        }

        $.when.apply($, arrayOfPromises).done(function () {
            deferred.resolveWith(null, arguments);
        });

        return deferred;
    };

    SmartSliderBackgroundImages.prototype.getBackgroundImages = function () {
        var images = [];
        for (var i = 0; i < this.slider.realSlides.length; i++) {
            images.push(this.slider.realSlides[i].backgroundImage);
        }
        return images;
    };

    SmartSliderBackgroundImages.prototype.onVisibleSlidesChanged = function () {

        if (this.lazyLoad == 1) {
            this.load = this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide));
        } else if (this.lazyLoad == 2) { // delayed
            this.load = this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide));
        }
    };

    SmartSliderBackgroundImages.prototype.onSlideDeviceChangedFirst = function (e, device) {
        this.onSlideDeviceChanged(e, device);
        this.deviceDeferred.resolve();

        this.slider.sliderElement.on('SliderDevice', $.proxy(this.onSlideDeviceChanged, this));

        this.preLoadSlides = this._preLoadSlides;
        if (this.lazyLoad == 1) {
            this.preLoadSlides = this.preloadSlidesLazyNeighbor;

            this.load = this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide));
        } else if (this.lazyLoad == 2) { // delayed
            $(window).on('load', $.proxy(this.preLoadAll, this));

            this.load = this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide));
        } else {
            this.load = this.whenWithProgress(this.preLoadAll());
        }
    };

    SmartSliderBackgroundImages.prototype.onSlideDeviceChanged = function (e, device) {
        this.device = device;
        for (var i = 0; i < this.slider.realSlides.length; i++) {
            if (this.slider.realSlides[i].backgroundImage) {
                this.slider.realSlides[i].backgroundImage.updateBackgroundToDevice(device);
            }
        }
    };

    SmartSliderBackgroundImages.prototype.preLoadAll = function () {
        var deferreds = [];
        for (var i = 0; i < this.slider.realSlides.length; i++) {
            deferreds.push(this.slider.realSlides[i].preLoad());
        }
        return deferreds;
    };

    SmartSliderBackgroundImages.prototype._preLoadSlides = function (slides) {
        var deferreds = [];
        if (Object.prototype.toString.call(slides) !== '[object Array]') {
            slides = [slides];
        }
        for (var i = 0; i < slides.length; i++) {
            deferreds.push(slides[i].preLoad());
        }

        return $.when.apply($, deferreds);
    };

    SmartSliderBackgroundImages.prototype.preloadSlidesLazyNeighbor = function (slides) {
        var deferreds = [this._preLoadSlides(slides)];

        if (this.lazyLoadNeighbor) {
            var j = 0,
                previousSlide = slides[0].previousSlide,
                nextSlide = slides[slides.length - 1].nextSlide;
            while (j < this.lazyLoadNeighbor) {
                deferreds.push(previousSlide.preLoad());
                previousSlide = previousSlide.previousSlide;
                deferreds.push(nextSlide.preLoad());
                nextSlide = nextSlide.nextSlide;
                j++;
            }
        }

        var renderedDeferred = $.Deferred();
        if (deferreds[0].state() != 'resolved') {
            var timeout = setTimeout($.proxy(function () {
                this.slider.load.showSpinner('backgroundImage' + slides[0].index);
                timeout = null;
            }, this), 50);

            $.when.apply($, deferreds).done($.proxy(function () {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                } else {
                    this.slider.load.removeSpinner('backgroundImage' + slides[0].index);
                }
                setTimeout(function () {
                    renderedDeferred.resolve();
                }, 100);
            }, this));

        } else {
            setTimeout(function () {
                renderedDeferred.resolve();
            }, 100);
        }

        return renderedDeferred;
    };

    SmartSliderBackgroundImages.prototype.hack = function () {
        for (var i = 0; i < this.slider.realSlides.length; i++) {
            if (this.slider.realSlides[i].backgroundImage) {
                this.slider.realSlides[i].backgroundImage.hack();
            }
        }
    };

    return SmartSliderBackgroundImages;
});
N2Require('SmartSliderLoad', [], [], function ($, scope, undefined) {

    function SmartSliderLoad(smartSlider, parameters) {

        this.parameters = $.extend({
            fade: 1,
            scroll: 0
        }, parameters);

        this.deferred = $.Deferred();

        this.smartSlider = smartSlider;
        this.spinnerKey = 'fadePlaceholder';

        this.id = smartSlider.sliderElement.attr('id');
        this.$window = $(window);

        this.spinner = $('#' + this.id + '-spinner');
    };


    SmartSliderLoad.prototype.start = function () {
        if (this.parameters.scroll) {

            var $window = $(window);
            $window.on('scroll.' + this.id, $.proxy(this.onScroll, this));
            this.onScroll();

        } else if (this.parameters.fade) {
            this.loadingArea = $('#' + this.id + '-placeholder').eq(0);
            this.showSpinner('fadePlaceholder');
            n2c.log('Fade on load - start wait');


            var spinnerCounter = this.spinner.find('.n2-ss-spinner-counter');
            if (spinnerCounter.length) {
                this.smartSlider.backgroundImages.load.progress($.proxy(function (current, total) {
                    spinnerCounter.html(Math.round(current / (total + 1) * 100) + '%');
                }, this));
            }

            this.showSlider();

        } else {
            this.smartSlider.responsive.ready.done($.proxy(function () {
                this._showSlider();
            }, this));
        }
    };

    SmartSliderLoad.prototype.onScroll = function () {
        if ((this.$window.scrollTop() + this.$window.height() > (this.smartSlider.sliderElement.offset().top + 100))) {
            n2c.log('Fade on scroll - reached');

            this.$window.off('scroll.' + this.id);

            this.showSlider();
        }
    };

    SmartSliderLoad.prototype.loadLayerImages = function () {
        var deferred = $.Deferred();
        this.smartSlider.sliderElement.find('.n2-ss-layers-container').n2imagesLoaded()
            .always(function () {
                deferred.resolve();
            });
        return deferred;
    };

    SmartSliderLoad.prototype.showSlider = function () {

        $.when(this.smartSlider.responsive.ready, this.smartSlider.backgroundImages.load, this.loadLayerImages()).always($.proxy(function () {
            this._showSlider();
        }, this));
    };

    SmartSliderLoad.prototype._showSlider = function (cb) {
        n2c.log('Images loaded');

        this.smartSlider.responsive.isReadyToResize = true;

        $.when.apply($, this.smartSlider.widgetDeferreds).done($.proxy(function () {
            n2c.log('Event: BeforeVisible');
            this.smartSlider.responsive.invalidateResponsiveState = true;
            this.smartSlider.responsive.doResize();

            if (this.smartSlider.mainAnimation) this.smartSlider.mainAnimation.setToStarterSlide(this.smartSlider.starterSlide);

            this.smartSlider.starterSlide.setStarterSlide();

            this.smartSlider.sliderElement.trigger('BeforeVisible');

            this.smartSlider.responsive.alignElement.addClass('n2-ss-slider-align-visible');

            n2c.log('Fade start');
            this.smartSlider.sliderElement
                .addClass('n2-ss-loaded')
                .removeClass('n2notransition');

            this.removeSpinner('fadePlaceholder');
            $('#' + this.id + '-placeholder').remove();
            this.loadingArea = this.smartSlider.sliderElement;

            if (typeof cb === 'function') {
                cb(this.deferred);
            } else {
                this.deferred.resolve();
            }
        }, this));
    };

    SmartSliderLoad.prototype.loaded = function (fn) {
        this.deferred.done(fn);
    };

    SmartSliderLoad.prototype.showSpinner = function (spinnerKey) {
        this.spinnerKey = spinnerKey;
        this.spinner.appendTo(this.loadingArea).css('display', '');
    };

    SmartSliderLoad.prototype.removeSpinner = function (spinnerKey) {
        if (this.spinnerKey == spinnerKey) {
            this.spinner.detach();
            this.spinnerKey = '';
        }
    };

    return SmartSliderLoad;
});
N2Require('SmartSliderApi', [], [], function ($, scope, undefined) {
    function SmartSliderApi() {
        this.sliders = {};
        this.readys = {};

        this._resetCounters = [];
    }

    SmartSliderApi.prototype.makeReady = function (id, slider) {
        this.sliders[id] = slider;
        if (typeof this.readys[id] !== 'undefined') {
            for (var i = 0; i < this.readys[id].length; i++) {
                this.readys[id][i].call(slider, slider, slider.sliderElement);
            }
        }
    };

    SmartSliderApi.prototype.ready = function (id, callback) {
        if (typeof this.sliders[id] !== 'undefined') {
            callback.call(this.sliders[id], this.sliders[id], this.sliders[id].sliderElement);
        } else {
            if (typeof this.readys[id] == 'undefined') {
                this.readys[id] = [];
            }
            this.readys[id].push(callback);
        }
    };

    SmartSliderApi.prototype.trigger = function (el, event) {
        var $el = n2(el),
            split = event.split(','),
            slide = $el.closest('.n2-ss-slide,.n2-ss-static-slide');

        if (split.length > 1) {
            if ($.inArray(el, this._resetCounters) == -1) {
                this._resetCounters.push(el);

                slide.on('layerAnimationSetStart.resetCounter', function () {
                    $el.data('eventCounter', 0);
                });
            }
            var counter = $el.data('eventCounter') || 0
            event = split[counter];
            counter++;
            if (counter > split.length - 1) {
                counter = 0;
            }
            $el.data('eventCounter', counter);
        }
        slide.triggerHandler(event);
    };

    SmartSliderApi.prototype.applyAction = function (el, action) {
        var ss = n2(el).closest('.n2-ss-slider').data('ss');
        ss[action].apply(ss, Array.prototype.slice.call(arguments, 2));
    };

    window.n2ss = new SmartSliderApi();

    return SmartSliderApi;
});

N2Require('SmartSliderAbstract', [], [], function ($, scope, undefined) {

    function SmartSliderAbstract(elementID, parameters) {
        this.startedDeferred = $.Deferred();

        if (elementID instanceof n2) {
            elementID = '#' + elementID.attr('id');
        }

        var id = elementID.substr(1);

        if (window[id] && window[id] instanceof SmartSliderAbstract) {
            return false;
        }

        this.id = parseInt(id.replace('n2-ss-', ''));

        // Register our object to a global variable
        window[id] = this;
        this.readyDeferred = $.Deferred();

        this.waitForExists(id, parameters);
    }

    SmartSliderAbstract.prototype.kill = function () {
        this.killed = true;
        $('#' + this.sliderElement.attr('id') + '-placeholder').remove();
        this.sliderElement.closest('.n2-ss-align').remove();
    };

    SmartSliderAbstract.prototype.waitForExists = function (id, parameters) {
        var deferred = $.Deferred(),
            existsCheck = function () {
                var $el = $('#' + id);
                if ($el.length) {
                    deferred.resolve($el);
                } else {
                    setTimeout(existsCheck, 500);
                }
            };
        deferred.done($.proxy(this.onSliderExists, this, id, parameters));

        existsCheck();
    };

    SmartSliderAbstract.prototype.onSliderExists = function (id, parameters, $sliderElement) {

        if ($sliderElement.prop('tagName') == 'SCRIPT') {
            var dependency = $sliderElement.data('dependency'),
                delay = $sliderElement.data('delay'),
                rocketLoad = $.proxy(function () {
                    var rocketSlider = $($sliderElement.html().replace(/<_s_c_r_i_p_t/g, '<script').replace(/<_\/_s_c_r_i_p_t/g, '</script'));
                    $sliderElement.replaceWith(rocketSlider);

                    this.waitForDimension($('#' + id), parameters);

                    $(window).triggerHandler('n2Rocket', [this.sliderElement]);
                }, this);
            if (dependency && $('#n2-ss-' + dependency).length) {
                n2ss.ready(dependency, $.proxy(function (slider) {
                    slider.ready(rocketLoad);
                }, this));
            } else if (delay) {
                setTimeout(rocketLoad, delay);
            } else {
                rocketLoad();
            }
        } else {

            this.waitForDimension($sliderElement, parameters);
        }
    };

    SmartSliderAbstract.prototype.waitForDimension = function ($sliderElement, parameters) {
        var deferred = $.Deferred(),
            startDimensionCheck = function () {
                var hasDimension = $sliderElement.is(':visible');
                if (hasDimension) {
                    deferred.resolve();
                } else {
                    setTimeout(startDimensionCheck, 200);
                }
            };
        startDimensionCheck();
        deferred
            .done($.proxy(this.onSliderHasDimension, this, $sliderElement, parameters));
    };

    SmartSliderAbstract.prototype.onSliderHasDimension = function ($sliderElement, parameters) {
        this.killed = false;
        this.isAdmin = false;

        this.responsive = false;
        this.mainAnimationLastChangeTime = 0;

        this.currentSlide = null;
        this.currentRealSlide = null;
        this.staticSlide = false;
        this.isShuffled = false;

        this.slides = [];

        this.visibleSlides = 1;

        this.sliderElement = $sliderElement.data('ss', this);

        this.parameters = $.extend({
            admin: false,
            playWhenVisible: 1,
            playWhenVisibleAt: 0.5,
            callbacks: '',
            autoplay: {},
            blockrightclick: false,
            maintainSession: 0,
            align: 'normal',
            controls: {
                drag: false,
                touch: 'horizontal',
                keyboard: false,
                scroll: false,
                tilt: false
            },
            hardwareAcceleration: true,
            layerMode: {
                playOnce: 0,
                playFirstLayer: 1,
                mode: 'skippable',
                inAnimation: 'mainInEnd'
            },
            foreverLayerAnimation: false,
            parallax: {
                enabled: 0,
                mobile: 0,
                horizontal: 'mouse',
                vertical: 'mouse',
                origin: 'enter'
            },
            load: {},
            mainanimation: {},
            randomize: {
                randomize: 0,
                randomizeFirst: 0
            },
            responsive: {},
            lazyload: {
                enabled: 0
            },
            postBackgroundAnimations: false,
            initCallbacks: [],
            dynamicHeight: 0,
            lightbox: [],
            lightboxDeviceImages: [],
            titles: [],
            descriptions: [],
            'background.parallax.tablet': 0,
            'background.parallax.mobile': 0,
            allowBGImageAttachmentFixed: 1,
            particlejs: 0
        }, parameters);

        this.firstSlideReady = $.Deferred();

        try {
            eval(this.parameters.callbacks);
        } catch (e) {
            console.error(e);
        }

        this.startVisibilityCheck();
        n2ss.makeReady(this.id, this);


        this.widgetDeferreds = [];
        this.sliderElement.on('addWidget', $.proxy(this.addWidget, this));

        this.isAdmin = !!this.parameters.admin;
        if (this.isAdmin) {
            this.changeTo = function () {
            };
        }

        this.load = new scope.SmartSliderLoad(this, this.parameters.load);

        this.backgroundImages = new scope.SmartSliderBackgroundImages(this);

        this.__initSlides();

        $.when(this.overrideFirstSlide()).done($.proxy(this.onFirstSlideInitialized, this));

        if (navigator.userAgent.match('UCBrowser')) {
            $('html').addClass('n2-ucbrowser');
        }
    };

    SmartSliderAbstract.prototype.overrideFirstSlide = function () {
        if (typeof window['ss' + this.id] !== 'undefined') {
            if (typeof window['ss' + this.id] == 'object') {
                return window['ss' + this.id].done($.proxy(function (forceActiveSlideIndex) {
                    if (forceActiveSlideIndex !== null) {
                        this.changeActiveBeforeLoad(forceActiveSlideIndex);
                    }
                }, this))
            } else {
                var forceActiveSlideIndex = typeof window['ss' + this.id] !== 'undefined' ? parseInt(window['ss' + this.id]) : null;
                if (forceActiveSlideIndex !== null) {
                    this.changeActiveBeforeLoad(forceActiveSlideIndex);
                }
            }
        } else {
            if (!this.isAdmin && this.parameters.maintainSession && typeof sessionStorage !== 'undefined') {
                var sessionIndex = sessionStorage.getItem('ss-' + this.id);
                if (sessionIndex !== null) {
                    this.changeActiveBeforeLoad(parseInt(sessionIndex));
                }
                this.sliderElement.on('mainAnimationComplete', $.proxy(function (e, animation, previous, next) {
                    sessionStorage.setItem('ss-' + this.id, next);
                }, this));
            }
        }

        return true;
    };

    SmartSliderAbstract.prototype.changeActiveBeforeLoad = function (index) {
        if (index > 0 && index < this.realSlides.length && this.starterSlide != this.realSlides[index]) {

            this.unsetActiveSlide(this.starterSlide);

            this.starterSlide = this.realSlides[index];

            this.setActiveSlide(this.realSlides[index]);
        }
    };

    SmartSliderAbstract.prototype.startCurrentSlideIndex = function () {

        this.currentRealSlide = this.currentSlide = this.starterSlide;

        this.setActiveSlide(this.currentSlide);

        if (!parseInt(this.parameters.carousel)) {
            this.initNotCarousel();
        } else {
            this.initCarousel();
        }
    };

    SmartSliderAbstract.prototype.onFirstSlideInitialized = function () {
        //Prepare linked list of slides
        for (var i = 0; i < this.realSlides.length; i++) {
            this.realSlides[i].setNext(this.realSlides[i + 1 > this.realSlides.length - 1 ? 0 : i + 1]);
        }

        this.startCurrentSlideIndex();
        this.firstSlideReady.resolve(this.currentSlide);

        for (var j = 0; j < this.parameters.initCallbacks.length; j++) {
            (new Function('$', this.parameters.initCallbacks[j])).call(this, $);
        }

        this.widgets = new scope.SmartSliderWidgets(this);

        this.sliderElement.on({
            universalenter: $.proxy(function (e) {
                if (!$(e.target).closest('.n2-full-screen-widget').length) {
                    this.sliderElement.addClass('n2-hover');
                }
            }, this),
            universalleave: $.proxy(function (e) {
                e.stopPropagation();
                this.sliderElement.removeClass('n2-hover');
            }, this)
        });


        this.controls = {};

        if (this.parameters.blockrightclick) {
            this.sliderElement.bind("contextmenu", function (e) {
                e.preventDefault();
            });
        }

        this.initMainAnimation();
        this.initResponsiveMode();

        if (this.killed) {
            return;
        }

        try {
            var removeHoverClassCB = $.proxy(function () {
                this.sliderElement.removeClass('n2-has-hover');
                this.sliderElement[0].removeEventListener('touchstart', removeHoverClassCB, window.n2passiveEvents ? {passive: true} : false);
            }, this);
            this.sliderElement[0].addEventListener('touchstart', removeHoverClassCB, window.n2passiveEvents ? {passive: true} : false);
        } catch (e) {
        }

        this.initControls();

        this.startedDeferred.resolve(this);

        if (!this.isAdmin) {
            var event = 'click';
            if (this.parameters.controls.touch != '0' && this.parameters.controls.touch) {
                event = 'n2click';
            }
            this.sliderElement.find('[data-n2click]').each(function (i, el) {
                var el = $(el);
                el.on(event, function () {
                    eval(el.data('n2click'));
                });
            });

            this.sliderElement.find('[data-click]').each(function (i, el) {
                var el = $(el).on('click', function () {
                    eval(el.data('click'));
                }).css('cursor', 'pointer');
            });

            this.sliderElement.find('[data-n2middleclick]').on('mousedown', function (e) {
                var el = $(this);
                if (e.which == 2 || e.which == 4) {
                    e.preventDefault();
                    eval(el.data('n2middleclick'));
                }
            });

            this.sliderElement.find('[data-mouseenter]').each(function (i, el) {
                var el = $(el).on('mouseenter', function () {
                    eval(el.data('mouseenter'));
                });
            });

            this.sliderElement.find('[data-mouseleave]').each(function (i, el) {
                var el = $(el).on('mouseleave', function () {
                    eval(el.data('mouseleave'));
                });
            });

            this.sliderElement.find('[data-play]').each(function (i, el) {
                var el = $(el).on('n2play', function () {
                    eval(el.data('play'));
                });
            });

            this.sliderElement.find('[data-pause]').each(function (i, el) {
                var el = $(el).on('n2pause', function () {
                    eval(el.data('pause'));
                });
            });

            this.sliderElement.find('[data-stop]').each(function (i, el) {
                var el = $(el).on('n2stop', function () {
                    eval(el.data('stop'));
                });
            });


            if (window.n2FocusAllowed == undefined) {
                window.n2FocusAllowed = false;

                $(window).on({
                    keydown: function () {
                        window.n2FocusAllowed = true;
                    },
                    keyup: function () {
                        window.n2FocusAllowed = false;
                    }
                });
            }

            this.sliderElement.find('a').on({
                focus: $.proxy(function (e) {
                    if (n2FocusAllowed) {
                        var slide = this.slider.findSlideByElement(e.currentTarget);
                        if (slide && slide != this.currentRealSlide) {
                            this.directionalChangeToReal(slide.index);
                        }
                    }
                }, this)
            });

        }

        this.preReadyResolve();

        this.sliderElement.find('[role="button"], [tabindex]').not('input,select,textarea')
            .keypress(function (event) {
                if (event.charCode === 32 || event.charCode === 13) {
                    event.preventDefault();
                    $(event.target).click();
                }
            })
            .on('mouseleave', function (e) {
                $(e.currentTarget).blur();
            });
    };

    SmartSliderAbstract.prototype.__initSlides = function () {

        var $slides = this.sliderElement.find('.n2-ss-slide');
        for (var i = 0; i < $slides.length; i++) {
            this.slides.push(new scope.FrontendSliderSlide(this, $slides.eq(i), i));
        }

        this.starterSlide = this.slides[0];
        for (var i = 0; i < this.slides.length; i++) {
            this.slides[i].init();
            if (this.slides[i].$element.data('first') == 1) {
                this.starterSlide = this.slides[i];
            }
        }

        this.realSlides = this.slides;

        this.afterRawSlidesReady();

        this.randomize(this.slides);

        var staticSlide = this.sliderElement.find('.n2-ss-static-slide');
        if (staticSlide.length) {
            this.staticSlide = new scope.FrontendSliderStaticSlide(this, staticSlide);
        }
    };

    SmartSliderAbstract.prototype.afterRawSlidesReady = function () {

    };

    SmartSliderAbstract.prototype.setVisibleSlides = function (visibleSlides) {
        if (visibleSlides != this.visibleSlides) {
            this.visibleSlides = visibleSlides;
            this.sliderElement.triggerHandler('visibleSlidesChanged');
        }
    };

    SmartSliderAbstract.prototype.getVisibleSlides = function (relativeSlide) {
        if (arguments.length == 0) relativeSlide = this.currentSlide;
        return [relativeSlide];
    };

    SmartSliderAbstract.prototype.findSlideBackground = function (slide) {
        return slide.$element.find('.n2-ss-slide-background');
    };

    SmartSliderAbstract.prototype.getRealIndex = function (index) {
        return index;
    };

    SmartSliderAbstract.prototype.randomize = function (slides) {
        this.randomizeFirst();

        if (this.parameters.randomize.randomize) {
            this.shuffleSlides(slides);
        }
    };

    SmartSliderAbstract.prototype.randomizeFirst = function () {
        if (this.parameters.randomize.randomizeFirst) {
            this.unsetActiveSlide(this.starterSlide);

            this.starterSlide = this.realSlides[Math.floor(Math.random() * this.realSlides.length)];

            this.setActiveSlide(this.starterSlide);
            console.log('randomize first');
        }
    };

    SmartSliderAbstract.prototype.shuffleSlides = function (slides) {

        slides.sort(function () {
            return 0.5 - Math.random();
        });
        var $container = slides[0].$element.parent();
        for (var i = 0; i < slides.length; i++) {
            slides[i].$element.appendTo($container);
            slides[i].setIndex(i);
        }

        this.isShuffled = true;
    };

    SmartSliderAbstract.prototype.addWidget = function (e, deferred) {
        this.widgetDeferreds.push(deferred);
    };

    SmartSliderAbstract.prototype.started = function (fn) {
        this.startedDeferred.done($.proxy(fn, this));
    };

    SmartSliderAbstract.prototype.preReadyResolve = function () {
        // Hack to allow time to widgets to register
        setTimeout($.proxy(this._preReadyResolve, this), 1);
    };

    SmartSliderAbstract.prototype._preReadyResolve = function () {

        this.load.start();
        this.load.loaded($.proxy(this.readyResolve, this));
    };

    SmartSliderAbstract.prototype.readyResolve = function () {
        n2c.log('Slider ready');
        $(window).scroll(); // To force other sliders to recalculate the scroll position

        this.readyDeferred.resolve();
    };

    SmartSliderAbstract.prototype.ready = function (fn) {
        this.readyDeferred.done($.proxy(fn, this));
    };

    SmartSliderAbstract.prototype.startVisibilityCheck = function () {
        this.visibleDeferred = $.Deferred();
        if (this.parameters.playWhenVisible) {
            this.ready($.proxy(function () {
                $(window).on('scroll.n2-ss-visible' + this.id + ' resize.n2-ss-visible' + this.id, $.proxy(this.checkIfVisible, this));
                this.checkIfVisible();
            }, this));
        } else {
            this.ready($.proxy(function () {
                this.visibleDeferred.resolve();
            }, this));
        }
    };

    SmartSliderAbstract.prototype.checkIfVisible = function () {
        var windowOffsetTop = $(window).scrollTop(),
            windowHeight = $(window).height(),
            sliderTop = this.sliderElement.offset().top,
            middlePointTop = sliderTop + Math.min(this.sliderElement.height(), windowHeight) * this.parameters.playWhenVisibleAt,
            middlePointBottom = sliderTop + Math.min(this.sliderElement.height(), windowHeight) * (1 - this.parameters.playWhenVisibleAt);

        if (this.isAdmin || (middlePointTop >= windowOffsetTop && middlePointBottom <= windowOffsetTop + windowHeight)) {
            $(window).off('scroll.n2-ss-visible' + this.id + ' resize.n2-ss-visible' + this.id, $.proxy(this.checkIfVisible, this));
            this.visibleDeferred.resolve();
        }
    };

    SmartSliderAbstract.prototype.visible = function (fn) {
        this.visibleDeferred.done($.proxy(fn, this));
    };

    SmartSliderAbstract.prototype.isPlaying = function () {
        if (this.mainAnimation.getState() != 'ended') {
            return true;
        }
        return false;
    };

    SmartSliderAbstract.prototype.focus = function (isSystem) {
        var deferred = $.Deferred();
        if (typeof isSystem == 'undefined') {
            isSystem = 0;
        }
        if (this.responsive.parameters.focusUser && !isSystem || this.responsive.parameters.focusAutoplay && isSystem) {
            var top = this.sliderElement.offset().top - (this.responsive.verticalOffsetSelectors.height() || 0);
            if ($(window).scrollTop() != top) {
                $("html, body").animate({scrollTop: top}, 400, $.proxy(function () {
                    deferred.resolve();
                }, this));
            } else {
                deferred.resolve();
            }
        } else {
            deferred.resolve();
        }
        return deferred;
    };

    SmartSliderAbstract.prototype.initNotCarousel = function () {
        this.next = function (isSystem, customAnimation) {
            var nextIndex = this.currentSlide.index + 1;
            if (nextIndex < this.slides.length) {
                return this.changeTo(nextIndex, false, isSystem, customAnimation);
            }
            return false;
        };
        this.previous = function (isSystem, customAnimation) {
            var nextIndex = this.currentSlide.index - 1;
            if (nextIndex >= 0) {
                return this.changeTo(nextIndex, true, isSystem, customAnimation);
            }
            return false;
        };
        this.isChangePossible = function (direction) {
            var nextIndex = false;
            if (direction == 'next') {
                nextIndex = this.currentSlide.index + 1;
                if (nextIndex >= this.slides.length) {
                    nextIndex = false;
                }
            } else if (direction == 'previous') {
                nextIndex = this.currentSlide.index - 1;
                if (nextIndex < 0) {
                    nextIndex = false;
                }
            }

            if (nextIndex !== false && nextIndex != this.currentSlide.index) {
                return true;
            }
            return false;
        };

        var slidesCount = this.slides.length,
            previousArrowOpacity = 1,
            previousArrow = this.sliderElement.find('.nextend-arrow-previous'),
            changePreviousArrowOpacity = function (opacity) {
                if (opacity != previousArrowOpacity) {
                    NextendTween.to(previousArrow, 0.4, {opacity: opacity}).play();
                    previousArrowOpacity = opacity;
                }
            };
        var nextArrowOpacity = 1,
            nextArrow = this.sliderElement.find('.nextend-arrow-next'),
            changeNextArrowOpacity = function (opacity) {
                if (opacity != nextArrowOpacity) {
                    NextendTween.to(nextArrow, 0.4, {opacity: opacity}).play();
                    nextArrowOpacity = opacity;
                }
            };

        var hideOrShowArrows = function (i) {
            changePreviousArrowOpacity(i == 0 ? 0 : 1);
            changeNextArrowOpacity(i == slidesCount - 1 ? 0 : 1);
        };

        hideOrShowArrows(this.currentSlide.index);

        this.sliderElement.on('sliderSwitchTo', function (e, i) {
            hideOrShowArrows(i);
        });
    };

    SmartSliderAbstract.prototype.isChangePossibleCarousel = function (direction) {
        var nextIndex = false;
        if (direction == 'next') {
            nextIndex = this.currentSlide.index + 1;
            if (nextIndex >= this.slides.length) {
                nextIndex = 0;
            }
        } else if (direction == 'previous') {
            nextIndex = this.currentSlide.index - 1;
            if (nextIndex < 0) {
                nextIndex = this.slides.length - 1;
            }
        }

        if (nextIndex !== false && nextIndex != this.currentSlide.index) {
            return true;
        }
        return false;
    };

    SmartSliderAbstract.prototype.initCarousel = function () {

        this.next = this.nextCarousel;
        this.previous = this.previousCarousel;
        this.isChangePossible = this.isChangePossibleCarousel;
    };

    SmartSliderAbstract.prototype.nextCarousel = function (isSystem, customAnimation) {
        var nextIndex = this.currentSlide.index + 1;
        if (nextIndex >= this.slides.length) {
            nextIndex = 0;
        }
        return this.changeTo(nextIndex, false, isSystem, customAnimation);
    };

    SmartSliderAbstract.prototype.previousCarousel = function (isSystem, customAnimation) {
        var nextIndex = this.currentSlide.index - 1;
        if (nextIndex < 0) {
            nextIndex = this.slides.length - 1;
        }
        return this.changeTo(nextIndex, true, isSystem, customAnimation);
    };


    SmartSliderAbstract.prototype.directionalChangeToReal = function (nextSlideIndex) {
        this.directionalChangeTo(nextSlideIndex);
    };

    SmartSliderAbstract.prototype.directionalChangeTo = function (nextSlideIndex) {
        if (nextSlideIndex > this.currentSlide.index) {
            this.changeTo(nextSlideIndex, false);
        } else {
            this.changeTo(nextSlideIndex, true);
        }
    };

    SmartSliderAbstract.prototype.changeTo = function (nextSlideIndex, reversed, isSystem, customAnimation) {
        nextSlideIndex = parseInt(nextSlideIndex);

        if (nextSlideIndex != this.currentSlide.index) {
            n2c.log('Event: sliderSwitchTo: ', 'targetSlideIndex');
            this.sliderElement.trigger('sliderSwitchTo', [nextSlideIndex, this.getRealIndex(nextSlideIndex)]);
            var time = $.now();
            $.when(this.backgroundImages.preLoadSlides(this.getVisibleSlides(this.slides[nextSlideIndex])), this.focus(isSystem)).done($.proxy(function () {

                if (this.mainAnimationLastChangeTime <= time) {
                    this.mainAnimationLastChangeTime = time;
                    // If the current main animation haven't finished yet or the prefered next slide is the same as our current slide we have nothing to do
                    var state = this.mainAnimation.getState();
                    if (state == 'ended') {

                        if (typeof isSystem === 'undefined') {
                            isSystem = false;
                        }

                        var animation = this.mainAnimation;
                        if (typeof customAnimation !== 'undefined') {
                            animation = customAnimation;
                        }

                        this._changeTo(nextSlideIndex, reversed, isSystem, customAnimation);

                        n2c.log('Change From:', this.currentSlide.index, ' To: ', nextSlideIndex, ' Reversed: ', reversed, ' System: ', isSystem);
                        animation.changeTo(this.currentSlide, this.slides[nextSlideIndex], reversed, isSystem);

                        this._changeCurrentSlide(nextSlideIndex);

                    } else if (state == 'playing') {
                        this.sliderElement.off('.fastChange').one('mainAnimationComplete.fastChange', $.proxy(function () {
                            this.changeTo.call(this, nextSlideIndex, reversed, isSystem, customAnimation);
                        }, this));
                        this.mainAnimation.timeScale(this.mainAnimation.timeScale() * 2);
                    }
                }
            }, this));
            return true;
        }
        return false;
    };

    SmartSliderAbstract.prototype._changeCurrentSlide = function (index) {
        this.currentRealSlide = this.currentSlide = this.slides[index];
    };

    SmartSliderAbstract.prototype._changeTo = function (nextSlideIndex, reversed, isSystem, customAnimation) {

    };

    SmartSliderAbstract.prototype.revertTo = function (nextSlideIndex, originalNextSlideIndex) {

        this.unsetActiveSlide(this.slides[originalNextSlideIndex]);
        this.setActiveSlide(this.slides[nextSlideIndex]);

        this._changeCurrentSlide(nextSlideIndex);

        this.sliderElement.trigger('sliderSwitchTo', [nextSlideIndex, this.getRealIndex(nextSlideIndex)]);
    };

    SmartSliderAbstract.prototype.setActiveSlide = function (slide) {
        slide.$element.addClass('n2-ss-slide-active');
    };

    SmartSliderAbstract.prototype.unsetActiveSlide = function (slide) {
        slide.$element.removeClass('n2-ss-slide-active');
    };

    SmartSliderAbstract.prototype.findSlideByElement = function (element) {
        element = $(element);
        for (var i = 0; i < this.realSlides.length; i++) {
            if (this.realSlides[i].$element.has(element).length === 1) {
                return this.realSlides[i];
            }
        }
        return false;
    };

    SmartSliderAbstract.prototype.findSlideIndexByElement = function (element) {
        var slide = this.findSlideByElement(element);
        if (slide) {
            return slide;
        }
        return -1;
    };

    SmartSliderAbstract.prototype.initMainAnimation = function () {
        this.mainAnimation = false;
    };

    SmartSliderAbstract.prototype.initResponsiveMode = function () {
        this.dimensions = this.responsive.responsiveDimensions;
    };

    SmartSliderAbstract.prototype.initControls = function () {

        if (!this.parameters.admin) {
            if (this.parameters.controls.touch != '0' && this.slides.length > 1) {
                new scope.SmartSliderControlTouch(this, this.parameters.controls.touch, {
                    fallbackToMouseEvents: this.parameters.controls.drag
                });
            }

            if (this.parameters.controls.keyboard) {
                if (typeof this.controls.touch !== 'undefined') {
                    new scope.SmartSliderControlKeyboard(this, this.controls.touch._direction.axis);
                } else {
                    new scope.SmartSliderControlKeyboard(this, 'horizontal');
                }
            }

            if (this.parameters.controls.scroll) {
                new scope.SmartSliderControlScroll(this);
            }

            if (this.parameters.controls.tilt) {
                new scope.SmartSliderControlTilt(this);
            }

            this.controlAutoplay = new scope.SmartSliderControlAutoplay(this, this.parameters.autoplay);


            this.controlFullscreen = new scope.SmartSliderControlFullscreen(this);

        }
    };

    SmartSliderAbstract.prototype.getSlideIndex = function (index) {
        return index;
    };

    SmartSliderAbstract.prototype.slideToID = function (id, direction) {
        for (var i = 0; i < this.realSlides.length; i++) {
            if (this.realSlides[i].id == id) {
                return this.slide(this.getSlideIndex(i), direction);
            }
        }

        var slider = $('[data-id="' + id + '"]').closest('.n2-ss-slider');

        if (slider.length && this.id == slider.data('ss').id) {
            return true;
        }

        if (slider.length) {
            var offsetTop = 0;
            if (typeof n2ScrollOffsetSelector !== "undefined") {
                offsetTop = n2(n2ScrollOffsetSelector).outerHeight();
            }
            n2("html, body").animate({scrollTop: slider.offset().top - offsetTop}, 400);
            return slider.data('ss').slideToID(id, direction);
        }
    };

    SmartSliderAbstract.prototype.slide = function (index, direction) {
        if (index >= 0 && index < this.slides.length) {
            if (typeof direction == 'undefined') {
                if (parseInt(this.parameters.carousel)) {
                    if (this.currentSlide.index == this.slides.length - 1 && index == 0) {
                        return this.next();
                    } else {
                        if (this.currentSlide.index > index) {
                            return this.changeTo(index, true);
                        } else {
                            return this.changeTo(index);
                        }
                    }
                } else {
                    if (this.currentSlide.index > index) {
                        return this.changeTo(index, true);
                    } else {
                        return this.changeTo(index);
                    }
                }
            } else {
                return this.changeTo(index, !direction);
            }
        }
        return false;
    };

    SmartSliderAbstract.prototype.startAutoplay = function (e) {
        if (typeof this.controlAutoplay !== 'undefined') {
            this.controlAutoplay.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
            return true;
        }
        return false;
    };

    return SmartSliderAbstract;
});

N2Require('SmartSliderWidgets', [], [], function ($, scope, undefined) {

    function SmartSliderWidgets(slider) {
        this.slider = slider;
        this.sliderElement = slider.sliderElement.on('BeforeVisible', $.proxy(this.onReady, this));

        this.initExcludeSlides();
    }

    SmartSliderWidgets.prototype.onReady = function () {
        this.dimensions = this.slider.dimensions;

        this.widgets = {
            previous: this.sliderElement.find('.nextend-arrow-previous'),
            next: this.sliderElement.find('.nextend-arrow-next'),
            bullet: this.sliderElement.find('.nextend-bullet-bar'),
            autoplay: this.sliderElement.find('.nextend-autoplay'),
            indicator: this.sliderElement.find('.nextend-indicator'),
            bar: this.sliderElement.find('.nextend-bar'),
            thumbnail: this.sliderElement.find('.nextend-thumbnail'),
            shadow: this.sliderElement.find('.nextend-shadow'),
            fullscreen: this.sliderElement.find('.nextend-fullscreen'),
            html: this.sliderElement.find('.nextend-widget-html')
        };

        this.variableElementsDimension = {
            width: this.sliderElement.find('[data-sswidth]'),
            height: this.sliderElement.find('[data-ssheight]')
        };

        this.variableElements = {
            top: this.sliderElement.find('[data-sstop]'),
            right: this.sliderElement.find('[data-ssright]'),
            bottom: this.sliderElement.find('[data-ssbottom]'),
            left: this.sliderElement.find('[data-ssleft]')
        };

        this.slider.sliderElement.on('SliderAnimatedResize', $.proxy(this.onAnimatedResize, this));
        this.slider.sliderElement.on('SliderResize', $.proxy(this.onResize, this));
        this.slider.sliderElement.one('slideCountChanged', $.proxy(function () {
            this.onResize(this.slider.responsive.lastRatios);
        }, this));

        //this.slider.ready($.proxy(function () {
        this.onResize(this.slider.responsive.lastRatios);
        //}, this));
        this.initHover();
    };

    SmartSliderWidgets.prototype.initHover = function () {
        var timeout = null,
            widgets = this.sliderElement.find('.n2-ss-widget-hover');
        if (widgets.length > 0) {
            this.sliderElement.on('universalenter', function (e) {
                var slider = $(this);
                if (timeout) clearTimeout(timeout);
                widgets.css('visibility', 'visible');
                setTimeout(function () {
                    slider.addClass('n2-ss-widget-hover-show');
                }, 50);
            }).on('universalleave', function () {
                var slide = this;
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(function () {
                    $(slide).removeClass('n2-ss-widget-hover-show');
                    timeout = setTimeout(function () {
                        widgets.css('visibility', 'hidden');
                    }, 400);
                }, 500);
            });
        }
    };

    SmartSliderWidgets.prototype.initExcludeSlides = function () {
        var widgets = this.sliderElement.find('.n2-ss-widget[data-exclude-slides]'),
            hideOrShow = function (widget, excludedSlides, currentSlideIndex) {
                if ($.inArray((currentSlideIndex + 1) + '', excludedSlides) != -1) {
                    widget.addClass('n2-ss-widget-hidden');
                } else {
                    widget.removeClass('n2-ss-widget-hidden');
                }
            };
        widgets.each($.proxy(function (i, el) {
            var widget = $(el),
                excludedSlides = widget.attr('data-exclude-slides').split(',');
            for (var i = excludedSlides.length - 1; i >= 0; i--) {
                var parts = excludedSlides[i].split('-');
                if (parts.length == 2 && parseInt(parts[0]) <= parseInt(parts[1])) {
                    excludedSlides[i] = parts[0];
                    parts[0] = parseInt(parts[0]);
                    parts[1] = parseInt(parts[1]);
                    for (var j = parts[0] + 1; j <= parts[1]; j++) {
                        excludedSlides.push(j + '');
                    }
                }
            }
            hideOrShow(widget, excludedSlides, this.slider.currentRealSlide.index);
            this.slider.sliderElement
                .on('sliderSwitchTo', function (e, targetSlideIndex) {
                    hideOrShow(widget, excludedSlides, targetSlideIndex);
                });
        }, this));
    };

    SmartSliderWidgets.prototype.onAnimatedResize = function (e, ratios, timeline, duration) {
        for (var key in this.widgets) {
            var el = this.widgets[key],
                visible = el.is(":visible");
            this.dimensions[key + 'width'] = visible ? el.outerWidth(false) : 0;
            this.dimensions[key + 'height'] = visible ? el.outerHeight(false) : 0;
        }

        // Compatibility variables for the old version
        this.dimensions['width'] = this.dimensions.slider.width;
        this.dimensions['height'] = this.dimensions.slider.height;
        this.dimensions['outerwidth'] = this.sliderElement.parent().width();
        this.dimensions['outerheight'] = this.sliderElement.parent().height();
        this.dimensions['canvaswidth'] = this.dimensions.slide.width;
        this.dimensions['canvasheight'] = this.dimensions.slide.height;
        this.dimensions['margintop'] = this.dimensions.slider.marginTop;
        this.dimensions['marginright'] = this.dimensions.slider.marginRight;
        this.dimensions['marginbottom'] = this.dimensions.slider.marginBottom;
        this.dimensions['marginleft'] = this.dimensions.slider.marginLeft;

        var variableText = '';
        for (var key in this.dimensions) {
            var value = this.dimensions[key];
            if (typeof value == "object") {
                for (var key2 in value) {
                    variableText += "var " + key + key2 + " = " + value[key2] + ";";
                }
            } else {
                variableText += "var " + key + " = " + value + ";";
            }
        }
        eval(variableText);

        for (var k in this.variableElementsDimension) {
            for (var i = 0; i < this.variableElementsDimension[k].length; i++) {
                var el = this.variableElementsDimension[k].eq(i);
                if (el.is(':visible')) {
                    var to = {};
                    try {
                        to[k] = eval(el.data('ss' + k)) + 'px';
                        for (var widget in this.widgets) {
                            if (this.widgets[widget].filter(el).length) {
                                if (k == 'width') {
                                    this.dimensions[widget + k] = el.outerWidth(false);
                                } else if (k == 'height') {
                                    this.dimensions[widget + k] = el.outerHeight(false);
                                }
                                eval(widget + k + " = " + this.dimensions[widget + k] + ";");
                            }
                        }
                    } catch (e) {
                        console.log(el, ' position variable: ' + e.message + ': ', el.data('ss' + k));
                    }
                    timeline.to(el, duration, to, 0);
                }
            }
        }

        for (var k in this.variableElements) {
            for (var i = 0; i < this.variableElements[k].length; i++) {
                var el = this.variableElements[k].eq(i);
                try {
                    var to = {};
                    to[k] = eval(el.data('ss' + k)) + 'px';
                    timeline.to(el, duration, to, 0);
                } catch (e) {
                    console.log(el, ' position variable: ' + e.message + ': ', el.data('ss' + k));
                }
            }
        }
    };


    SmartSliderWidgets.prototype.onResize = function (e, ratios, responsive, timeline) {
        if (timeline) {
            return;
        }


        for (var k in this.variableElements) {
            for (var i = 0; i < this.variableElements[k].length; i++) {
                var last = this.variableElements[k].data('n2Last' + k);
                if (last > 0) {
                    this.variableElements[k].css(k, 0);
                }
            }
        }

        for (var key in this.widgets) {
            var el = this.widgets[key],
                visible = el.length && el.is(":visible");
            if (el.length && el.is(":visible")) {
                this.dimensions[key + 'width'] = el.outerWidth(false);
                this.dimensions[key + 'height'] = el.outerHeight(false);

            } else {
                this.dimensions[key + 'width'] = 0;
                this.dimensions[key + 'height'] = 0;
            }
        }


        for (var k in this.variableElements) {
            for (var i = 0; i < this.variableElements[k].length; i++) {
                var last = this.variableElements[k].data('n2Last' + k);
                if (last > 0) {
                    this.variableElements[k].css(k, last);
                }
            }
        }

        // Compatibility variables for the old version
        this.dimensions['width'] = this.dimensions.slider.width;
        this.dimensions['height'] = this.dimensions.slider.height;
        this.dimensions['outerwidth'] = this.sliderElement.parent().width();
        this.dimensions['outerheight'] = this.sliderElement.parent().height();
        this.dimensions['canvaswidth'] = this.dimensions.slide.width;
        this.dimensions['canvasheight'] = this.dimensions.slide.height;
        this.dimensions['margintop'] = this.dimensions.slider.marginTop;
        this.dimensions['marginright'] = this.dimensions.slider.marginRight;
        this.dimensions['marginbottom'] = this.dimensions.slider.marginBottom;
        this.dimensions['marginleft'] = this.dimensions.slider.marginLeft;

        var variableText = '';
        for (var key in this.dimensions) {
            var value = this.dimensions[key];
            if (typeof value == "object") {
                for (var key2 in value) {
                    variableText += "var " + key + key2 + " = " + value[key2] + ";";
                }
            } else {
                variableText += "var " + key + " = " + value + ";";
            }
        }
        eval(variableText);

        for (var k in this.variableElementsDimension) {
            for (var i = 0; i < this.variableElementsDimension[k].length; i++) {
                var el = this.variableElementsDimension[k].eq(i);
                if (el.is(':visible')) {
                    try {
                        el.css(k, eval(el.data('ss' + k)) + 'px');
                        for (var widget in this.widgets) {
                            if (this.widgets[widget].filter(el).length) {
                                if (k == 'width') {
                                    this.dimensions[widget + k] = el.outerWidth(false);
                                } else if (k == 'height') {
                                    this.dimensions[widget + k] = el.outerHeight(false);
                                }
                                eval(widget + k + " = " + this.dimensions[widget + k] + ";");
                            }
                        }
                    } catch (e) {
                        console.log(el, ' position variable: ' + e.message + ': ', el.data('ss' + k));
                    }
                }
            }
        }

        for (var k in this.variableElements) {
            for (var i = 0; i < this.variableElements[k].length; i++) {
                var el = this.variableElements[k].eq(i);
                try {
                    var value = eval(el.data('ss' + k));
                    el.css(k, value + 'px');
                    el.data('n2Last' + k, value);
                } catch (e) {
                    console.log(el, ' position variable: ' + e.message + ': ', el.data('ss' + k));
                }
            }
        }

        this.slider.responsive.refreshStaticSizes();

    };

    return SmartSliderWidgets;
});
N2Require('SmartSliderBackgroundAnimationAbstract', [], [], function ($, scope, undefined) {

    function SmartSliderBackgroundAnimationAbstract(sliderBackgroundAnimation, currentImage, nextImage, animationProperties, durationMultiplier, reversed) {
        this.durationMultiplier = durationMultiplier;

        this.original = {
            currentImage: currentImage,
            nextImage: nextImage
        };

        this.animationProperties = animationProperties;

        this.reversed = reversed;

        this.timeline = sliderBackgroundAnimation.timeline;

        this.containerElement = sliderBackgroundAnimation.bgAnimationElement;

        this.shiftedBackgroundAnimation = sliderBackgroundAnimation.parameters.shiftedBackgroundAnimation;

        this.clonedImages = {};

    };

    SmartSliderBackgroundAnimationAbstract.prototype.postSetup = function () {
    };

    SmartSliderBackgroundAnimationAbstract.prototype.ended = function () {

    };

    SmartSliderBackgroundAnimationAbstract.prototype.revertEnded = function () {

    };

    SmartSliderBackgroundAnimationAbstract.prototype.placeNextImage = function () {
        this.clonedImages.nextImage = this.original.nextImage.clone().css({
            position: 'absolute',
            top: 0,
            left: 0
        });

        this.containerElement.append(this.clonedImages.nextImage);
    };

    SmartSliderBackgroundAnimationAbstract.prototype.placeCurrentImage = function () {
        this.clonedImages.currentImage = this.original.currentImage.clone().css({
            position: 'absolute',
            top: 0,
            left: 0
        });

        this.containerElement.append(this.clonedImages.currentImage);
    };

    SmartSliderBackgroundAnimationAbstract.prototype.hideOriginals = function () {
        this.original.currentImage.css('opacity', 0);
        this.original.nextImage.css('opacity', 0);
    };

    SmartSliderBackgroundAnimationAbstract.prototype.resetAll = function () {
        this.original.currentImage.css('opacity', 1);
        this.original.nextImage.css('opacity', 1);
        this.containerElement.html('');
    };

    SmartSliderBackgroundAnimationAbstract.prototype.getExtraDelay = function () {
        return 0;
    };

    return SmartSliderBackgroundAnimationAbstract;
});

N2Require('SmartSliderBackgroundAnimationCubic', ['SmartSliderBackgroundAnimationTiled'], [], function ($, scope, undefined) {


    function SmartSliderBackgroundAnimationCubic() {
        scope.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    };

    SmartSliderBackgroundAnimationCubic.prototype = Object.create(scope.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationCubic.prototype.constructor = SmartSliderBackgroundAnimationCubic;


    SmartSliderBackgroundAnimationCubic.prototype.setup = function () {
        var animation = $.extend(true, {
            columns: 1,
            rows: 1,
            fullCube: true,
            tiles: {
                delay: 0.2,  // Delay between the starting of the tiles sequence. Ex.: #1 batch start: 0s, #2: .2s, #3: .4s
                sequence: 'Parallel' // Parallel, Random, ForwardCol, BackwardCol, ForwardRow, BackwardRow, ForwardDiagonal, BackwardDiagonal
            },
            depth: 50, // Used only when side is "Back"
            main: {
                side: 'Left', // Left, Right, Top, Bottom, Back, BackInvert
                duration: 0.5,
                ease: 'easeInOutCubic',
                direction: 'horizontal', // horizontal, vertical // Used when side points to Back
                real3D: true // Enable perspective
            },
            pre: [], // Animations to play on tiles before main
            post: [] // Animations to play on tiles after main
        }, this.animationProperties);
        animation.fullCube = true;

        if (this.reversed) {
            if (typeof animation.invert !== 'undefined') {
                $.extend(true, animation.main, animation.invert);
            }

            if (typeof animation.invertTiles !== 'undefined') {
                $.extend(animation.tiles, animation.invertTiles);
            }
        }

        scope.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);
    };

    SmartSliderBackgroundAnimationCubic.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {

        var d = animation.depth;

        switch (d) {
            case 'width':
                d = w;
                break;
            case 'height':
                d = h;
                break;
        }
        switch (animation.main.side) {
            case 'Top':
            case 'Bottom':
                d = h;
                break;
            case 'Left':
            case 'Right':
                d = w;
                break;
        }

        if (animation.main.real3D) {
            NextendTween.set(tile.get(0), {
                transformStyle: "preserve-3d"
            });
        }
        var cuboid = $('<div class="cuboid"></div>').css({
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%'
        }).appendTo(tile);
        NextendTween.set(cuboid.get(0), {
            transformStyle: "preserve-3d",
            z: -d / 2
        });

        var backRotationZ = 0;
        if (animation.main.direction == 'horizontal') {
            backRotationZ = 180;
        }
        var back = this.getSide(cuboid, w, h, 0, 0, -d / 2, 180, 0, backRotationZ),
            sides = {
                Back: back,
                BackInvert: back
            };
        if (animation.fullCube || animation.main.direction == 'vertical') {
            sides.Bottom = this.getSide(cuboid, w, d, 0, h - d / 2, 0, -90, 0, 0);
            sides.Top = this.getSide(cuboid, w, d, 0, -d / 2, 0, 90, 0, 0);
        }

        sides.Front = this.getSide(cuboid, w, h, 0, 0, d / 2, 0, 0, 0);
        if (animation.fullCube || animation.main.direction == 'horizontal') {
            sides.Left = this.getSide(cuboid, d, h, -d / 2, 0, 0, 0, -90, 0);
            sides.Right = this.getSide(cuboid, d, h, w - d / 2, 0, 0, 0, 90, 0);
        }

        sides.Front.append(this.clonedCurrent().clone().css({
            position: 'absolute',
            top: -totalTop + 'px',
            left: -totalLeft + 'px'
        }));

        sides[animation.main.side].append(this.clonedNext().clone().css({
            position: 'absolute',
            top: -totalTop + 'px',
            left: -totalLeft + 'px'
        }));

        return cuboid;
    };

    SmartSliderBackgroundAnimationCubic.prototype.getSide = function (cuboid, w, h, x, y, z, rX, rY, rZ) {
        var side = $('<div class="n2-3d-side"></div>')
            .css({
                width: w,
                height: h
            })
            .appendTo(cuboid);
        NextendTween.set(side.get(0), {
            x: x,
            y: y,
            z: z,
            rotationX: rX,
            rotationY: rY,
            rotationZ: rZ,
            backfaceVisibility: "hidden"
        });
        return side;
    };

    SmartSliderBackgroundAnimationCubic.prototype.addAnimation = function (animation, cuboids) {
        var duration = animation.duration;
        delete animation.duration;
        this.timeline.to(cuboids, duration * this.durationMultiplier, animation);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transform = function (animation, cuboid, position) {

        for (var i = 0; i < animation.pre.length; i++) {
            var _a = animation.pre[i];
            var duration = _a.duration * this.durationMultiplier;
            this.timeline.to(cuboid, duration, _a, position);
            position += duration;
        }

        this['transform' + animation.main.side](animation.main, cuboid, position);
        position += animation.main.duration;

        for (var i = 0; i < animation.post.length; i++) {
            var _a = animation.post[i];
            var duration = _a.duration * this.durationMultiplier;
            this.timeline.to(cuboid, duration, _a, position);
            position += duration;
        }
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformLeft = function (main, cuboid, total) {
        this._transform(main, cuboid, total, 0, 90, 0);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformRight = function (main, cuboid, total) {
        this._transform(main, cuboid, total, 0, -90, 0);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformTop = function (main, cuboid, total) {
        this._transform(main, cuboid, total, -90, 0, 0);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformBottom = function (main, cuboid, total) {
        this._transform(main, cuboid, total, 90, 0, 0);
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformBack = function (main, cuboid, total) {
        if (main.direction == 'horizontal') {
            this._transform(main, cuboid, total, 0, 180, 0);
        } else {
            this._transform(main, cuboid, total, 180, 0, 0);
        }
    };

    SmartSliderBackgroundAnimationCubic.prototype.transformBackInvert = function (main, cuboid, total) {
        if (main.direction == 'horizontal') {
            this._transform(main, cuboid, total, 0, -180, 0);
        } else {
            this._transform(main, cuboid, total, -180, 0, 0);
        }
    };

    SmartSliderBackgroundAnimationCubic.prototype._transform = function (main, cuboid, total, rX, rY, rZ) {
        this.timeline.to(cuboid, main.duration * this.durationMultiplier, {
            rotationX: rX,
            rotationY: rY,
            rotationZ: rZ,
            ease: main.ease
        }, total);
    };

    return SmartSliderBackgroundAnimationCubic;
});
N2Require('SmartSliderBackgroundAnimationExplode', ['SmartSliderBackgroundAnimationTiled'], [], function ($, scope, undefined) {

    function SmartSliderBackgroundAnimationExplode() {
        scope.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    };

    SmartSliderBackgroundAnimationExplode.prototype = Object.create(scope.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationExplode.prototype.constructor = SmartSliderBackgroundAnimationExplode;


    SmartSliderBackgroundAnimationExplode.prototype.setup = function () {

        var animation = $.extend(true, {
            columns: 1,
            rows: 1,
            reverse: false,
            tiles: {
                delay: 0, // Delay between the starting of the tiles sequence. Ex.: #1 batch start: 0s, #2: .2s, #3: .4s
                sequence: 'Parallel' // Parallel, Random, ForwardCol, BackwardCol, ForwardRow, BackwardRow, ForwardDiagonal, BackwardDiagonal
            },
            main: {
                duration: 0.5,
                zIndex: 2, // z-index of the current image. Change it to 2 to show it over the second image.
                current: { // Animation of the current tile
                    ease: 'easeInOutCubic'
                }
            }
        }, this.animationProperties);

        this.placeNextImage();
        this.clonedImages.nextImage.css({
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        });

        scope.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);
    };

    SmartSliderBackgroundAnimationExplode.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {

        var current = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: animation.main.zIndex
            })
            .append(this.clonedCurrent().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);

        NextendTween.set(tile.get(0), {
            transformPerspective: 1000,
            transformStyle: "preserve-3d"
        });

        return {
            current: current,
            tile: tile
        }
    };

    SmartSliderBackgroundAnimationExplode.prototype.transform = function (animation, animatable, total) {

        var current = $.extend(true, {}, animation.main.current);

        current.rotationX = (Math.random() * 3 - 1) * 90;
        current.rotationY = (Math.random() * 3 - 1) * 90;
        current.rotationZ = (Math.random() * 3 - 1) * 90;
        this.timeline.to(animatable.tile, animation.main.duration * this.durationMultiplier, current, total);
    };


    return SmartSliderBackgroundAnimationExplode;
});

N2Require('SmartSliderBackgroundAnimationExplodeReversed', ['SmartSliderBackgroundAnimationTiled'], [], function ($, scope, undefined) {


    function SmartSliderBackgroundAnimationExplodeReversed() {
        scope.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    };

    SmartSliderBackgroundAnimationExplodeReversed.prototype = Object.create(scope.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationExplodeReversed.prototype.constructor = SmartSliderBackgroundAnimationExplodeReversed;


    SmartSliderBackgroundAnimationExplodeReversed.prototype.setup = function () {

        var animation = $.extend(true, {
            columns: 1,
            rows: 1,
            reverse: false,
            tiles: {
                delay: 0, // Delay between the starting of the tiles sequence. Ex.: #1 batch start: 0s, #2: .2s, #3: .4s
                sequence: 'Parallel' // Parallel, Random, ForwardCol, BackwardCol, ForwardRow, BackwardRow, ForwardDiagonal, BackwardDiagonal
            },
            main: {
                duration: 0.5,
                zIndex: 2, // z-index of the current image. Change it to 2 to show it over the second image.
                current: { // Animation of the current tile
                    ease: 'easeInOutCubic'
                }
            }
        }, this.animationProperties);

        this.placeCurrentImage();
        this.clonedImages.currentImage.css({
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        });

        scope.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);
    };

    SmartSliderBackgroundAnimationExplodeReversed.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {

        var next = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: animation.main.zIndex
            })
            .append(this.clonedNext().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);

        NextendTween.set(tile.get(0), {
            transformPerspective: 1000,
            transformStyle: "preserve-3d"
        });

        return {
            next: next,
            tile: tile
        }
    };

    SmartSliderBackgroundAnimationExplodeReversed.prototype.transform = function (animation, animatable, total) {

        var current = $.extend(true, {}, animation.main.current);

        current.rotationX = (Math.random() * 3 - 1) * 90;
        current.rotationY = (Math.random() * 3 - 1) * 90;
        current.rotationZ = (Math.random() * 3 - 1) * 30;
        this.timeline.from(animatable.tile, animation.main.duration * this.durationMultiplier, current, total);
    };

    return SmartSliderBackgroundAnimationExplodeReversed;
});
N2Require('SmartSliderBackgroundAnimationFlat', ['SmartSliderBackgroundAnimationTiled'], [], function ($, scope, undefined) {

    function SmartSliderBackgroundAnimationFlat() {
        scope.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    };

    SmartSliderBackgroundAnimationFlat.prototype = Object.create(scope.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationFlat.prototype.constructor = SmartSliderBackgroundAnimationFlat;

    SmartSliderBackgroundAnimationFlat.prototype.setup = function () {

        var animation = $.extend(true, {
            columns: 1,
            rows: 1,
            tiles: {
                cropOuter: false,
                crop: true,
                delay: 0, // Delay between the starting of the tiles sequence. Ex.: #1 batch start: 0s, #2: .2s, #3: .4s
                sequence: 'Parallel' // Parallel, Random, ForwardCol, BackwardCol, ForwardRow, BackwardRow, ForwardDiagonal, BackwardDiagonal
            },
            main: {
                type: 'next',  // Enable animation on the specified tile: current, next, both
                duration: 0.5,
                real3D: true, // Enable perspective
                zIndex: 1, // z-index of the current image. Change it to 2 to show it over the second image.
                current: { // Animation of the current tile
                    ease: 'easeInOutCubic'
                },
                next: { // Animation of the next tile
                    ease: 'easeInOutCubic'
                }
            }
        }, this.animationProperties);

        if (this.reversed) {
            if (typeof animation.invert !== 'undefined') {
                $.extend(true, animation.main, animation.invert);
            }

            if (typeof animation.invertTiles !== 'undefined') {
                $.extend(animation.tiles, animation.invertTiles);
            }
        }

        scope.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);

        if (animation.tiles.cropOuter) {
            this.container.css('overflow', 'hidden');
        }
    };

    SmartSliderBackgroundAnimationFlat.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {

        if (animation.tiles.crop) {
            tile.css('overflow', 'hidden');
        }

        var current = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: animation.main.zIndex
            })
            .append(this.clonedCurrent().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);
        var next = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: 1
            })
            .append(this.clonedNext().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);

        if (animation.main.real3D) {
            NextendTween.set(tile.get(0), {
                transformStyle: "preserve-3d"
            });
            NextendTween.set(current.get(0), {
                transformStyle: "preserve-3d"
            });
            NextendTween.set(next.get(0), {
                transformStyle: "preserve-3d"
            });
        }

        return {
            current: current,
            next: next
        }
    };

    SmartSliderBackgroundAnimationFlat.prototype.transform = function (animation, animatable, total) {

        var main = animation.main;

        if (main.type == 'current' || main.type == 'both') {
            this.timeline.to(animatable.current, main.duration * this.durationMultiplier, main.current, total);
        }

        if (main.type == 'next' || main.type == 'both') {
            this.timeline.from(animatable.next, main.duration * this.durationMultiplier, main.next, total);
        }
    };

    return SmartSliderBackgroundAnimationFlat;
});
N2Require('SmartSliderBackgroundAnimationSlixes', ['SmartSliderBackgroundAnimationTiled'], [], function ($, scope, undefined) {

    function SmartSliderBackgroundAnimationSlixes() {
        scope.SmartSliderBackgroundAnimationTiled.prototype.constructor.apply(this, arguments);
    };

    SmartSliderBackgroundAnimationSlixes.prototype = Object.create(scope.SmartSliderBackgroundAnimationTiled.prototype);
    SmartSliderBackgroundAnimationSlixes.prototype.constructor = SmartSliderBackgroundAnimationSlixes;


    SmartSliderBackgroundAnimationSlixes.prototype.setup = function () {

        var animation = $.extend(true, {
            columns: 2,
            rows: 2,
            main: {
                duration: 2,
                zIndex: 2 // z-index of the current image. Change it to 2 to show it over the second image.
            }
        }, this.animationProperties);

        this.placeNextImage();
        this.clonedImages.nextImage.css({
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        });

        scope.SmartSliderBackgroundAnimationTiled.prototype.setup.call(this, animation);
    };

    SmartSliderBackgroundAnimationSlixes.prototype.renderTile = function (tile, w, h, animation, totalLeft, totalTop) {
        this.container.css('overflow', 'hidden');

        var current = $('<div></div>')
            .css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: w,
                height: h,
                overflow: 'hidden',
                zIndex: animation.main.zIndex
            })
            .append(this.clonedCurrent().clone().css({
                position: 'absolute',
                top: -totalTop + 'px',
                left: -totalLeft + 'px'
            }))
            .appendTo(tile);

        NextendTween.set(tile.get(0), {
            transformPerspective: 1000,
            transformStyle: "preserve-3d"
        });

        return {
            current: current,
            tile: tile
        }
    };

    SmartSliderBackgroundAnimationSlixes.prototype.animate = function (animation, animatables, animatablesMulti) {

        this.timeline.to(animatablesMulti[0][0].tile, animation.main.duration * this.durationMultiplier, {
            left: '-50%',
            ease: 'easeInOutCubic'
        }, 0);
        this.timeline.to(animatablesMulti[0][1].tile, animation.main.duration * this.durationMultiplier, {
            left: '-50%',
            ease: 'easeInOutCubic'
        }, 0.3);

        this.timeline.to(animatablesMulti[1][0].tile, animation.main.duration * this.durationMultiplier, {
            left: '100%',
            ease: 'easeInOutCubic'
        }, 0.15);
        this.timeline.to(animatablesMulti[1][1].tile, animation.main.duration * this.durationMultiplier, {
            left: '100%',
            ease: 'easeInOutCubic'
        }, 0.45);

        $('<div />').css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden'
        }).prependTo(this.clonedImages.nextImage.parent()).append(this.clonedImages.nextImage);

        this.timeline.fromTo(this.clonedImages.nextImage, animation.main.duration * this.durationMultiplier, {
            scale: 1.3
        }, {
            scale: 1
        }, 0.45);
    };

    return SmartSliderBackgroundAnimationSlixes;
});
N2Require('SmartSliderBackgroundAnimationTiled', ['SmartSliderBackgroundAnimationFluxAbstract'], [], function ($, scope, undefined) {

    function SmartSliderBackgroundAnimationTiled() {
        scope.SmartSliderBackgroundAnimationFluxAbstract.prototype.constructor.apply(this, arguments);

        this.setup();
    };

    SmartSliderBackgroundAnimationTiled.prototype = Object.create(scope.SmartSliderBackgroundAnimationFluxAbstract.prototype);
    SmartSliderBackgroundAnimationTiled.prototype.constructor = SmartSliderBackgroundAnimationTiled;

    SmartSliderBackgroundAnimationTiled.prototype.setup = function (animation) {

        var container = $('<div></div>').css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: this.w,
            height: this.h/*,
             overflow: 'hidden'*/
        });
        this.container = container;
        NextendTween.set(container.get(0), {
            force3D: true,
            perspective: 1000
        });

        var animatablesMulti = [],
            animatables = [];

        var columns = animation.columns,
            rows = animation.rows,
            colWidth = Math.floor(this.w / columns),
            rowHeight = Math.floor(this.h / rows);

        var colRemainder = this.w - (columns * colWidth),
            colAddPerLoop = Math.ceil(colRemainder / columns),
            rowRemainder = this.h - (rows * rowHeight),
            rowAddPerLoop = Math.ceil(rowRemainder / rows),
            totalLeft = 0;

        for (var col = 0; col < columns; col++) {
            animatablesMulti[col] = [];
            var thisColWidth = colWidth,
                totalTop = 0;

            if (colRemainder > 0) {
                var add = colRemainder >= colAddPerLoop ? colAddPerLoop : colRemainder;
                thisColWidth += add;
                colRemainder -= add;
            }

            var thisRowRemainder = rowRemainder;

            for (var row = 0; row < rows; row++) {
                var thisRowHeight = rowHeight;

                if (thisRowRemainder > 0) {
                    var add = thisRowRemainder >= rowAddPerLoop ? rowAddPerLoop : thisRowRemainder;
                    thisRowHeight += add;
                    thisRowRemainder -= add;
                }
                var tile = $('<div class="tile tile-' + col + '-' + row + '"></div>').css({
                    position: 'absolute',
                    top: totalTop + 'px',
                    left: totalLeft + 'px',
                    width: thisColWidth + 'px',
                    height: thisRowHeight + 'px',
                    zIndex: -Math.abs(col - parseInt(columns / 2)) + columns - Math.abs(row - parseInt(rows / 2))
                }).appendTo(container);

                var animatable = this.renderTile(tile, thisColWidth, thisRowHeight, animation, totalLeft, totalTop);
                animatables.push(animatable);
                animatablesMulti[col][row] = animatable;

                totalTop += thisRowHeight;
            }
            totalLeft += thisColWidth;
        }

        container.appendTo(this.containerElement);

        this.preSetup();

        this.animate(animation, animatables, animatablesMulti);
    };

    SmartSliderBackgroundAnimationTiled.prototype.animate = function (animation, animatables, animatablesMulti) {
        this['sequence' + animation.tiles.sequence]($.proxy(this.transform, this, animation), animatables, animatablesMulti, animation.tiles.delay * this.durationMultiplier);
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceParallel = function (transform, cuboids) {
        transform(cuboids, null);
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceRandom = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration();
        for (var i = 0; i < cuboids.length; i++) {
            transform(cuboids[i], total + Math.random() * delay);
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceForwardCol = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration();
        for (var i = 0; i < cuboids.length; i++) {
            transform(cuboids[i], total + delay * i);
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceBackwardCol = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration(),
            length = cuboids.length - 1;
        for (var i = 0; i < cuboids.length; i++) {
            transform(cuboids[i], total + delay * (length - i));
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceForwardRow = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration(),
            i = 0;
        for (var row = 0; row < cuboidsMulti[0].length; row++) {
            for (var col = 0; col < cuboidsMulti.length; col++) {
                transform(cuboidsMulti[col][row], total + delay * i);
                i++;
            }
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceBackwardRow = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration(),
            i = cuboids.length - 1;
        for (var row = 0; row < cuboidsMulti[0].length; row++) {
            for (var col = 0; col < cuboidsMulti.length; col++) {
                transform(cuboidsMulti[col][row], total + delay * i);
                i--;
            }
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceForwardDiagonal = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration();
        for (var row = 0; row < cuboidsMulti[0].length; row++) {
            for (var col = 0; col < cuboidsMulti.length; col++) {
                transform(cuboidsMulti[col][row], total + delay * (col + row));
            }
        }
    };

    SmartSliderBackgroundAnimationTiled.prototype.sequenceBackwardDiagonal = function (transform, cuboids, cuboidsMulti, delay) {
        var total = this.timeline.totalDuration(),
            length = cuboidsMulti[0].length + cuboidsMulti.length - 2;
        for (var row = 0; row < cuboidsMulti[0].length; row++) {
            for (var col = 0; col < cuboidsMulti.length; col++) {
                transform(cuboidsMulti[col][row], total + delay * (length - col - row));
            }
        }
    };

    return SmartSliderBackgroundAnimationTiled;
});
N2Require('SmartSliderBackgroundAnimationTurn', ['SmartSliderBackgroundAnimationFluxAbstract'], [], function ($, scope, undefined) {
    
    function SmartSliderBackgroundAnimationTurn() {
        scope.SmartSliderBackgroundAnimationFluxAbstract.prototype.constructor.apply(this, arguments);

        var animation = $.extend(true, {
            perspective: this.w * 1.5,
            duration: 0.8,
            direction: 'left'
        }, this.animationProperties);

        if (this.reversed) {
            if (animation.direction == 'left') {
                animation.direction = 'right';
            } else {
                animation.direction = 'left';
            }
        }

        var w2 = parseInt(this.w / 2);

        this.clonedCurrent().css({
            'position': 'absolute',
            'top': 0,
            'left': (animation.direction == 'left' ? -1 * (this.w / 2) : 0)
        });

        this.clonedNext().css({
            'position': 'absolute',
            'top': 0,
            'left': (animation.direction == 'left' ? 0 : -1 * (this.w / 2))
        });

        var tab = $('<div class="tab"></div>').css({
            width: w2,
            height: this.h,
            position: 'absolute',
            top: '0px',
            left: animation.direction == 'left' ? w2 : '0',
            'z-index': 101
        });

        NextendTween.set(tab, {
            transformStyle: 'preserve-3d',
            transformOrigin: animation.direction == 'left' ? '0px 0px' : w2 + 'px 0px'
        });

        var front = $('<div class="n2-ff-3d"></div>').append(this.clonedCurrent())
            .css({
                width: w2,
                height: this.h,
                position: 'absolute',
                top: 0,
                left: 0,
                '-webkit-transform': 'translateZ(0.1px)',
                overflow: 'hidden'
            })
            .appendTo(tab);

        NextendTween.set(front, {
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d'
        });


        var back = $('<div class="n2-ff-3d"></div>')
            .append(this.clonedNext())
            .appendTo(tab)
            .css({
                width: w2,
                height: this.h,
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'hidden'
            });

        NextendTween.set(back, {
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            rotationY: 180,
            rotationZ: 0
        });

        var current = $('<div></div>')
                .append(this.clonedCurrent().clone().css('left', (animation.direction == 'left' ? 0 : -w2))).css({
                    position: 'absolute',
                    top: 0,
                    left: animation.direction == 'left' ? '0' : w2,
                    width: w2,
                    height: this.h,
                    zIndex: 100,
                    overflow: 'hidden'
                }),
            overlay = $('<div class="overlay"></div>').css({
                position: 'absolute',
                top: 0,
                left: animation.direction == 'left' ? w2 : 0,
                width: w2,
                height: this.h,
                background: '#000',
                opacity: 1,
                overflow: 'hidden'
            }),

            container = $('<div></div>').css({
                width: this.w,
                height: this.h,
                position: 'absolute',
                top: 0,
                left: 0
            }).append(tab).append(current).append(overlay);


        NextendTween.set(container, {
            perspective: animation.perspective,
            perspectiveOrigin: '50% 50%'
        });

        this.placeNextImage();
        this.clonedImages.nextImage.css({
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        });

        this.containerElement.append(container);

        this.preSetup();

        this.timeline.to(tab.get(0), animation.duration * this.durationMultiplier, {
            rotationY: (animation.direction == 'left' ? -180 : 180)
        }, 0);

        this.timeline.to(overlay.get(0), animation.duration * this.durationMultiplier, {
            opacity: 0
        }, 0);
    };

    SmartSliderBackgroundAnimationTurn.prototype = Object.create(scope.SmartSliderBackgroundAnimationFluxAbstract.prototype);
    SmartSliderBackgroundAnimationTurn.prototype.constructor = SmartSliderBackgroundAnimationTurn;


    SmartSliderBackgroundAnimationTurn.prototype.getExtraDelay = function () {
        return 0;
    };

    return SmartSliderBackgroundAnimationTurn;
});
N2Require('SmartSliderBackgroundAnimationFluxAbstract', ['SmartSliderBackgroundAnimationAbstract'], [], function ($, scope, undefined) {

    function SmartSliderBackgroundAnimationFluxAbstract() {
        this.shiftedPreSetup = false;
        this._clonedCurrent = false;
        this._clonedNext = false;

        scope.SmartSliderBackgroundAnimationAbstract.prototype.constructor.apply(this, arguments);

        this.w = this.original.currentImage.width();
        this.h = this.original.currentImage.height();
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype = Object.create(scope.SmartSliderBackgroundAnimationAbstract.prototype);
    SmartSliderBackgroundAnimationFluxAbstract.prototype.constructor = SmartSliderBackgroundAnimationFluxAbstract;

    SmartSliderBackgroundAnimationFluxAbstract.prototype.clonedCurrent = function () {
        if (!this._clonedCurrent) {
            this._clonedCurrent = this.original.currentImage
                .clone()
                .css({
                    width: this.w,
                    height: this.h
                });
            this._clonedCurrent.find('.n2-ss-slide-background-video').remove();
        }
        return this._clonedCurrent;
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.clonedNext = function () {
        if (!this._clonedNext) {
            this._clonedNext = this.original.nextImage
                .clone()
                .css({
                    width: this.w,
                    height: this.h
                });
            this._clonedNext.find('.n2-ss-slide-background-video').remove();
        }
        return this._clonedNext;
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.preSetup = function () {
        if (this.shiftedBackgroundAnimation != 0) {
            this.shiftedPreSetup = true;
        } else {
            this._preSetup();
        }
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype._preSetup = function (skipFadeOut) {
        this.timeline.to(this.original.currentImage.get(0), this.getExtraDelay(), {
            opacity: 0
        }, 0);

        this.original.nextImage.css('opacity', 0);
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.postSetup = function () {
        this.timeline.to(this.original.nextImage.get(0), this.getExtraDelay(), {
            opacity: 1
        });
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.getExtraDelay = function () {
        return .2;
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.ended = function () {
        this.original.currentImage.css('opacity', 1);
        this.containerElement.html('');
    };

    SmartSliderBackgroundAnimationFluxAbstract.prototype.revertEnded = function () {
        this.original.nextImage.css('opacity', 1);
        this.containerElement.html('');
    };

    return SmartSliderBackgroundAnimationFluxAbstract;
});
N2Require('SmartSliderMainAnimationAbstract', [], [], function ($, scope, undefined) {

    function SmartSliderMainAnimationAbstract(slider, parameters) {

        this.state = 'ended';
        this.isTouch = false;
        this.isReverseAllowed = true;
        this.isReverseEnabled = false;
        this.reverseSlideIndex = null;
        this.isNoAnimation = false;

        this.slider = slider;

        this.parameters = $.extend({
            duration: 1500,
            ease: 'easeInOutQuint'
        }, parameters);

        this.parameters.duration /= 1000;

        this.sliderElement = slider.sliderElement;

        this.timeline = new NextendTimeline({
            paused: true
        });

        this.sliderElement.on('mainAnimationStart', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this._revertCurrentSlideIndex = currentSlideIndex;
            this._revertNextSlideIndex = nextSlideIndex;
        }, this));
    }

    SmartSliderMainAnimationAbstract.prototype.setToStarterSlide = function (slide) {

    };

    SmartSliderMainAnimationAbstract.prototype.enableReverseMode = function () {
        this.isReverseEnabled = true;

        this.reverseTimeline = new NextendTimeline({
            paused: true
        });

        this.sliderElement.triggerHandler('reverseModeEnabled', this.reverseSlideIndex);
    };

    SmartSliderMainAnimationAbstract.prototype.disableReverseMode = function () {
        this.isReverseEnabled = false;
    };

    SmartSliderMainAnimationAbstract.prototype.setTouch = function (direction) {
        this.isTouch = direction;
    };

    SmartSliderMainAnimationAbstract.prototype.setTouchProgress = function (progress) {
        if (this.isReverseEnabled) {
            this._setTouchProgressWithReverse(progress);
        } else {
            this._setTouchProgress(progress);
        }
    };

    SmartSliderMainAnimationAbstract.prototype._setTouchProgress = function (progress) {
        if (this.state != 'ended') {
            if (progress <= 0) {
                this.timeline.progress(Math.max(progress, 0.000001), false);
            } else if (progress >= 0 && progress <= 1) {
                this.timeline.progress(progress);
            }
        }
    };

    SmartSliderMainAnimationAbstract.prototype._setTouchProgressWithReverse = function (progress) {
        if (progress == 0) {
            this.reverseTimeline.progress(0);
            this.timeline.progress(progress, false);
        } else if (progress >= 0 && progress <= 1) {
            this.reverseTimeline.progress(0);
            this.timeline.progress(progress);
        } else if (progress < 0 && progress >= -1) {
            this.timeline.progress(0);
            this.reverseTimeline.progress(Math.abs(progress));
        }
    };


    SmartSliderMainAnimationAbstract.prototype.setTouchEnd = function (hasDirection, progress, duration) {
        if (this.state != 'ended') {
            if (this.isReverseEnabled) {
                this._setTouchEndWithReverse(hasDirection, progress, duration);
            } else {
                this._setTouchEnd(hasDirection, progress, duration);
            }
        }
    };

    SmartSliderMainAnimationAbstract.prototype._setTouchEnd = function (hasDirection, progress, duration) {
        if (hasDirection && progress > 0) {
            this.fixTouchDuration(this.timeline, progress, duration);
            this.timeline.play();
        } else {
            this.revertCB(this.timeline);
            this.fixTouchDuration(this.timeline, 1 - progress, duration);
            this.timeline.reverse();

            this.willRevertTo(this._revertCurrentSlideIndex, this._revertNextSlideIndex);
        }
    };

    SmartSliderMainAnimationAbstract.prototype._setTouchEndWithReverse = function (hasDirection, progress, duration) {
        if (hasDirection) {
            if (progress < 0 && this.reverseTimeline.totalDuration() > 0) {
                this.fixTouchDuration(this.reverseTimeline, progress, duration);
                this.reverseTimeline.play();

                this.willRevertTo(this.reverseSlideIndex, this._revertNextSlideIndex);
            } else {

                this.willCleanSlideIndex(this.reverseSlideIndex);
                this.fixTouchDuration(this.timeline, progress, duration);
                this.timeline.play();
            }
        } else {
            if (progress < 0) {
                this.revertCB(this.reverseTimeline);
                this.fixTouchDuration(this.reverseTimeline, 1 - progress, duration);
                this.reverseTimeline.reverse();
            } else {
                this.revertCB(this.timeline);
                this.fixTouchDuration(this.timeline, 1 - progress, duration);
                this.timeline.reverse();
            }

            this.willCleanSlideIndex(this.reverseSlideIndex);

            this.willRevertTo(this._revertCurrentSlideIndex, this._revertNextSlideIndex);
        }
    };

    SmartSliderMainAnimationAbstract.prototype.fixTouchDuration = function (timeline, progress, duration) {
        var totalDuration = timeline.totalDuration(),
            modifiedDuration = Math.max(totalDuration / 3, Math.min(totalDuration, duration / Math.abs(progress) / 1000));
        if (modifiedDuration != totalDuration) {
            timeline.totalDuration(modifiedDuration);
        }
    };

    SmartSliderMainAnimationAbstract.prototype.getState = function () {
        return this.state;
    };

    SmartSliderMainAnimationAbstract.prototype.timeScale = function () {
        if (arguments.length > 0) {
            this.timeline.timeScale(arguments[0]);
            return this;
        }
        return this.timeline.timeScale();
    };

    SmartSliderMainAnimationAbstract.prototype.changeTo = function (currentSlide, nextSlide, reversed, isSystem) {

        this._initAnimation(currentSlide, nextSlide, reversed);

        this.state = 'initAnimation';

        this.timeline.paused(true);
        this.timeline.eventCallback('onStart', this.onChangeToStart, [currentSlide, nextSlide, isSystem], this);
        this.timeline.eventCallback('onComplete', this.onChangeToComplete, [currentSlide, nextSlide, isSystem], this);
        this.timeline.eventCallback('onReverseComplete', null);

        this.revertCB = $.proxy(function (timeline) {
            timeline.eventCallback('onReverseComplete', this.onReverseChangeToComplete, [nextSlide, currentSlide, isSystem], this);
        }, this);

        if (this.slider.parameters.dynamicHeight) {
            var tl = new NextendTimeline();
            this.slider.responsive.doResize(null, false, tl, nextSlide, 0.6);
            this.timeline.add(tl);
        }
        if (!this.isTouch) {
            this.timeline.play();
        }
    
    };


    SmartSliderMainAnimationAbstract.prototype.willRevertTo = function (slideIndex, originalNextSlideIndex) {

        this.sliderElement.triggerHandler('mainAnimationWillRevertTo', [slideIndex, originalNextSlideIndex]);

        this.sliderElement.one('mainAnimationComplete', $.proxy(this.revertTo, this, slideIndex, originalNextSlideIndex));
    };


    SmartSliderMainAnimationAbstract.prototype.revertTo = function (slideIndex, originalNextSlideIndex) {
        this.slider.revertTo(slideIndex, originalNextSlideIndex);

        // Cancel the pre-initialized layer animations on the original next slide.
        this.slider.slides[originalNextSlideIndex].triggerHandler('mainAnimationStartInCancel');
    };


    SmartSliderMainAnimationAbstract.prototype.willCleanSlideIndex = function (slideIndex) {

        this.sliderElement.one('mainAnimationComplete', $.proxy(this.cleanSlideIndex, this, slideIndex));
    };

    SmartSliderMainAnimationAbstract.prototype.cleanSlideIndex = function () {

    };

    /**
     * @abstract
     * @param currentSlide
     * @param nextSlide
     * @param reversed
     * @private
     */
    SmartSliderMainAnimationAbstract.prototype._initAnimation = function (currentSlide, nextSlide, reversed) {

    };

    SmartSliderMainAnimationAbstract.prototype.onChangeToStart = function (previousSlide, currentSlide, isSystem) {

        this.state = 'playing';

        var parameters = [this, previousSlide.index, currentSlide.index, isSystem];

        n2c.log('Event: mainAnimationStart: ', parameters, '{NextendSmartSliderMainAnimationAbstract}, previousSlideIndex, currentSlideIndex, isSystem');
        this.sliderElement.trigger('mainAnimationStart', parameters);

        this.slider.slides[previousSlide.index].trigger('mainAnimationStartOut', parameters);
        this.slider.slides[currentSlide.index].trigger('mainAnimationStartIn', parameters);
    };

    SmartSliderMainAnimationAbstract.prototype.onChangeToComplete = function (previousSlide, currentSlide, isSystem) {
        var parameters = [this, previousSlide.index, currentSlide.index, isSystem];

        this.clearTimelines();

        this.disableReverseMode();

        this.slider.slides[previousSlide.index].trigger('mainAnimationCompleteOut', parameters);
        this.slider.slides[currentSlide.index].trigger('mainAnimationCompleteIn', parameters);

        this.state = 'ended';

        n2c.log('Event: mainAnimationComplete: ', parameters, '{NextendSmartSliderMainAnimationAbstract}, previousSlideIndex, currentSlideIndex, isSystem');
        this.sliderElement.trigger('mainAnimationComplete', parameters);
    };

    SmartSliderMainAnimationAbstract.prototype.onReverseChangeToComplete = function (previousSlide, currentSlide, isSystem) {
        SmartSliderMainAnimationAbstract.prototype.onChangeToComplete.apply(this, arguments);
    };

    SmartSliderMainAnimationAbstract.prototype.clearTimelines = function () {
        // When the animation done, clear the timeline
        this.revertCB = function () {
        };
        this.timeline.clear();
        this.timeline.timeScale(1);

    };

    SmartSliderMainAnimationAbstract.prototype.getEase = function () {
        if (this.isTouch) {
            return 'linear';
        }
        return this.parameters.ease;
    };

    return SmartSliderMainAnimationAbstract;
});
N2Require('SmartSliderControlAutoplay', [], [], function ($, scope, undefined) {
    "use strict";

    var preventMouseEnter = false;

    function SmartSliderControlAutoplay(slider, parameters) {
        this._paused = true;
        this._wait = false;
        this._disabled = false;
        this._currentCount = 0;
        this._progressEnabled = false;
        this.timeline = null;

        this.hasButton = false;

        this.deferredsMediaPlaying = null;
        this.deferredMouseLeave = null;
        this.deferredMouseEnter = null;
        this.mainAnimationDeferred = true;
        this.autoplayDeferred = null;

        this.slider = slider;

        this.parameters = $.extend({
            enabled: 0,
            start: 1,
            duration: 8000,
            autoplayToSlide: 0,
            autoplayToSlideIndex: -1,
            allowReStart: 0,
            pause: {
                mouse: 'enter',
                click: true,
                mediaStarted: true
            },
            resume: {
                click: 0,
                mouse: 0,
                mediaEnded: true
            }
        }, parameters);

        if (this.parameters.enabled) {

            this.parameters.duration /= 1000;

            slider.controls.autoplay = this;

            this.deferredsExtraPlaying = {};

            this.slider.visible($.proxy(this.onReady, this));

        } else {
            this.disable();
        }

        slider.controls.autoplay = this;
    };

    SmartSliderControlAutoplay.prototype.onReady = function () {
        this.autoplayDeferred = $.Deferred();

        var obj = {
            _progress: 0
        };
        this.timeline = NextendTween.to(obj, this.getSlideDuration(this.slider.currentSlide.index), {
            _progress: 1,
            paused: true,
            onComplete: $.proxy(this.next, this)
        });

        if (this._progressEnabled) {
            this.enableProgress();
        }


        var sliderElement = this.slider.sliderElement;

        if (this.parameters.start) {
            this.continueAutoplay();
        } else {
            this.pauseAutoplayExtraPlaying(null, 'autoplayButton');
        }

        sliderElement.on('mainAnimationStart.autoplay', $.proxy(this.onMainAnimationStart, this));

        if (this.parameters.pause.mouse != '0') {
            sliderElement.on("touchend.autoplay", function () {
                preventMouseEnter = true;
                setTimeout(function () {
                    preventMouseEnter = false;
                }, 300)
            });
            switch (this.parameters.pause.mouse) {
                case 'enter':
                    sliderElement.on('mouseenter.autoplay', $.proxy(this.pauseAutoplayMouseEnter, this));
                    sliderElement.on('mouseleave.autoplay', $.proxy(this.pauseAutoplayMouseEnterEnded, this));
                    break;
                case 'leave':
                    sliderElement.on('mouseleave.autoplay', $.proxy(this.pauseAutoplayMouseLeave, this));
                    sliderElement.on('mouseenter.autoplay', $.proxy(this.pauseAutoplayMouseLeaveEnded, this));
                    break;
            }
        }
        if (this.parameters.pause.click && !this.parameters.resume.click) {
            sliderElement.on('universalclick.autoplay', $.proxy(this.pauseAutoplayUniversal, this));
        } else if (!this.parameters.pause.click && this.parameters.resume.click) {
            sliderElement.on('universalclick.autoplay', $.proxy(function (e) {
                this.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
            }, this));
        } else if (this.parameters.pause.click && this.parameters.resume.click) {
            sliderElement.on('universalclick.autoplay', $.proxy(function (e) {
                if (!this._paused) {
                    this.pauseAutoplayUniversal(e);
                } else {
                    this.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
                }
            }, this));
        }
        if (this.parameters.pause.mediaStarted) {
            this.deferredsMediaPlaying = {};
            sliderElement.on('mediaStarted.autoplay', $.proxy(this.pauseAutoplayMediaPlaying, this));
            sliderElement.on('mediaEnded.autoplay', $.proxy(this.pauseAutoplayMediaPlayingEnded, this));
        }

        if (this.parameters.resume.mouse != '0') {
            switch (this.parameters.resume.mouse) {
                case 'enter':
                    if (!this.hasButton || this.parameters.pause.mouse == '0') {
                        sliderElement.on('mouseenter.autoplay', $.proxy(function (e) {
                            this.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
                        }, this));
                    } else {
                        sliderElement.on('mouseenter.autoplay', $.proxy(this.continueAutoplay, this));
                    }
                    break;
                case 'leave':
                    if (!this.hasButton || this.parameters.pause.mouse == '0') {
                        sliderElement.on('mouseleave.autoplay', $.proxy(function (e) {
                            this.pauseAutoplayExtraPlayingEnded(e, 'autoplayButton');
                        }, this));
                    } else {
                        sliderElement.on('mouseleave.autoplay', $.proxy(this.continueAutoplay, this));
                    }
                    break;
            }
        }

        if (this.parameters.resume.mediaEnded) {
            sliderElement.on('mediaEnded.autoplay', $.proxy(this.continueAutoplay, this));
        }
        sliderElement.on('autoplayExtraWait.autoplay', $.proxy(this.pauseAutoplayExtraPlaying, this));
        sliderElement.on('autoplayExtraContinue.autoplay', $.proxy(this.pauseAutoplayExtraPlayingEnded, this));


        this.slider.sliderElement.on('mainAnimationComplete.autoplay', $.proxy(this.onMainAnimationComplete, this));

    };

    SmartSliderControlAutoplay.prototype.enableProgress = function () {
        if (this.timeline) {
            this.timeline.eventCallback('onUpdate', $.proxy(this.onUpdate, this));
        }
        this._progressEnabled = true;
    };


    SmartSliderControlAutoplay.prototype.onMainAnimationStart = function (e, animation, previousSlideIndex, currentSlideIndex, isSystem) {
        this.mainAnimationDeferred = $.Deferred();
        this.deActivate(0, 'wait');
        for (var k in this.deferredsMediaPlaying) {
            this.deferredsMediaPlaying[k].resolve();
        }
    };

    SmartSliderControlAutoplay.prototype.onMainAnimationComplete = function (e, animation, previousSlideIndex, currentSlideIndex) {

        if (this.parameters.autoplayToSlideIndex >= 0 && this.parameters.autoplayToSlideIndex == this.slider.currentRealSlide.index + 1) {
            this.limitAutoplay();
        }

        this.timeline.duration(this.getSlideDuration(currentSlideIndex));

        this.mainAnimationDeferred.resolve();

        this.continueAutoplay();
    };

    SmartSliderControlAutoplay.prototype.getSlideDuration = function (index) {
        var slide = this.slider.realSlides[this.slider.getRealIndex(index)],
            duration = slide.minimumSlideDuration;

        if (duration < 0.3 && duration < this.parameters.duration) {
            duration = this.parameters.duration;
        }
        return duration;
    };

    SmartSliderControlAutoplay.prototype.continueAutoplay = function (e) {
        if (this.autoplayDeferred.state() == 'pending') {
            this.autoplayDeferred.reject();
        }
        var deferreds = [];
        for (var k in this.deferredsExtraPlaying) {
            deferreds.push(this.deferredsExtraPlaying[k]);
        }
        for (var k in this.deferredsMediaPlaying) {
            deferreds.push(this.deferredsMediaPlaying[k]);
        }
        if (this.deferredMouseEnter) {
            deferreds.push(this.deferredMouseEnter);
        }
        if (this.deferredMouseLeave) {
            deferreds.push(this.deferredMouseLeave);
        }

        deferreds.push(this.mainAnimationDeferred);

        this.autoplayDeferred = $.Deferred();
        this.autoplayDeferred.done($.proxy(this._continueAutoplay, this));

        $.when.apply($, deferreds).done($.proxy(function () {
            if (this.autoplayDeferred.state() == 'pending') {
                this.autoplayDeferred.resolve();
            }
        }, this));
    };

    SmartSliderControlAutoplay.prototype._continueAutoplay = function () {
        if ((this._paused || this._wait) && !this._disabled) {
            this._paused = false;
            this._wait = false;
            n2c.log('Event: autoplayStarted');
            this.slider.sliderElement.triggerHandler('autoplayStarted');

            if (this.timeline.progress() == 1) {
                this.timeline.pause(0, false);
            }

            this.startTimeout(null);
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayUniversal = function (e) {
        //this.autoplayDeferred.reject();
        this.pauseAutoplayExtraPlaying(e, 'autoplayButton');
        this.deActivate(null, 'pause');
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMouseEnter = function () {
        if (!preventMouseEnter) {
            this.autoplayDeferred.reject();
            this.deferredMouseEnter = $.Deferred();
            this.deActivate(null, this.parameters.resume.mouse == 'leave' ? 'wait' : 'pause');
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMouseEnterEnded = function () {
        if (this.deferredMouseEnter) {
            this.deferredMouseEnter.resolve();
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMouseLeave = function () {
        this.autoplayDeferred.reject();
        this.deferredMouseLeave = $.Deferred();
        this.deActivate(null, this.parameters.resume.mouse == 'enter' ? 'wait' : 'pause');
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMouseLeaveEnded = function () {
        if (this.deferredMouseLeave) {
            this.deferredMouseLeave.resolve();
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMediaPlaying = function (e, obj) {
        if (typeof this.deferredsMediaPlaying[obj] !== 'undefined') {
            this.autoplayDeferred.reject();
        }
        this.deferredsMediaPlaying[obj] = $.Deferred();
        this.deActivate(null, 'wait');
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayMediaPlayingEnded = function (e, obj) {
        if (typeof this.deferredsMediaPlaying[obj] !== 'undefined') {
            this.autoplayDeferred.reject();
            this.deferredsMediaPlaying[obj].resolve();
            delete this.deferredsMediaPlaying[obj];
        }
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayExtraPlaying = function (e, obj) {
        if (typeof this.deferredsExtraPlaying[obj] !== 'undefined') {
            this.autoplayDeferred.reject();
        }
        this.deferredsExtraPlaying[obj] = $.Deferred();
        this.deActivate(null, 'pause');
    };

    SmartSliderControlAutoplay.prototype.pauseAutoplayExtraPlayingEnded = function (e, obj) {
        if (typeof this.deferredsExtraPlaying[obj] !== 'undefined') {
            this.autoplayDeferred.reject();
            this.deferredsExtraPlaying[obj].resolve();
            delete this.deferredsExtraPlaying[obj];
        }
        this.continueAutoplay();
    };

    SmartSliderControlAutoplay.prototype.deActivate = function (seekTo, mode) {

        if (mode == 'pause') {
            if (!this._paused) {
                this._paused = true;
                if (seekTo !== 0) {
                    n2c.log('Event: autoplayPaused');
                    this.slider.sliderElement.triggerHandler('autoplayPaused');
                }
            }
        } else if (mode == 'wait') {
            if (!this._wait) {
                this._wait = true;
                if (seekTo !== 0) {
                    n2c.log('Event: autoplayWait');
                    this.slider.sliderElement.triggerHandler('autoplayWait');
                }
            }
        }

        if (this.timeline) {
            this.timeline.pause(seekTo, false);
        }
    };

    SmartSliderControlAutoplay.prototype.disable = function () {
        this.deActivate(0, 'pause');
        this.slider.sliderElement.triggerHandler('autoplayPaused');
        this.slider.sliderElement.triggerHandler('autoplayDisabled');
        this.slider.sliderElement.off('.autoplay');
        n2c.log('Autoplay: disable');
        this._disabled = true;
    };

    SmartSliderControlAutoplay.prototype.startTimeout = function (time) {
        if (!this._paused && !this._disabled) {
            this.timeline.play(time);
        }
    };

    SmartSliderControlAutoplay.prototype.next = function () {
        this.timeline.pause();
        this._currentCount++;
        /**
         * We have reached the maximum slides in the autoplay so disable it completely
         */
        if (this.parameters.autoplayToSlide > 0 && this._currentCount >= this.parameters.autoplayToSlide || this.parameters.autoplayToSlideIndex >= 0 && this.parameters.autoplayToSlideIndex == this.slider.currentRealSlide.index + 2) {
            this.limitAutoplay();
        }

        this.slider.nextCarousel(true);
    };

    SmartSliderControlAutoplay.prototype.limitAutoplay = function () {
        n2c.log('Autoplay: auto play to slide value reached');
        if (!this.parameters.allowReStart) {
            this.disable();
        } else {
            this._currentCount = 0;
            this.slider.sliderElement.triggerHandler('autoplayExtraWait', 'autoplayButton');
        }
    }

    SmartSliderControlAutoplay.prototype.onUpdate = function () {
        this.slider.sliderElement.triggerHandler('autoplay', this.timeline.progress());
    };

    return SmartSliderControlAutoplay;
});
N2Require('SmartSliderControlFullscreen', [], [], function ($, scope, undefined) {
    "use strict";
    function SmartSliderControlFullscreen(slider, direction, parameters) {

        this.slider = slider;

        this.responsive = this.slider.responsive;

        this._type = this.responsive.parameters.type;
        this._forceFull = this.responsive.parameters.forceFull;

        this.forceFullpage = this._type == 'auto' || this._type == 'fullwidth' || this._type == 'fullpage';
        if (this.forceFullpage) {
            this._upscale = this.responsive.parameters.upscale;
            this._minimumHeightRatio = $.extend({}, this.responsive.parameters.minimumHeightRatio);
            this._maximumHeightRatio = $.extend({}, this.responsive.parameters.maximumHeightRatio);
        }

        this.isFullScreen = false;

        this.fullParent = this.slider.sliderElement.closest('.n2-ss-align');


        this.browserSpecific = {};
        var elem = this.slider.sliderElement[0];
        if (elem.requestFullscreen) {
            this.browserSpecific.requestFullscreen = 'requestFullscreen';
            this.browserSpecific.event = 'fullscreenchange';
        } else if (elem.msRequestFullscreen) {
            this.browserSpecific.requestFullscreen = 'msRequestFullscreen';
            this.browserSpecific.event = 'MSFullscreenChange';
        } else if (elem.mozRequestFullScreen) {
            this.browserSpecific.requestFullscreen = 'mozRequestFullScreen';
            this.browserSpecific.event = 'mozfullscreenchange';
        } else if (elem.webkitRequestFullscreen) {
            this.browserSpecific.requestFullscreen = 'webkitRequestFullscreen';
            this.browserSpecific.event = 'webkitfullscreenchange';
        } else {
            this.browserSpecific.requestFullscreen = 'nextendRequestFullscreen';
            this.browserSpecific.event = 'nextendfullscreenchange';

            this.fullParent[0][this.browserSpecific.requestFullscreen] = $.proxy(function () {
                this.fullParent.css({
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    zIndex: 1000000
                });

                document.fullscreenElement = this.fullParent[0];


                this.triggerEvent(document, this.browserSpecific.event);

                $(window).trigger('resize');
            }, this);
        }

        if (document.exitFullscreen) {
            this.browserSpecific.exitFullscreen = 'exitFullscreen';
        } else if (document.msExitFullscreen) {
            this.browserSpecific.exitFullscreen = 'msExitFullscreen';
        } else if (document.mozCancelFullScreen) {
            this.browserSpecific.exitFullscreen = 'mozCancelFullScreen';
        } else if (document.webkitExitFullscreen) {
            this.browserSpecific.exitFullscreen = 'webkitExitFullscreen';
        } else {
            this.browserSpecific.exitFullscreen = 'nextendExitFullscreen';
            this.fullParent[0][this.browserSpecific.exitFullscreen] = $.proxy(function () {
                this.fullParent.css({
                    position: '',
                    left: '',
                    top: '',
                    width: '',
                    height: '',
                    backgroundColor: '',
                    zIndex: ''
                });

                document.fullscreenElement = null;

                this.triggerEvent(document, this.browserSpecific.event);

            }, this);
        }
        document.addEventListener(this.browserSpecific.event, $.proxy(this.fullScreenChange, this));
    };

    SmartSliderControlFullscreen.prototype.switchState = function () {
        this.isFullScreen = !this.isFullScreen;
        if (this.isFullScreen) {
            this._fullScreen();
        } else {
            this._normalScreen();
        }
    };

    SmartSliderControlFullscreen.prototype.requestFullscreen = function () {
        if (!this.isFullScreen) {
            this.isFullScreen = true;
            this._fullScreen();
            return true;
        }
        return false;
    }

    SmartSliderControlFullscreen.prototype.exitFullscreen = function () {
        if (this.isFullScreen) {
            this.isFullScreen = false;
            this._normalScreen();
            return true;
        }
        return false;
    }

    SmartSliderControlFullscreen.prototype.triggerEvent = function (el, eventName) {
        var event;
        if (document.createEvent) {
            event = document.createEvent('HTMLEvents');
            event.initEvent(eventName, true, true);
        } else if (document.createEventObject) {// IE < 9
            event = document.createEventObject();
            event.eventType = eventName;
        }
        event.eventName = eventName;
        if (el.dispatchEvent) {
            el.dispatchEvent(event);
        } else if (el.fireEvent && htmlEvents['on' + eventName]) {// IE < 9
            el.fireEvent('on' + event.eventType, event);// can trigger only real event (e.g. 'click')
        } else if (el[eventName]) {
            el[eventName]();
        } else if (el['on' + eventName]) {
            el['on' + eventName]();
        }
    }

    SmartSliderControlFullscreen.prototype._fullScreen = function () {

        if (this.forceFullpage) {
            this.responsive.parameters.type = 'fullpage';
            this.responsive.parameters.upscale = true;
            this.responsive.parameters.forceFull = false;
            this._marginLeft = this.responsive.containerElement[0].style.marginLeft;
            this.responsive.containerElement.css(nextend.rtl.marginLeft, 0);
        }
        this.fullParent.css({
            width: '100%',
            height: '100%',
            backgroundColor: $('body').css('background-color')
        }).addClass("n2-ss-in-fullscreen");
        this.fullParent.get(0)[this.browserSpecific.requestFullscreen]();
    };

    SmartSliderControlFullscreen.prototype._normalScreen = function () {
        if (document[this.browserSpecific.exitFullscreen]) {
            document[this.browserSpecific.exitFullscreen]();
        } else if (this.fullParent[0][this.browserSpecific.exitFullscreen]) {
            this.fullParent[0][this.browserSpecific.exitFullscreen]();
        }
    };

    SmartSliderControlFullscreen.prototype.fullScreenChange = function () {
        if (this.isDocumentInFullScreenMode()) {
            this.slider.sliderElement.triggerHandler('n2FullScreen');
            $('html').addClass('n2-in-fullscreen');
            this.isFullScreen = true;
            $(window).trigger('resize'); //needed for Safari
        } else {
            if (this.forceFullpage) {
                this.responsive.parameters.type = this._type;
                this.responsive.parameters.upscale = this._upscale;
                this.responsive.parameters.forceFull = this._forceFull;
                this.responsive.parameters.minimumHeightRatio = this._minimumHeightRatio;
                this.responsive.parameters.maximumHeightRatio = this._maximumHeightRatio;
                this.responsive.containerElement.css(nextend.rtl.marginLeft, this._marginLeft);
                this.fullParent.css({
                    width: '',
                    height: '',
                    backgroundColor: ''
                }).removeClass("n2-ss-in-fullscreen");
                $('html').removeClass('n2-in-fullscreen');
                $(window).trigger('resize');
                this.isFullScreen = false;
                this.slider.sliderElement.triggerHandler('n2ExitFullScreen');
            }
        }
    };

    SmartSliderControlFullscreen.prototype.isDocumentInFullScreenMode = function () {
        // Note that the browser fullscreen (triggered by short keys) might
        // be considered different from content fullscreen when expecting a boolean
        return ((document.fullscreenElement && document.fullscreenElement !== null) ||    // alternative standard methods
        (document.msFullscreenElement && document.msFullscreenElement !== null) ||
        document.mozFullScreen || document.webkitIsFullScreen);                   // current working methods
    };


    return SmartSliderControlFullscreen;
});
N2Require('SmartSliderControlKeyboard', [], [], function ($, scope, undefined) {
    "use strict";

    function SmartSliderControlKeyboard(slider, direction, parameters) {

        this.slider = slider;

        this.parameters = $.extend({}, parameters);

        if (direction == 'vertical') {
            this.parseEvent = SmartSliderControlKeyboard.prototype.parseEventVertical;
        } else {
            this.parseEvent = SmartSliderControlKeyboard.prototype.parseEventHorizontal;
        }

        $(document).on('keydown', $.proxy(this.onKeyDown, this));

        slider.controls.keyboard = this;
    };

    SmartSliderControlKeyboard.prototype.isSliderOnScreen = function () {
        var offset = this.slider.sliderElement.offset(),
            scrollTop = $(window).scrollTop(),
            height = this.slider.sliderElement.height();
        if (offset.top + height * 0.5 >= scrollTop && offset.top - height * 0.5 <= scrollTop + $(window).height()) {
            return true;
        }
        return false;
    };

    SmartSliderControlKeyboard.prototype.onKeyDown = function (e) {

        if (e.target.tagName.match(/BODY|DIV|IMG/)) {
            if (this.isSliderOnScreen()) {
                e = e || window.event;
                if (this.parseEvent.call(this, e)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        }
    };

    SmartSliderControlKeyboard.prototype.parseEventHorizontal = function (e) {
        switch (e.keyCode) {
            case 39: // right arrow
                this.slider[nextend.rtl.next]();
                return true;
            case 37: // left arrow
                this.slider[nextend.rtl.previous]();
                return true;
            default:
                return false;
        }
    };

    SmartSliderControlKeyboard.prototype.parseEventVertical = function (e) {
        switch (e.keyCode) {
            case 40: // down arrow
                this.slider.next();
                return true;
            case 38: // up arrow
                this.slider.previous();
                return true;
            default:
                return false;
        }
    };

    return SmartSliderControlKeyboard;
});
N2Require('SmartSliderControlScroll', [], [], function ($, scope, undefined) {
    "use strict";

    function SmartSliderControlScroll(slider) {

        this.preventScroll = false;
        this._preventScrollTimeout = null;

        this.slider = slider;

        slider.sliderElement.on('DOMMouseScroll mousewheel', $.proxy(this.onMouseWheel, this));

        slider.controls.scroll = this;
    }

    SmartSliderControlScroll.prototype.onMouseWheel = function (e) {
        if (!this.preventScroll) {

            var up = false;
            if (e.originalEvent) {
                if (e.originalEvent.wheelDelta) up = e.originalEvent.wheelDelta / -1 < 0;
                if (e.originalEvent.deltaY) up = e.originalEvent.deltaY < 0;
                if (e.originalEvent.detail) up = e.originalEvent.detail < 0;
            }

            if (up) {
                if (this.slider.previous()) {
                    this.preventScrollTimeout(e);
                }
            } else {
                if (this.slider.next()) {
                    this.preventScrollTimeout(e);
                }
            }
        } else {
            this.preventScrollTimeout(e);
        }
    };

    SmartSliderControlScroll.prototype.preventScrollTimeout = function (e) {
        if (this._preventScrollTimeout !== null) {
            clearTimeout(this._preventScrollTimeout);
        }
        this.preventScroll = true;
        e.preventDefault();
        this._preventScrollTimeout = setTimeout($.proxy(function () {
            this.preventScroll = false;
            this._preventScrollTimeout = null;
        }, this), 400);
    };

    return SmartSliderControlScroll;
});
N2Require('SmartSliderControlTilt', [], [], function ($, scope, undefined) {
    "use strict";

    function SmartSliderControlTilt(slider, parameters) {

        if (typeof window.DeviceOrientationEvent == 'undefined' || typeof window.orientation == 'undefined') {
            return "Not supported";
        }
        this.timeout = null;

        this.slider = slider;

        this.parameters = $.extend({
            duration: 2000
        }, parameters);

        this.orientationchange();

        window.addEventListener('orientationchange', $.proxy(this.orientationchange, this));

        window.addEventListener("deviceorientation", $.proxy(this.handleOrientation, this), true);

        slider.controls.tilt = this;
    };

    SmartSliderControlTilt.prototype.orientationchange = function () {
        switch (window.orientation) {
            case -90:
            case 90:
                this.parseEvent = SmartSliderControlTilt.prototype.parseEventHorizontalLandscape;
                break;
            default:
                this.parseEvent = SmartSliderControlTilt.prototype.parseEventHorizontal;
                break;
        }
    };

    SmartSliderControlTilt.prototype.clearTimeout = function () {
        this.timeout = null;
    };

    SmartSliderControlTilt.prototype.handleOrientation = function (e) {
        if (this.timeout == null && this.parseEvent.call(this, e)) {
            this.timeout = setTimeout($.proxy(this.clearTimeout, this), this.parameters.duration);

            e.preventDefault();
        }
    };

    SmartSliderControlTilt.prototype.parseEventHorizontal = function (e) {
        if (e.gamma > 10) { // right tilt
            this.slider.next();
            return true;
        } else if (e.gamma < -10) { // left tilt
            this.slider.previous();
            return true;
        }
        return false;
    };

    SmartSliderControlTilt.prototype.parseEventHorizontalLandscape = function (e) {
        if (e.beta < -10) { // right tilt
            this.slider.next();
            return true;
        } else if (e.beta > 10) { // left tilt
            this.slider.previous();
            return true;
        }
        return false;
    };

    return SmartSliderControlTilt;
});
N2Require('SmartSliderControlTouch', [], [], function ($, scope, undefined) {
    "use strict";

    var pointer = window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
        hadDirection = false,
        preventMultipleTap = false;

    function SmartSliderControlTouch(slider, _direction, parameters) {
        this.currentAnimation = null;
        this.slider = slider;

        this._animation = slider.mainAnimation;

        this.parameters = $.extend({
            fallbackToMouseEvents: true
        }, parameters);

        this.swipeElement = this.slider.sliderElement.find('> .n2-ss-swipe-element');

        if (_direction == 'vertical') {
            this.setVertical();
        } else if (_direction == 'horizontal') {
            this.setHorizontal();
        }

        var initTouch = $.proxy(function () {
            var that = this;
            if (this._animation.isNoAnimation) {
                N2EventBurrito(this.swipeElement.get(0), {
                    mouse: this.parameters.fallbackToMouseEvents,
                    axis: _direction == 'horizontal' ? 'x' : 'y',
                    start: function () {
                        hadDirection = false;
                    },
                    move: function (event, start, diff, speed, isRealScrolling) {
                        var direction = that._direction.measure(diff);
                        if (!isRealScrolling && direction != 'unknown' && that.currentAnimation === null) {

                            if (that._animation.state != 'ended') {
                                // skip the event as the current animation is still playing
                                return false;
                            }
                            that.distance = [0];
                            that.swipeElement.addClass('n2-grabbing');

                            that.currentAnimation = {
                                direction: direction
                            };
                            var isChangePossible = that.slider.isChangePossible(that._direction[direction]);
                            if (!isChangePossible) {
                                that.currentAnimation = null;
                                return false;
                            }
                        }

                        if (that.currentAnimation) {
                            var realDistance = that._direction.get(diff, that.currentAnimation.direction);
                            that.logDistance(realDistance);
                            if ((hadDirection || Math.abs(realDistance) > that._direction.minDistance) && event.cancelable) {
                                hadDirection = true;
                                return true;
                            }
                        }
                        return false;
                    },
                    end: function (event, start, diff, speed, isRealScrolling) {
                        if (that.currentAnimation !== null) {
                            var targetDirection = isRealScrolling ? 0 : that.measureRealDirection();
                            if (targetDirection) {
                                that.slider[that._direction[that.currentAnimation.direction]]();
                            }

                            that.swipeElement.removeClass('n2-grabbing');
                            that.currentAnimation = null;
                        }

                        if (Math.abs(diff.x) < 10 && Math.abs(diff.y) < 10) {
                            that.onTap(event);
                        } else {
                            nextend.preventClick();
                        }
                    }
                });
            } else {
                N2EventBurrito(this.swipeElement.get(0), {
                    mouse: this.parameters.fallbackToMouseEvents,
                    axis: _direction == 'horizontal' ? 'x' : 'y',
                    start: function (event, start) {
                        hadDirection = false;
                    },
                    move: function (event, start, diff, speed, isRealScrolling) {
                        var direction = that._direction.measure(diff);
                        if (!isRealScrolling && direction != 'unknown' && that.currentAnimation === null) {

                            if (that._animation.state != 'ended') {
                                // skip the event as the current animation is still playing
                                return false;
                            }
                            that.distance = [0];
                            that.swipeElement.addClass('n2-grabbing');

                            // Force the main animation into touch mode horizontal/vertical
                            that._animation.setTouch(that._direction.axis);

                            that.currentAnimation = {
                                direction: direction,
                                percent: 0
                            };
                            var isChangePossible = that.slider[that._direction[direction]](false);
                            if (!isChangePossible) {
                                that._animation.setTouch(false);
                                that.currentAnimation = null;
                                return false;
                            }
                        }

                        if (that.currentAnimation) {
                            var realDistance = that._direction.get(diff, that.currentAnimation.direction);
                            that.logDistance(realDistance);
                            if (that.currentAnimation.percent < 1) {
                                var percent = Math.max(-0.99999, Math.min(0.99999, realDistance / that.slider.dimensions.slider[that._property]));
                                that.currentAnimation.percent = percent;
                                that._animation.setTouchProgress(percent);
                            }
                            if ((hadDirection || Math.abs(realDistance) > that._direction.minDistance) && event.cancelable) {
                                hadDirection = true;
                                return true;
                            }
                        }
                        return false;
                    },
                    end: function (event, start, diff, speed, isRealScrolling) {
                        if (that.currentAnimation !== null) {
                            var targetDirection = isRealScrolling ? 0 : that.measureRealDirection();
                            var progress = that._animation.timeline.progress();
                            if (progress != 1) {
                                that._animation.setTouchEnd(targetDirection, that.currentAnimation.percent, diff.time);
                            }
                            that.swipeElement.removeClass('n2-grabbing');

                            // Switch back the animation into the original mode when our touch is ended
                            that._animation.setTouch(false);
                            that.currentAnimation = null;
                        }

                        if (Math.abs(diff.x) < 10 && Math.abs(diff.y) < 10) {
                            that.onTap(event);
                        } else {
                            nextend.preventClick();
                        }
                    }
                });
            }
        }, this);

        if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
            var parent = this.swipeElement.parent();
            if (parent.css('opacity') != 1) {
                this.swipeElement.parent().one('transitionend', initTouch);
            } else {
                initTouch();
            }
        } else {
            initTouch();
        }

        if (!this.parameters.fallbackToMouseEvents) {
            this.swipeElement.on('click', $.proxy(this.onTap, this));
        }

        if (this.parameters.fallbackToMouseEvents) {
            this.swipeElement.addClass('n2-grab');
        }

        slider.controls.touch = this;
    };

    SmartSliderControlTouch.prototype.setHorizontal = function () {

        this._property = 'width';

        this._direction = {
            left: nextend.rtl.next,
            right: nextend.rtl.previous,
            up: null,
            down: null,
            axis: 'horizontal',
            minDistance: 10,
            measure: function (diff) {
                if ((!hadDirection && Math.abs(diff.x) < 10) || diff.x == 0 || Math.abs(diff.x) < Math.abs(diff.y)) return 'unknown';
                return diff.x < 0 ? 'left' : 'right';
            },
            get: function (diff, direction) {
                if (direction == 'left') {
                    return -diff.x;
                }
                return diff.x;
            }
        };

        if (pointer) {
            this.swipeElement.css('-ms-touch-action', 'pan-y');
            this.swipeElement.css('touch-action', 'pan-y');
        }
    };

    SmartSliderControlTouch.prototype.setVertical = function () {

        this._property = 'height';

        this._direction = {
            left: null,
            right: null,
            up: 'next',
            down: 'previous',
            axis: 'vertical',
            minDistance: 1,
            measure: function (diff) {
                if ((!hadDirection && Math.abs(diff.y) < 1) || diff.y == 0 || Math.abs(diff.y) < Math.abs(diff.x)) return 'unknown';
                return diff.y < 0 ? 'up' : 'down';
            },
            get: function (diff, direction) {
                if (direction == 'up') {
                    return -diff.y;
                }
                return diff.y;
            }
        };

        if (pointer) {
            this.swipeElement.css('-ms-touch-action', 'pan-x');
            this.swipeElement.css('touch-action', 'pan-x');
        }
    };

    SmartSliderControlTouch.prototype.logDistance = function (realDistance) {
        if (this.distance.length > 3) {
            this.distance.shift();
        }
        this.distance.push(realDistance);
    };

    SmartSliderControlTouch.prototype.measureRealDirection = function () {
        var firstValue = this.distance[0],
            lastValue = this.distance[this.distance.length - 1];

        if ((lastValue >= 0 && firstValue > lastValue) || (lastValue < 0 && firstValue < lastValue)) {
            return 0;
        }
        return 1;
    };

    SmartSliderControlTouch.prototype.onTap = function (e) {
        if (!preventMultipleTap) {
            $(e.target).trigger('n2click');
            preventMultipleTap = true;
            setTimeout(function () {
                preventMultipleTap = false;
            }, 500);
        }
    };

    return SmartSliderControlTouch;
});
N2Require('SmartSliderBackgroundImage', [], [], function ($, scope, undefined) {

    function SmartSliderBackgroundImage(slide, element, manager) {
        this.loadStarted = false;

        this.loadAllowed = false;

        this.width = 0;
        this.height = 0;

        this.slide = slide;

        this.element = element;
        this.$mask = this.element.find('.n2-ss-slide-background-mask');
        this.manager = manager;
        this.loadDeferred = $.Deferred();

        this.currentSrc = '';
        this.mode = element.data('mode');
        this.opacity = element.data('opacity');
        this.blur = element.data('blur');
        this.x = element.data('x');
        this.y = element.data('y');


        this.hasImage = false;
        this.$image = this.$mask.find('img');

        if (!this.$image.length) {
            this.startColorMode();
        } else {
            this.hasImage = true;
            this.startImageMode();
        }

    }

    SmartSliderBackgroundImage.prototype.startColorMode = function () {
        this.loadDeferred.resolve();
    };

    SmartSliderBackgroundImage.prototype.startImageMode = function () {
        if (this.mode == 'fixed' && ((n2const.isPhone && !this.slide.slider.parameters['background.parallax.mobile']) || (n2const.isTablet && !this.slide.slider.parameters['background.parallax.tablet']))) {
            this.mode = 'fill';
        }
        this.$image.css('display', 'none');
        this.$background = $('<div class="n2-ss-background-image"/>')
            .css({
                opacity: this.opacity,
                backgroundPosition: this.x + '% ' + this.y + '%'
            })
            .appendTo(this.$mask);

        if (window.n2FilterProperty) {
            if (this.blur > 0) {
                this.$background.css({
                    margin: '-' + (this.blur * 2) + 'px',
                    padding: (this.blur * 2) + 'px'
                }).css(window.n2FilterProperty, 'blur(' + this.blur + 'px)');
            } else {
                this.$background.css({
                    margin: '',
                    padding: ''
                }).css(window.n2FilterProperty, '');
            }
        }

        if (this.mode == 'fixed') {
            this.startFixed();
        }

        this.desktopSrc = this.element.data('desktop') || '';
        this.tabletSrc = this.element.data('tablet') || '';
        this.mobileSrc = this.element.data('mobile') || '';

        if (nextend.isRetina) {
            var retina = this.element.data('desktop-retina');
            if (retina) {
                this.desktopSrc = retina;
            }
            retina = this.element.data('tablet-retina');
            if (retina) {
                this.tabletSrc = retina;
            }
            retina = this.element.data('mobile-retina');
            if (retina) {
                this.mobileSrc = retina;
            }
        }
    }

    SmartSliderBackgroundImage.prototype.preLoad = function () {
        if (!this.loadStarted) {
            this.slide.$element.find('[data-lazysrc]').each(function () {
                var $this = $(this);
                $this.attr('src', $this.data('lazysrc'));
            });
            this.loadStarted = true;
        }

        if (this.loadDeferred.state() == 'pending') {
            this.loadAllowed = true;
            this.manager.deviceDeferred.done($.proxy(function () {
                this.updateBackgroundToDevice(this.manager.device);
                this.$background.n2imagesLoaded({background: true}, $.proxy(function (e) {
                    var img = e.images[0].img;
                    this.width = img.naturalWidth;
                    this.height = img.naturalHeight;

                    this.isLoaded = true;
                    this.loadDeferred.resolve(this.element);
                }, this));
            }, this));
        }
        return this.loadDeferred;
    };

    SmartSliderBackgroundImage.prototype.updateBackgroundToDevice = function (device) {
        var newSrc = this.desktopSrc;
        if (device.device == 'mobile') {
            if (this.mobileSrc) {
                newSrc = this.mobileSrc;
            } else if (this.tabletSrc) {
                newSrc = this.tabletSrc;
            }
        } else if (device.device == 'tablet') {
            if (this.tabletSrc) {
                newSrc = this.tabletSrc;
            }
        }
        if (newSrc) {
            this.setSrc(newSrc);
        } else {
            this.setSrc('');
        }
    };

    SmartSliderBackgroundImage.prototype.setSrc = function (src) {
        if (this.loadAllowed) {
            if (src != this.currentSrc) {
                if (src === '') {
                    this.$background.css('background-image', '');
                } else {
                    this.$background.css('background-image', 'url("' + src + '")');
                }
                this.currentSrc = src;
            }
        }
    }

    SmartSliderBackgroundImage.prototype.startFixed = function () {
        if (!n2const.isEdge) {
            if (this.slide.slider.parameters.allowBGImageAttachmentFixed && !n2const.isIOS) {
                this.$background.css('background-repeat', 'repeat');
                this.$background.css('position', 'static');
                this.$background.css('background-attachment', 'fixed');
            } else if (!n2const.isIE) {
                this.slide.slider.startedDeferred.done($.proxy(function () {
                    fixedBackground.addElement(this.$background, this.element);
                }, this));
            }
        }
    }

    SmartSliderBackgroundImage.prototype.hack = function () {
        NextendTween.set(this.element, {
            rotation: 0.0001
        });
    };

    return SmartSliderBackgroundImage;
});
N2Require('FrontendComponent', [], [], function ($, scope, undefined) {

    /**
     * @constructor
     * @memberof scope
     */
    function FrontendComponent(slide, parent, $layer, $children) {
        this.wraps = {};
        this.isVisible = true;
        this.device = '';
        this.children = [];
        this.slide = slide;
        this.parent = parent;
        this.$layer = $layer.data('layer', this);

        var $mask = this.$layer.find('> .n2-ss-layer-mask');
        if ($mask.length) {
            this.wraps.mask = $mask;
        }

        var $parallax = this.$layer.find('> .n2-ss-layer-parallax');
        if ($parallax.length) {
            this.wraps.parallax = $parallax;
        }

        switch ($layer.data('pm')) {
            case 'absolute':
                this.placement = new scope.FrontendPlacementAbsolute(this);
                break;
            case 'normal':
                this.placement = new scope.FrontendPlacementNormal(this);
                break;
            case 'content':
                this.placement = new scope.FrontendPlacementContent(this);
                break;
            default:
                this.placement = new scope.FrontendPlacementDefault(this);
                break;
        }
        this.parallax = $layer.data('parallax');

        this.baseSize = this.baseSize || 100;
        this.isAdaptiveFont = this.get('adaptivefont');
        this.refreshBaseSize(this.getDevice('fontsize'));

        if ($children) {
            for (var i = 0; i < $children.length; i++) {
                switch ($children.eq(i).data('type')) {
                    case 'content':
                        this.children.push(new scope.FrontendComponentContent(this.slide, this, $children.eq(i)));
                        break;
                    case 'row':
                        this.children.push(new scope.FrontendComponentRow(this.slide, this, $children.eq(i)));
                        break;
                    case 'col':
                        this.children.push(new scope.FrontendComponentCol(this.slide, this, $children.eq(i)));
                        break;
                    case 'group':
                        break;
                    default:
                        this.children.push(new scope.FrontendComponentLayer(this.slide, this, $children.eq(i)));
                        break;
                }
            }
        }
    }

    FrontendComponent.prototype.refreshBaseSize = function (fontSize) {
        if (this.isAdaptiveFont) {
            this.baseSize = (16 * fontSize / 100);
        } else {
            this.baseSize = this.parent.baseSize * fontSize / 100;
        }
    }

    FrontendComponent.prototype.start = function () {
        this.placement.start();
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].start()
        }

        var rotation = this.get('rotation') || 0;
        if (rotation / 360 != 0) {
            var $el = this.addWrap('rotation', "<div class='n2-ss-layer-rotation'></div>");

            NextendTween.set($el[0], {
                rotationZ: rotation
            });
        }
    }

    FrontendComponent.prototype.onDeviceChange = function (device) {
        this.device = device;
        var wasVisible = this.isVisible;
        this.isVisible = this.getDevice('');
        if (this.isVisible === undefined) this.isVisible = 1;

        if (wasVisible && !this.isVisible) {
            this.$layer.data('shows', 0);
            this.$layer.css('display', 'none');
        } else if (!wasVisible && this.isVisible) {
            this.$layer.data('shows', 1);
            this.$layer.css('display', 'block');
        }

        if (this.isVisible) {
            var fontSize = this.getDevice('fontsize');
            this.refreshBaseSize(fontSize);
            if (this.isAdaptiveFont) {
                this.$layer.css('font-size', (16 * fontSize / 100) + 'px');
            } else {
                this.$layer.css('font-size', fontSize + '%');
            }

            for (var i = 0; i < this.children.length; i++) {
                this.children[i].onDeviceChange(device)
            }
            this.placement.onDeviceChange(device);

            this.onAfterDeviceChange(device);
        }
    }

    FrontendComponent.prototype.onAfterDeviceChange = function (device) {

    }

    FrontendComponent.prototype.onResize = function (ratios, dimensions, isStatic) {
        if (this.isVisible || this.placement.alwaysResize) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].onResize(ratios, dimensions, isStatic)
            }
            this.placement.onResize(ratios, dimensions, isStatic);
        }
    }

    FrontendComponent.prototype.getDevice = function (property, def) {
        var value = this.$layer.data(this.device + property);
        if (value != undefined) {
            return value;
        }
        if (this.device != 'desktopportrait') {
            return this.$layer.data('desktopportrait' + property);
        }
        if (def !== undefined) {
            return def;
        }
        return 0;
    }

    FrontendComponent.prototype.get = function (property) {
        return this.$layer.data(property);
    }

    FrontendComponent.prototype.getParallaxNodes = function () {
        var parallaxed = [];
        if (this.isVisible) {
            if (this.parallax) {
                parallaxed.push(this.$layer[0]);
            }
            for (var i = 0; i < this.children.length; i++) {
                parallaxed.push.apply(parallaxed, this.children[i].getParallaxNodes());
            }
        }
        return parallaxed;

    }

    FrontendComponent.prototype.addWrap = function (key, html) {
        if (this.wraps[key] === undefined) {
            var $el = $(html);
            switch (key) {
                case 'rotation':
                    if (this.wraps.mask !== undefined) {
                        $el.appendTo(this.wraps.mask);
                    } else if (this.wraps.parallax !== undefined) {
                        $el.appendTo(this.wraps.parallax);
                    } else {
                        $el.appendTo(this.$layer);
                    }
                    $el.append(this.getContents());
                    break;
            }
            this.wraps[key] = $el;
        }
        return $el;
    }

    FrontendComponent.prototype.getContents = function () {
        return false;
    }

    return FrontendComponent;
});
N2Require('FrontendPlacement', [], [], function ($, scope, undefined) {
    function FrontendPlacement(layer) {
        this.layer = layer;
        this.alwaysResize = false;
    }

    FrontendPlacement.prototype.start = function () {

    }

    FrontendPlacement.prototype.onDeviceChange = function (mode) {

    }

    FrontendPlacement.prototype.onResize = function (ratios, dimensions, isStatic) {

    }

    return FrontendPlacement;
});
N2Require('FrontendSliderSlide', ['FrontendComponentSlideAbstract'], [], function ($, scope, undefined) {

    /**
     * @constructor
     * @augments FrontendComponentSlideAbstract
     * @memberof scope
     */
    function FrontendSliderSlide(slider, $element, index) {
        this.isStaticSlide = false;
        this.originalIndex = index;
        this.index = index;
        this.localIndex = index;
        this.$element = $element.data('slide', this);
        this.id = this.$element.data('id');

        this.backgroundImage = false;
        this.backgroundVideo = false;

        this.slides = [this];

        if (!slider.parameters.admin) {
            this.minimumSlideDuration = $element.data('slide-duration');
            if (!$.isNumeric(this.minimumSlideDuration)) {
                this.minimumSlideDuration = 0;
            }
        } else {
            this.minimumSlideDuration = 0;
        }

        var $container = $element.find('.n2-ss-layers-container');

        scope.FrontendComponentSlideAbstract.prototype.constructor.call(this, slider, $container);
    }

    FrontendSliderSlide.prototype = Object.create(scope.FrontendComponentSlideAbstract.prototype);
    FrontendSliderSlide.prototype.constructor = FrontendSliderSlide;

    FrontendSliderSlide.prototype.init = function () {
        scope.FrontendComponentSlideAbstract.prototype.init.call(this);
        var $image = this.slider.findSlideBackground(this);
        if ($image.length > 0) {
            if (this.slider.isAdmin) {
                this.backgroundImage = new scope.SmartSliderBackgroundImageAdmin(this, $image, this.slider.backgroundImages);
            } else {
                this.backgroundImage = new scope.SmartSliderBackgroundImage(this, $image, this.slider.backgroundImages);
            }
        }

        this.$element.data('slideBackground', this.backgroundImage);

        var $video = this.backgroundImage.element.find('.n2-ss-slide-background-video');
        if ($video.length > 0) {
            this.backgroundVideo = new scope.SmartSliderBackgroundVideo(this, $video);
        }
    };

    FrontendSliderSlide.prototype.setStarterSlide = function () {
        scope.FrontendComponentSlideAbstract.prototype.setStarterSlide.call(this);
    };

    FrontendSliderSlide.prototype.setIndex = function (index) {
        this.localIndex = this.index = index;
    };

    FrontendSliderSlide.prototype.preLoad = function () {
        if (this.backgroundImage) {
            return this.backgroundImage.preLoad();
        }

        return true;
    };

    /**
     * Linked list
     * @param previousSlide
     */
    FrontendSliderSlide.prototype.setPrevious = function (previousSlide) {
        this.previousSlide = previousSlide;
    };

    /**
     * Linked list
     * @param nextSlide
     */
    FrontendSliderSlide.prototype.setNext = function (nextSlide) {
        this.nextSlide = nextSlide;
        nextSlide.setPrevious(this);
    };

    FrontendSliderSlide.prototype.hasBackgroundVideo = function () {
        return this.backgroundVideo;
    };

    return FrontendSliderSlide;
});
N2Require('FrontendComponentSlideAbstract', ['FrontendComponent'], [], function ($, scope, undefined) {

    var SlideStatus = {
        NOT_INITIALIZED: -1,
        INITIALIZED: 0,
        READY_TO_START: 1,
        PLAYING: 2,
        ENDED: 3
    };

    /**
     * @constructor
     * @augments FrontendComponent
     * @memberof scope
     */
    function FrontendComponentSlideAbstract(slider, $el) {
        this.baseSize = 16;
        this.slider = slider;

        if (!this.isCurrentlyEdited()) {

            this.status = SlideStatus.NOT_INITIALIZED;

            scope.FrontendComponent.prototype.constructor.call(this, this, this, $el, $el.find('> .n2-ss-section-outer > .n2-ss-layer, > .n2-ss-layer, > .n2-ss-layer-group'));

            this.slider.sliderElement.on({
                SliderDeviceOrientation: $.proxy(function (e, modes) {
                    this.onDeviceChange(modes.device + modes.orientation.toLowerCase());
                }, this),
                SliderResize: $.proxy(function (e, ratios, responsive) {
                    this.onResize(ratios, responsive.responsiveDimensions);
                }, this)
            });

            scope.FrontendComponent.prototype.start.call(this);
        }
    }

    FrontendComponentSlideAbstract.prototype = Object.create(scope.FrontendComponent.prototype);
    FrontendComponentSlideAbstract.prototype.constructor = FrontendComponentSlideAbstract;

    FrontendComponentSlideAbstract.prototype.isCurrentlyEdited = function () {
        return this.slider.parameters.admin && this.$element.hasClass('n2-ss-currently-edited-slide');
    };

    FrontendComponentSlideAbstract.prototype.trigger = function () {
        this.$element.trigger.apply(this.$element, [].slice.call(arguments));
    };

    FrontendComponentSlideAbstract.prototype.triggerHandler = function () {
        return this.$element.triggerHandler.apply(this.$element, [].slice.call(arguments));
    };

    FrontendComponentSlideAbstract.prototype.init = function () {

        if (!this.isCurrentlyEdited()) {
        }
    };

    FrontendComponentSlideAbstract.prototype.refreshBaseSize = function (fontSize) {

    };

    FrontendComponentSlideAbstract.prototype.onResize = function (ratios, dimensions) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].onResize(ratios, dimensions, this.isStaticSlide)
        }
    };


    FrontendComponentSlideAbstract.prototype.hasLayers = function () {
        return this.children.length > 0;
    };

    FrontendComponentSlideAbstract.prototype.onDeviceChange = function (device) {
        this.device = device;

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].onDeviceChange(device)
        }
        this.placement.onDeviceChange(device);

    };

    FrontendComponentSlideAbstract.prototype.setStarterSlide = function () {
    };

    return FrontendComponentSlideAbstract;
});
N2Require('FrontendSliderStaticSlide', ['FrontendComponentSlideAbstract'], [], function ($, scope, undefined) {

    /**
     * @constructor
     * @augments FrontendComponentSlideAbstract
     * @memberof scope
     */
    function FrontendSliderStaticSlide(slider, $element) {
        this.isStaticSlide = true;
        this.$element = $element.data('slide', this);
        scope.FrontendComponentSlideAbstract.prototype.constructor.call(this, slider, $element);

        this.init();
    }

    FrontendSliderStaticSlide.prototype = Object.create(scope.FrontendComponentSlideAbstract.prototype);
    FrontendSliderStaticSlide.prototype.constructor = FrontendSliderStaticSlide;

    return FrontendSliderStaticSlide;
});
N2Require('FrontendPlacementAbsolute', ['FrontendPlacement'], [], function ($, scope, undefined) {

    if (/(MSIE\ [0-7]\.\d+)/.test(navigator.userAgent)) {
        function getPos($element) {
            return $element.position();
        }
    } else {
        function getPos($element) {
            return {
                left: $element.prop('offsetLeft'),
                top: $element.prop('offsetTop')
            }
        }
    }

    function FrontendPlacementAbsolute(layer) {
        this.linked = [];
        this.parentLayer = false;
        this.$parent = false;
        scope.FrontendPlacement.prototype.constructor.apply(this, arguments);
    }

    FrontendPlacementAbsolute.prototype = Object.create(scope.FrontendPlacement.prototype);
    FrontendPlacementAbsolute.prototype.constructor = FrontendPlacementAbsolute;

    FrontendPlacementAbsolute.prototype.start = function () {
        var parentID = this.layer.get('parentid');
        if (parentID) {
            this.$parent = $('#' + parentID);
            if (this.$parent.length == 0) {
                this.$parent = false;
            } else {
                this.parentLayer = this.$parent.data('layer');
                this.parentLayer.placement.addLinked(this);
                this.onResize = function () {
                };
            }
        }
    }

    FrontendPlacementAbsolute.prototype.addLinked = function (childPlacement) {
        this.linked.push(childPlacement);
        this.alwaysResize = true;
    }

    FrontendPlacementAbsolute.prototype.onResize =
        FrontendPlacementAbsolute.prototype.onResizeLinked = function (ratios, dimensions, isStatic) {
            var $layer = this.layer.$layer;
            var ratioPositionH = ratios.slideW,
                ratioSizeH = ratioPositionH,
                ratioPositionV = ratios.slideH,
                ratioSizeV = ratioPositionV;


            if (!parseInt(this.layer.get('responsivesize'))) {
                ratioSizeH = ratioSizeV = 1;
            }

            $layer.css('width', this.getWidth(ratioSizeH));
            $layer.css('height', this.getHeight(ratioSizeV));

            if (!parseInt(this.layer.get('responsiveposition'))) {
                ratioPositionH = ratioPositionV = 1;
            }


            var left = this.layer.getDevice('left') * ratioPositionH,
                top = this.layer.getDevice('top') * ratioPositionV,
                align = this.layer.getDevice('align'),
                valign = this.layer.getDevice('valign');

            var positionCSS = {
                left: 'auto',
                top: 'auto',
                right: 'auto',
                bottom: 'auto'
            };

            if (this.$parent && this.$parent.data('layer').isVisible) {
                var position = getPos(this.$parent),
                    p = {left: 0, top: 0};

                switch (this.layer.getDevice('parentalign')) {
                    case 'right':
                        p.left = position.left + this.$parent.width();
                        break;
                    case 'center':
                        p.left = position.left + this.$parent.width() / 2;
                        break;
                    default:
                        p.left = position.left;
                }

                switch (align) {
                    case 'right':
                        positionCSS.right = ($layer.parent().width() - p.left - left) + 'px';
                        break;
                    case 'center':
                        positionCSS.left = (p.left + left - $layer.width() / 2) + 'px';
                        break;
                    default:
                        positionCSS.left = (p.left + left) + 'px';
                        break;
                }


                switch (this.layer.getDevice('parentvalign')) {
                    case 'bottom':
                        p.top = position.top + this.$parent.height();
                        break;
                    case 'middle':
                        p.top = position.top + this.$parent.height() / 2;
                        break;
                    default:
                        p.top = position.top;
                }

                switch (valign) {
                    case 'bottom':
                        positionCSS.bottom = ($layer.parent().height() - p.top - top) + 'px';
                        break;
                    case 'middle':
                        positionCSS.top = (p.top + top - $layer.height() / 2) + 'px';
                        break;
                    default:
                        positionCSS.top = (p.top + top) + 'px';
                        break;
                }


            } else {
                switch (align) {
                    case 'right':
                        positionCSS.right = -left + 'px';
                        break;
                    case 'center':
                        positionCSS.left = ((isStatic ? $layer.parent().width() : dimensions.slide.width) / 2 + left - $layer.width() / 2) + 'px';
                        break;
                    default:
                        positionCSS.left = left + 'px';
                        break;
                }

                switch (valign) {
                    case 'bottom':
                        positionCSS.bottom = -top + 'px';
                        break;
                    case 'middle':
                        positionCSS.top = ((isStatic ? $layer.parent().height() : dimensions.slide.height) / 2 + top - $layer.height() / 2) + 'px';
                        break;
                    default:
                        positionCSS.top = top + 'px';
                        break;
                }
            }

            $layer.css(positionCSS);

            for (var i = 0; i < this.linked.length; i++) {
                this.linked[i].onResizeLinked(ratios, dimensions, isStatic)
            }
        }

    FrontendPlacementAbsolute.prototype.getWidth = function (ratio) {
        var width = this.layer.getDevice('width');
        if (this.isDimensionPropertyAccepted(width)) {
            return width;
        }
        return (width * ratio) + 'px'
    }

    FrontendPlacementAbsolute.prototype.getHeight = function (ratio) {
        var height = this.layer.getDevice('height');
        if (this.isDimensionPropertyAccepted(height)) {
            return height;
        }
        return (height * ratio) + 'px'
    }

    FrontendPlacementAbsolute.prototype.isDimensionPropertyAccepted = function (value) {
        if ((value + '').match(/[0-9]+%/) || value == 'auto') {
            return true;
        }
        return false;
    };

    return FrontendPlacementAbsolute;
});
N2Require('FrontendPlacementContent', ['FrontendPlacement'], [], function ($, scope, undefined) {
    function FrontendPlacementContent(layer) {
        scope.FrontendPlacement.prototype.constructor.apply(this, arguments);
    }

    FrontendPlacementContent.prototype = Object.create(scope.FrontendPlacement.prototype);
    FrontendPlacementContent.prototype.constructor = FrontendPlacementContent;

    return FrontendPlacementContent;
});
N2Require('FrontendPlacementDefault', ['FrontendPlacement'], [], function ($, scope, undefined) {
    function FrontendPlacementDefault(layer) {
        scope.FrontendPlacement.prototype.constructor.apply(this, arguments);
    }

    FrontendPlacementDefault.prototype = Object.create(scope.FrontendPlacement.prototype);
    FrontendPlacementDefault.prototype.constructor = FrontendPlacementDefault;

    return FrontendPlacementDefault;
});
N2Require('FrontendPlacementNormal', ['FrontendPlacement'], [], function ($, scope, undefined) {
    function FrontendPlacementNormal(layer) {
        scope.FrontendPlacement.prototype.constructor.apply(this, arguments);
    }

    FrontendPlacementNormal.prototype = Object.create(scope.FrontendPlacement.prototype);
    FrontendPlacementNormal.prototype.constructor = FrontendPlacementNormal;

    FrontendPlacementNormal.prototype.onDeviceChange = function () {
        this.updateMargin();
        this.updateHeight();
        this.updateMaxWidth();
        this.updateSelfAlign();

    }

    FrontendPlacementNormal.prototype.updateMargin = function () {
        var margin = this.layer.getDevice('margin').split('|*|'),
            unit = margin.pop(),
            baseSize = this.layer.baseSize;

        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < margin.length; i++) {
                margin[i] = parseInt(margin[i]) / baseSize;
            }
        }
        this.layer.$layer.css('margin', margin.join(unit + ' ') + unit);
    };

    FrontendPlacementNormal.prototype.updateHeight = function () {
        var height = this.layer.getDevice('height'),
            unit = 'px';
        if (height > 0) {
            var baseSize = this.layer.baseSize;
            if (baseSize > 0) {
                unit = 'em'
                height = parseInt(height) / baseSize;
            }
            this.layer.$layer.css('height', height + unit);
        } else {
            this.layer.$layer.css('height', '');
        }
    }

    FrontendPlacementNormal.prototype.updateMaxWidth = function () {
        var value = parseInt(this.layer.getDevice('maxwidth'));
        if (value <= 0 || isNaN(value)) {
            this.layer.$layer.css('maxWidth', '')
                .removeClass('n2-ss-has-maxwidth');
        } else {
            this.layer.$layer.css('maxWidth', value + 'px')
                .addClass('n2-ss-has-maxwidth');
        }
    };

    FrontendPlacementNormal.prototype.updateSelfAlign = function () {
        this.layer.$layer.attr('data-cssselfalign', this.layer.getDevice('selfalign'));
    }

    return FrontendPlacementNormal;
});
N2Require('FrontendComponentCol', ['FrontendComponent'], [], function ($, scope, undefined) {
    function FrontendComponentCol(slide, parent, $el) {

        this.$content = $el.find('.n2-ss-layer-col:first');

        scope.FrontendComponent.prototype.constructor.call(this, slide, parent, $el, this.$content.find('> .n2-ss-layer'));
    }

    FrontendComponentCol.prototype = Object.create(scope.FrontendComponent.prototype);
    FrontendComponentCol.prototype.constructor = FrontendComponentCol;


    FrontendComponentCol.prototype.onDeviceChange = function (device) {
        scope.FrontendComponent.prototype.onDeviceChange.apply(this, arguments);

        this.updateOrder();
        this.updatePadding();
        this.updateInnerAlign();
        this.updateMaxWidth();
    }

    FrontendComponentCol.prototype.updatePadding = function () {
        var padding = this.getDevice('padding').split('|*|'),
            unit = padding.pop(),
            baseSize = this.baseSize;

        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < padding.length; i++) {
                padding[i] = parseInt(padding[i]) / baseSize;
            }
        }
        this.$content.css('padding', padding.join(unit + ' ') + unit);
    };

    FrontendComponentCol.prototype.updateInnerAlign = function () {
        this.$layer.attr('data-csstextalign', this.getDevice('inneralign'));
    }

    FrontendComponentCol.prototype.updateMaxWidth = function () {
        var value = parseInt(this.getDevice('maxwidth'));
        if (value <= 0 || isNaN(value)) {
            this.$layer.css('maxWidth', '')
                .removeClass('n2-ss-has-maxwidth');
        } else {
            this.$layer.css('maxWidth', value + 'px')
                .addClass('n2-ss-has-maxwidth');
        }
    };

    FrontendComponentCol.prototype.getRealOrder = function () {
        var order = this.getDevice('order');
        if (order == 0) {
            return 10;
        }
        return order;
    }

    FrontendComponentCol.prototype.updateOrder = function () {
        var order = this.getDevice('order');

        if (order == 0) {
            this.$layer.css('order', '');
        } else {
            this.$layer.css('order', order);
        }
    }

    FrontendComponentCol.prototype.getContents = function () {
        return this.$content;
    }

    return FrontendComponentCol;
});
N2Require('FrontendComponentContent', ['FrontendComponent'], [], function ($, scope, undefined) {
    function FrontendComponentContent(slide, parent, $el) {

        this.$content = $el.find('> .n2-ss-section-main-content');

        scope.FrontendComponent.prototype.constructor.call(this, slide, parent, $el, this.$content.find('> .n2-ss-layer'));
    }

    FrontendComponentContent.prototype = Object.create(scope.FrontendComponent.prototype);
    FrontendComponentContent.prototype.constructor = FrontendComponentContent;


    FrontendComponentContent.prototype.onDeviceChange = function (device) {
        scope.FrontendComponent.prototype.onDeviceChange.apply(this, arguments);

        this.updatePadding();
        this.updateInnerAlign();
        this.updateMaxWidth();
        this.updateSelfAlign();
    }

    FrontendComponentContent.prototype.updatePadding = function () {
        var padding = this.getDevice('padding').split('|*|'),
            unit = padding.pop(),
            baseSize = this.baseSize;

        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < padding.length; i++) {
                padding[i] = parseInt(padding[i]) / baseSize;
            }
        }
        this.$content.css('padding', padding.join(unit + ' ') + unit);
    };

    FrontendComponentContent.prototype.updateInnerAlign = function () {
        this.$layer.attr('data-csstextalign', this.getDevice('inneralign'));
    }

    FrontendComponentContent.prototype.updateMaxWidth = function () {
        var value = parseInt(this.getDevice('maxwidth'));
        if (value <= 0 || isNaN(value)) {
            this.$layer.css('maxWidth', '')
                .removeClass('n2-ss-has-maxwidth');
        } else {
            this.$layer.css('maxWidth', value + 'px')
                .addClass('n2-ss-has-maxwidth');
        }
    };

    FrontendComponentContent.prototype.updateSelfAlign = function () {
        this.$layer.attr('data-cssselfalign', this.getDevice('selfalign'));
    }

    FrontendComponentContent.prototype.getContents = function () {
        return this.$content;
    }

    return FrontendComponentContent;
});
N2Require('FrontendComponentLayer', ['FrontendComponent'], [], function ($, scope, undefined) {
    function FrontendComponentLayer(slide, parent, $el) {
        scope.FrontendComponent.prototype.constructor.call(this, slide, parent, $el);

        if (this.wraps.mask !== undefined) {
            this.$item = this.wraps.mask.children();
        } else if (this.wraps.parallax !== undefined) {
            this.$item = this.wraps.parallax.children();
        } else {
            this.$item = $el.children();
        }
    }

    FrontendComponentLayer.prototype = Object.create(scope.FrontendComponent.prototype);
    FrontendComponentLayer.prototype.constructor = FrontendComponentLayer;

    FrontendComponentLayer.prototype.getContents = function () {
        return this.$item;
    }

    return FrontendComponentLayer;
});
N2Require('FrontendComponentRow', ['FrontendComponent'], [], function ($, scope, undefined) {
    function FrontendComponentRow(slide, parent, $el) {

        this.$row = $el.find('.n2-ss-layer-row:first');
        scope.FrontendComponent.prototype.constructor.call(this, slide, parent, $el, this.$row.find('> .n2-ss-layer'));
    }

    FrontendComponentRow.prototype = Object.create(scope.FrontendComponent.prototype);
    FrontendComponentRow.prototype.constructor = FrontendComponentRow;


    FrontendComponentRow.prototype.onDeviceChange = function (device) {
        scope.FrontendComponent.prototype.onDeviceChange.apply(this, arguments);

        this.updatePadding();
        this.updateGutter();
        this.updateInnerAlign();
    }

    FrontendComponentRow.prototype.onAfterDeviceChange = function (device) {
        this.updateWrapAfter();
    }

    FrontendComponentRow.prototype.updatePadding = function () {
        var padding = this.getDevice('padding').split('|*|'),
            unit = padding.pop(),
            baseSize = this.baseSize;

        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < padding.length; i++) {
                padding[i] = parseInt(padding[i]) / baseSize;
            }
        }
        this.$row.css('padding', padding.join(unit + ' ') + unit);
    };

    FrontendComponentRow.prototype.updateInnerAlign = function () {
        this.$layer.attr('data-csstextalign', this.getDevice('inneralign'));
    }

    FrontendComponentRow.prototype.updateGutter = function () {
        var gutterValue = this.getDevice('gutter') + 'px';
        if (this.children.length > 0) {
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i].$layer
                    .css('marginRight', gutterValue)
                    .css('marginTop', gutterValue);
            }
        }
    }

    FrontendComponentRow.prototype.getSortedColumns = function () {
        var columns = $.extend([], this.children).sort(function (a, b) {
            return a.getRealOrder() - b.getRealOrder();
        });

        for (var i = columns.length - 1; i >= 0; i--) {

            if (!columns[i].isVisible) {
                columns.splice(i, 1);
            }
        }

        return columns;
    }

    FrontendComponentRow.prototype.updateWrapAfter = function () {
        var wrapAfter = parseInt(this.getDevice('wrapafter')),
            columns = this.getSortedColumns(),
            length = columns.length,
            isWrapped = false;

        if (length == 0) {
            return false;
        }

        if (wrapAfter > 0 && wrapAfter < length) {
            isWrapped = true;
        }

        this.$row.find('> .n2-ss-row-break').remove();

        this.$row.toggleClass('n2-ss-row-wrapped', isWrapped);
        if (isWrapped) {
            for (var i = 0; i < length; i++) {
                var row = parseInt(i / wrapAfter);
                columns[i].$layer.attr('data-r', row);
                if ((i + 1) % wrapAfter == 0 || i == length - 1) {
                    columns[i].$layer.addClass('n2-ss-last-in-row');
                    var order = columns[i].getDevice('order');
                    if (order == 0) order = 10;
                    $('<div class="n2-ss-row-break"/>')
                        .css('order', order)
                        .insertAfter(columns[i].$layer), columns[i].$layer;
                } else {
                    columns[i].$layer.removeClass('n2-ss-last-in-row');
                }
            }
        } else {
            for (var i = 0; i < length; i++) {
                columns[i].$layer
                    .removeClass('n2-ss-last-in-row')
                    .attr('data-r', 0);
            }
            columns[length - 1].$layer.addClass('n2-ss-last-in-row');
        }
    }

    FrontendComponentRow.prototype.getContents = function () {
        return this.$row;
    }

    return FrontendComponentRow;
});
N2Require('SmartSliderResponsive', [], [], function ($, scope, undefined) {

    var isTablet = null,
        isMobile = null;

    function SmartSliderResponsive(slider, parameters) {
        this.disableTransitions = false;
        this.disableTransitionsTimeout = null;
        this.lastClientHeight = 0;
        this.lastOrientation = 0;

        this.invalidateResponsiveState = true;

        this.parameters = $.extend({
            desktop: 1,
            tablet: 1,
            mobile: 1,

            onResizeEnabled: true,
            type: 'auto',
            downscale: true,
            upscale: false,
            constrainRatio: true,
            minimumHeight: 0,
            maximumHeight: 0,
            minimumHeightRatio: 0,
            maximumHeightRatio: {
                desktopLandscape: 0,
                desktopPortrait: 0,
                mobileLandscape: 0,
                mobilePortrait: 0,
                tabletLandscape: 0,
                tabletPortrait: 0
            },
            maximumSlideWidth: 0,
            maximumSlideWidthLandscape: 0,
            maximumSlideWidthRatio: -1,
            maximumSlideWidthTablet: 0,
            maximumSlideWidthTabletLandscape: 0,
            maximumSlideWidthMobile: 0,
            maximumSlideWidthMobileLandscape: 0,
            maximumSlideWidthConstrainHeight: 0,
            forceFull: 0,
            forceFullHorizontalSelector: '',
            verticalOffsetSelectors: '',

            focusUser: 0,
            focusAutoplay: 0,

            deviceModes: {
                desktopLandscape: 1,
                desktopPortrait: 0,
                mobileLandscape: 0,
                mobilePortrait: 0,
                tabletLandscape: 0,
                tabletPortrait: 0
            },
            normalizedDeviceModes: {
                unknownUnknown: ["unknown", "Unknown"],
                desktopPortrait: ["desktop", "Portrait"]
            },
            verticalRatioModifiers: {
                unknownUnknown: 1,
                desktopLandscape: 1,
                desktopPortrait: 1,
                mobileLandscape: 1,
                mobilePortrait: 1,
                tabletLandscape: 1,
                tabletPortrait: 1
            },
            minimumFontSizes: {
                desktopLandscape: 0,
                desktopPortrait: 0,
                mobileLandscape: 0,
                mobilePortrait: 0,
                tabletLandscape: 0,
                tabletPortrait: 0
            },
            ratioToDevice: {
                Portrait: {
                    tablet: 0,
                    mobile: 0
                },
                Landscape: {
                    tablet: 0,
                    mobile: 0
                }
            },
            sliderWidthToDevice: {
                desktopLandscape: 0,
                desktopPortrait: 0,
                mobileLandscape: 0,
                mobilePortrait: 0,
                tabletLandscape: 0,
                tabletPortrait: 0
            },

            basedOn: 'combined',
            desktopPortraitScreenWidth: 1200,
            tabletPortraitScreenWidth: 800,
            mobilePortraitScreenWidth: 440,
            tabletLandscapeScreenWidth: 1024,
            mobileLandscapeScreenWidth: 740,
            orientationMode: 'width_and_height',
            scrollFix: 0,
            overflowHiddenPage: 0
        }, parameters);

        if (slider.isAdmin) {
            this.doResize = NextendThrottle(this.doResize, 50);
        }

        this.loadDeferred = $.Deferred();

        this.slider = slider;
        this.sliderElement = slider.sliderElement;
    }

    SmartSliderResponsive.OrientationMode = {
        SCREEN: 0,
        ADMIN_LANDSCAPE: 1,
        ADMIN_PORTRAIT: 2,
        SCREEN_WIDTH_ONLY: 3
    };
    SmartSliderResponsive.DeviceOrientation = {
        UNKNOWN: 0,
        LANDSCAPE: 1,
        PORTRAIT: 2
    };
    SmartSliderResponsive._DeviceOrientation = {
        0: 'Unknown',
        1: 'Landscape',
        2: 'Portrait'
    };
    SmartSliderResponsive.DeviceMode = {
        UNKNOWN: 0,
        DESKTOP: 1,
        TABLET: 2,
        MOBILE: 3
    };
    SmartSliderResponsive._DeviceMode = {
        0: 'unknown',
        1: 'desktop',
        2: 'tablet',
        3: 'mobile'
    };

    SmartSliderResponsive.prototype.start = function () {

        if (nextend.fontsDeferred == undefined) {
            nextend.loadDeferred.always($.proxy(function () {
                this.loadDeferred.resolve();
            }, this));
        } else {
            nextend.fontsDeferred.always($.proxy(function () {
                this.loadDeferred.resolve();
            }, this));
        }


        this.normalizeTimeout = null;
        this.delayedResizeAdded = false;

        this.deviceMode = SmartSliderResponsive.DeviceMode.UNKNOWN;
        this.orientationMode = SmartSliderResponsive.OrientationMode.SCREEN;
        this.orientation = SmartSliderResponsive.DeviceOrientation.UNKNOWN;
        this.lastRatios = {
            ratio: -1
        };
        this.lastRawRatios = {
            ratio: -1
        };
        this.normalizedMode = 'unknownUnknown';

        this.widgetMargins = {
            Top: [],
            Right: [],
            Bottom: [],
            Left: []
        };
        this.staticSizes = {
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
        };
        this.enabledWidgetMargins = [];


        this.alignElement = this.slider.sliderElement.closest('.n2-ss-align');

        var ready = this.ready = $.Deferred();

        this.sliderElement.triggerHandler('SliderResponsiveStarted');

        this.sliderElement.one('SliderResize', function () {
            ready.resolve();
        });

        this.containerElementPadding = this.sliderElement.parent();
        this.containerElement = this.containerElementPadding.parent();


        if (!this.slider.isAdmin && this.parameters.overflowHiddenPage) {
            $('html, body').css('overflow', 'hidden');
        }

        if (this.parameters.orientationMode == 'width') {
            this.orientationMode = SmartSliderResponsive.OrientationMode.SCREEN_WIDTH_ONLY;
        }

        nextend.smallestZoom = Math.min(Math.max(this.parameters.sliderWidthToDevice.mobilePortrait, 120), 320);

        switch (this.parameters.basedOn) {
            case 'screen':
                break;
            default:
                if (isTablet == null) {
                    var md = new MobileDetect(window.navigator.userAgent, 801);
                    isTablet = !!md.tablet();
                    isMobile = !!md.phone();
                }
        }

        if (!this.slider.isAdmin) {
            if (!this.parameters.desktop || !this.parameters.tablet || !this.parameters.mobile) {
                if (isTablet == null) {
                    var md = new MobileDetect(window.navigator.userAgent, 801);
                    isTablet = !!md.tablet();
                    isMobile = !!md.phone();
                }
                if (!this.parameters.mobile && isMobile || !this.parameters.tablet && isTablet || !this.parameters.desktop && !isTablet && !isMobile) {
                    this.slider.kill();
                    return;
                }
            }
        }
        this.verticalOffsetSelectors = $(this.parameters.verticalOffsetSelectors);

        n2c.log('Responsive: Store defaults');
        this.storeDefaults();

        if (this.parameters.minimumHeight > 0) {
            this.parameters.minimumHeightRatio = this.parameters.minimumHeight / this.responsiveDimensions.startHeight;
        }

        if (this.parameters.maximumHeight > 0 && this.parameters.maximumHeight >= this.parameters.minimumHeight) {
            this.parameters.maximumHeightRatio = {
                desktopPortrait: this.parameters.maximumHeight / this.responsiveDimensions.startHeight
            };
            this.parameters.maximumHeightRatio.desktopLandscape = this.parameters.maximumHeightRatio.desktopPortrait;
            this.parameters.maximumHeightRatio.tabletPortrait = this.parameters.maximumHeightRatio.desktopPortrait;
            this.parameters.maximumHeightRatio.tabletLandscape = this.parameters.maximumHeightRatio.desktopPortrait;
            this.parameters.maximumHeightRatio.mobilePortrait = this.parameters.maximumHeightRatio.desktopPortrait;
            this.parameters.maximumHeightRatio.mobileLandscape = this.parameters.maximumHeightRatio.desktopPortrait;
        }
        if (this.parameters.maximumSlideWidth > 0) {
            this.parameters.maximumSlideWidthRatio = {
                desktopPortrait: this.parameters.maximumSlideWidth / this.responsiveDimensions.startSlideWidth,
                desktopLandscape: this.parameters.maximumSlideWidthLandscape / this.responsiveDimensions.startSlideWidth,
                tabletPortrait: this.parameters.maximumSlideWidthTablet / this.responsiveDimensions.startSlideWidth,
                tabletLandscape: this.parameters.maximumSlideWidthTabletLandscape / this.responsiveDimensions.startSlideWidth,
                mobilePortrait: this.parameters.maximumSlideWidthMobile / this.responsiveDimensions.startSlideWidth,
                mobileLandscape: this.parameters.maximumSlideWidthMobileLandscape / this.responsiveDimensions.startSlideWidth
            };

            if (this.parameters.maximumSlideWidthConstrainHeight) {
                this.parameters.maximumHeightRatio = $.extend({}, this.parameters.maximumSlideWidthRatio);
                for (var k in this.parameters.maximumHeightRatio) {
                    this.parameters.maximumHeightRatio[k] *= this.parameters.verticalRatioModifiers[k];
                }
            }
        }

        n2c.log('Responsive: First resize');
        if (typeof nextend !== 'undefined' && typeof nextend['ssBeforeResponsive'] !== 'undefined') {
            nextend['ssBeforeResponsive'].call(this);
        }

        this.onResize();
        if (this.parameters.onResizeEnabled || this.parameters.type == 'adaptive') {
            $(window).on({
                resize: $.proxy(this.onResize, this),
                orientationchange: $.proxy(this.onResize, this)
            });

            this.sliderElement.on('SliderInternalResize', $.proxy(this.onResize, this));

            if (this.parameters.scrollFix) {
                try {
                    var that = this,
                        iframe = $('<iframe sandbox="allow-same-origin allow-scripts" style="height: 0; background-color: transparent; margin: 0; padding: 0; overflow: hidden; border-width: 0; position: absolute; width: 100%;"/>')
                            .on('load', function (e) {
                                $(e.target.contentWindow ? e.target.contentWindow : e.target.contentDocument.defaultView).on('resize', function () {
                                    that.sliderElement.triggerHandler('SliderInternalResize');
                                });
                            }).insertBefore(this.containerElement);
                } catch (e) {
                }
            }
        }
    };

    SmartSliderResponsive.prototype.getOuterWidth = function () {
        return this.responsiveDimensions.startSliderWidth + this.responsiveDimensions.startSliderMarginLeft + this.responsiveDimensions.startSliderMarginRight;
    };

    SmartSliderResponsive.prototype.storeDefaults = function () {

        // We should use outerWidth(true) as we need proper margin calculation for the ratio
        this.responsiveDimensions = {
            startWidth: this.sliderElement.outerWidth(true),
            startHeight: this.sliderElement.outerHeight(true)
        };

        /**
         * @type {SmartSliderResponsiveElement[]}
         */
        this.horizontalElements = [];
        this.verticalElements = [];

        this.init();

        this.margins = {
            top: this.responsiveDimensions.startSliderMarginTop,
            right: this.responsiveDimensions.startSliderMarginRight,
            bottom: this.responsiveDimensions.startSliderMarginBottom,
            left: this.responsiveDimensions.startSliderMarginLeft
        }
    };

    SmartSliderResponsive.prototype.addHorizontalElement = function (element, cssproperties, ratioName, name) {
        ratioName = ratioName || 'ratio';

        var responsiveElement = new scope.SmartSliderResponsiveElement(this, ratioName, element, cssproperties, name);
        this.horizontalElements.push(responsiveElement);
        return responsiveElement;
    };

    SmartSliderResponsive.prototype.addVerticalElement = function (element, cssproperties, ratioName, name) {
        ratioName = ratioName || 'ratio';

        var responsiveElement = new scope.SmartSliderResponsiveElement(this, ratioName, element, cssproperties, name);
        this.verticalElements.push(responsiveElement);
        return responsiveElement;
    };

    SmartSliderResponsive.prototype.resizeHorizontalElements = function (ratios) {
        for (var i = 0; i < this.horizontalElements.length; i++) {
            var responsiveElement = this.horizontalElements[i];
            if (typeof ratios[responsiveElement.ratioName] === 'undefined') {
                console.log('error with ' + responsiveElement.ratioName);
            }
            responsiveElement.resize(this.responsiveDimensions, ratios[responsiveElement.ratioName], false, 0);
        }
    };

    SmartSliderResponsive.prototype.updateVerticalRatios = function (ratios) {

        return ratios;
    };

    SmartSliderResponsive.prototype._updateVerticalRatios = function (ratios) {

        var targetHeight = this.responsiveDimensions.startSlideHeight * ratios.slideH,
            hasMainContent = false;
        this.sliderElement.find('.n2-ss-section-main-content')
            .addClass('n2-ss-section-main-content-calc')
            .each(function (i, el) {
                var height = $(el).outerHeight();
                if (height > targetHeight) {
                    hasMainContent = true;
                    targetHeight = height;
                }
            }).removeClass('n2-ss-section-main-content-calc');
        if (hasMainContent) {
            ratios.slideH = targetHeight / this.responsiveDimensions.startSlideHeight;
            ratios.h = Math.max(ratios.h, ratios.slideH);
        }

        return ratios;
    };

    SmartSliderResponsive.prototype.resizeVerticalElements = function (ratios, timeline, duration) {

        for (var i = 0; i < this.verticalElements.length; i++) {
            var responsiveElement = this.verticalElements[i];
            if (typeof ratios[responsiveElement.ratioName] === 'undefined') {
                console.log('error with ' + responsiveElement.ratioName);
            }
            responsiveElement.resize(this.responsiveDimensions, ratios[responsiveElement.ratioName], timeline, duration);
        }
    };

    SmartSliderResponsive.prototype.getDeviceMode = function () {
        return SmartSliderResponsive._DeviceMode[this.deviceMode];
    };

    SmartSliderResponsive.prototype.getDeviceModeOrientation = function () {
        return SmartSliderResponsive._DeviceMode[this.deviceMode] + SmartSliderResponsive._DeviceOrientation[this.orientation];
    };

    SmartSliderResponsive.prototype.onResize = function (e) {
        if (!this.slider.mainAnimation || this.slider.mainAnimation.getState() == 'ended') {
            this.doResize(e);
        } else if (!this.delayedResizeAdded) {
            this.delayedResizeAdded = true;
            this.sliderElement.on('mainAnimationComplete.responsive', $.proxy(this._doDelayedResize, this));
        }
    };

    SmartSliderResponsive.prototype._doDelayedResize = function () {
        this.doResize();
        this.delayedResizeAdded = false;
    };


    SmartSliderResponsive.prototype.doNormalizedResize = function () {
        if (this.normalizeTimeout) {
            clearTimeout(this.normalizeTimeout);
        }

        this.normalizeTimeout = setTimeout($.proxy(this.doResize, this), 10);
    };

    SmartSliderResponsive.prototype._getOrientation = function () {
        if (this.orientationMode == SmartSliderResponsive.OrientationMode.SCREEN) {
            if (window.innerHeight <= window.innerWidth) {
                return SmartSliderResponsive.DeviceOrientation.LANDSCAPE;
            } else {
                return SmartSliderResponsive.DeviceOrientation.PORTRAIT;
            }
        } else if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_PORTRAIT) {
            return SmartSliderResponsive.DeviceOrientation.PORTRAIT;
        } else if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_LANDSCAPE) {
            return SmartSliderResponsive.DeviceOrientation.LANDSCAPE;
        }
    };

    SmartSliderResponsive.prototype._getDevice = function () {
        switch (this.parameters.basedOn) {
            case 'combined':
                return this._getDeviceDevice(this._getDeviceScreenWidth());
            case 'device':
                return this._getDeviceDevice(SmartSliderResponsive.DeviceMode.DESKTOP);
            case 'screen':
                return this._getDeviceScreenWidth();
        }
    };

    SmartSliderResponsive.prototype._getDeviceScreenWidth = function () {
        var viewportWidth = window.innerWidth;
        if (this.orientation == SmartSliderResponsive.DeviceOrientation.PORTRAIT) {
            if (viewportWidth < this.parameters.mobilePortraitScreenWidth) {
                return SmartSliderResponsive.DeviceMode.MOBILE;
            } else if (viewportWidth < this.parameters.tabletPortraitScreenWidth) {
                return SmartSliderResponsive.DeviceMode.TABLET;
            }
        } else {
            if (viewportWidth < this.parameters.mobileLandscapeScreenWidth) {
                return SmartSliderResponsive.DeviceMode.MOBILE;
            } else if (viewportWidth < this.parameters.tabletLandscapeScreenWidth) {
                return SmartSliderResponsive.DeviceMode.TABLET;
            }
        }
        return SmartSliderResponsive.DeviceMode.DESKTOP;
    };

    SmartSliderResponsive.prototype._getDeviceAndOrientationByScreenWidth = function () {
        var viewportWidth = window.innerWidth;
        if (viewportWidth < this.parameters.mobilePortraitScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.MOBILE, SmartSliderResponsive.DeviceOrientation.PORTRAIT];
        } else if (viewportWidth < this.parameters.mobileLandscapeScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.MOBILE, SmartSliderResponsive.DeviceOrientation.LANDSCAPE];
        } else if (viewportWidth < this.parameters.tabletPortraitScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.TABLET, SmartSliderResponsive.DeviceOrientation.PORTRAIT];
        } else if (viewportWidth < this.parameters.tabletLandscapeScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.TABLET, SmartSliderResponsive.DeviceOrientation.LANDSCAPE];
        } else if (viewportWidth < this.parameters.desktopPortraitScreenWidth) {
            return [SmartSliderResponsive.DeviceMode.DESKTOP, SmartSliderResponsive.DeviceOrientation.PORTRAIT];
        }
        return [SmartSliderResponsive.DeviceMode.DESKTOP, SmartSliderResponsive.DeviceOrientation.LANDSCAPE];
    };

    SmartSliderResponsive.prototype._getDeviceDevice = function (device) {
        if (isMobile === true) {
            return SmartSliderResponsive.DeviceMode.MOBILE;
        } else if (isTablet && device != SmartSliderResponsive.DeviceMode.MOBILE) {
            return SmartSliderResponsive.DeviceMode.TABLET;
        }
        return device;
    };

    SmartSliderResponsive.prototype._getDeviceZoom = function (ratio) {
        var orientation;
        if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_PORTRAIT) {
            orientation = SmartSliderResponsive.DeviceOrientation.PORTRAIT;
        } else if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_LANDSCAPE) {
            orientation = SmartSliderResponsive.DeviceOrientation.LANDSCAPE;
        }
        var targetMode = SmartSliderResponsive.DeviceMode.DESKTOP;

        if (ratio - this.parameters.ratioToDevice[SmartSliderResponsive._DeviceOrientation[orientation]].mobile < 0.001) {
            targetMode = SmartSliderResponsive.DeviceMode.MOBILE;
        } else if (ratio - this.parameters.ratioToDevice[SmartSliderResponsive._DeviceOrientation[orientation]].tablet < 0.001) {
            targetMode = SmartSliderResponsive.DeviceMode.TABLET;
        }
        return targetMode;
    };

    SmartSliderResponsive.prototype.reTriggerSliderDeviceOrientation = function () {
        var normalized = this._normalizeMode(SmartSliderResponsive._DeviceMode[this.deviceMode], SmartSliderResponsive._DeviceOrientation[this.orientation]);
        this.sliderElement.trigger('SliderDeviceOrientation', {
            lastDevice: normalized[0],
            lastOrientation: normalized[1],
            device: normalized[0],
            orientation: normalized[1]
        });
    };

    SmartSliderResponsive.prototype.doResize = function (e, fixedMode, timeline, nextSlide, duration) {
        if (!this.disableTransitions) {
            this.disableTransitions = true;
            this.sliderElement.addClass('n2notransition');
            if (this.disableTransitionsTimeout) {
                clearTimeout(this.disableTransitionsTimeout);
            }
            this.disableTransitionsTimeout = setTimeout($.proxy(function () {
                this.sliderElement.removeClass('n2notransition');
                this.disableTransitions = false;
            }, this), 500);
        }

        // required to force recalculate if the thumbnails widget get hidden.
        this.refreshMargin();

        if (this.slider.parameters.align == 'center') {
            if (this.parameters.type == 'fullpage') {
                this.alignElement.css('maxWidth', 'none');
            } else {
                this.alignElement.css('maxWidth', this.responsiveDimensions.startWidth);
            }
        }

        if (!this.slider.isAdmin) {
            if (this.parameters.forceFull) {
                $('body').css('overflow-x', 'hidden');
                var customWidth = 0,
                    adjustLeftOffset = 0;

                if (this.parameters.forceFullHorizontalSelector != '') {
                    var $fullWidthTo = this.sliderElement.closest(this.parameters.forceFullHorizontalSelector);
                    if ($fullWidthTo && $fullWidthTo.length > 0) {
                        customWidth = $fullWidthTo.width();
                        adjustLeftOffset = $fullWidthTo.offset().left;
                    }
                }

                var windowWidth = customWidth > 0 ? customWidth : (document.body.clientWidth || document.documentElement.clientWidth),
                    outerEl = this.containerElement.parent(),
                    outerElBoundingRect = outerEl[0].getBoundingClientRect(),
                    outerElOffset;
                if (nextend.rtl.isRtl) {
                    outerElOffset = windowWidth - (outerElBoundingRect.left + outerEl.outerWidth());
                } else {
                    outerElOffset = outerElBoundingRect.left;
                }
                this.containerElement.css(nextend.rtl.marginLeft, -outerElOffset - parseInt(outerEl.css('paddingLeft')) - parseInt(outerEl.css('borderLeftWidth')) + adjustLeftOffset)
                    .width(windowWidth);
            }
        }

        var ratio = this.containerElementPadding.width() / this.getOuterWidth();

        var hasOrientationOrDeviceChange = false,
            lastOrientation = this.orientation,
            lastDevice = this.deviceMode,
            targetOrientation = null,
            targetMode = null;

        if (this.orientationMode == SmartSliderResponsive.OrientationMode.SCREEN_WIDTH_ONLY) {
            var deviceOrientation = this._getDeviceAndOrientationByScreenWidth();
            targetMode = deviceOrientation[0]
            targetOrientation = deviceOrientation[1];
        } else {
            targetOrientation = this._getOrientation()
        }

        if (this.orientation != targetOrientation) {
            this.orientation = targetOrientation;
            hasOrientationOrDeviceChange = true;
            n2c.log('Event: SliderOrientation', {
                lastOrientation: SmartSliderResponsive._DeviceOrientation[lastOrientation],
                orientation: SmartSliderResponsive._DeviceOrientation[targetOrientation]
            });
            this.sliderElement.trigger('SliderOrientation', {
                lastOrientation: SmartSliderResponsive._DeviceOrientation[lastOrientation],
                orientation: SmartSliderResponsive._DeviceOrientation[targetOrientation]
            });
        }

        if (!fixedMode) {
            if (this.orientationMode != SmartSliderResponsive.OrientationMode.SCREEN_WIDTH_ONLY) {
                targetMode = this._getDevice(ratio);
            }

            if (this.deviceMode != targetMode) {
                this.deviceMode = targetMode;
                this.sliderElement.removeClass('n2-ss-' + SmartSliderResponsive._DeviceMode[lastDevice])
                    .addClass('n2-ss-' + SmartSliderResponsive._DeviceMode[targetMode]);
                n2c.log('Event: SliderDevice', {
                    lastDevice: SmartSliderResponsive._DeviceMode[lastDevice],
                    device: SmartSliderResponsive._DeviceMode[targetMode]
                });
                this.sliderElement.trigger('SliderDevice', {
                    lastDevice: SmartSliderResponsive._DeviceMode[lastDevice],
                    device: SmartSliderResponsive._DeviceMode[targetMode]
                });
                hasOrientationOrDeviceChange = true;
            }
        }

        if (!this.slider.isAdmin) {
            if (this.parameters.type == 'fullpage') {
                var clientHeight = 0;
                if (window.matchMedia && (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)) {
                    var innerHeight,
                        isOrientationChanged = false;

                    if (e && e.type == 'orientationchange') {
                        isOrientationChanged = true;
                    }

                    if (n2const.isIOS) {
                        innerHeight = document.documentElement.clientHeight;
                    } else {
                        innerHeight = window.innerHeight;
                    }

                    if (window.matchMedia("(orientation: landscape)").matches) {
                        // landscape
                        clientHeight = Math.min(screen.width, innerHeight);
                        if (this.lastOrientation != 90) {
                            isOrientationChanged = true;
                            this.lastOrientation = 90;
                        }
                    } else {
                        clientHeight = Math.min(screen.height, innerHeight);
                        if (this.lastOrientation != 0) {
                            isOrientationChanged = true;
                            this.lastOrientation = 0;
                        }
                    }

                    if (!isOrientationChanged && Math.abs(clientHeight - this.lastClientHeight) < 100) {
                        clientHeight = this.lastClientHeight;
                    } else {
                        this.lastClientHeight = clientHeight;
                    }
                } else {
                    clientHeight = window.n2ClientHeight || document.documentElement.clientHeight || document.body.clientHeight;
                }
                this.parameters.maximumHeightRatio[this.getDeviceModeOrientation()] = this.parameters.minimumHeightRatio = (clientHeight - this.getVerticalOffsetHeight()) / this.responsiveDimensions.startHeight;
            }
        }

        if (hasOrientationOrDeviceChange) {
            var lastNormalized = this._normalizeMode(SmartSliderResponsive._DeviceMode[lastDevice], SmartSliderResponsive._DeviceOrientation[lastOrientation]),
                normalized = this._normalizeMode(SmartSliderResponsive._DeviceMode[this.deviceMode], SmartSliderResponsive._DeviceOrientation[this.orientation]);

            if (lastNormalized[0] != normalized[0] || lastNormalized[1] != normalized[1]) {
                this.normalizedMode = normalized[0] + normalized[1];
                n2c.log('Event: SliderDeviceOrientation', {
                    lastDevice: lastNormalized[0],
                    lastOrientation: lastNormalized[1],
                    device: normalized[0],
                    orientation: normalized[1]
                });
                this.sliderElement.trigger('SliderDeviceOrientation', {
                    lastDevice: lastNormalized[0],
                    lastOrientation: lastNormalized[1],
                    device: normalized[0],
                    orientation: normalized[1]
                });
            }
        }

        var zeroRatio = this.parameters.sliderWidthToDevice[this.normalizedMode] / this.parameters.sliderWidthToDevice.desktopPortrait;
        if (!this.parameters.downscale && ratio < zeroRatio) {
            ratio = zeroRatio;
        } else if (!this.parameters.upscale && ratio > zeroRatio) {
            ratio = zeroRatio;
        }
        this._doResize(ratio, timeline, nextSlide, duration);

        if (this.slider.parameters.align == 'center') {
            this.alignElement.css('maxWidth', this.responsiveDimensions.slider.width);
        }
    };

    SmartSliderResponsive.prototype._normalizeMode = function (device, orientation) {
        return this.parameters.normalizedDeviceModes[device + orientation];
    };

    SmartSliderResponsive.prototype.getNormalizedModeString = function () {
        var normalized = this._normalizeMode(SmartSliderResponsive._DeviceMode[this.deviceMode], SmartSliderResponsive._DeviceOrientation[this.orientation]);
        return normalized.join('');
    };

    SmartSliderResponsive.prototype.getModeString = function () {
        return SmartSliderResponsive._DeviceMode[this.deviceMode] + SmartSliderResponsive._DeviceOrientation[this.orientation];
    };

    SmartSliderResponsive.prototype.enabled = function (device, orientation) {
        return this.parameters.deviceModes[device + orientation];
    };

    SmartSliderResponsive.prototype._doResize = function (ratio, timeline, nextSlide, duration) {
        var ratios = {
            ratio: ratio,
            w: ratio,
            h: ratio,
            slideW: ratio,
            slideH: ratio,
            fontRatio: 1
        };

        this._buildRatios(ratios, this.slider.parameters.dynamicHeight, nextSlide);

        ratios.fontRatio = ratios.slideW;


        var isChanged = false;
        for (var k in ratios) {
            if (ratios[k] != this.lastRawRatios[k]) {
                isChanged = true;
                break;
            }
        }
        if (this.invalidateResponsiveState || isChanged) {
            this.lastRawRatios = $.extend({}, ratios);

            this.resizeHorizontalElements(ratios);

            this.finishResize(ratios, timeline, duration);
        }
    };

    SmartSliderResponsive.prototype.finishResize = function (ratios, timeline, duration) {
        this.loadDeferred.done($.proxy(function () {
            var cb = $.proxy(function () {
                this.finishResize = this._finishResize;
                this.finishResize(ratios, timeline, duration);
            }, this);
            if ((/OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor)) || /CriOS/.exec(window.navigator.userAgent)) {
                setTimeout(cb, 200);
            } else {
                cb();
            }


        }, this));

        this.invalidateResponsiveState = false;
    }

    SmartSliderResponsive.prototype._finishResize = function (ratios, timeline, duration) {
        this.invalidateResponsiveState = false;

        ratios = this.updateVerticalRatios(ratios);

        this.resizeVerticalElements(ratios, timeline, duration);


        this.lastRatios = ratios;

        if (timeline) {
            this.sliderElement.trigger('SliderAnimatedResize', [ratios, timeline, duration]);
            timeline.eventCallback("onComplete", function () {
                this.triggerResize(ratios, timeline);
            }, [], this);
        } else {
            this.triggerResize(ratios, false);
        }

    };

    /**
     * Admin only
     */
    SmartSliderResponsive.prototype.doVerticalResize = function () {

        var ratios = this.updateVerticalRatios($.extend({}, this.lastRawRatios)),
            isChanged = false;
        for (var k in ratios) {
            if (ratios[k] != this.lastRatios[k]) {
                isChanged = true;
                break;
            }
        }

        if (isChanged) {
            this.finishVerticalResize(ratios);
        }
    };

    SmartSliderResponsive.prototype.finishVerticalResize = function (ratios) {
        this.loadDeferred.done($.proxy(function () {
            this.finishVerticalResize = this._finishVerticalResize;
            this.finishVerticalResize(ratios);
        }, this));
    };

    SmartSliderResponsive.prototype._finishVerticalResize = function (ratios) {
        this.resizeVerticalElements(ratios, false, 0);

        this.lastRatios = ratios;
        this.triggerResize(ratios, false);

    };

    SmartSliderResponsive.prototype.triggerResize = function (ratios, timeline) {
        n2c.log('Event: SliderResize', ratios);
        this.sliderElement.trigger('SliderResize', [ratios, this, timeline]);
    };

    SmartSliderResponsive.prototype._buildRatios = function (ratios, dynamicHeight, nextSlide) {

        var deviceModeOrientation = this.getDeviceModeOrientation();

        if (this.parameters.maximumSlideWidthRatio[deviceModeOrientation] > 0 && ratios.slideW > this.parameters.maximumSlideWidthRatio[deviceModeOrientation]) {
            ratios.slideW = this.parameters.maximumSlideWidthRatio[deviceModeOrientation];
        }

        ratios.slideW = ratios.slideH = Math.min(ratios.slideW, ratios.slideH);

        var verticalRatioModifier = this.parameters.verticalRatioModifiers[deviceModeOrientation];
        ratios.slideH *= verticalRatioModifier;

        if (this.parameters.type == 'fullpage') {
            ratios.h *= verticalRatioModifier;

            if (this.parameters.minimumHeightRatio > 0) {
                ratios.h = Math.max(ratios.h, this.parameters.minimumHeightRatio);
            }

            if (this.parameters.maximumHeightRatio[deviceModeOrientation] > 0) {
                ratios.h = Math.min(ratios.h, this.parameters.maximumHeightRatio[deviceModeOrientation]);
            }

            if (this.slider.isAdmin) {
                if (!this.parameters.constrainRatio) {
                    ratios.w = ratios.slideW;
                    ratios.h = ratios.slideH;
                } else {
                    ratios.slideH = Math.min(ratios.slideH, ratios.h);
                    ratios.slideH = ratios.slideW = Math.min(ratios.slideW, ratios.slideH);
                }
            } else {
                if (!this.parameters.constrainRatio) {
                    ratios.slideW = ratios.w;
                    if (this.parameters.maximumSlideWidthRatio[deviceModeOrientation] > 0 && ratios.slideW > this.parameters.maximumSlideWidthRatio[deviceModeOrientation]) {
                        ratios.slideW = this.parameters.maximumSlideWidthRatio[deviceModeOrientation];
                    }
                    ratios.slideH = ratios.h;
                } else {
                    ratios.slideH = Math.min(ratios.slideH, ratios.h);
                    ratios.slideH = ratios.slideW = Math.min(ratios.slideW, ratios.slideH);
                }
            }
        } else {
            ratios.h *= verticalRatioModifier;

            if (this.parameters.minimumHeightRatio > 0) {
                ratios.h = Math.max(ratios.h, this.parameters.minimumHeightRatio);
            }

            if (this.parameters.maximumHeightRatio[deviceModeOrientation] > 0) {
                ratios.h = Math.min(ratios.h, this.parameters.maximumHeightRatio[deviceModeOrientation]);
            }

            ratios.slideH = Math.min(ratios.slideH, ratios.h);
            ratios.slideW = ratios.slideH / verticalRatioModifier;

            if (this.slider.type == "showcase") {
                ratios.slideW = Math.min(ratios.slideW, ratios.w);
                ratios.slideH = Math.min(ratios.slideW, ratios.slideH);
            }

            if (dynamicHeight) {

                /** @type {SmartSliderBackgroundImage} */
                var backgroundImage = this.slider.currentSlide.backgroundImage;
                if (typeof nextSlide !== 'undefined') {
                    backgroundImage = nextSlide.backgroundImage;
                }

                if (backgroundImage.width > 0 && backgroundImage.height > 0) {
                    var backgroundRatioModifier = (this.responsiveDimensions.startSlideWidth / backgroundImage.width) * ( backgroundImage.height / this.responsiveDimensions.startSlideHeight);
                    if (backgroundRatioModifier != -1) {
                        ratios.slideH *= backgroundRatioModifier;
                        ratios.h *= backgroundRatioModifier;
                    }
                }
            }
        }

        this.sliderElement.triggerHandler('responsiveBuildRatios', [ratios]);
    };

    SmartSliderResponsive.prototype.setOrientation = function (newOrientation) {
        if (newOrientation == 'portrait') {
            this.orientationMode = SmartSliderResponsive.OrientationMode.ADMIN_PORTRAIT;
        } else if (newOrientation == 'landscape') {
            this.orientationMode = SmartSliderResponsive.OrientationMode.ADMIN_LANDSCAPE;
        }
    };

    SmartSliderResponsive.prototype.setMode = function (newMode, responsive) {
        var orientation;
        if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_PORTRAIT) {
            orientation = SmartSliderResponsive.DeviceOrientation.PORTRAIT;
        } else if (this.orientationMode == SmartSliderResponsive.OrientationMode.ADMIN_LANDSCAPE) {
            orientation = SmartSliderResponsive.DeviceOrientation.LANDSCAPE;
        }
        if (this == responsive) {
            var width = this.parameters.sliderWidthToDevice[newMode + SmartSliderResponsive._DeviceOrientation[orientation]];
            //width = nextend.smallestZoom + (((this.parameters.sliderWidthToDevice['desktopPortrait'] - nextend.smallestZoom)) / 50) * Math.floor((width - nextend.smallestZoom) / (((this.parameters.sliderWidthToDevice['desktopPortrait'] - nextend.smallestZoom)) / 50));

            if (newMode == 'mobile') {
                switch (SmartSliderResponsive._DeviceOrientation[orientation]) {
                    case 'Portrait':
                        width = Math.max(nextend.smallestZoom, 320);
                        break;
                }
            }

            this.setSize(width);
        }
    };

    SmartSliderResponsive.prototype.setSize = function (targetWidth) {
        this.containerElement.width(targetWidth);

        this.doResize();
    };

    SmartSliderResponsive.prototype.getVerticalOffsetHeight = function () {
        var h = 0;
        for (var i = 0; i < this.verticalOffsetSelectors.length; i++) {
            h += this.verticalOffsetSelectors.eq(i).outerHeight();
        }
        return h;
    };

    SmartSliderResponsive.prototype.addMargin = function (side, widget) {
        this.widgetMargins[side].push(widget);
        if (widget.isVisible()) {
            this._addMarginSize(side, widget.getSize());
            this.enabledWidgetMargins.push(widget);
        }
        this.doNormalizedResize();
    };

    SmartSliderResponsive.prototype.addStaticMargin = function (side, widget) {
        if (side == 'Bottom' || side == 'Top') return;

        if (!this.widgetStaticMargins) {
            this.widgetStaticMargins = {
                Top: [],
                Right: [],
                Bottom: [],
                Left: []
            };
        }
        this.widgetStaticMargins[side].push(widget);
        this.doNormalizedResize();
    };

    SmartSliderResponsive.prototype.refreshMargin = function () {
        for (var side in this.widgetMargins) {
            var widgets = this.widgetMargins[side];
            for (var i = widgets.length - 1; i >= 0; i--) {
                var widget = widgets[i];
                if (widget.isVisible()) {
                    if ($.inArray(widget, this.enabledWidgetMargins) == -1) {
                        this._addMarginSize(side, widget.getSize());
                        this.enabledWidgetMargins.push(widget);
                    }
                } else {
                    var index = $.inArray(widget, this.enabledWidgetMargins);
                    if (index != -1) {
                        this._addMarginSize(side, -widget.getSize());
                        this.enabledWidgetMargins.splice(index, 1);
                    }
                }
            }
        }
        this.refreshStaticSizes();
    };

    SmartSliderResponsive.prototype.refreshStaticSizes = function () {
        if (this.widgetStaticMargins) {
            var staticSizes = {
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0
            };
            for (var side in this.widgetStaticMargins) {
                var widgets = this.widgetStaticMargins[side];
                for (var i = widgets.length - 1; i >= 0; i--) {
                    var widget = widgets[i];
                    if (widget.isVisible()) {
                        staticSizes['padding' + side] += widget.getSize();
                    }
                }
            }
            for (var k in staticSizes) {
                this.containerElementPadding.css(staticSizes);
            }
            this.staticSizes = staticSizes;
        }
    };

    SmartSliderResponsive.prototype._addMarginSize = function (side, size) {
        var axis = null;
        switch (side) {
            case 'Top':
            case 'Bottom':
                axis = this._sliderVertical;
                break;
            default:
                axis = this._sliderHorizontal;
        }
        axis.data['margin' + side] += size;
        this.responsiveDimensions['startSliderMargin' + side] += size;
    };

    return SmartSliderResponsive;
});
N2Require('SmartSliderResponsiveElement', [], [], function ($, scope, undefined) {

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * @constructor
     * @param responsive {SmartSliderResponsive} caller object
     * @param ratioName {String}
     * @param element {jQuery}
     * @param cssProperties {Array} Array of properties which will be responsive
     * @param name {String} we will register the changed values for this namespace in the global NextendSmartSliderResponsive objects' responsiveDimensions property
     */
    function SmartSliderResponsiveElement(responsive, ratioName, element, cssProperties, name) {
        this._lastRatio = 1;
        this.responsive = responsive;

        this.ratioName = ratioName;

        this.element = element;

        this._readyDeferred = $.Deferred();

        if (typeof name !== 'undefined') {
            this.name = name;
        } else {
            this.name = null;
        }

        this.data = {};

        this.helper = {
            /**
             * Holds the current element's parent element, which is required for the centered mode
             */
            parent: null,
            /**
             * Holds the current element's parent original width and height for images
             */
            parentProps: null,
            /**
             * If font size is enabled for the current element, this will hold the different font sized for the different devices
             */
            fontSize: false,
            /**
             * If this is enabled, the responsive mode will try to position the actual element into the center of the parent element
             */
            centered: false
        };

        this._lateInit(cssProperties);
    };

    SmartSliderResponsiveElement.prototype._lateInit = function (cssProperties) {

        this._cssProperties = cssProperties;

        this.reloadDefault();

        /**
         * If font-size is responsive on the element, we init this feature on the element.
         */
        if ($.inArray('fontSize', cssProperties) != -1) {

            this.data['fontSize'] = this.element.data('fontsize');

            this.helper.fontSize = {
                fontSize: this.element.data('fontsize'),
                desktopPortrait: this.element.data('minfontsizedesktopportrait'),
                desktopLandscape: this.element.data('minfontsizedesktoplandscape'),
                tabletPortrait: this.element.data('minfontsizetabletportrait'),
                tabletLandscape: this.element.data('minfontsizetabletlandscape'),
                mobilePortrait: this.element.data('minfontsizemobileportrait'),
                mobileLandscape: this.element.data('minfontsizemobilelandscape')
            };

            // Sets the proper font size for the current mode
            //this.setFontSizeByMode(this.responsive.mode.mode);

            // When the mode changes we have to adjust the original font size value in the data
            this.responsive.sliderElement.on('SliderDeviceOrientation', $.proxy(this.onModeChange, this));
        }

        // Our resource is finished with the loading, so we can enable the normal resize method.
        this.resize = this._resize;

        // We are ready
        this._readyDeferred.resolve();
    };

    SmartSliderResponsiveElement.prototype.reloadDefault = function () {

        for (var i = 0; i < this._cssProperties.length; i++) {
            var propName = this._cssProperties[i];
            this.data[propName] = parseInt(this.element.css(propName));
        }
        if (this.name) {
            var d = this.responsive.responsiveDimensions;
            for (var k in this.data) {
                d['start' + capitalize(this.name) + capitalize(k)] = this.data[k];
            }
        }
    };

    /**
     * You can use it as the normal jQuery ready, except it check for the current element list
     * @param {function} fn
     */
    SmartSliderResponsiveElement.prototype.ready = function (fn) {
        this._readyDeferred.done(fn);
    };

    /**
     * When the element list is not loaded yet, we have to add the current resize call to the ready event.
     * @example You have an image which is not loaded yet, but a resize happens on the browser. We have to make the resize later when the image is ready!
     * @param responsiveDimensions
     * @param ratio
     */
    SmartSliderResponsiveElement.prototype.resize = function (responsiveDimensions, ratio) {
        this.ready($.proxy(this.resize, this, responsiveDimensions, ratio));
        this._lastRatio = ratio;
    };

    SmartSliderResponsiveElement.prototype._resize = function (responsiveDimensions, ratio, timeline, duration) {
        if (this.name && typeof responsiveDimensions[this.name] === 'undefined') {
            responsiveDimensions[this.name] = {};
        }

        var to = {};
        for (var propName in this.data) {
            var value = this.data[propName] * ratio;
            if (typeof this[propName + 'Prepare'] == 'function') {
                value = this[propName + 'Prepare'](value);
            }

            if (this.name) {
                responsiveDimensions[this.name][propName] = value;
            }
            to[propName] = value;
        }
        if (timeline) {
            timeline.to(this.element, duration, to, 0);
        } else {
            this.element.css(to);

            if (this.helper.centered) {
                var verticalMargin = this.getVerticalMargin(parseInt((this.helper.parent.height() - this.element.height()) / 2)),
                    horizontalMargin = this.getHorizontalMargin(parseInt((this.helper.parent.width() - this.element.width()) / 2));
                this.element.css({
                    marginLeft: horizontalMargin,
                    marginRight: horizontalMargin,
                    marginTop: verticalMargin,
                    marginBottom: verticalMargin
                });
            }
        }
        this._lastRatio = ratio;
    };

    SmartSliderResponsiveElement.prototype.getHorizontalMargin = function (left) {
        return left;
    }

    SmartSliderResponsiveElement.prototype.getVerticalMargin = function (top) {
        return top;
    }

    SmartSliderResponsiveElement.prototype._refreshResize = function () {
        this.responsive.ready.done($.proxy(function () {
            this._resize(this.responsive.responsiveDimensions, this.responsive.lastRatios[this.ratioName]);
        }, this));
    };

    SmartSliderResponsiveElement.prototype.widthPrepare = function (value) {
        return Math.round(value);
    };

    SmartSliderResponsiveElement.prototype.heightPrepare = function (value) {
        return Math.round(value);
    };

    SmartSliderResponsiveElement.prototype.marginLeftPrepare = function (value) {
        return parseInt(value);
    };

    SmartSliderResponsiveElement.prototype.marginRightPrepare = function (value) {
        return parseInt(value);
    };

    SmartSliderResponsiveElement.prototype.lineHeightPrepare = function (value) {
        return value + 'px';
    };

    SmartSliderResponsiveElement.prototype.fontSizePrepare = function (value) {
        var mode = this.responsive.getNormalizedModeString();
        if (value < this.helper.fontSize[mode]) {
            return this.helper.fontSize[mode];
        }
        return value;
    };

    /**
     * Enables the centered feature on the current element.
     */
    SmartSliderResponsiveElement.prototype.setCentered = function () {
        this.helper.parent = this.element.parent();
        this.helper.centered = true;
    };
    SmartSliderResponsiveElement.prototype.unsetCentered = function () {
        this.helper.centered = false;
    };
    SmartSliderResponsiveElement.prototype.onModeChange = function () {
        this.setFontSizeByMode();
    };

    /**
     * Changes the original font size based on the current mode and also updates the current value on the element.
     * @param mode
     */
    SmartSliderResponsiveElement.prototype.setFontSizeByMode = function () {
        this.element.css('fontSize', this.fontSizePrepare(this.data['fontSize'] * this._lastRatio));
    };

    return SmartSliderResponsiveElement;
});


N2Require('FrontendItemVimeo', [], [], function ($, scope, undefined) {

    function FrontendItemVimeo(slider, id, sliderid, parameters, hasImage, start) {
        this.readyDeferred = $.Deferred();

        this.slider = slider;
        this.playerId = id;
        this.start = start;

        this.parameters = $.extend({
            vimeourl: "//vimeo.com/144598279",
            center: 0,
            autoplay: "0",
            reset: "0",
            title: "1",
            byline: "1",
            portrait: "0",
            loop: "0",
            color: "00adef",
            volume: "-1"
        }, parameters);

        if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
            this.parameters.autoplay = 0;
        }

        if (this.parameters.autoplay == 1 || !hasImage || n2const.isMobile) {
            this.ready($.proxy(this.initVimeoPlayer, this));
        } else {
            $("#" + this.playerId).on('click.vimeo n2click.vimeo', $.proxy(function (e) {
                $(e.currentTarget).off('.vimeo');
                e.preventDefault();
                e.stopPropagation();
                this.ready($.proxy(function () {
                    this.readyDeferred.done($.proxy(function () {
                        this.play();
                    }, this));
                    this.initVimeoPlayer();
                }, this));
            }, this));
        }
    };

    FrontendItemVimeo.vimeoDeferred = null;

    FrontendItemVimeo.prototype.ready = function (callback) {
        if (FrontendItemVimeo.vimeoDeferred === null) {
            FrontendItemVimeo.vimeoDeferred = $.getScript('https://player.vimeo.com/api/player.js');
        }
        FrontendItemVimeo.vimeoDeferred.done(callback);
    };

    FrontendItemVimeo.prototype.initVimeoPlayer = function () {
        var playerElement = n2('<iframe id="' + this.playerId + '_video" src="https://player.vimeo.com/video/' + this.parameters.vimeocode + '?autoplay=0&' +
            '_video&title=' + this.parameters.title + '&byline=' + this.parameters.byline + "&background=" + this.parameters.background + '&portrait=' + this.parameters.portrait + '&color=' + this.parameters.color +
            '&loop=' + this.parameters.loop + ( this.parameters.quality == '-1' ? '' : '&quality=' + this.parameters.quality ) + '" style="position: absolute; top:0; left: 0; width: 100%; height: 100%;" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
        $("#" + this.playerId).append(playerElement);

        this.isStatic = playerElement.closest('.n2-ss-static-slide').length;

        this.playerElement = playerElement;
        this.player = new Vimeo.Player(playerElement[0]);
        this.player.ready().then($.proxy(this.onReady, this));
    };

    FrontendItemVimeo.prototype.onReady = function () {
        var volume = parseFloat(this.parameters.volume);
        if (volume >= 0) {
            this.setVolume(volume);
        }

        this.slide = this.slider.findSlideByElement(this.playerElement);

        if (this.parameters.center == 1) {
            this.onResize();

            this.slider.sliderElement.on('SliderResize', $.proxy(this.onResize, this))
        }
        var layer = this.playerElement.parent().parent();

        this.player.on('play', $.proxy(function () {
            if (!this.isStatic) {
                this.slider.sliderElement.trigger('mediaStarted', this.playerId);
            }
            layer.triggerHandler('n2play');
        }, this));

        this.player.on('pause', $.proxy(function () {
            layer.triggerHandler('n2pause');
        }));

        this.player.on('ended', $.proxy(function () {
            if (!this.isStatic) {
                this.slider.sliderElement.trigger('mediaEnded', this.playerId);
            }
            layer.triggerHandler('n2stop');
        }, this));

        if (!this.isStatic) {
            //pause video when slide changed
            this.slider.sliderElement.on("mainAnimationStart", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex, isSystem) {
                if ($.inArray(this.slide, this.slider.getVisibleSlides(this.slider.slides[currentSlideIndex])) == -1) {
                    if (parseInt(this.parameters.reset)) {
                        this.reset();
                    } else {
                        this.pause();
                    }
                }
            }, this));
        }

        if (this.parameters.autoplay == 1) {
            this.slider.visible($.proxy(this.initAutoplay, this));
        }
        this.readyDeferred.resolve();
    };

    FrontendItemVimeo.prototype.onResize = function () {
        var controls = 52,
            parent = this.playerElement.parent(),
            width = parent.width() + controls,
            height = parent.height() + controls,
            aspectRatio = 16 / 9,
            css = {
                width: width,
                height: height,
                marginTop: 0
            };
        css[nextend.rtl.marginLeft] = 0;
        if (width / height > aspectRatio) {
            css.height = width * aspectRatio;
            css.marginTop = (height - css.height) / 2;
        } else {
            css.width = height * aspectRatio;
            css[nextend.rtl.marginLeft] = (width - css.width) / 2;
        }
        this.playerElement.css(css);
    };

    FrontendItemVimeo.prototype.initAutoplay = function () {

        if (!this.isStatic) {
            //change slide
            this.slider.sliderElement.on("mainAnimationComplete", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex, isSystem) {
                if ($.inArray(this.slide, this.slider.getVisibleSlides(this.slider.slides[currentSlideIndex])) >= 0) {
                    this.play();
                }
            }, this));

            if ($.inArray(this.slide, this.slider.getVisibleSlides()) >= 0) {
                this.play();
            }
        } else {
            this.play();
        }
    };

    FrontendItemVimeo.prototype.play = function () {
        this.slider.sliderElement.trigger('mediaStarted', this.playerId);
        if (this.start != 0) {
            this.player.setCurrentTime(this.start);
        }
        this.player.play();

        this.player.getCurrentTime().then($.proxy(function (seconds) {
            if (seconds < this.start && this.start != 0) {
                this.player.setCurrentTime(this.start);
            }
            this.player.play();
        }, this)).catch($.proxy(function (error) {
            this.player.play();
        }, this));
    };

    FrontendItemVimeo.prototype.pause = function () {
        this.player.pause();
    };

    FrontendItemVimeo.prototype.reset = function () {
        this.player.setCurrentTime(this.start);
    };

    FrontendItemVimeo.prototype.setVolume = function (volume) {
        this.player.setVolume(volume);
    };

    return FrontendItemVimeo;
});
N2Require('FrontendItemYouTube', [], [], function ($, scope, undefined) {

    function FrontendItemYouTube(slider, id, parameters, hasImage) {
        this.readyDeferred = $.Deferred();
        this.slider = slider;
        this.playerId = id;

        this.parameters = $.extend({
            youtubeurl: "//www.youtube.com/watch?v=MKmIwHAFjSU",
            youtubecode: "MKmIwHAFjSU",
            center: 0,
            autoplay: "1",
            theme: "dark",
            related: "1",
            vq: "default",
            volume: "-1",
            loop: 0,
            showinfo: 1,
            modestbranding: 1,
            reset: 0,
            query: []
        }, parameters);

        if (navigator.userAgent.toLowerCase().indexOf("android") > -1 || n2const.isIOS) {
            this.parameters.autoplay = 0;
        }

        if (this.parameters.autoplay == 1 || !hasImage || n2const.isMobile) {
            this.ready($.proxy(this.initYoutubePlayer, this));
        } else {
            $("#" + this.playerId).on('click.youtube n2click.youtube', $.proxy(function (e) {
                $(e.currentTarget).off('.youtube');
                e.preventDefault();
                e.stopPropagation();
                this.ready($.proxy(function () {
                    this.readyDeferred.done($.proxy(function () {
                        this.play();
                    }, this));
                    this.initYoutubePlayer();
                }, this));
            }, this));
        }
    }

    FrontendItemYouTube.YTDeferred = null;

    FrontendItemYouTube.prototype.ready = function (callback) {
        if (FrontendItemYouTube.YTDeferred === null) {
            FrontendItemYouTube.YTDeferred = $.Deferred();
            if (typeof YT === 'undefined') {
                var otherYTCB = function () {
                };
                if (typeof window.onYouTubeIframeAPIReady === 'function') {
                    otherYTCB = window.onYouTubeIframeAPIReady;
                }

                window.onYouTubeIframeAPIReady = function () {
                    FrontendItemYouTube.YTDeferred.resolve();
                    otherYTCB();
                };
                $.getScript("https://www.youtube.com/iframe_api");
            } else {
                if (YT.loaded) {
                    FrontendItemYouTube.YTDeferred.resolve();
                } else {
                    var interval = setInterval(function () {
                        if (YT.loaded) {
                            FrontendItemYouTube.YTDeferred.resolve();
                            clearInterval(interval);
                        }
                    }, 200);
                }
            }
        }
        FrontendItemYouTube.YTDeferred.done(callback);
    };


    FrontendItemYouTube.prototype.initYoutubePlayer = function () {
        var player = $("#" + this.playerId),
            layer = player.closest(".n2-ss-layer");
        this.isStatic = player.closest('.n2-ss-static-slide').length;

        var vars = {
            enablejsapi: 1,
            origin: window.location.protocol + "//" + window.location.host,
            theme: this.parameters.theme,
            wmode: "opaque",
            rel: this.parameters.related,
            vq: this.parameters.vq,
            start: this.parameters.start,
            showinfo: this.parameters.start.showinfo,
            modestbranding: this.parameters.start.modestbranding
        };

        if (this.parameters.center == 1) {
            vars.controls = 0;
            vars.showinfo = 0;
        }
        if (this.parameters.controls != 1) {
            vars.autohide = 1;
            vars.controls = 0;
            vars.showinfo = 0;
        }

        if (+(navigator.platform.toUpperCase().indexOf('MAC') >= 0 && navigator.userAgent.search("Firefox") > -1)) {
            vars.html5 = 1;
        }

        for (var k in this.parameters.query) {
            if (this.parameters.query.hasOwnProperty(k)) {
                vars[k] = this.parameters.query[k];
            }
        }

        this.player = new YT.Player(this.playerId, {
            videoId: this.parameters.youtubecode,
            wmode: 'opaque',
            playerVars: vars,
            events: {
                onReady: $.proxy(this.onReady, this),
                onStateChange: $.proxy(function (state) {
                    switch (state.data) {
                        case YT.PlayerState.PLAYING:
                            if (!this.isStatic) {
                                this.slider.sliderElement.trigger('mediaStarted', this.playerId);
                            }
                            layer.triggerHandler('n2play');
                            break;
                        case YT.PlayerState.PAUSED:
                            layer.triggerHandler('n2pause');
                            break;
                        case YT.PlayerState.ENDED:
                            if (this.parameters.loop == 1) {
                                this.player.seekTo(0);
                                this.player.playVideo();
                            } else {
                                if (!this.isStatic) {
                                    this.slider.sliderElement.trigger('mediaEnded', this.playerId);
                                }
                                layer.triggerHandler('n2stop');
                            }
                            break;

                    }
                }, this)
            }
        });

        this.playerElement = $("#" + this.playerId);

        this.slide = this.slider.findSlideByElement(this.playerElement);
        if (this.parameters.center == 1) {
            this.playerElement.parent().css('overflow', 'hidden');

            this.onResize();

            this.slider.sliderElement.on('SliderResize', $.proxy(this.onResize, this))
        }

    };

    FrontendItemYouTube.prototype.onReady = function () {

        var volume = parseFloat(this.parameters.volume);
        if (volume >= 0) {
            this.setVolume(volume);
        }

        if (this.parameters.autoplay == 1) {
            this.slider.visible($.proxy(this.initAutoplay, this));
        }

        if (!this.isStatic) {
            //pause video when slide changed
            this.slider.sliderElement.on("mainAnimationStart", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex) {
                if ($.inArray(this.slide, this.slider.getVisibleSlides(this.slider.slides[currentSlideIndex])) == -1) {
                    this.pause();
                }
            }, this));
            if (parseInt(this.parameters.reset)) {
                this.slider.sliderElement.on("mainAnimationComplete", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex) {
                    if ($.inArray(this.slide, this.slider.getVisibleSlides(this.slider.slides[currentSlideIndex])) == -1) {
                        this.player.seekTo(0);
                    }
                }, this));
            }
        }
        this.readyDeferred.resolve();
    };

    FrontendItemYouTube.prototype.onResize = function () {
        var controls = 100,
            parent = this.playerElement.parent(),
            width = parent.width(),
            height = parent.height() + controls,
            aspectRatio = 16 / 9,
            css = {
                width: width,
                height: height,
                marginTop: 0
            };
        css[nextend.rtl.marginLeft] = 0;
        if (width / height > aspectRatio) {
            css.height = width * aspectRatio;
            css.marginTop = (height - css.height) / 2;
        } else {
            css.width = height * aspectRatio;
            css[nextend.rtl.marginLeft] = (width - css.width) / 2;
        }
        this.playerElement.css(css);
    };

    FrontendItemYouTube.prototype.initAutoplay = function () {

        if (!this.isStatic) {
            //change slide
            this.slider.sliderElement.on("mainAnimationComplete", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex) {
                if ($.inArray(this.slide, this.slider.getVisibleSlides(this.slider.slides[currentSlideIndex])) >= 0) {
                    this.play();
                }
            }, this));

            if ($.inArray(this.slide, this.slider.getVisibleSlides()) >= 0) {
                this.play();
            }
        } else {
            this.play();
        }
    };

    FrontendItemYouTube.prototype.play = function () {
        if (this.isStopped()) {
            this.slider.sliderElement.trigger('mediaStarted', this.playerId);
            this.player.playVideo();
        }
    };

    FrontendItemYouTube.prototype.pause = function () {
        if (!this.isStopped()) {
            this.player.pauseVideo();
        }
    };

    FrontendItemYouTube.prototype.stop = function () {
        this.player.stopVideo();
    };

    FrontendItemYouTube.prototype.isStopped = function () {
        var state = this.player.getPlayerState();
        switch (state) {
            case -1:
            case 0:
            case 2:
            case 5:
                return true;
                break;
            default:
                return false;
                break;
        }
    };

    FrontendItemYouTube.prototype.setVolume = function (volume) {
        this.player.setVolume(volume * 100);
    };

    return FrontendItemYouTube;
});