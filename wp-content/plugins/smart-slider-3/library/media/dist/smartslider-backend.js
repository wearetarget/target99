var NextendSmartSliderAdminStorage = function () {
    /** @type {NextendSmartSliderAdminTimelineManager} */
    this.timelineManager = null;
    /** @type {NextendSmartSliderAdminTimelineControl} */
    this.timelineControl = null;
    /** @type {SmartSliderAdminSlide} */
    this.slide = null;
    /** @type {NextendSmartSliderAbstract} */
    this.frontend = null;
    /** @type {SmartSliderAdminGenerator} */
    this.generator = null;
    /** @type {NextendSmartSliderAdminSlideLayerManager} */
    this.layerManager = null;
    /** @type {NextendSmartSliderSlideEditorHistory} */
    this.history = null;


    this.oneSecWidth = 200;
    this.oneSecMs = 1000;
    this.fps = 20;
    this.pxToFrame = this.oneSecWidth / this.fps;

    this.$currentSlideElement = null;
};

NextendSmartSliderAdminStorage.prototype.durationToOffsetX = function (sec) {
    return sec * this.oneSecWidth;
};

NextendSmartSliderAdminStorage.prototype.offsetXToDuration = function (px) {
    return px / this.oneSecWidth;
};

NextendSmartSliderAdminStorage.prototype.normalizeOffsetX = function (offsetX) {
    return Math.round(offsetX / this.pxToFrame) * this.pxToFrame;
};


NextendSmartSliderAdminStorage.prototype.startEditor = function (sliderElementID, slideContentElementID, isUploadDisabled, uploadUrl, uploadDir, options) {
    if (this.slide === null) {
        window[sliderElementID].started(function(){
            new SmartSliderAdminSlide(sliderElementID, slideContentElementID, isUploadDisabled, uploadUrl, uploadDir, options);
        });
    }
    return this.slide;
};

window.nextend.pre = 'div#n2-ss-0 ';
window.nextend.smartSlider = new NextendSmartSliderAdminStorage();
;
(function (smartSlider, $, scope) {

    function NextendBackgroundAnimationManager() {
        this.type = 'backgroundanimation';
        NextendVisualManagerMultipleSelection.prototype.constructor.apply(this, arguments);
    };

    NextendBackgroundAnimationManager.prototype = Object.create(NextendVisualManagerMultipleSelection.prototype);
    NextendBackgroundAnimationManager.prototype.constructor = NextendBackgroundAnimationManager;

    NextendBackgroundAnimationManager.prototype.loadDefaults = function () {
        NextendVisualManagerMultipleSelection.prototype.loadDefaults.apply(this, arguments);
        this.type = 'backgroundanimation';
        this.labels = {
            visual: 'Background animation',
            visuals: 'Background animations'
        };
    };

    NextendBackgroundAnimationManager.prototype.initController = function () {
        return new NextendBackgroundAnimationEditorController();
    };

    NextendBackgroundAnimationManager.prototype.createVisual = function (visual, set) {
        return new NextendVisualWithSetRowMultipleSelection(visual, set, this);
    };

    scope.NextendBackgroundAnimationManager = NextendBackgroundAnimationManager;

})(nextend.smartSlider, n2, window);

;
(function ($, scope) {

    function NextendBackgroundAnimationEditorController() {
        this.parameters = {
            shiftedBackgroundAnimation: 0
        };
        NextendVisualEditorController.prototype.constructor.call(this, false);

        this.bgAnimationElement = $('.n2-bg-animation');
        this.slides = $('.n2-bg-animation-slide');
        this.bgImages = $('.n2-bg-animation-slide-bg');

        this.directionTab = new NextendElementRadio('n2-background-animation-preview-tabs', ['0', '1']);
        this.directionTab.element.on('nextendChange.n2-editor', $.proxy(this.directionTabChanged, this));

        if (!nModernizr.csstransforms3d || !nModernizr.csstransformspreserve3d) {
            nextend.notificationCenter.error('Background animations are not available in your browser. It works if the <i>transform-style: preserve-3d</i> feature available. ')
        }
    };

    NextendBackgroundAnimationEditorController.prototype = Object.create(NextendVisualEditorController.prototype);
    NextendBackgroundAnimationEditorController.prototype.constructor = NextendBackgroundAnimationEditorController;

    NextendBackgroundAnimationEditorController.prototype.loadDefaults = function () {
        NextendVisualEditorController.prototype.loadDefaults.call(this);
        this.type = 'backgroundanimation';
        this.current = 0;
        this.animationProperties = false;
        this.direction = 0;
    };

    NextendBackgroundAnimationEditorController.prototype.get = function () {
        return null;
    };

    NextendBackgroundAnimationEditorController.prototype.load = function (visual, tabs, mode, preview) {
        this.lightbox.addClass('n2-editor-loaded');
    };

    NextendBackgroundAnimationEditorController.prototype.setTabs = function (labels) {

    };

    NextendBackgroundAnimationEditorController.prototype.directionTabChanged = function () {
        this.direction = parseInt(this.directionTab.element.val());
    };

    NextendBackgroundAnimationEditorController.prototype.start = function () {
        if (this.animationProperties) {
            if (!this.timeline) {
                this.next();
            } else {
                this.timeline.play();
            }
        }
    };

    NextendBackgroundAnimationEditorController.prototype.pause = function () {
        if (this.timeline) {
            this.timeline.pause();
        }
    };

    NextendBackgroundAnimationEditorController.prototype.next = function () {
        this.timeline = new NextendTimeline({
            paused: true,
            onComplete: $.proxy(this.ended, this)
        });
        var current = this.bgImages.eq(this.current),
            next = this.bgImages.eq(1 - this.current);

        if (nModernizr.csstransforms3d && nModernizr.csstransformspreserve3d) {
            this.currentAnimation = new window['NextendSmartSliderBackgroundAnimation' + this.animationProperties.type](this, current, next, this.animationProperties, 1, this.direction);

            this.slides.eq(this.current).css('zIndex', 2);
            this.slides.eq(1 - this.current).css('zIndex', 3);

            this.timeline.to(this.slides.eq(this.current), 0.5, {
                opacity: 0
            }, this.currentAnimation.getExtraDelay());

            this.timeline.to(this.slides.eq(1 - this.current), 0.5, {
                opacity: 1
            }, this.currentAnimation.getExtraDelay());


            this.currentAnimation.postSetup();

        } else {

            this.timeline.to(this.slides.eq(this.current), 1.5, {
                opacity: 0
            }, 0);

            this.timeline.to(this.slides.eq(1 - this.current), 1.5, {
                opacity: 1
            }, 0);
        }
        this.current = 1 - this.current;
        this.timeline.play();
    };

    NextendBackgroundAnimationEditorController.prototype.ended = function () {
        if (this.currentAnimation) {
            this.currentAnimation.ended();
        }
        this.next();
    };

    NextendBackgroundAnimationEditorController.prototype.setAnimationProperties = function (animationProperties) {
        var lastAnimationProperties = this.animationProperties;
        this.animationProperties = animationProperties;
        if (!lastAnimationProperties) {
            this.next();
        }
    };

    scope.NextendBackgroundAnimationEditorController = NextendBackgroundAnimationEditorController;

})
(n2, window);

function strip_tags(input, allowed) {
    allowed = (((allowed || '') + '')
        .toLowerCase()
        .match(/<[a-z][a-z0-9]*>/g) || [])
        .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '')
        .replace(tags, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun /*, thisp */) {
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}
(function ($, scope, undefined) {

    function NextendSmartSliderAdminInlineField() {

        this.$input = $('<input type="text" name="name" />')
            .on({
                mouseup: function (e) {
                    e.stopPropagation();
                },
                keyup: $.proxy(function (e) {
                    if (e.keyCode == 27) {
                        this.cancel();
                    }
                }, this),
                blur: $.proxy(this.save, this)
            });

        this.$form = $('<form class="n2-inline-form"></form>')
            .append(this.$input)
            .on('submit', $.proxy(this.save, this));
    }

    NextendSmartSliderAdminInlineField.prototype.injectNode = function ($targetNode, value) {
        this.$input.val(value);
        $targetNode.append(this.$form);
        this.$input.focus();
    };

    NextendSmartSliderAdminInlineField.prototype.save = function (e) {
        e.preventDefault();
        this.$input.trigger('valueChanged', [this.$input.val()]);
        this.$input.off('blur');
        this.destroy();
    };

    NextendSmartSliderAdminInlineField.prototype.cancel = function () {
        this.$input.trigger('cancel');
        this.destroy();
    };

    NextendSmartSliderAdminInlineField.prototype.destroy = function () {
        this.$input.off('blur')
        this.$form.remove();
    };

    scope.NextendSmartSliderAdminInlineField = NextendSmartSliderAdminInlineField;

})(n2, window);




(function (smartSlider, $, scope, undefined) {
    "use strict";

    function NextendSmartSliderSlideEditorHistory() {
        this.historyStates = 50;
        this.isEnabled = this.historyStates != 0;
        this.historyAddAllowed = true;
        this.isBatched = false;
        this.index = -1;
        this.history = [];

        this.preventUndoRedo = false;

        this.undoBTN = $('#n2-ss-undo').on('click', $.proxy(this.undo, this));
        this.redoBTN = $('#n2-ss-redo').on('click', $.proxy(this.redo, this));
        this.updateUI();
    };

    NextendSmartSliderSlideEditorHistory.prototype.updateUI = function () {
        if (this.index == 0 || this.history.length == 0) {
            this.undoBTN.removeClass('n2-active');
        } else {
            this.undoBTN.addClass('n2-active');
        }

        if (this.index == -1 || this.index >= this.history.length) {
            this.redoBTN.removeClass('n2-active');
        } else {
            this.redoBTN.addClass('n2-active');
        }
    };

    NextendSmartSliderSlideEditorHistory.prototype.throttleUndoRedo = function () {
        if (!this.preventUndoRedo) {
            this.preventUndoRedo = true;
            setTimeout($.proxy(function () {
                this.preventUndoRedo = false;
            }, this), 100);
            return false;
        }
        return true;
    };

    NextendSmartSliderSlideEditorHistory.prototype.add = function (cb) {
        if (!this.isEnabled || !this.historyAddAllowed) return;
        if (this.index != -1) {
            this.history.splice(this.index, this.history.length);
        }
        this.index = -1;
        var currentTask = cb();
        if (!this.isBatched) {
            this.history.push([currentTask]);
            this.isBatched = true;
            setTimeout($.proxy(function () {
                this.isBatched = false;
            }, this), 100);
        } else {
            this.history[this.history.length - 1].push(currentTask);
        }

        if (this.history.length > this.historyStates) {
            this.history.unshift();
        }
        this.updateUI();
        return currentTask;
    };

    NextendSmartSliderSlideEditorHistory.prototype.off = function () {
        this.historyAddAllowed = false;
    };

    NextendSmartSliderSlideEditorHistory.prototype.on = function () {
        this.historyAddAllowed = true;
    };

    NextendSmartSliderSlideEditorHistory.prototype.undo = function (e) {
        if (e) {
            e.preventDefault();
        }
        if (this.throttleUndoRedo()) {
            return false;
        }
        this.off();
        if (this.index == -1) {
            this.index = this.history.length - 1;
        } else {
            this.index--;
        }
        if (this.index >= 0) {
            var actions = this.history[this.index];
            for (var i = actions.length - 1; i >= 0; i--) {
                var action = actions[i];
                action[0].history(action[1], action[3], action[4], action);
            }
        } else {
            this.index = 0;
            // No more undo
        }
        this.on();
        this.updateUI();
    };

    NextendSmartSliderSlideEditorHistory.prototype.redo = function (e) {
        if (e) {
            e.preventDefault();
        }
        if (this.throttleUndoRedo()) {
            return false;
        }
        this.off();
        if (this.index != -1) {
            if (this.index < this.history.length) {
                var actions = this.history[this.index];
                this.index++;
                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i];
                    action[0].history(action[1], action[2], action[4], action);
                }
            } else {
                // No more redo
            }
        } else {
            // No redo
        }
        this.on();
        this.updateUI();
    };

    NextendSmartSliderSlideEditorHistory.prototype.changeFuture = function (originalScope, newScope) {
        for (var i = 0; i < this.history.length; i++) {
            for (var j = 0; j < this.history[i].length; j++) {
                if (this.history[i][j][0] === originalScope) {
                    this.history[i][j][0] = newScope;
                }
                for (var k = 2; k < this.history[i][j].length; k++) {
                    for (var l = 0; l < this.history[i][j][k].length; l++) {
                        if (this.history[i][j][k][l] === originalScope) {
                            this.history[i][j][k][l] = newScope;
                        }
                    }
                }
            }
        }
    };

    n2(window).ready(function () {
        smartSlider.history = new NextendSmartSliderSlideEditorHistory();
    });

})(nextend.smartSlider, n2, window);

(function ($, scope, undefined) {

    function QuickSlides(ajaxUrl) {

        var button = $('#n2-quick-slides-edit');
        if (button.length < 1) {
            return;
        }

        this.ajaxUrl = ajaxUrl;

        button.on('click', $.proxy(this.openEdit, this));
    };

    QuickSlides.prototype.openEdit = function (e) {
        e.preventDefault();
        var slides = $('#n2-ss-slides .n2-box-slide');

        var that = this;
        this.modal = new NextendModal({
            zero: {
                fit: true,
                fitX: false,
                overflow: 'auto',
                size: [
                    1200,
                    700
                ],
                title: n2_('Quick Edit - Slides'),
                back: false,
                close: true,
                content: '<form class="n2-form"><table></table></form>',
                controls: [
                    '<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Save') + '</a>'
                ],
                fn: {
                    show: function () {

                        var button = this.controls.find('.n2-button-green'),
                            form = this.content.find('.n2-form').on('submit', function (e) {
                                e.preventDefault();
                                button.trigger('click');
                            }),
                            table = form.find('table');

                        slides.each($.proxy(function (i, el) {
                            var slide = $(el),
                                tr = $('<tr />').appendTo(table),
                                id = slide.data('slideid');
                            tr.append($('<td />').append('<img src="' + slide.data('image') + '" style="width:100px;"/>'));
                            tr.append($('<td />').append(that.createInput('Name', 'title-' + id, slide.data('title'), 'width: 240px;')));
                            tr.append($('<td />').append(that.createTextarea('Description', 'description-' + id, slide.data('description'), 'width: 330px;height:24px;')));
                            var link = slide.data('link').split('|*|');
                            tr.append($('<td />').append(that.createLink('Link', 'link-' + id, link[0], 'width: 180px;')));
                            tr.append($('<td />').append(that.createTarget('Target', 'target-' + id, link.length > 1 ? link[1] : '_self', '')));

                            new NextendElementUrl('link-' + id, nextend.NextendElementUrlParams);

                        }, this));


                        button.on('click', $.proxy(function (e) {

                            var changed = {};
                            slides.each($.proxy(function (i, el) {
                                var slide = $(el),
                                    id = slide.data('slideid'),
                                    name = $('#title-' + id).val(),
                                    description = $('#description-' + id).val(),
                                    link = $('#link-' + id).val() + '|*|' + $('#target-' + id).val();

                                if (name != slide.data('title') || description != slide.data('description') || link != slide.data('link')) {
                                    changed[id] = {
                                        name: name,
                                        description: description,
                                        link: link
                                    };
                                }
                            }, this));

                            if (jQuery.isEmptyObject(changed)) {
                                this.hide(e);
                            } else {
                                this.hide(e);
                                NextendAjaxHelper.ajax({
                                    type: "POST",
                                    url: NextendAjaxHelper.makeAjaxUrl(that.ajaxUrl),
                                    data: {changed: Base64.encode(JSON.stringify(changed))},
                                    dataType: 'json'
                                }).done($.proxy(function (response) {
                                    var slides = response.data;
                                    for (var slideID in slides) {
                                        var slideBox = $('.n2-box-slide[data-slideid="' + slideID + '"]');
                                        slideBox.find('.n2-box-placeholder a.n2-h4').html(slides[slideID].title);

                                        slideBox.attr('data-title', slides[slideID].rawTitle);
                                        slideBox.data('title', slides[slideID].rawTitle);
                                        slideBox.attr('data-description', slides[slideID].rawDescription);
                                        slideBox.data('description', slides[slideID].rawDescription);
                                        slideBox.attr('data-link', slides[slideID].rawLink);
                                        slideBox.data('link', slides[slideID].rawLink);
                                    }
                                }, this));
                            }
                        }, this));
                    }
                }
            }
        });

        this.modal.setCustomClass('n2-ss-quick-slides-edit-modal');
        this.modal.show();

    };

    QuickSlides.prototype.createInput = function (label, id, value) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        var nodes = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" class="n2-h5" autocomplete="off" style="' + style + '"></div></div></div></div>');
        nodes.find('input').val(value);
        return nodes;
    };

    QuickSlides.prototype.createTextarea = function (label, id, value) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        var nodes = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-textarea n2-border-radius"><textarea id="' + id + '" class="n2-h5" autocomplete="off" style="resize:y;' + style + '"></textarea></div></div></div></div>');
        nodes.find('textarea').val(value);
        return nodes;
    };

    QuickSlides.prototype.createLink = function (label, id, value) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        var nodes = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" class="n2-h5" autocomplete="off" style="' + style + '"><a href="#" class="n2-form-element-clear"><i class="n2-i n2-it n2-i-empty n2-i-grey-opacity"></i></a><a id="' + id + '_button" class="n2-form-element-button n2-h5 n2-uc" href="#">Link</a></div></div></div></div>');
        nodes.find('input').val(value);
        return nodes;
    };


    QuickSlides.prototype.createTarget = function (label, id, value) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        var nodes = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-list"><select id="' + id + '" autocomplete="off" style="' + style + '"><option value="_self">Self</option><option value="_blank">Blank</option></select</div></div></div></div>');
        nodes.find('select').val(value);
        return nodes;
    };

    scope.NextendSmartSliderQuickSlides = QuickSlides;
})(n2, window);
(function ($, scope, undefined) {

    function ruler(stored) {
        this.showGuides = 1;
        this.guides = [];
        this.ratios = {
            w: 1,
            h: 1
        };
        this.container = $('<div class="n2-ruler-container" />').appendTo('#smartslider-adjust-height .n2-ss-slider-outer-container');

        this.scale = 10;

        this.vertical = $('<div class="n2-ruler n2-ruler-vertical unselectable"></div>').appendTo('.n2-ss-slider-real-container');
        this.horizontal = $('<div class="n2-ruler n2-ruler-horizontal unselectable"></div>').appendTo(this.container);

        this.verticalSpans = $();
        this.horizontalSpans = $();

        this.onResize();
        nextend.smartSlider.frontend.sliderElement.on('SliderResize', $.proxy(this.onSliderResize, this))
        $(window).on('resize', $.proxy(this.onResize, this));


        this.positionDisplay = $('<div class="n2 n2-ss-position-display"/>')
            .appendTo('body');

        this.horizontal.on('mousedown', $.proxy(function (e) {
            if (this.showGuides) {
                new GuideHorizontal(this, this.horizontal, this.ratios.w, e);
            }
        }, this));


        this.vertical.on('mousedown', $.proxy(function (e) {
            if (this.showGuides) {
                new GuideVertical(this, this.vertical, this.ratios.h, e);
            }
        }, this));


        try {
            stored = $.extend({vertical: [], horizontal: []}, JSON.parse(Base64.decode(stored)));
            for (var i = 0; i < stored.horizontal.length; i++) {
                var guide = new GuideHorizontal(this, this.horizontal, this.ratios.w);
                guide.setPosition(stored.horizontal[i]);
            }
            for (var i = 0; i < stored.vertical.length; i++) {
                var guide = new GuideVertical(this, this.vertical, this.ratios.h);
                guide.setPosition(stored.vertical[i]);
            }
        } catch (e) {
        }
        nextend.ruler = this;
        this.measureToolVertical();
        this.measureToolHorizontal();
    }

    ruler.prototype.addGuide = function (guide) {
        this.guides.push(guide);
    }

    ruler.prototype.removeGuide = function (guide) {
        this.guides.splice($.inArray(guide, this.guides), 1);
    }

    ruler.prototype.clearGuides = function () {
        for (var i = this.guides.length - 1; i >= 0; i--) {
            this.guides[i].delete();
        }
    }

    ruler.prototype.onSliderResize = function (e, ratios) {
        this.ratios = ratios;
        for (var i = 0; i < this.guides.length; i++) {
            this.guides[i].setRatio(ratios.w, ratios.h);
        }
        this.onResize();
    }

    ruler.prototype.onResize = function () {
        var dimensions = nextend.smartSlider.frontend.responsive.responsiveDimensions,
            width = Math.max(dimensions.slider.width, $('#n2-tab-smartslider-editor').outerWidth(true) - 40),
            height = Math.max(dimensions.slider.height, $('#n2-tab-smartslider-editor').outerHeight(true));


        this.container.css({
            width: width + 40,
            height: height + 40
        });

        for (var i = this.horizontalSpans.length - 3; i < width / this.scale; i++) {
            var mark = $('<span />').appendTo(this.horizontal);
            if (i % 10 == 0) {
                mark.addClass('n2-ss-ruler-mark-large').append('<span>' + ((i / 10) * 100) + '</span>');
            } else if (i % 2 == 0) {
                mark.addClass('n2-ss-ruler-mark-medium');
            }
            this.horizontalSpans = this.horizontalSpans.add(mark);
        }

        for (var i = this.verticalSpans.length - 3; i < height / this.scale; i++) {
            var mark = $('<span />').appendTo(this.vertical);
            if (i % 10 == 0) {
                mark.addClass('n2-ss-ruler-mark-large').append('<span>' + ((i / 10) * 100) + '</span>');
            } else if (i % 2 == 0) {
                mark.addClass('n2-ss-ruler-mark-medium');
            }
            this.verticalSpans = this.verticalSpans.add(mark);
        }
    }

    ruler.prototype.toArray = function () {
        var data = {
            horizontal: [],
            vertical: []
        };
        for (var i = 0; i < this.guides.length; i++) {
            if (this.guides[i] instanceof GuideHorizontal) {
                data.horizontal.push(this.guides[i].position);
            } else if (this.guides[i] instanceof GuideVertical) {
                data.vertical.push(this.guides[i].position);
            }
        }
        return data;
    }

    ruler.prototype.measureToolVertical = function () {
        var guide = $('<div class="n2-ruler-guide" style="z-index:1;"><div class="n2-ruler-guide-border" style="border-color: #f00;"></div></div>')
            .css('display', 'none')
            .appendTo(this.vertical);

        var guideVisible = false,
            showGuide = $.proxy(function () {
                if (!guideVisible) {
                    guideVisible = true;
                    guide.css('display', '');
                    this.positionDisplay.addClass('n2-active');
                }
            }, this),
            hideGuide = $.proxy(function () {
                if (guideVisible) {
                    guideVisible = false;
                    guide.css('display', 'none');
                    this.positionDisplay.removeClass('n2-active');
                }
            }, this);
        this.vertical.on({
            mouseenter: $.proxy(function (e) {
                if (!this.showGuides) return;
                var lastY = 0,
                    offset = Math.round(this.vertical.offset().top);
                showGuide();

                this.vertical.on('mousemove.n2-ruler-measure-tool', $.proxy(function (e) {
                    if ($(e.target).hasClass('n2-ruler-guide-border') && $(e.target).parent()[0] != guide[0]) {
                        hideGuide();
                    } else {
                        showGuide();
                        if (lastY != e.pageY) {
                            var pos = e.pageY - offset;
                            guide.css('top', pos);
                            this.positionDisplay.html((pos - 40) + 'px').css({
                                left: e.pageX + 10,
                                top: e.pageY + 10
                            });
                            lastY = e.pageY;
                        }
                    }
                }, this));
            }, this),
            mouseleave: $.proxy(function () {
                this.vertical.off('.n2-ruler-measure-tool');
                hideGuide();
            }, this)
        });
    }

    ruler.prototype.measureToolHorizontal = function () {
        var guide = $('<div class="n2-ruler-guide" style="z-index:1;"><div class="n2-ruler-guide-border" style="border-color: #f00;"></div></div>')
            .css('display', 'none')
            .appendTo(this.horizontal);

        var guideVisible = false,
            showGuide = $.proxy(function () {
                if (!guideVisible) {
                    guideVisible = true;
                    guide.css('display', '');
                    this.positionDisplay.addClass('n2-active');
                }
            }, this),
            hideGuide = $.proxy(function () {
                if (guideVisible) {
                    guideVisible = false;
                    guide.css('display', 'none');
                    this.positionDisplay.removeClass('n2-active');
                }
            }, this);

        this.horizontal.on({
            mouseenter: $.proxy(function (e) {
                if (!this.showGuides) return;
                var lastX = 0,
                    offset = Math.round(this.horizontal.offset().left);
                showGuide();

                this.horizontal.on('mousemove.n2-ruler-measure-tool', $.proxy(function (e) {
                    if ($(e.target).hasClass('n2-ruler-guide-border') && $(e.target).parent()[0] != guide[0]) {
                        hideGuide();
                    } else {
                        showGuide();
                        if (lastX != e.pageX) {
                            var pos = Math.max(e.pageX - offset, 40);
                            guide.css('left', pos);
                            this.positionDisplay.html((pos - 40) + 'px').css({
                                left: e.pageX + 10,
                                top: e.pageY + 10
                            });
                            lastX = e.pageX;
                        }
                    }
                }, this));
            }, this),
            mouseleave: $.proxy(function () {
                this.horizontal.off('.n2-ruler-measure-tool');
                hideGuide();
            }, this)
        });
    }

    scope.NextendSmartSliderRuler = ruler;

    function Guide(ruler, container, ratio, e) {
        this.ruler = ruler;
        this.container = container;
        this.position = 0;
        this.ratio = ratio;

        this.guide = $('<div class="n2-ruler-guide"><div class="n2-ruler-guide-border"></div><div class="n2-ruler-guide-handle"></div></div>')
            .appendTo(container)
            .on('mousedown', $.proxy(function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (!nextend.smartSlider.layerManager.settings['n2-ss-lock-guides']) {
                    this.delete();
                }
            }, this));

        this.ruler.addGuide(this);

        if (e) {
            this.create(e);
        }

    }

    Guide.prototype._position = function (position, e) {
        return Math.max(0, position);
    }

    Guide.prototype.setPosition = function (position) {
        this.position = position;
        this.refresh();
    }

    Guide.prototype.refresh = function () {
        this.positionRender(this.position);
    }

    Guide.prototype.delete = function () {
        this.ruler.removeGuide(this);
        this.guide.remove();
    }

    function GuideHorizontal() {
        Guide.prototype.constructor.apply(this, arguments);
    }

    GuideHorizontal.prototype = Object.create(Guide.prototype);
    GuideHorizontal.prototype.constructor = GuideHorizontal;


    GuideHorizontal.prototype.create = function (e) {

        var offset = Math.round(this.container.offset().left) + 40;

        this.position = this._position((e.pageX - offset) / this.ratio, e);
        this.positionRender(this.position);
    }

    GuideHorizontal.prototype.rawPositionRender = function (value) {
        this.guide.css('left', Math.max(0, value) + 40);
    }

    GuideHorizontal.prototype.positionRender = function (value) {
        this.guide.css('left', Math.max(0, value) * this.ratio + 40);
    }

    GuideHorizontal.prototype.setRatio = function (w, h) {
        this.ratio = h;
        this.refresh();
    }

    function GuideVertical() {
        Guide.prototype.constructor.apply(this, arguments);
    }

    GuideVertical.prototype = Object.create(Guide.prototype);
    GuideVertical.prototype.constructor = GuideVertical;

    GuideVertical.prototype.create = function (e) {

        var offset = Math.round(this.container.offset().top) + 40;
        this.position = this._position((e.pageY - offset) / this.ratio, e);
        this.positionRender(this.position);
    }

    GuideVertical.prototype.rawPositionRender = function (value) {
        this.guide.css('top', Math.max(0, value) + 40);
    }

    GuideVertical.prototype.positionRender = function (value) {
        this.guide.css('top', Math.max(0, value) * this.ratio + 40);
    }

    GuideVertical.prototype.setRatio = function (w, h) {
        this.ratio = w;
        this.refresh();
    }


})(n2, window);
(function ($, scope, undefined) {

    function NextendSmartSliderAdminSidebarSlides(ajaxUrl, contentAjaxUrl, parameters, isUploadDisabled, uploadUrl, uploadDir) {
        this.quickPostModal = null;
        this.quickVideoModal = null;
        this.parameters = parameters;
        this.slides = [];
        this.ajaxUrl = ajaxUrl;
        this.contentAjaxUrl = contentAjaxUrl;
        this.slidesPanel = $('#n2-ss-slides-container');
        this.slidesContainer = this.slidesPanel.find('.n2-ss-slides-container');

        this.initMenu();

        this.initSlidesOrderable();

        var slides = this.slidesContainer.find('.n2-box-slide');
        for (var i = 0; i < slides.length; i++) {
            this.slides.push(new NextendSmartSliderAdminSlide(this, slides.eq(i)));
        }

        $('html').attr('data-slides', this.slides.length);

        $('.n2-add-quick-image, .n2-box-slide-dummy').on('click', $.proxy(this.addQuickImage, this));
        $('.n2-add-quick-video').on('click', $.proxy(this.addQuickVideo, this));
        $('.n2-add-quick-post').on('click', $.proxy(this.addQuickPost, this));

        this.initBulk();


        if (!isUploadDisabled) {
            var images = [];
            this.slidesContainer.fileupload({
                url: uploadUrl,
                pasteZone: false,
                dataType: 'json',
                paramName: 'image',
                dropZone: typeof nextend.smartSlider == 'undefined' ? $(document) : $('.n2-ss-slides-outer-container'),

                add: $.proxy(function (e, data) {
                    data.formData = {path: '/' + uploadDir};
                    data.submit();
                }, this),

                done: $.proxy(function (e, data) {
                    var response = data.result;
                    if (response.data && response.data.name) {
                        images.push({
                            title: response.data.name,
                            description: '',
                            image: response.data.url
                        });
                    } else {
                        NextendAjaxHelper.notification(response);
                    }

                }, this),

                fail: $.proxy(function (e, data) {
                    NextendAjaxHelper.notification(data.jqXHR.responseJSON);
                }, this),

                start: function () {
                    NextendAjaxHelper.startLoading();
                },

                stop: $.proxy(function () {
                    if (images.length) {
                        this._addQuickImages(images);
                    } else {
                        setTimeout(function () {
                            NextendAjaxHelper.stopLoading();
                        }, 100);
                    }
                    images = [];
                }, this)
            });

            var timeout = null;
            this.slidesContainer.on('dragover', $.proxy(function (e) {
                if (timeout !== null) {
                    clearTimeout(timeout);
                    timeout = null;
                } else {
                    this.slidesContainer.addClass('n2-drag-over');
                }
                timeout = setTimeout($.proxy(function () {
                    this.slidesContainer.removeClass('n2-drag-over');
                    timeout = null;
                }, this), 400);

            }, this));
        }
    };

    NextendSmartSliderAdminSidebarSlides.prototype.changed = function () {

    };

    NextendSmartSliderAdminSidebarSlides.prototype.initSlidesOrderable = function () {
        this.slidesContainer.sortable({
            helper: 'clone',
            forcePlaceholderSize: false,
            tolerance: "pointer",
            items: ".n2-box-slide",
            start: function (event, ui) {
                ui.item.show();
            },
            stop: $.proxy(this.saveSlideOrder, this),
            placeholder: 'n2-box-sortable-placeholder n2-box-sortable-placeholder-small',
            distance: 10
        });
    };

    NextendSmartSliderAdminSidebarSlides.prototype.saveSlideOrder = function (e) {
        var slideNodes = this.slidesContainer.find('.n2-box-slide'),
            slides = [],
            ids = [],
            originalIds = [];
        for (var i = 0; i < slideNodes.length; i++) {
            var slide = slideNodes.eq(i).data('slide');
            slides.push(slide);
            ids.push(slide.getId());
        }
        for (var i = 0; i < this.slides.length; i++) {
            originalIds.push(this.slides[i].getId());
        }

        if (JSON.stringify(originalIds) != JSON.stringify(ids)) {
            $(window).triggerHandler('SmartSliderSidebarSlidesOrderChanged');
            var queries = {
                nextendcontroller: 'slides',
                nextendaction: 'order'
            };
            NextendAjaxHelper.ajax({
                type: 'POST',
                url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, queries),
                data: {
                    slideorder: ids
                }
            });
            this.slides = slides;
            this.changed();
        }
    };

    NextendSmartSliderAdminSidebarSlides.prototype.initSlides = function () {
        var previousLength = this.slides.length;
        var slideNodes = this.slidesContainer.find('.n2-box-slide'),
            slides = [];
        for (var i = 0; i < slideNodes.length; i++) {
            var slide = slideNodes.eq(i).data('slide');
            slides.push(slide);
        }
        this.slides = slides;
        this.changed();
        $(window).triggerHandler('SmartSliderSidebarSlidesChanged');

        $('html').attr('data-slides', this.slides.length);
    };

    NextendSmartSliderAdminSidebarSlides.prototype.unsetFirst = function () {
        for (var i = 0; i < this.slides.length; i++) {
            this.slides[i].unsetFirst();
        }
        this.changed();
    };

    NextendSmartSliderAdminSidebarSlides.prototype.addQuickImage = function (e) {
        e.preventDefault();
        nextend.imageHelper.openMultipleLightbox($.proxy(this._addQuickImages, this));
    };

    NextendSmartSliderAdminSidebarSlides.prototype.addBoxes = function (boxes) {

        boxes.insertBefore(this.slidesContainer.find('.n2-clear'));
        boxes.addClass('n2-ss-box-just-added').each($.proxy(function (i, el) {
            new NextendSmartSliderAdminSlide(this, $(el));
        }, this));
        this.initSlides();
        setTimeout(function () {
            boxes.removeClass('n2-ss-box-just-added');
        }, 200);
    }

    NextendSmartSliderAdminSidebarSlides.prototype._addQuickImages = function (images) {
        NextendAjaxHelper.ajax({
            type: 'POST',
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'quickImages'
            }),
            data: {
                images: Base64.encode(JSON.stringify(images))
            }
        }).done($.proxy(function (response) {
            this.addBoxes($(response.data));
        }, this));
    };

    NextendSmartSliderAdminSidebarSlides.prototype.addQuickVideo = function (e) {
        e.preventDefault();
        var manager = this;
        if (!this.quickVideoModal) {
            this.quickVideoModal = new NextendModal({
                zero: {
                    size: [
                        500,
                        350
                    ],
                    title: n2_('Add video'),
                    back: false,
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Add video') + '</a>'],
                    fn: {
                        show: function () {
                            var button = this.controls.find('.n2-button'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                }).append(this.createInput(n2_('Video url'), 'n2-slide-video-url', 'width: 446px;')),
                                videoUrlField = this.content.find('#n2-slide-video-url').focus();

                            this.content.append(this.createHeading(n2_('Examples')));
                            this.content.append(this.createTable([['YouTube', 'https://www.youtube.com/watch?v=MKmIwHAFjSU'], ['Vimeo', 'https://vimeo.com/144598279']], ['', '']));

                            button.on('click', $.proxy($.proxy(function (e) {
                                e.preventDefault();
                                var video = videoUrlField.val(),
                                    youtubeRegexp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
                                    youtubeMatch = video.match(youtubeRegexp),
                                    vimeoRegexp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/,
                                    vimeoMatch = video.match(vimeoRegexp),
                                    html5Video = video.match(/\.(mp4|ogv|ogg|webm)/i);

                                if (youtubeMatch) {
                                    NextendAjaxHelper.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + encodeURI(youtubeMatch[2]) + '&part=snippet&key=AIzaSyC3AolfvPAPlJs-2FgyPJdEEKS6nbPHdSM').done($.proxy(function (data) {
                                        if (data.items.length) {
                                            var snippet = data.items[0].snippet;

                                            var thumbnails = data.items[0].snippet.thumbnails,
                                                thumbnail = thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default;

                                            manager._addQuickVideo(this, {
                                                type: 'youtube',
                                                title: snippet.title,
                                                description: snippet.description,
                                                image: thumbnail.url,
                                                video: video
                                            });
                                        }
                                    }, this)).fail(function (data) {
                                        nextend.notificationCenter.error(data.error.errors[0].message);
                                    });
                                } else if (vimeoMatch) {
                                    NextendAjaxHelper.getJSON('https://vimeo.com/api/v2/video/' + vimeoMatch[3] + '.json').done($.proxy(function (data) {
                                        manager._addQuickVideo(this, {
                                            type: 'vimeo',
                                            title: data[0].title,
                                            description: data[0].description,
                                            video: vimeoMatch[3],
                                            image: data[0].thumbnail_large
                                        });
                                    }, this)).fail(function (data) {
                                        nextend.notificationCenter.error(data.responseText);
                                    });

                                } else if (html5Video) {
                                    nextend.notificationCenter.error('This video url is not supported!');
                                
                                } else {
                                    nextend.notificationCenter.error('This video url is not supported!');
                                }
                            }, this)));
                        }
                    }
                }
            });
        }
        this.quickVideoModal.show();
    };

    NextendSmartSliderAdminSidebarSlides.prototype._addQuickVideo = function (modal, video) {
        NextendAjaxHelper.ajax({
            type: 'POST',
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'quickVideo'
            }),
            data: {
                video: Base64.encode(encodeURIComponent(JSON.stringify(video)))
            }
        }).done($.proxy(function (response) {
            this.addBoxes($(response.data));

            this.initSlides();
        }, this));
        modal.hide();
    };

    NextendSmartSliderAdminSidebarSlides.prototype.addQuickPost = function (e) {
        e.preventDefault();
        if (!this.quickPostModal) {
            var manager = this,
                cache = {},
                getContent = $.proxy(function (search) {
                    if (typeof cache[search] == 'undefined') {
                        cache[search] = NextendAjaxHelper.ajax({
                            type: "POST",
                            url: NextendAjaxHelper.makeAjaxUrl(this.contentAjaxUrl),
                            data: {
                                keyword: search
                            },
                            dataType: 'json'
                        });
                    }
                    return cache[search];
                }, this);

            this.quickPostModal = new NextendModal({
                zero: {
                    size: [
                        600,
                        430
                    ],
                    title: n2_('Add post'),
                    back: false,
                    close: true,
                    content: '<div class="n2-form"></div>',
                    fn: {
                        show: function () {

                            this.content.find('.n2-form').append(this.createInput(n2_('Keyword'), 'n2-ss-keyword', 'width:546px;'));
                            var search = $('#n2-ss-keyword'),
                                heading = this.createHeading('').appendTo(this.content),
                                result = this.createResult().appendTo(this.content),
                                searchString = '';

                            search.on('keyup', $.proxy(function () {
                                searchString = search.val();
                                getContent(searchString).done($.proxy(function (r) {
                                    if (search.val() == searchString) {
                                        if (searchString == '') {
                                            heading.html(n2_('No search term specified. Showing recent items.'));
                                        } else {
                                            heading.html(n2_printf(n2_('Showing items match for "%s"'), searchString));
                                        }

                                        var rows = r.data,
                                            data = [],
                                            modal = this;
                                        for (var i = 0; i < rows.length; i++) {
                                            data.push([rows[i].title, rows[i].info, $('<div class="n2-button n2-button-normal n2-button-xs n2-button-green n2-radius-s n2-uc n2-h5">' + n2_('Select') + '</div>')
                                                .on('click', {post: rows[i]}, function (e) {
                                                    manager._addQuickPost(modal, e.data.post);
                                                })]);
                                        }
                                        result.html('');
                                        this.createTable(data, ['width:100%;', '', '']).appendTo(this.createTableWrap().appendTo(result));
                                    }
                                }, this));
                            }, this))
                                .trigger('keyup').focus();
                        }
                    }
                }
            });
        }
        this.quickPostModal.show();
    };

    NextendSmartSliderAdminSidebarSlides.prototype._addQuickPost = function (modal, post) {
        if (!post.image) {
            post.image = '';
        }
        NextendAjaxHelper.ajax({
            type: 'POST',
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'quickPost'
            }),
            data: {
                post: post
            }
        }).done($.proxy(function (response) {
            this.addBoxes($(response.data));

            this.initSlides();
        }, this));
        modal.hide();
    };

    NextendSmartSliderAdminSidebarSlides.prototype.initBulk = function () {

        this.selection = [];

        this.isBulkSelection = false;

        var selects = $('.n2-bulk-select').find('a');

        //Select all
        selects.eq(0).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slide) {
                slide.select();
            });
        }, this));

        //Select none
        selects.eq(1).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slide) {
                slide.deSelect();
            });
        }, this));

        //Select published
        selects.eq(2).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slide) {
                if (slide.box.hasClass('n2-slide-state-published')) {
                    slide.select();
                } else {
                    slide.deSelect();
                }
            });
        }, this));

        //Select unpublished
        selects.eq(3).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slide) {
                if (slide.box.hasClass('n2-slide-state-published')) {
                    slide.deSelect();
                } else {
                    slide.select();
                }
            });
        }, this));

        var actions = $('.n2-bulk-actions').find('a');

        //Delete
        actions.eq(0).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkAction('deleteSlides');
        }, this));

        //Duplicate
        actions.eq(1).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkAction('duplicateSlides');
        }, this));

        //Publish
        actions.eq(2).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkAction('publishSlides');
        }, this));

        //Unpublish
        actions.eq(3).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkAction('unPublishSlides');
        }, this));
    };

    NextendSmartSliderAdminSidebarSlides.prototype.addSelection = function (slide) {
        if (this.selection.length == 0) {
            this.enterBulk();
        }
        this.selection.push(slide);
    }

    NextendSmartSliderAdminSidebarSlides.prototype.removeSelection = function (slide) {
        this.selection.splice($.inArray(slide, this.selection), 1);
        if (this.selection.length == 0) {
            this.leaveBulk();
        }
    }

    NextendSmartSliderAdminSidebarSlides.prototype.bulkSelect = function (cb) {
        for (var i = 0; i < this.slides.length; i++) {
            cb(this.slides[i]);
        }
    };

    NextendSmartSliderAdminSidebarSlides.prototype.bulkAction = function (action) {
        var slides = [],
            ids = [];
        this.bulkSelect(function (slide) {
            if (slide.selected) {
                slides.push(slide);
                ids.push(slide.getId());
            }
        });
        if (ids.length) {
            this[action](ids, slides);
        } else {
            nextend.notificationCenter.notice('Please select one or more slides for the action!');
        }
    };

    NextendSmartSliderAdminSidebarSlides.prototype.enterBulk = function () {
        if (!this.isBulkSelection) {
            this.isBulkSelection = true;
            this.slidesContainer.sortable('option', 'disabled', true);
            $('#n2-admin').addClass('n2-ss-has-box-selection');
        }
    };

    NextendSmartSliderAdminSidebarSlides.prototype.leaveBulk = function () {
        if (this.isBulkSelection) {
            this.slidesContainer.sortable('option', 'disabled', false);
            $('#n2-admin').removeClass('n2-ss-has-box-selection');

            for (var i = 0; i < this.slides.length; i++) {
                this.slides[i].deSelect();
            }
            this.selection = [];
            this.isBulkSelection = false;
        }
    };

    NextendSmartSliderAdminSidebarSlides.prototype.deleteSlides = function (ids, slides) {
        this.hideMenu();
        var title = slides[0].box.find('.n2-box-placeholder-title a').text();
        if (slides.length > 1) {
            title += ' and ' + (slides.length - 1) + ' more';
        }
        NextendDeleteModal('slide-delete', title, $.proxy(function () {
            NextendAjaxHelper.ajax({
                url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                    nextendaction: 'delete'
                }),
                type: 'POST',
                data: {
                    slides: ids
                }
            }).done($.proxy(function () {
                for (var i = 0; i < slides.length; i++) {
                    slides[i].deleted();
                }
                this.initSlides();
                this.leaveBulk();
            }, this));
        }, this));
    };

    NextendSmartSliderAdminSidebarSlides.prototype.duplicateSlides = function (ids, slides) {
        for (var i = 0; i < this.slides.length; i++) {
            if (this.slides[i].selected) {
                this.slides[i].duplicate($.Event("click", {
                    currentTarget: null
                }));
            }
        }
    };

    NextendSmartSliderAdminSidebarSlides.prototype.publishSlides = function (ids, slides) {
        NextendAjaxHelper.ajax({
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'publish'
            }),
            type: 'POST',
            data: {
                slides: ids
            }
        }).done($.proxy(function () {
            for (var i = 0; i < slides.length; i++) {
                slides[i].published();
            }
            this.changed();
        }, this));
    };

    NextendSmartSliderAdminSidebarSlides.prototype.unPublishSlides = function (ids, slides) {
        NextendAjaxHelper.ajax({
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'unpublish'
            }),
            type: 'POST',
            data: {
                slides: ids
            }
        }).done($.proxy(function () {
            for (var i = 0; i < slides.length; i++) {
                slides[i].unPublished();
            }
            this.changed();
        }, this));
    };

    NextendSmartSliderAdminSidebarSlides.prototype.initMenu = function () {
        this.slide = null;
        this.menu = $('#n2-ss-slide-menu').detach().addClass('n2-inited');

        this.menuActions = {
            publish: this.menu.find('.n2-ss-publish').on('click', $.proxy(function (e) {
                this.slide.switchPublished(e);
            }, this)),
            unpublish: this.menu.find('.n2-ss-unpublish').on('click', $.proxy(function (e) {
                this.slide.switchPublished(e);
            }, this)),
            generator: this.menu.find('.n2-ss-generator').on('click', $.proxy(function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.location = this.slide.box.data('generator');
            }, this)),
            duplicate: this.menu.find('.n2-ss-duplicate').on('click', $.proxy(function (e) {
                this.slide.duplicate(e);
            }, this)),
            'delete': this.menu.find('.n2-ss-delete').on('click', $.proxy(function (e) {
                this.slide.delete(e);
            }, this)),
            setFirst: this.menu.find('.n2-ss-setFirst').on('click', $.proxy(function (e) {
                this.slide.setFirst(e);
            }, this)),
            saveLayout: this.menu.find('.n2-ss-saveLayout')
        }

        this.menu.find('.n2-button').on('click', $.proxy(function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.menu.hasClass('n2-active')) {
                this.menu.removeClass('n2-active').off('mouseleave');
            } else {
                this.menu.addClass('n2-active').on('mouseleave', function () {
                    $(this).removeClass('n2-active');
                });
            }
        }, this));
    }


    NextendSmartSliderAdminSidebarSlides.prototype.showMenu = function (slide) {
        this.slide = slide;
        this.menu.appendTo(slide.box);
    }

    NextendSmartSliderAdminSidebarSlides.prototype.hideMenu = function () {
        this.menu.detach();
    }

    scope.NextendSmartSliderAdminSidebarSlides = NextendSmartSliderAdminSidebarSlides;

    function NextendSmartSliderAdminSlide(manager, box) {
        this.selected = false;
        this.manager = manager;

        this.box = box.data('slide', this)
            .addClass('n2-clickable');

        this.box
            .on('mouseenter', $.proxy(function () {
                this.manager.showMenu(this);
            }, this))
            .on('mouseleave', $.proxy(function () {
                this.manager.hideMenu();
            }, this))
            .on('click.n2-slide', $.proxy(this.goToEdit, this));

        this.publishElement = this.box.find('.n2-slide-published')
            .on('click', $.proxy(this.switchPublished, this));

        this.box.find('.n2-ss-box-select').on('click', $.proxy(function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.invertSelection();
        }, this));
    };

    NextendSmartSliderAdminSlide.prototype.getId = function () {
        return this.box.data('slideid');
    };
    NextendSmartSliderAdminSlide.prototype.setFirst = function (e) {
        e.stopPropagation();
        e.preventDefault();
        NextendAjaxHelper.ajax({
            url: NextendAjaxHelper.makeAjaxUrl(this.manager.ajaxUrl, {
                nextendaction: 'first'
            }),
            type: 'POST',
            data: {
                id: this.getId()
            }
        }).done($.proxy(function () {
            this.manager.unsetFirst();
            this.box.addClass('n2-slide-state-first');
        }, this));
    };
    NextendSmartSliderAdminSlide.prototype.unsetFirst = function () {
        this.box.removeClass('n2-slide-state-first');
    };

    NextendSmartSliderAdminSlide.prototype.switchPublished = function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.isPublished()) {
            this.manager.unPublishSlides([this.getId()], [this]);
        } else {
            this.manager.publishSlides([this.getId()], [this]);
        }
    };

    NextendSmartSliderAdminSlide.prototype.isPublished = function () {
        return this.box.hasClass('n2-slide-state-published');
    };

    NextendSmartSliderAdminSlide.prototype.published = function () {
        this.box.addClass('n2-slide-state-published');
    };

    NextendSmartSliderAdminSlide.prototype.unPublished = function () {
        this.box.removeClass('n2-slide-state-published');
    };

    NextendSmartSliderAdminSlide.prototype.goToEdit = function (e, isBlank) {
        var editUrl = this.box.data('editurl');
        if (typeof isBlank !== 'undefined' && isBlank) {
            window.open(editUrl, '_blank');
        } else if (editUrl == location.href) {
            n2("#n2-admin").toggleClass("n2-ss-slides-outer-container-visible");
        } else {
            window.location = editUrl;
        }
    };

    NextendSmartSliderAdminSlide.prototype.duplicate = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var deferred = $.Deferred();
        NextendAjaxHelper.ajax({
            url: NextendAjaxHelper.makeAjaxUrl(this.box.data('editurl'), {
                nextendaction: 'duplicate'
            })
        }).done($.proxy(function (response) {
            var box = $(response.data).insertAfter(this.box);
            var newSlide = new NextendSmartSliderAdminSlide(this.manager, box);
            this.manager.initSlides();
            deferred.resolve(newSlide);
        }, this));
        return deferred;
    };

    NextendSmartSliderAdminSlide.prototype.delete = function (e) {
        e.stopPropagation();
        e.preventDefault();
        this.manager.deleteSlides([this.getId()], [this]);
    };
    NextendSmartSliderAdminSlide.prototype.deleted = function () {
        this.box.remove();
    };

    NextendSmartSliderAdminSlide.prototype.invertSelection = function (e) {
        if (e) {
            e.preventDefault();
        }

        if (!this.selected) {
            this.select();
        } else {
            this.deSelect();
        }
    };

    NextendSmartSliderAdminSlide.prototype.select = function () {
        if (!this.selected) {
            this.selected = true;
            this.box.addClass('n2-selected');
            this.manager.addSelection(this);
        }
    };

    NextendSmartSliderAdminSlide.prototype.deSelect = function () {
        if (this.selected) {
            this.selected = false;
            this.box.removeClass('n2-selected');
            this.manager.removeSelection(this);
        }
    };

    scope.NextendSmartSliderAdminSlide = NextendSmartSliderAdminSlide;


})(n2, window);
(function (smartSlider, $, scope, undefined) {

    var menuHideTimeout = false;

    function NextendSmartSliderSidebar(layerManager) {

        this.detachedPosition = {
            left: $.jStorage.get('ssPanelLeft') || 100,
            top: $.jStorage.get('ssPanelTop') || 100,
            height: $.jStorage.get('ssPanelHeight') || 400
        }

        this.autoPosition = $.jStorage.get('ssPanelAutoPosition', 1);

        this.lastHeight = this.detachedPosition.height;

        this.admin = $('#n2-admin');
        this.sidebar = $('#n2-ss-slide-sidebar').on('mousedown', $.proxy(nextend.context.setMouseDownArea, nextend.context, 'sidebarClicked'));
        this.title = this.sidebar.find('.n2-panel-titlebar-title');
        this.sidebarTD = this.sidebar.parent();

        this.layerManager = layerManager;
        smartSlider.sidebarManager = this;

        this.editorPanel = $('.n2-ss-editor-panel');

        this.views = {
            layerEdit: $('#n2-ss-layer-edit')
        };

        this.viewPanes = {
            layerEdit: $('#n2-tabbed-slide-editor-settings > .n2-tabs').addClass('n2-scrollable')
        };

        for (var k in this.viewPanes) {
            this.viewPanes[k].on('DOMMouseScroll mousewheel', function (e) {
                var up = false;
                if (e.originalEvent) {
                    if (e.originalEvent.wheelDelta) up = e.originalEvent.wheelDelta / -1 < 0;
                    if (e.originalEvent.deltaY) up = e.originalEvent.deltaY < 0;
                    if (e.originalEvent.detail) up = e.originalEvent.detail < 0;
                }

                var prevent = function () {
                    e.stopPropagation();
                    e.preventDefault();
                    e.returnValue = false;
                    return false;
                }

                if (!up && this.scrollHeight <= $(this).innerHeight() + this.scrollTop + 1) {
                    return prevent();
                } else if (up && 0 >= this.scrollTop - 1) {
                    return prevent();
                }
            });
        }

        this.panelHeading = $('#n2-tabbed-slide-editor-settings').find('.n2-sidebar-tab-switcher .n2-td');


        var right = this.sidebar.find('.n2-panel-titlebar-nav-right');

        this.magnet = $('<a href="#"><i class="n2-i n2-i-magnet n2-i-grey-opacity" data-n2tip="Auto position layer window"></i></a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.magnetize();
        }, this)).css('display', 'none').appendTo(right);
        $('<a href="#"><i class="n2-i n2-i-closewindow n2-i-grey-opacity"></i></a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.hide();
        }, this)).appendTo(right);

        nextend.tooltip.add(right);


        var $verticalBar = $('#n2-ss-slide-vertical-bar');
        $('.n2-ss-add-layer-button').on('click', function (e) {
            e.preventDefault();
            $verticalBar.toggleClass('n2-active');
        })

        $('.n2-ss-core-item').on('click', function (e) {
            $verticalBar.removeClass('n2-active');
        });

        var topOffset = $('#wpadminbar, .navbar-fixed-top').height() + $('.n2-top-bar').height();
        this.$verticalBarInner = $('.n2-ss-slide-vertical-bar-inner').each(function () {
            var bar = $(this);
            bar.fixTo(bar.parent(), {
                top: topOffset
            });
        });

        this.$resizeInnerContainer = $('#n2-ss-layers-switcher_0, #n2-ss-layers-switcher_1');
        this.extraHeightToRemove = 60;
        if (!this.$resizeInnerContainer.length) {
            this.extraHeightToRemove = 0;
            this.$resizeInnerContainer = this.$verticalBarInner;
        }

        this.$resizeInnerContainer.css('overflow', 'auto');

        this.detach();

        $('#n2-admin').on('resize', $.proxy(this.resizeVerticalBar, this))

        $(window).on('resize', $.proxy(this.onResize, this));

    };

    NextendSmartSliderSidebar.prototype.magnetize = function () {
        if (!this.autoPosition) {

            this.autoPosition = 1;
            $.jStorage.set('ssPanelAutoPosition', 1);

            this.magnet.css('display', 'none');

            var activeLayer = this.layerManager.getSelectedLayer();
            if (activeLayer) {
                activeLayer.positionSidebar();
            }
        }
    }

    NextendSmartSliderSidebar.prototype.show = function (layer, of) {

        this.setTitle(layer.property.name);

        $('body').addClass('n2-ss-layer-edit-visible');

        if (this.autoPosition) {
            this.sidebar.position({
                my: 'left top',
                at: 'right+10 top',
                collision: "flipfit",
                of: of.is(':visible') ? of : '#n2-ss-layer-list'
            });
        }
    }

    NextendSmartSliderSidebar.prototype._show = function () {
        $('body').addClass('n2-ss-layer-edit-visible');
    }

    NextendSmartSliderSidebar.prototype.hide = function () {
        $('body').removeClass('n2-ss-layer-edit-visible');
    }

    NextendSmartSliderSidebar.prototype.hideWithDeferred = function (deferred) {
        if ($('body').hasClass('n2-ss-layer-edit-visible')) {
            this.hide();
            deferred.done($.proxy(this._show, this));
        }
    }

    NextendSmartSliderSidebar.prototype.setTitle = function (title) {
        this.title.html(title);
    }

    NextendSmartSliderSidebar.prototype.getLayerEditExcludedHeight = function () {
        return 85;
    };

    NextendSmartSliderSidebar.prototype.resizeVerticalBar = function () {
        this.$resizeInnerContainer.height((window.innerHeight || document.documentElement.clientHeight) - ($('#n2-ss-layers').is(':visible') && $('#n2-ss-layers').hasClass('n2-active') ? $('#n2-ss-layers').height() : 0) - $('#wpadminbar, .navbar-fixed-top').height() - $('.n2-top-bar').height() - this.extraHeightToRemove);
    }

    NextendSmartSliderSidebar.prototype.onResize = function () {
        this.sidebar.css('display', 'block');
        this.resizeVerticalBar();

        var windowHeight = (window.innerHeight || document.documentElement.clientHeight);

        var targetHeight = this.sidebar.height() - this.getLayerEditExcludedHeight();

        this.viewPanes['layerEdit'].height(targetHeight);

        var properties = {},
            windowWidth = (window.innerWidth || document.documentElement.clientWidth);
        var bounding = this.sidebar[0].getBoundingClientRect();

        if (bounding.left < 0) {
            properties.left = 0;
        } else if (bounding.left + bounding.width > windowWidth) {
            properties.left = Math.max(0, windowWidth - bounding.width);
        }

        if (bounding.height > windowHeight - bounding.top) {
            properties.top = windowHeight - bounding.top - bounding.height + bounding.top;
            if (properties.top < 0) {
                this.lastHeight = properties.height = bounding.height + properties.top;
                properties.top = 0;
            }
        }

        this.sidebar.css(properties);
        this.sidebar.css('display', '');

    }

    NextendSmartSliderSidebar.prototype.detach = function () {
        if (this.autoPosition) {
            this.sidebar.css('height', this.detachedPosition.height);
            this.magnet.css('display', 'none');
        } else {
            this.sidebar.css(this.detachedPosition);
            this.magnet.css('display', 'inline-block');
        }
        this.sidebar.appendTo(this.admin);

        this.admin.addClass('n2-sidebar-hidden');

        $(window).off('.n2-ss-panel');
        this.sidebar.removeClass("n2-sidebar-fixed");

        this.sidebar
            .draggable({
                distance: 5,
                handle: ".n2-panel-titlebar",
                containment: 'window',
                stop: $.proxy(function (event, ui) {
                    this.sidebar.css('height', this.lastHeight);
                    var bounding = this.sidebar[0].getBoundingClientRect();
                    this.detachedPosition.left = bounding.left;
                    this.detachedPosition.top = bounding.top;

                    $.jStorage.set('ssPanelLeft', bounding.left);
                    $.jStorage.set('ssPanelTop', bounding.top);

                    this.autoPosition = 0;
                    $.jStorage.set('ssPanelAutoPosition', 0);
                    this.magnet.css('display', 'inline-block');
                }, this),
                scroll: false
            })
            .resizable({
                distance: 5,
                handles: "s",
                stop: $.proxy(function (event, ui) {
                    this.lastHeight = this.detachedPosition.height = this.sidebar.height();
                    $.jStorage.set('ssPanelHeight', this.detachedPosition.height);

                }, this),
                create: $.proxy(function (e, ui) {
                    var handle = $(e.target).find('.ui-resizable-handle').addClass('n2-ss-panel-resizer');
                }, this)
            });

        this.onResize();
        nextend.triggerResize();
    }

    NextendSmartSliderSidebar.prototype.switchTab = function (tabName) {
        this.panelHeading.filter('[data-tab="' + tabName + '"]').trigger('click');
    };


    scope.NextendSmartSliderSidebar = NextendSmartSliderSidebar;

})(nextend.smartSlider, n2, window);
;
(function (smartSlider, $, scope, undefined) {


    function SmartSliderAdminSlide(sliderElementID, slideContentElementID, isUploadDisabled, uploadUrl, uploadDir, options) {

        this.options = $.extend({
            slideAsFile: 0
        }, options);

        this.readyDeferred = $.Deferred();
        smartSlider.slide = this;

        this._warnInternetExplorerUsers();

        this.$slideContentElement = $('#' + slideContentElementID);
        this.$slideGuidesElement = $('#slideguides');
        this.slideStartValue = this.$slideContentElement.val();
        this.$sliderElement = $('#' + sliderElementID);


        smartSlider.frontend = window["n2-ss-0"];
        smartSlider.ruler = new NextendSmartSliderRuler(this.$slideGuidesElement.val());
        smartSlider.frontend.visible(function () {
            $('body').addClass('n2-ss-slider-visible');
            var el = $("#n2-tab-smartslider-editor"),
                tinyscrollbar = el
                    .tinyscrollbar({
                        axis: "x",
                        wheel: false,
                        wheelLock: false
                    })
                    .data('plugin_tinyscrollbar');
            if (typeof el.get(0).move === 'function') {
                el.get(0).move = null;
            }

            this.sliderElement.on('SliderResize', function () {
                tinyscrollbar.update("relative");
            });
        });

        var fontSize = this.$sliderElement.data('fontsize');

        nextend.fontManager.setFontSize(fontSize);
        nextend.styleManager.setFontSize(fontSize);


        smartSlider.$currentSlideElement = smartSlider.frontend.adminGetCurrentSlideElement();

        new SmartSliderAdminGenerator();

        smartSlider.$currentSlideElement.addClass('n2-ss-currently-edited-slide');
        var staticSlide = smartSlider.frontend.parameters.isStaticEdited;
        new NextendSmartSliderAdminSlideLayerManager(smartSlider.$currentSlideElement.data('slide'), staticSlide, isUploadDisabled, uploadUrl, uploadDir);

        if (!staticSlide) {
            this._initializeBackgroundChanger();
        }

        this.readyDeferred.resolve();

        $('#smartslider-form').on({
            checkChanged: $.proxy(this.prepareFormForCheck, this),
            submit: $.proxy(this.onSlideSubmit, this)
        });

        this.createHistory();
    };

    SmartSliderAdminSlide.prototype.ready = function (fn) {
        this.readyDeferred.done(fn);
    };

    SmartSliderAdminSlide.prototype.prepareFormForCheck = function () {
        var data = JSON.stringify(smartSlider.layerManager.getData()),
            startData = JSON.stringify(JSON.parse(Base64.decode(this.slideStartValue)));

        this.$slideContentElement.val(startData == data ? this.slideStartValue : Base64.encode(data));
    };

    SmartSliderAdminSlide.prototype.onSlideSubmit = function (e) {
        if (!nextend.isPreview) {
            this.prepareForm();
            e.preventDefault();

            nextend.askToSave = false;

            if (this.options.slideAsFile && typeof window.FormData !== undefined && typeof window.File !== 'undefined') {
                var fd = new FormData();
                var data = $('#smartslider-form').serializeArray();
                $.each(data, function (key, input) {
                    if (input.name == 'slide[slide]') {
                        fd.append('slide', new File([input.value], "slide.txt"));
                    } else {
                        fd.append(input.name, input.value);
                    }
                });

                NextendAjaxHelper.ajax({
                    url: NextendAjaxHelper.makeAjaxUrl(window.location.href),
                    type: 'POST',
                    data: fd,
                    contentType: false,
                    processData: false
                }).done($.proxy(this.afterSave, this));
            } else {
                NextendAjaxHelper.ajax({
                    type: 'POST',
                    url: NextendAjaxHelper.makeAjaxUrl(window.location.href),
                    data: $('#smartslider-form').serialize(),
                    dataType: 'json'
                }).done($.proxy(this.afterSave, this));
            }
        }
    };

    SmartSliderAdminSlide.prototype.afterSave = function () {
        nextend.askToSave = true;
        $('#smartslider-form').trigger('saved');

        $('.n2-ss-edit-slide-top-details .n2-h1').html($('#slidetitle').val());
    };

    SmartSliderAdminSlide.prototype.prepareForm = function () {
        this.$slideGuidesElement.val(Base64.encode(JSON.stringify(smartSlider.ruler.toArray())));

        this.$slideContentElement.val(Base64.encode(nextend.UnicodeToHTMLEntity(JSON.stringify(smartSlider.layerManager.getData()))));
    };

    SmartSliderAdminSlide.prototype._initializeBackgroundChanger = function () {
        this.background = {
            type: $('#slidebackground-type').on('nextendChange', $.proxy(this.__onAfterBackgroundTypeChange, this)),
            slideBackgroundColorField: $('#slidebackgroundColor').on('nextendChange', $.proxy(this.__onAfterBackgroundColorChange, this)),
            slideBackgroundGradientField: $('#slidebackgroundGradient').on('nextendChange', $.proxy(this.__onAfterBackgroundColorChange, this)),
            slideBackgroundColorEndField: $('#slidebackgroundColorEnd').on('nextendChange', $.proxy(this.__onAfterBackgroundColorChange, this)),
            slideBackgroundImageField: $('#slidebackgroundImage').on('nextendChange', $.proxy(this.__onAfterBackgroundImageChange, this)),
            slideBackgroundImageOpacity: $('#slidebackgroundImageOpacity').on('nextendChange', $.proxy(this.__onAfterBackgroundImageOpacityChange, this)),
            slidebackgroundFocusX: $('#slidebackgroundFocusX').on('nextendChange', $.proxy(this.__onAfterBackgroundImageChange, this)),
            slidebackgroundFocusY: $('#slidebackgroundFocusY').on('nextendChange', $.proxy(this.__onAfterBackgroundImageChange, this)),
            slideBackgroundModeField: $('#slidebackgroundMode').on('nextendChange', $.proxy(this.__onAfterBackgroundImageChange, this)),
            backgroundImageElement: smartSlider.$currentSlideElement.find('.nextend-slide-bg'),
            canvas: smartSlider.$currentSlideElement.find('.n2-ss-slide-background')
        };

        this.currentBackgroundType = this.background.type.val();

        // Auto fill thumbnail if empty
        var thumbnail = $('#slidethumbnail');
        if (thumbnail.val() == '') {
            var itemImage = $('#item_imageimage'),
                cb = $.proxy(function (image) {
                    if (image != '' && image != '$system$/images/placeholder/image.png') {
                        thumbnail.val(image).trigger('change');
                        this.background.slideBackgroundImageField.off('.slidethumbnail');
                        itemImage.off('.slidethumbnail');
                    }
                }, this);
            this.background.slideBackgroundImageField.on('nextendChange.slidethumbnail', $.proxy(function () {
                cb(this.background.slideBackgroundImageField.val());
            }, this));
            itemImage.on('nextendChange.slidethumbnail', $.proxy(function () {
                cb(itemImage.val());
            }, this));
        }
    };

    SmartSliderAdminSlide.prototype.__onAfterBackgroundTypeChange = function () {
        var newType = this.background.type.val();
        this.currentBackgroundType = newType;
        switch (newType) {
            case 'image':
                this.__onAfterBackgroundImageChange();
                break;
            case 'video':
                this.__onAfterBackgroundImageChange();
                break;
            case 'color':
                smartSlider.$currentSlideElement.data('slideBackground').changeDesktop('', '', this.background.slideBackgroundModeField.val(), this.background.slidebackgroundFocusX.val(), this.background.slidebackgroundFocusY.val());
                this.__onAfterBackgroundColorChange();
                break;
        }

    }

    SmartSliderAdminSlide.prototype.__onAfterBackgroundColorChange = function () {
        var backgroundColor = this.background.slideBackgroundColorField.val(),
            gradient = this.background.slideBackgroundGradientField.val();
        if (gradient != 'off') {
            var backgroundColorEnd = this.background.slideBackgroundColorEndField.val(),
                canvas = this.background.canvas.css({background: '', filter: ''});

            switch (gradient) {
                case 'horizontal':
                    canvas
                        .css('background', '#' + backgroundColor.substr(0, 6))
                        .css('background', '-moz-linear-gradient(left, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', ' -webkit-linear-gradient(left, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', 'linear-gradient(to right, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', 'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#' + backgroundColor.substr(0, 6) + '\', endColorstr=\'#' + backgroundColorEnd.substr(0, 6) + '\',GradientType=1)');
                    break;
                case 'vertical':
                    canvas
                        .css('background', '#' + backgroundColor.substr(0, 6))
                        .css('background', '-moz-linear-gradient(top, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', ' -webkit-linear-gradient(top, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', 'linear-gradient(to bottom, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', 'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#' + backgroundColor.substr(0, 6) + '\', endColorstr=\'#' + backgroundColorEnd.substr(0, 6) + '\',GradientType=0)');
                    break;
                case 'diagonal1':
                    canvas
                        .css('background', '#' + backgroundColor.substr(0, 6))
                        .css('background', '-moz-linear-gradient(45deg, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', ' -webkit-linear-gradient(45deg, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', 'linear-gradient(45deg, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', 'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#' + backgroundColor.substr(0, 6) + '\', endColorstr=\'#' + backgroundColorEnd.substr(0, 6) + '\',GradientType=1)');
                    break;
                case 'diagonal2':
                    canvas
                        .css('background', '#' + backgroundColor.substr(0, 6))
                        .css('background', '-moz-linear-gradient(-45deg, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', ' -webkit-linear-gradient(-45deg, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', 'linear-gradient(-45deg, ' + N2Color.hex2rgbaCSS(backgroundColor) + ' 0%,' + N2Color.hex2rgbaCSS(backgroundColorEnd) + ' 100%)')
                        .css('background', 'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#' + backgroundColor.substr(0, 6) + '\', endColorstr=\'#' + backgroundColorEnd.substr(0, 6) + '\',GradientType=1)');
                    break;
            }


        } else {
            if (backgroundColor.substr(6, 8) == '00') {
                this.background.canvas.css('background', '');
            } else {
                this.background.canvas.css('background', '#' + backgroundColor.substr(0, 6))
                    .css('background', N2Color.hex2rgbaCSS(backgroundColor));
            }
        }
    };

    /**
     * This event callback is responsible for the slide editor to show the apropiate background color and image.
     * @private
     */
    SmartSliderAdminSlide.prototype.__onAfterBackgroundImageChange = function () {
        smartSlider.$currentSlideElement.data('slideBackground').changeDesktop(smartSlider.generator.fill(this.background.slideBackgroundImageField.val()), '', this.background.slideBackgroundModeField.val(), this.background.slidebackgroundFocusX.val(), this.background.slidebackgroundFocusY.val());
        this.__onAfterBackgroundImageOpacityChange();
    };

    SmartSliderAdminSlide.prototype.__onAfterBackgroundImageOpacityChange = function () {
        smartSlider.$currentSlideElement.data('slideBackground').setOpacity(this.background.slideBackgroundImageOpacity.val() / 100);
    };

    /**
     * Warn old version IE users that the editor may fail to work in their browser.
     * @private
     */
    SmartSliderAdminSlide.prototype._warnInternetExplorerUsers = function () {
        var ie = this.__isInternetExplorer();
        if (ie && ie < 10) {
            alert(window.ss2lang.The_editor_was_tested_under_Internet_Explorer_10_Firefox_and_Chrome_Please_use_one_of_the_tested_browser);
        }
    };

    /**
     * @returns Internet Explorer version number or false
     * @private
     */
    SmartSliderAdminSlide.prototype.__isInternetExplorer = function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };

    SmartSliderAdminSlide.prototype.getLayout = function () {
        var propertiesRaw = $('#smartslider-form').serializeArray(),
            properties = {};

        for (var i = 0; i < propertiesRaw.length; i++) {
            var m = propertiesRaw[i].name.match(/slide\[(.*?)\]/);
            if (m) {
                properties[m[1]] = propertiesRaw[i].value;
            }
        }
        delete properties['generator'];
        delete properties['published'];
        delete properties['publishdates'];
        delete properties['record-start'];
        delete properties['record-slides'];
        delete properties['slide'];

        properties['slide'] = smartSlider.layerManager.getData();
        return properties;
    };

    SmartSliderAdminSlide.prototype.loadLayout = function (properties, slideDataOverwrite, layerOverwrite) {
        // we are working on references!
        var slide = properties['slide'];
        delete properties['slide'];
        if (layerOverwrite) {
            smartSlider.layerManager.loadData(slide, true);
        } else {
            smartSlider.layerManager.loadData(slide, false);
        }
        if (slideDataOverwrite) {
            for (var k in properties) {
                $('#slide' + k).val(properties[k]).trigger('change');
            }
        }
        properties['slide'] = slide;
    };

    SmartSliderAdminSlide.prototype.createHistory = function () {
        this.slideValues = {};
        n2('#smartslider-form').find('input[id][name^="slide"], textarea[id][name^="slide"]').not('#slideslide').each($.proxy(function (i, el) {
            var $input = $(el),
                field = $input.data('field'),
                id = $input.attr('id');
            this.slideValues[id] = $input.val();
            $input.on('nextendChange', $.proxy(function () {
                var newValue = $input.val(),
                    oldValue = this.slideValues[id];
                this.slideValues[id] = newValue;
                smartSlider.history.add($.proxy(function () {
                    return [this, 'slideValueChange', newValue, oldValue, [$input, field]];
                }, this));
            }, this));
        }, this));
    };


    SmartSliderAdminSlide.prototype.history = function (method, value, other) {
        switch (method) {
            case 'slideValueChange':
                other[1].insideChange(value);
                break;
        }
    };

    scope.SmartSliderAdminSlide = SmartSliderAdminSlide;

})(nextend.smartSlider, n2, window);
(function (smartSlider, $, scope, undefined) {

    var zoom = null;
    nextend['ssBeforeResponsive'] = function () {
        zoom = new NextendSmartSliderAdminZoom(this);
        nextend['ssBeforeResponsive'] = function () {
            zoom.add(this);
        };
    };

    function NextendSmartSliderAdminZoom(responsive) {

        this.key = 'n2-ss-editor-device-lock-mode';
        this.devices = {
            unknownUnknown: $('<div />')
        };
        this.responsives = [responsive];
        responsive.setOrientation('portrait');
        responsive.parameters.onResizeEnabled = 0;
        responsive.parameters.forceFull = 0; // We should disable force full feature on admin dashboard as it won't render before the sidebar
        responsive._getDevice = responsive._getDeviceZoom;

        this.lock = $('#n2-ss-lock').on('click', $.proxy(this.switchLock, this));

        var desktopWidth = responsive.parameters.sliderWidthToDevice['desktopPortrait'];

        this.container = responsive.containerElement.closest('.n2-ss-container-device').addBack();
        this.container.width(desktopWidth);
        this.containerWidth = desktopWidth;

        this.initZoom();

        var tr = $('#n2-ss-devices .n2-tr'),
            modes = responsive.parameters.deviceModes;

        this.devices.desktopPortrait = $('<div class="n2-td n2-panel-option" data-device="desktop" data-orientation="portrait"><i class="n2-i n2-it n2-i-v-desktop"></i></div>').prependTo(tr);
        if (modes.desktopLandscape) {
            this.devices.desktopLandscape = $('<div class="n2-td n2-panel-option" data-device="desktop" data-orientation="landscape"><i class="n2-i n2-it n2-i-v-desktop-landscape"></i></div>').prependTo(tr);
        } else {
            this.devices.desktopLandscape = this.devices.desktopPortrait;
        }

        if (modes.tabletPortrait) {
            this.devices.tabletPortrait = $('<div class="n2-td n2-panel-option" data-device="tablet" data-orientation="portrait"><i class="n2-i n2-it n2-i-v-tablet"></i></div>').prependTo(tr);
        } else {
            this.devices.tabletPortrait = this.devices.desktopPortrait;
        }
        if (modes.tabletLandscape) {
            this.devices.tabletLandscape = $('<div class="n2-td n2-panel-option" data-device="tablet" data-orientation="landscape"><i class="n2-i n2-it n2-i-v-tablet-landscape"></i></div>').prependTo(tr);
        } else {
            this.devices.tabletLandscape = this.devices.desktopLandscape;
        }

        if (modes.mobilePortrait) {
            this.devices.mobilePortrait = $('<div class="n2-td n2-panel-option" data-device="mobile" data-orientation="portrait"><i class="n2-i n2-it n2-i-v-mobile"></i></div>').prependTo(tr);
        } else {
            this.devices.mobilePortrait = this.devices.tabletPortrait;
        }
        if (modes.mobileLandscape) {
            this.devices.mobileLandscape = $('<div class="n2-td n2-panel-option" data-device="mobile" data-orientation="landscape"><i class="n2-i n2-it n2-i-v-mobile-landscape"></i></div>').prependTo(tr);
        } else {
            this.devices.mobileLandscape = this.devices.tabletLandscape;
        }

        this.deviceOptions = $('#n2-ss-devices .n2-panel-option');

        //$('#n2-ss-devices').css('width', (this.deviceOptions.length * 62) + 'px');

        this.deviceOptions.each($.proxy(function (i, el) {
            $(el).on({
                mousedown: $.proxy(nextend.context.setMouseDownArea, nextend.context, 'zoomDeviceClicked'),
                click: $.proxy(this.setDeviceMode, this)
            });
        }, this));

        responsive.sliderElement.on('SliderDeviceOrientation', $.proxy(this.onDeviceOrientationChange, this));
    };

    NextendSmartSliderAdminZoom.prototype.add = function (responsive) {

        this.responsives.push(responsive);
        responsive.setOrientation('portrait');
        responsive.parameters.onResizeEnabled = 0;
        responsive.parameters.forceFull = 0; // We should disable force full feature on admin dashboard as it won't render before the sidebar
        responsive._getDevice = responsive._getDeviceZoom;

        //responsive.sliderElement.on('SliderDeviceOrientation', $.proxy(this.onDeviceOrientationChange, this));
    }

    NextendSmartSliderAdminZoom.prototype.onDeviceOrientationChange = function (e, modes) {
        $('#n2-admin').removeClass('n2-ss-mode-' + modes.lastDevice + modes.lastOrientation)
            .addClass('n2-ss-mode-' + modes.device + modes.orientation);
        this.devices[modes.lastDevice + modes.lastOrientation].removeClass('n2-active');
        this.devices[modes.device + modes.orientation].addClass('n2-active');
    };

    NextendSmartSliderAdminZoom.prototype.setDeviceMode = function (e) {
        var el = $(e.currentTarget);
        if ((e.ctrlKey || e.metaKey) && smartSlider.layerManager) {
            var orientation = el.data('orientation');
            smartSlider.layerManager.copyOrResetMode(el.data('device') + orientation[0].toUpperCase() + orientation.substr(1));
        } else {
            for (var i = 0; i < this.responsives.length; i++) {
                this.responsives[i].setOrientation(el.data('orientation'));
                this.responsives[i].setMode(el.data('device'), this.responsives[0]);
            }
        }
    };

    NextendSmartSliderAdminZoom.prototype.switchLock = function (e) {
        e.preventDefault();
        this.lock.toggleClass('n2-active');
        if (this.lock.hasClass('n2-active')) {
            this.setZoomSyncMode();
            this.zoomChange(this.zoom.slider("value"), 'sync', false);

            $.jStorage.set(this.key, 'sync');
        } else {
            this.setZoomFixMode();
            $.jStorage.set(this.key, 'fix');
        }
    };

    NextendSmartSliderAdminZoom.prototype.initZoom = function () {
        var zoom = $("#n2-ss-slider-zoom");
        if (zoom.length > 0) {

            if (typeof zoom[0].slide !== 'undefined') {
                zoom[0].slide = null;
            }

            this.zoom =
                zoom.removeAttr('slide').slider({
                    range: "min",
                    step: 1,
                    value: 1,
                    min: 0,
                    max: 102
                });

            this.responsives[0].sliderElement.on('SliderResize', $.proxy(this.sliderResize, this));

            if ($.jStorage.get(this.key, 'sync') == 'fix') {
                this.setZoomFixMode();
            } else {
                this.setZoomSyncMode();
                this.lock.addClass('n2-active');
            }

            var parent = zoom.parent(),
                change = $.proxy(function (value) {
                    var oldValue = this.zoom.slider('value');
                    this.zoom.slider('value', oldValue + value);
                }, this),
                interval = null,
                mouseDown = $.proxy(function (value) {
                    change(value);
                    interval = setInterval($.proxy(change, this, value), 1000 / 25);
                }, this);
            parent.find('.n2-i-minus').on({
                mousedown: $.proxy(mouseDown, this, -1),
                'mouseup mouseleave': function () {
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }
                }
            });
            parent.find('.n2-i-plus').on({
                mousedown: $.proxy(mouseDown, this, 1),
                'mouseup mouseleave': function () {
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }
                }
            });
        }
    };

    NextendSmartSliderAdminZoom.prototype.sliderResize = function (e, ratios) {
        this.setZoom();
    };

    NextendSmartSliderAdminZoom.prototype.setZoomFixMode = function () {
        this.zoom.off('.n2-ss-zoom')
            .on({
                'slide.n2-ss-zoom': $.proxy(this.zoomChangeFixMode, this),
                'slidechange.n2-ss-zoom': $.proxy(this.zoomChangeFixMode, this)
            });
    };

    NextendSmartSliderAdminZoom.prototype.setZoomSyncMode = function () {

        this.zoom.off('.n2-ss-zoom')
            .on({
                'slide.n2-ss-zoom': $.proxy(this.zoomChangeSyncMode, this),
                'slidechange.n2-ss-zoom': $.proxy(this.zoomChangeSyncMode, this)
            });
    };

    NextendSmartSliderAdminZoom.prototype.zoomChangeFixMode = function (event, ui) {
        this.zoomChange(ui.value, 'fix', ui);
    };

    NextendSmartSliderAdminZoom.prototype.zoomChangeSyncMode = function (event, ui) {
        this.zoomChange(ui.value, 'sync', ui);
    };

    NextendSmartSliderAdminZoom.prototype.zoomChange = function (value, mode, ui) {
        var ratio = 1;
        if (value < 50) {
            ratio = nextend.smallestZoom / this.containerWidth + Math.max(value / 50, 0) * (1 - nextend.smallestZoom / this.containerWidth);
        } else if (value > 52) {
            ratio = 1 + (value - 52) / 50;
        }
        var width = parseInt(ratio * this.containerWidth);
        this.container.width(width);

        for (var i = 1; i < this.responsives.length; i++) {
            this.responsives[i].containerElement.width(width);
        }

        for (var i = 0; i < this.responsives.length; i++) {
            switch (mode) {
                case 'sync':
                    this.responsives[i].doResize();
                    break;
                default:
                    this.responsives[i].doResize(true);
                    break;
            }
        }
        if (ui) {
            ui.handle.innerHTML = width + 'px';
        }
    };

    NextendSmartSliderAdminZoom.prototype.setZoom = function () {
        var ratio = this.responsives[0].containerElement.width() / this.containerWidth;
        var v = 50;
        if (ratio < 1) {
            v = (ratio - nextend.smallestZoom / this.containerWidth) / (1 - nextend.smallestZoom / this.containerWidth) * 50;
        } else if (ratio > 1) {
            v = (ratio - 1) * 50 + 52;
        }
        var oldValue = this.zoom.slider('value');
        this.zoom.slider('value', v);
    };
})
(nextend.smartSlider, n2, window);
(function ($, scope) {

    function NextendSmartSliderCreateSlider(groupID, ajaxUrl) {
        this.addToGroupModal = null;
        this.groupID = groupID;
        this.ajaxUrl = ajaxUrl;
        $('.n2-ss-create-slider').click($.proxy(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.showModal();
        
        }, this));

        this.notificationStack = new NextendNotificationCenterStackModal($('body'));
        $('.n2-ss-add-sample-slider').click($.proxy(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.showDemoSliders();
        

        }, this));

        if (window.location.hash.substring(1) == 'createslider') {
            this.showModal();
        }
    }

    NextendSmartSliderCreateSlider.prototype.showModal = function () {
        if (!this.createSliderModal) {
            var that = this;
            var ajaxUrl = this.ajaxUrl;
            var presets = [];

            presets.push({
                key: 'default',
                name: n2_('Default'),
                image: '$ss$/admin/images/sliderpresets/default.png'
            });
            presets.push({
                key: 'fullwidth',
                name: n2_('Full width'),
                image: '$ss$/admin/images/sliderpresets/fullwidth.png'
            });
            presets.push({
                key: 'thumbnailhorizontal',
                name: n2_('Thumbnail - horizontal'),
                image: '$ss$/admin/images/sliderpresets/thumbnailhorizontal.png'
            });
            this.createSliderModal = new NextendModal({
                zero: {
                    size: [
                        N2SSPRO ? 750 : 550,
                        N2SSPRO ? 630 : 390 + 130
                    ],
                    title: n2_('Create Slider'),
                    back: false,
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: [
                        '<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Create') + '</a>'
                    ],
                    fn: {
                        show: function () {

                            var button = this.controls.find('.n2-button-green'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                });

                            form.append(this.createInput(n2_('Slider name'), 'createslidertitle', 'width: 240px;'));
                            form.append(this.createInputUnit(n2_('Width'), 'createsliderwidth', 'px', 'width: 30px;'));
                            form.append(this.createInputUnit(n2_('Height'), 'createsliderheight', 'px', 'width: 30px;'));

                            new NextendElementAutocompleteSimple("createsliderwidth", ["1920", "1200", "1000", "800", "600", "400"]);
                            new NextendElementAutocompleteSimple("createsliderheight", ["800", "600", "500", "400", "300", "200"]);

                            var sliderTitle = $('#createslidertitle').val(n2_('Slider')).focus(),
                                sliderWidth = $('#createsliderwidth').val(900),
                                sliderHeight = $('#createsliderheight').val(500);

                            sliderWidth.parent().addClass('n2-form-element-autocomplete ui-front');
                            sliderHeight.parent().addClass('n2-form-element-autocomplete ui-front');

                            this.createHeading(n2_('Preset')).appendTo(this.content);

                            var imageRadio = this.createImageRadio(presets)
                                .css('height', N2SSPRO ? 360 : 100)
                                .appendTo(this.content),
                                sliderPreset = imageRadio.find('input');
                            imageRadio.css('overflow', 'hidden');
                            this.createHeading(n2_('Import Sample Sliders')).appendTo(this.content);
                            $('<div class="n2-ss-create-slider-free-sample" style="background-image: url(\'' + nextend.imageHelper.fixed('$ss$/admin/images/free/sample1.png') + '\')"></div><div class="n2-ss-create-slider-free-sample" style="background-image: url(\'' + nextend.imageHelper.fixed('$ss$/admin/images/free/sample2.png') + '\')"></div><div class="n2-ss-create-slider-free-sample" style="background-image: url(\'' + nextend.imageHelper.fixed('$ss$/admin/images/free/sample3.png') + '\')"></div>')
                                .on('click', $.proxy(function () {
                                    this.hide();
                                    that.showDemoSliders();
                                }, this))
                                .appendTo(this.content);
                        

                            button.on('click', $.proxy(function () {

                                NextendAjaxHelper.ajax({
                                    type: "POST",
                                    url: NextendAjaxHelper.makeAjaxUrl(ajaxUrl, {
                                        nextendaction: 'create'
                                    }),
                                    data: {
                                        groupID: that.groupID,
                                        sliderTitle: sliderTitle.val(),
                                        sliderSizeWidth: sliderWidth.val(),
                                        sliderSizeHeight: sliderHeight.val(),
                                        preset: sliderPreset.val()
                                    },
                                    dataType: 'json'
                                }).done($.proxy(function (response) {
                                    NextendAjaxHelper.startLoading();
                                }, this));

                            }, this));
                        }
                    }
                }
            });
        }
        this.createSliderModal.show();
    };

    NextendSmartSliderCreateSlider.prototype.showDemoSliders = function () {
        var that = this;
        $('body').css('overflow', 'hidden');
        var pro = 0;
        var frame = $('<iframe src="//smartslider3.com/demo-import/?pro=' + pro + '&version=' + N2SS3VERSION + '&utm_campaign=' + N2SS3C + '&utm_source=import-slider-frame&utm_medium=smartslider-' + N2PLATFORM + '-' + (pro ? 'pro' : 'free') + '" frameborder="0"></iframe>').css({
                position: 'fixed',
                zIndex: 100000,
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
            }).appendTo('body'),
            closeFrame = function () {
                $('body').css('overflow', '');
                frame.remove();
                window.removeEventListener("message", listener, false);
                that.notificationStack.popStack();
            },
            importSlider = function (href) {
                NextendAjaxHelper.ajax({
                    type: "POST",
                    url: NextendAjaxHelper.makeAjaxUrl(that.ajaxUrl, {
                        nextendaction: 'importDemo'
                    }),
                    data: {
                        groupID: that.groupID,
                        key: Base64.encode(href.replace(/^(http(s)?:)?\/\//, '//'))
                    },
                    dataType: 'json'
                }).fail(function () {
                    //closeFrame();
                });
            },
            listener = function (e) {
                if (e.origin !== "http://smartslider3.com" && e.origin !== "https://smartslider3.com")
                    return;
                var msg = e.data;
                switch (msg.key) {
                    case 'importSlider':
                        if (typeof nextend.joinCommunity === 'function') {
                            nextend.joinCommunity(function () {
                                importSlider(msg.data.href);
                            });
                        } else {
                            importSlider(msg.data.href);
                        }
                    
                        return;

                        break;
                    case 'closeWindow':
                        closeFrame();
                }
            };

        this.notificationStack.enableStack();
        NextendEsc.add($.proxy(function () {
            closeFrame();
            return true;
        }, this));

        window.addEventListener("message", listener, false);
    };

    scope.NextendSmartSliderCreateSlider = NextendSmartSliderCreateSlider;

})(n2, window);
(function ($, scope) {

    function sliders(groupID, ajaxUrl) {
        this.preventSort = false;
        this.groupID = groupID;
        this.ajaxUrl = ajaxUrl;
        this.sliders = [];
        this.sliderPanel = $('#n2-ss-slider-container');
        this.orderBy = this.sliderPanel.data('orderby') == 'ordering' ? true : false;
        this.slidersContainer = this.sliderPanel.find('.n2-ss-sliders-container');

        var sliders = this.slidersContainer.find('.n2-ss-box-slider');
        for (var i = 0; i < sliders.length; i++) {
            this.sliders.push(new NextendSmartSliderAdminSlider(this, sliders.eq(i)));
        }

        this.changed();

        this.initMenu();

        this.initOrderable();

        this.create = new NextendSmartSliderCreateSlider(groupID, ajaxUrl);
        this.initBulk();
    }

    sliders.prototype.changed = function () {

        $('html').attr('data-sliders', this.sliders.length);
    };

    sliders.prototype.initSliders = function () {
        var previousLength = this.sliders.length;
        var sliderNodes = this.slidersContainer.find('.n2-ss-box-slider'),
            sliders = [];
        for (var i = 0; i < sliderNodes.length; i++) {
            var slider = sliderNodes.eq(i).data('slider');
            sliders.push(slider);
        }
        this.sliders = sliders;
        this.changed();
        $(window).triggerHandler('SmartSliderSidebarSlidersChanged');
    };

    sliders.prototype.initOrderable = function () {
        if (this.orderBy) {
            this.slidersContainer.sortable({
                helper: 'clone',
                forcePlaceholderSize: false,
                tolerance: "pointer",
                connectWith: '.n2-ss-box-slider-group',
                items: ".n2-ss-box-slider",
                start: function (event, ui) {
                    ui.item.show();
                },
                stop: $.proxy(this.saveOrder, this),
                placeholder: 'n2-box-sortable-placeholder',
                distance: 10
            });
        }
    };

    sliders.prototype.saveOrder = function (e) {
        if (this.preventSort) {
            this.slidersContainer.sortable("cancel");
            this.preventSort = false;
            return;
        }
        var sliderNodes = this.slidersContainer.find('.n2-ss-box-slider'),
            sliders = [],
            ids = [],
            originalIds = [];
        for (var i = 0; i < sliderNodes.length; i++) {
            var slider = sliderNodes.eq(i).data('slider');
            sliders.push(slider);
            ids.push(slider.getId());
        }
        for (var i = 0; i < this.sliders.length; i++) {
            originalIds.push(this.sliders[i].getId());
        }

        if (JSON.stringify(originalIds) != JSON.stringify(ids)) {
            $(window).triggerHandler('SmartSliderSidebarSlidersOrderChanged');
            var queries = {
                nextendcontroller: 'sliders',
                nextendaction: 'order'
            };
            NextendAjaxHelper.ajax({
                type: 'POST',
                url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, queries),
                data: {
                    groupID: this.groupID,
                    sliderorder: ids,
                    isReversed: (this.sliderPanel.data('orderbydirection') == 'DESC' ? 1 : 0)
                }
            });
            this.sliders = sliders;
        }
    };


    sliders.prototype.initMenu = function () {
        this.slider = null;
        this.menu = $('#n2-ss-slider-menu').detach().addClass('n2-inited');

        this.menuActions = {
            addToGroup: this.menu.find('.n2-ss-add-to-group').on('click', $.proxy(function (e) {
                e.stopPropagation();
                e.preventDefault();
                this.addToGroup([this.slider.getId()]);
            }, this)),
            removeFromGroup: this.menu.find('.n2-ss-remove-from-group').on('click', $.proxy(function (e) {
                e.stopPropagation();
                e.preventDefault();
                this.removeFromGroup([this.slider.getId()]);
            }, this)),
            duplicate: this.menu.find('.n2-ss-duplicate').on('click', $.proxy(function (e) {
                this.slider.duplicate(e);
            }, this)),
            'delete': this.menu.find('.n2-ss-delete').on('click', $.proxy(function (e) {
                this.slider.delete(e);
            }, this)),
            preview: this.menu.find('.n2-ss-preview').on('click', $.proxy(function (e) {
                this.slider.preview(e);
            }, this)),
        }

        this.menu.find('.n2-button').on('click', $.proxy(function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.menu.hasClass('n2-active')) {
                this.menu.removeClass('n2-active').off('mouseleave');
            } else {
                this.menu.addClass('n2-active').on('mouseleave', function () {
                    $(this).removeClass('n2-active');
                });
            }
        }, this));
    }


    sliders.prototype.showMenu = function (slider) {
        this.slider = slider;
        this.menu.appendTo(slider.box);
    }

    sliders.prototype.hideMenu = function () {
        if (this.menu.hasClass('n2-active')) {
            this.menu.removeClass('n2-active').off('mouseleave');
        }
        this.menu.detach();
    }

    sliders.prototype.deleteSliders = function (ids, sliders) {
        this.hideMenu();
        var title = sliders[0].box.find('.n2-box-placeholder-title a').text();
        if (sliders.length > 1) {
            title += ' and ' + (sliders.length - 1) + ' more';
        }
        NextendDeleteModal('slider-delete', title, $.proxy(function () {
            NextendAjaxHelper.ajax({
                url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                    nextendcontroller: 'sliders',
                    nextendaction: 'delete'
                }),
                type: 'POST',
                data: {
                    sliders: ids
                }
            }).done($.proxy(function () {
                for (var i = 0; i < sliders.length; i++) {
                    sliders[i].deleted();
                }
                this.initSliders();
                this.leaveBulk();
            }, this));
        }, this));
    };

    sliders.prototype.duplicateSliders = function (ids, slides) {
        for (var i = 0; i < this.sliders.length; i++) {
            if (this.sliders[i].selected) {
                this.sliders[i].duplicate($.Event("click", {
                    currentTarget: null
                }));
            }
        }
    };

    sliders.prototype.exportSliders = function (ids, sliders) {

        window.location.href = (NextendAjaxHelper.makeFallbackUrl(this.ajaxUrl, {
            nextendcontroller: 'sliders',
            nextendaction: 'exportAll'
        }) + '&' + $.param({sliders: ids, currentGroupID: this.groupID}));
    };


    sliders.prototype.initBulk = function () {

        this.selection = [];

        this.isBulkSelection = false;

        var selects = $('.n2-bulk-select').find('a');

        //Select all
        selects.eq(0).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slider) {
                slider.select();
            });
        }, this));

        //Select none
        selects.eq(1).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slider) {
                slider.deSelect();
            });
        }, this));

        var actions = $('.n2-bulk-actions').find('a')
            .on('click', $.proxy(function (e) {
                e.preventDefault();

                switch ($(e.currentTarget).data('action')) {
                    case 'duplicate':
                        this.bulkAction('duplicateSliders', false);
                        break;
                    case 'delete':
                        this.bulkAction('deleteSliders', false);
                        break;
                    case 'export':
                        this.bulkAction('exportSliders', false);
                        break;
                    case 'addToGroup':
                        this.bulkAction('addToGroup', true);
                        break;
                }
            }, this));
    };

    sliders.prototype.addSelection = function (slider) {
        if (this.selection.length == 0) {
            this.enterBulk();
        }
        this.selection.push(slider);
    }

    sliders.prototype.removeSelection = function (slider) {
        this.selection.splice($.inArray(slider, this.selection), 1);
        if (this.selection.length == 0) {
            this.leaveBulk();
        }
    }

    sliders.prototype.bulkSelect = function (cb) {
        for (var i = 0; i < this.sliders.length; i++) {
            cb(this.sliders[i]);
        }
    };

    sliders.prototype.bulkAction = function (action, skipGroups) {
        var sliders = [],
            ids = [];
        this.bulkSelect(function (slider) {
            if (slider.selected && (!skipGroups || !slider.isGroup)) {
                sliders.push(slider);
                ids.push(slider.getId());
            }
        });
        if (ids.length) {
            this[action](ids, sliders);
            this.leaveBulk();
        } else {
            if (skipGroups) {
                nextend.notificationCenter.notice('Please select one or more sliders for the action!');
            } else {
                nextend.notificationCenter.notice('Please select one or more sliders or groups for the action!');
            }
        }
    };

    sliders.prototype.enterBulk = function () {
        if (!this.isBulkSelection) {
            this.isBulkSelection = true;
            if (this.orderBy) {
                this.slidersContainer.sortable('option', 'disabled', true);
            }
            $('#n2-admin').addClass('n2-ss-has-box-selection');
        }
    };

    sliders.prototype.leaveBulk = function () {
        if (this.isBulkSelection) {
            if (this.orderBy) {
                this.slidersContainer.sortable('option', 'disabled', false);
            }
            $('#n2-admin').removeClass('n2-ss-has-box-selection');

            for (var i = 0; i < this.sliders.length; i++) {
                this.sliders[i].deSelect();
            }
            this.selection = [];
            this.isBulkSelection = false;
        }
    };

    sliders.prototype.removeFromGroup = function (sliders) {
        return NextendAjaxHelper.ajax({
            type: "POST",
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'removeFromGroup'
            }),
            data: {
                currentGroupID: this.groupID,
                sliders: sliders
            },
            dataType: 'json'
        }).done($.proxy(function (response) {
            for (var i = 0; i < sliders.length; i++) {
                $('[data-sliderid="' + sliders[i] + '"]').data('slider').deleted();
            }
            this.initSliders();
        }, this));
    }

    sliders.prototype._addToGroup = function (action, groupID, sliders) {
        return NextendAjaxHelper.ajax({
            type: "POST",
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'addToGroup'
            }),
            data: {
                currentGroupID: this.groupID,
                groupID: groupID,
                action: action,
                sliders: sliders
            },
            dataType: 'json'
        }).done($.proxy(function (response) {

            if (action == 'move') {
                for (var i = 0; i < sliders.length; i++) {
                    $('[data-sliderid="' + sliders[i] + '"]').data('slider').deleted();
                }

                this.initSliders();
            }

            var groupCounter = $('[data-sliderid="' + groupID + '"] .n2-box-placeholder-buttons .n2-button-grey');
            groupCounter.html(parseInt(groupCounter.html()) + sliders.length);
        }, this));
    };

    sliders.prototype.addToGroup = function (sliders) {
        var groups = null;
        var that = this;
        var ajaxUrl = this.ajaxUrl;

        var addToGroupModal = new NextendModal({
            zero: {
                size: [
                    350,
                    220
                ],
                title: n2_('Add to group'),
                back: false,
                close: true,
                content: '<form class="n2-form"></form>',
                controls: [
                    '<div class="n2-button n2-button-with-actions n2-button-l n2-button-green n2-radius-s n2-h4"><a class="n2-button-inner" href="#" data-action="move">' + n2_('Move') + '</a>' +
                    '<div class="n2-button-menu-open"><i class="n2-i n2-i-buttonarrow"></i><div class="n2-button-menu"><div class="n2-button-menu-inner n2-border-radius">' +
                    '<a class="n2-h4" href="#" data-action="copy">' + n2_('Copy') + '</a>' +
                    '<a class="n2-h4" href="#" data-action="link">' + n2_('Link') + '</a>' +
                    '</div></div></div></div>',
                ],
                fn: {
                    show: function () {

                        this.controls.find(".n2-button-menu-open").n2opener();

                        var button = this.controls.find('a'),
                            form = this.content.find('.n2-form').on('submit', function (e) {
                                e.preventDefault();
                                button.eq(0).trigger('click');
                            });

                        form.append(this.createSelect(n2_('Group'), 'choosegroup', groups, 'width:300px;'));

                        var choosegroup = $('#choosegroup');

                        button.on('click', $.proxy(function (e) {

                            e.preventDefault();

                            that._addToGroup($(e.currentTarget).data('action'), choosegroup.val(), sliders)
                                .done($.proxy(function () {
                                    this.hide(e);
                                }, this));

                        }, this));
                    }
                }
            }
        });


        NextendAjaxHelper.ajax({
            type: "POST",
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendcontroller: 'sliders',
                nextendaction: 'listGroups'
            }),
            dataType: 'json'
        }).done($.proxy(function (response) {
            groups = response.data;
            if (typeof groups[this.groupID] !== 'undefined') {
                delete groups[this.groupID];
            }
            if ($.isEmptyObject(groups)) {
                $('body').on({
                    'groupAdded.addToGroup': $.proxy(function () {
                        $('body').off('.addToGroup');
                        NextendAjaxHelper.ajax({
                            type: "POST",
                            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                                nextendcontroller: 'sliders',
                                nextendaction: 'listGroups'
                            }),
                            dataType: 'json'
                        }).done($.proxy(function (response) {
                            groups = response.data;
                            if (typeof groups[this.groupID] !== 'undefined') {
                                delete groups[this.groupID];
                            }
                            addToGroupModal.show();
                        }, this));

                    }, this),
                    'groupAddCanceled.addToGroup': $.proxy(function () {
                        $('body').off('.addToGroup');
                    }, this)
                });

                this.createGroup.showModal();

            } else {
                addToGroupModal.show();
            }
        }, this));
    };

    scope.NextendSmartSliderManageSliders = sliders;

})(n2, window);
(function ($, scope) {
    function slider(manager, box) {
        this.selected = false;
        this.manager = manager;

        this.box = box.data('slider', this)
            .addClass('n2-clickable');

        this.isGroup = this.box.hasClass('n2-ss-box-slider-group');

        this.box
            .on('mouseenter', $.proxy(function () {
                this.manager.showMenu(this);
            }, this))
            .on('mouseleave', $.proxy(function () {
                this.manager.hideMenu();
            }, this))
            .on('click.n2-slider', $.proxy(this.goToEdit, this));

        this.box.find('.n2-ss-box-select').on('click', $.proxy(function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.invertSelection();
        }, this));
    };

    slider.prototype.getId = function () {
        return this.box.data('sliderid');
    };

    slider.prototype.goToEdit = function (e, isBlank) {
        var editUrl = this.box.data('editurl');
        if (typeof isBlank !== 'undefined' && isBlank) {
            window.open(editUrl, '_blank');
        } else {
            window.location = editUrl;
        }
    };

    slider.prototype.preview = function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.open(NextendAjaxHelper.makeFallbackUrl(this.box.data('editurl'), {
            nextendcontroller: 'preview',
            nextendaction: 'index'
        }), '_blank');
    };


    slider.prototype.duplicate = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var deferred = $.Deferred();
        NextendAjaxHelper.ajax({
            url: NextendAjaxHelper.makeAjaxUrl(this.box.data('editurl'), {
                nextendcontroller: 'slider',
                nextendaction: 'duplicate'
            })
        }).done($.proxy(function (response) {
            var box = $(response.data).insertAfter(this.box);
            var newSlider = new slider(this.manager, box);
            this.manager.initSliders();
            deferred.resolve(newSlider);
        }, this));
        return deferred;
    };

    slider.prototype.delete = function (e) {
        e.stopPropagation();
        e.preventDefault();
        this.manager.deleteSliders([this.getId()], [this]);
    };
    slider.prototype.deleted = function () {
        this.box.remove();
    };

    slider.prototype.invertSelection = function (e) {
        if (e) {
            e.preventDefault();
        }

        if (!this.selected) {
            this.select();
        } else {
            this.deSelect();
        }
    };

    slider.prototype.select = function () {
        if (!this.selected) {
            this.selected = true;
            this.box.addClass('n2-selected');
            this.manager.addSelection(this);
        }
    };

    slider.prototype.deSelect = function () {
        if (this.selected) {
            this.selected = false;
            this.box.removeClass('n2-selected');
            this.manager.removeSelection(this);
        }
    };

    scope.NextendSmartSliderAdminSlider = slider;
})(n2, window);
;
(function ($, scope) {

    function NextendElementAnimationManager(id, managerIdentifier) {
        this.element = $('#' + id);
        this.managerIdentifier = managerIdentifier;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        this.updateName(this.element.val());

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementAnimationManager.prototype = Object.create(NextendElement.prototype);
    NextendElementAnimationManager.prototype.constructor = NextendElementAnimationManager;


    NextendElementAnimationManager.prototype.show = function (e) {
        e.preventDefault();
        nextend[this.managerIdentifier].show(this.element.val(), $.proxy(this.save, this));
    };

    NextendElementAnimationManager.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    NextendElementAnimationManager.prototype.save = function (e, value) {
        this.val(value);
    };

    NextendElementAnimationManager.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    NextendElementAnimationManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    NextendElementAnimationManager.prototype.updateName = function (value) {
        if (value == '') {
            value = n2_('Disabled');
        } else if (value.split('||').length > 1) {
            value = n2_('Multiple animations')
        } else {
            value = n2_('Single animation');
        }
        this.name.val(value);
    };

    scope.NextendElementAnimationManager = NextendElementAnimationManager;

    function NextendElementPostAnimationManager() {
        NextendElementAnimationManager.prototype.constructor.apply(this, arguments);
    };


    NextendElementPostAnimationManager.prototype = Object.create(NextendElementAnimationManager.prototype);
    NextendElementPostAnimationManager.prototype.constructor = NextendElementPostAnimationManager;

    NextendElementPostAnimationManager.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var data = this.element.val().split('|*|');
        data[2] = '';
        this.val(data.join('|*|'));
    };
    NextendElementPostAnimationManager.prototype.updateName = function (value) {
        var data = value.split('|*|');
        value = data[2];
        if (value == '') {
            value = n2_('Disabled');
        } else if (value.split('||').length > 1) {
            value = n2_('Multiple animations');
        } else {
            value = n2_('Single animation');
        }
        this.name.val(value);
    };

    scope.NextendElementPostAnimationManager = NextendElementPostAnimationManager;

})(n2, window);
;
(function ($, scope) {

    function NextendElementBackground(id, value) {
        this.value = '';
        this.element = $('#' + id);

        this.$container = this.element.closest('.n2-form-tab');

        this.panel = $('#' + id + '-panel');
        this.setValue(value);
        this.options = this.panel.find('.n2-subform-image-option').on('click', $.proxy(this.selectOption, this));

        this.active = this.getIndex(this.options.filter('.n2-active').get(0));

        NextendElement.prototype.constructor.apply(this, arguments);
    };

    NextendElementBackground.prototype = Object.create(NextendElement.prototype);
    NextendElementBackground.prototype.constructor = NextendElementBackground;

    NextendElementBackground.prototype.selectOption = function (e) {
        var index = this.getIndex(e.currentTarget);
        if (index != this.active) {

            this.options.eq(index).addClass('n2-active');
            this.options.eq(this.active).removeClass('n2-active');

            this.active = index;

            var value = $(e.currentTarget).data('value');
            this.insideChange(value);
            this.setValue(value);

        }
    };
    NextendElementBackground.prototype.setValue = function (newValue) {
        this.$container.removeClass('n2-ss-background-type-' + this.value);
        this.value = newValue;
        this.$container.addClass('n2-ss-background-type-' + this.value);
    }

    NextendElementBackground.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    NextendElementBackground.prototype.getIndex = function (option) {
        return $.inArray(option, this.options);
    };

    scope.NextendElementBackground = NextendElementBackground;

})(n2, window);

(function ($, scope) {

    var STATUS = {
            INITIALIZED: 0,
            PICK_PARENT: 1,
            PICK_CHILD: 2,
            PICK_PARENT_ALIGN: 3,
            PICK_CHILD_ALIGN: 4/*,
             UNDER_PICK_PARENT: 1,
             UNDER_PICK_CHILD: 2*/
        },
        OVERLAYS = '<div class="n2-ss-picker-overlay-tile" data-align="left" data-valign="top" />' +
            '<div class="n2-ss-picker-overlay-tile" data-align="center" data-valign="top" style="left:33%;top:0;" />' +
            '<div class="n2-ss-picker-overlay-tile" data-align="right" data-valign="top" style="left:66%;top:0;width:34%;" />' +
            '<div class="n2-ss-picker-overlay-tile" data-align="left" data-valign="middle" style="left:0;top:33%;" />' +
            '<div class="n2-ss-picker-overlay-tile" data-align="center" data-valign="middle" style="left:33%;top:33%; " />' +
            '<div class="n2-ss-picker-overlay-tile" data-align="right" data-valign="middle" style="left:66%;top:33%;width:34%;" />' +
            '<div class="n2-ss-picker-overlay-tile" data-align="left" data-valign="bottom" style="left:0;top:66%;height:34%;" />' +
            '<div class="n2-ss-picker-overlay-tile" data-align="center" data-valign="bottom" style="left:33%;top:66%;height:34%;" />' +
            '<div class="n2-ss-picker-overlay-tile" data-align="right" data-valign="bottom" style="left:66%;top:66%;width:34%;height:34%;" />';

    function NextendElementLayerPicker(id) {
        this.status = 0;
        this.element = $('#' + id);
        this.$container = $('.n2-ss-parent-picker');
        this.overlays = null;

        this.aligns = this.element.parent().parent().siblings();

        this.picker = this.element.siblings('.n2-ss-layer-picker')
            .on({
                click: $.proxy(function () {
                    this.change('');
                }, this)
            });


        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementLayerPicker.prototype = Object.create(NextendElement.prototype);
    NextendElementLayerPicker.prototype.constructor = NextendElementLayerPicker;

    NextendElementLayerPicker.prototype.click = function (e) {
        if (!$('#n2-admin').hasClass('n2-ss-mode-desktopPortrait')) {
            nextend.notificationCenter.notice('To chain layers together, please switch to desktop portrait mode!');
            return;
        }
        if (this.status == STATUS.INITIALIZED) {
            this.data = {
                parent: null,
                parentVAlign: null,
                parentHAlign: null,
                child: null,
                childVAlign: null,
                childHAlign: null,
            };

            $('body').on('mousedown.n2-ss-parent-linker', $.proxy(function (e) {
                var el = $(e.target),
                    parent = el.parent();
                if (!el.hasClass('n2-ss-picker-overlay') && !el.hasClass('n2-ss-picker-overlay-tile')) {
                    this.destroy();
                }
            }, this));

            NextendEsc.add($.proxy(function () {
                this.destroy();
                return false;
            }, this));

            this.pickParent(e);
        } else {
            this.data = null;
            this.change('');
            this.destroy();
        }
    }

    NextendElementLayerPicker.prototype.pickParent = function (e) {
        var layerManager = nextend.smartSlider.layerManager,
            layers = $(layerManager.mainLayerGroup.getChildLayersRecursive(true));
        if (layers.length == 0) {
            this.destroy();
        } else {

            this.status = STATUS.PICK_PARENT;
            nextend.tooltipMouse.show('Pick the parent layer!', e);

            var overlays = $('<div class="n2-ss-picker-overlay"></div>').appendTo(layers)
                .on('click', $.proxy(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $layer = $(e.currentTarget).parent(),
                        layer = $layer.data('layerObject');

                    this.data.parent = $layer;

                    this._destroy();
                    this.pickParentAlign(e);

                }, this));
        }
    }

    NextendElementLayerPicker.prototype.pickParentAlign = function (e) {
        this.status = STATUS.PICK_PARENT_ALIGN;
        nextend.tooltipMouse.show('Pick the align point of the parent layer!', e);

        var overlays = $(OVERLAYS).appendTo(this.data.parent)
            .on('click', $.proxy(function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $currentTarget = $(e.currentTarget);
                this.data.parentHAlign = $currentTarget.data('align');
                this.data.parentVAlign = $currentTarget.data('valign');
                $currentTarget.off('click').addClass('n2-active');

                overlays.not($currentTarget).remove();
                this.pickChild(e);
            }, this));
    }

    NextendElementLayerPicker.prototype.pickChild = function (e) {
        this.status = STATUS.PICK_CHILD;
        nextend.tooltipMouse.show('Pick the child layer!', e);

        var layerManager = nextend.smartSlider.layerManager;
        var layers = $(layerManager.mainLayerGroup.getChildLayersRecursive(true)).not(this.data.parent);

        /**
         * Parent layers can not be child of one of their child layers.
         * @param layer
         */
        var recursiveRemoveParents = function (layer) {
            var pID = layer.data('layerObject').getProperty(false, 'parentid');
            if (pID && pID != '') {
                recursiveRemoveParents($('#' + pID));
            }
            layers = layers.not(layer);
        };

        recursiveRemoveParents(this.data.parent);

        if (!layers.length) {
            nextend.notificationCenter.error('There is no possible child layer for the selected parent layer!');
            this.destroy();
            return;
        }

        var overlays = $('<div class="n2-ss-picker-overlay"></div>').appendTo(layers)
            .on('click', $.proxy(function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $layer = $(e.currentTarget).parent(),
                    layer = $layer.data('layerObject');

                this.data.child = $layer;

                overlays.remove();
                this.pickChildAlign(e);

            }, this));
    }

    NextendElementLayerPicker.prototype.pickChildAlign = function (e) {
        this.status = STATUS.PICK_CHILD_ALIGN;

        nextend.tooltipMouse.show('Pick the align point of the child layer!', e);

        var overlays = $(OVERLAYS).appendTo(this.data.child)
            .on('click', $.proxy(function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $currentTarget = $(e.currentTarget);
                this.data.childHAlign = $currentTarget.data('align');
                this.data.childVAlign = $currentTarget.data('valign');

                this.done();

            }, this));
    }

    NextendElementLayerPicker.prototype._destroy = function () {
        $('.n2-ss-picker-overlay').remove();
        $('.n2-ss-picker-overlay-tile').remove();
    }

    NextendElementLayerPicker.prototype.destroy = function () {
        nextend.tooltipMouse.hide();
        this._destroy();
        $('body').off('.n2-ss-parent-linker');
        NextendEsc.pop();

        this.status = STATUS.INITIALIZED;
    }

    NextendElementLayerPicker.prototype.done = function () {

        this.data.child.data('layerObject').parentPicked(this.data.parent.data('layerObject'), this.data.parentHAlign, this.data.parentVAlign, this.data.childHAlign, this.data.childVAlign);
        this.destroy();
    }

    NextendElementLayerPicker.prototype.change = function (value) {
        this.element.val(value).trigger('change');
        this._setValue(value);
        this.triggerOutsideChange();
    };

    NextendElementLayerPicker.prototype.insideChange = function (value) {
        this.element.val(value);
        this._setValue(value);

        this.triggerInsideChange();
    };

    NextendElementLayerPicker.prototype._setValue = function (value) {
        if (value && value != '') {
            this.$container.css('display', '');
        } else {
            this.$container.css('display', 'none');
        }
    };

    scope.NextendElementLayerPicker = NextendElementLayerPicker;

})(n2, window);
;
(function ($, scope) {

    function NextendElementSliderType(id) {
        this.element = $('#' + id);

        this.setAttribute();

        this.element.on('nextendChange', $.proxy(this.setAttribute, this));
    };

    NextendElementSliderType.prototype.setAttribute = function () {

        $('#n2-admin').attr('data-slider-type', this.element.val());

        if (this.element.val() == 'block') {
            $('.n2-fm-shadow').trigger('click');
        }
    };

    scope.NextendElementSliderType = NextendElementSliderType;

})(n2, window);

;
(function ($, scope) {

    function NextendElementSliderWidgetArea(id) {
        this.element = $('#' + id);

        this.area = $('#' + id + '_area');

        this.areas = this.area.find('.n2-area');

        this.areas.on('click', $.proxy(this.chooseArea, this));

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementSliderWidgetArea.prototype = Object.create(NextendElement.prototype);
    NextendElementSliderWidgetArea.prototype.constructor = NextendElementSliderWidgetArea;


    NextendElementSliderWidgetArea.prototype.chooseArea = function (e) {
        var value = parseInt($(e.target).data('area'));

        this.element.val(value);
        this.setSelected(value);

        this.triggerOutsideChange();
    };

    NextendElementSliderWidgetArea.prototype.insideChange = function (value) {
        value = parseInt(value);
        this.element.val(value);
        this.setSelected(value);

        this.triggerInsideChange();
    };

    NextendElementSliderWidgetArea.prototype.setSelected = function (index) {
        this.areas.removeClass('n2-active');
        this.areas.eq(index - 1).addClass('n2-active');
    };

    scope.NextendElementSliderWidgetArea = NextendElementSliderWidgetArea;

})(n2, window);

"use strict";
(function ($, scope) {
    function NextendElementWidgetPosition(id) {

        this.element = $('#' + id + '-mode');
        this.container = this.element.closest('.n2-form-element-mixed');

        this.tabs = this.container.find('> .n2-mixed-group');

        this.element.on('nextendChange', $.proxy(this.onChange, this));

        this.onChange();
    };

    NextendElementWidgetPosition.prototype.onChange = function () {
        var value = this.element.val();

        if (value == 'advanced') {
            this.tabs.eq(2).css('display', '');
            this.tabs.eq(1).css('display', 'none');
        } else {
            this.tabs.eq(1).css('display', '');
            this.tabs.eq(2).css('display', 'none');
        }
    };

    scope.NextendElementWidgetPosition = NextendElementWidgetPosition;

})(n2, window);

(function (smartSlider, $, scope, undefined) {
    "use strict";
    function Generator() {
        this._refreshTimeout = null;
        this.modal = false;
        this.group = 0;
        smartSlider.generator = this;
        var variables = smartSlider.$currentSlideElement.data('variables');
        if (variables) {
            this.variables = variables;

            for (var i in this.variables) {
                if (!isNaN(parseFloat(i)) && isFinite(i)) {
                    this.group = Math.max(this.group, parseInt(i) + 1);
                }
            }

            this.fill = this.generatorFill;
            if (this.group > 0) {
                this.registerField = this.generatorRegisterField;

                this.button = $('<a href="#" class="n2-button n2-button-normal n2-button-xs n2-radius-s n2-button-blue n2-h5 n2-uc" style="position:absolute;right: -2px;top: -18px;">Variable</a>')
                    .on('click', $.proxy(function (e) {
                        e.preventDefault();
                        this.showModal();
                    }, this));
                this.registerField($('#layerclass'));
                this.registerField($('#slidetitle'));
                this.registerField($('#slidedescription'));
                this.registerField($('#slidethumbnail'));
                this.registerField($('#slidebackgroundImage'));
                this.registerField($('#slidebackgroundAlt'));
                this.registerField($('#slidebackgroundTitle'));
                this.registerField($('#slidebackgroundVideoMp4'));
                this.registerField($('#slidebackgroundVideoWebm'));
                this.registerField($('#slidebackgroundVideoOgg'));
                this.registerField($('#linkslidelink_0'));
                this.registerField($('#layergenerator-visible'));
                this.registerField($('#layergroup-generator-visible'));

                $('body').addClass('n2-ss-dynamic-slide');
                //this.showModal();
            }

            this.initSlideDataRefresh();
        } else {
            this.variables = null;
        }
    };

    Generator.prototype.isDynamicSlide = function () {
        return this.group > 0;
    };

    Generator.prototype.splitTokens = function (input) {
        var tokens = [];
        var currentToken = "";
        var nestingLevel = 0;
        for (var i = 0; i < input.length; i++) {
            var currentChar = input[i];
            if (currentChar === "," && nestingLevel === 0) {
                tokens.push(currentToken);
                currentToken = "";
            } else {
                currentToken += currentChar;
                if (currentChar === "(") {
                    nestingLevel++;
                }
                else if (currentChar === ")") {
                    nestingLevel--;
                }
            }
        }
        if (currentToken.length) {
            tokens.push(currentToken);
        }
        return tokens;
    }

    Generator.prototype.fill = function (value) {
        return value;
    };

    Generator.prototype.generatorFill = function (value) {
        return value.replace(/{((([a-z]+)\(([^}]+)\))|([a-zA-Z0-9][a-zA-Z0-9_\/]*))}/g, $.proxy(this.parseFunction, this));
    };

    Generator.prototype.parseFunction = function (s, s2, s3, functionName, argumentString, variable) {
        if (typeof variable == 'undefined') {

            var args = this.splitTokens(argumentString);
            for (var i = 0; i < args.length; i++) {
                args[i] = this.parseVariable(args[i]);
            }
            return this[functionName].apply(this, args);
        } else {
            return this.parseVariable(variable);
        }
    };

    Generator.prototype.parseVariable = function (variable) {
        var _string = variable.match(/^("|')(.*)("|')$/);
        if (_string) {
            return _string[2];
        }

        var functionMatch = variable.match(/((([a-z]+)\(([^}]+)\)))/);
        if (functionMatch) {
            return this.parseFunction.apply(this, functionMatch);
        } else {
            var variableMatch = variable.match(/([a-zA-Z][0-9a-zA-Z_]*)(\/([0-9a-z]+))?/);
            if (variableMatch) {
                var index = variableMatch[3];
                if (typeof index == 'undefined') {
                    index = 0;
                } else {
                    var i = parseInt(index);
                    if (!isNaN(i)) {
                        index = Math.max(index, 1) - 1;
                    }
                }
                if (typeof this.variables[index] != 'undefined' && typeof this.variables[index][variableMatch[1]] != 'undefined') {
                    return this.variables[index][variableMatch[1]];
                }
                return '';
            }
            return variable;
        }
    };

    Generator.prototype.fallback = function (variable, def) {
        if (variable == '') {
            return def;
        }
        return variable;
    };

    Generator.prototype.cleanhtml = function (variable) {
        return strip_tags(variable, '<p><a><b><br /><br/><i>');
    };

    Generator.prototype.removehtml = function (variable) {
        return $('<div>' + variable + '</div>').text();
    };

    Generator.prototype.splitbychars = function (s, start, length) {
        return s.substr(start, length);
    };

    Generator.prototype.splitbywords = function (variable, start, length) {
        var s = variable,
            len = s.length,
            posStart = Math.max(0, start == 0 ? 0 : s.indexOf(' ', start)),
            posEnd = Math.max(0, length > len ? len : s.indexOf(' ', length));
        if(posEnd == 0 && length <= len) posEnd = len;
        return s.substr(posStart, posEnd);
    };

    Generator.prototype.findimage = function (variable, index) {
        var s = variable,
            re = /(<img.*?src=[\'"](.*?)[\'"][^>]*>)|(background(-image)??\s*?:.*?url\((["|\']?)?(.+?)(["|\']?)?\))/gi,
            r = [],
            tmp = null;

        index = typeof index != 'undefined' ? parseInt(index) - 1 : 0;

        while (tmp = re.exec(s)) {
            if (typeof tmp[2] != 'undefined') {
                r.push(tmp[2]);
            } else if (typeof tmp[6] != 'undefined') {
                r.push(tmp[6]);
            }
        }

        if (r.length) {
            if (r.length > index) {
                return r[index];
            } else {
                return r[r.length - 1];
            }
        } else {
            return '';
        }
    };

    Generator.prototype.findlink = function (variable, index) {
        var s = variable,
            re = /href=["\']?([^"\'>]+)["\']?/gi,
            r = [],
            tmp = null;

        index = typeof index != 'undefined' ? parseInt(index) - 1 : 0;

        while (tmp = re.exec(s)) {
            if (typeof tmp[1] != 'undefined') {
                r.push(tmp[1]);
            }
        }

        if (r.length) {
            if (r.length > index) {
                return r[index];
            } else {
                return r[r.length - 1];
            }
        } else {
            return '';
        }
    };

    Generator.prototype.removevarlink = function (variable) {
        var s = String(variable),
            re = /<a href=\"(.*?)\">(.*?)<\/a>/g;

        return s.replace(re, '');
    };

    Generator.prototype.registerField = function (field) {
    };

    Generator.prototype.generatorRegisterField = function (field) {
        var parent = field.parent();
        parent.on({
            mouseenter: $.proxy(function () {
                this.activeField = field;
                this.button.prependTo(parent);
            }, this)
        });
    };

    Generator.prototype.getModal = function () {
        var that = this;
        if (!this.modal) {
            var active = {
                    key: '',
                    group: 1,
                    filter: 'no',
                    split: 'no',
                    splitStart: 0,
                    splitLength: 300,
                    findImage: 0,
                    findImageIndex: 1,
                    findLink: 0,
                    findLinkIndex: 1,
                    removeVarLink: 0
                },
                getVariableString = function () {
                    var variable = active.key + '/' + active.group;
                    if (active.findImage) {
                        variable = 'findimage(' + variable + ',' + Math.max(1, active.findImageIndex) + ')';
                    }
                    if (active.findLink) {
                        variable = 'findlink(' + variable + ',' + Math.max(1, active.findLinkIndex) + ')';
                    }
                    if (active.removeVarLink) {
                        variable = 'removevarlink(' + variable + ')';
                    }
                    if (active.filter != 'no') {
                        variable = active.filter + '(' + variable + ')';
                    }
                    if (active.split != 'no' && active.splitStart >= 0 && active.splitLength > 0) {
                        variable = active.split + '(' + variable + ',' + active.splitStart + ',' + active.splitLength + ')';
                    }
                    return '{' + variable + '}';
                },
                resultContainer = $('<div class="n2-generator-result-container" />'),
                updateResult = function () {
                    resultContainer.html($('<div/>').text(that.fill(getVariableString())).html());
                };

            var group = that.group,
                variables = null,
                groups = null,
                content = $('<div class="n2-generator-insert-variable"/>');


            var groupHeader = NextendModal.prototype.createHeading(n2_('Choose the group')).appendTo(content);
            var groupContainer = $('<div class="n2-group-container" />').appendTo(content);


            content.append(NextendModal.prototype.createHeading(n2_('Choose the variable')));
            var variableContainer = $('<div class="n2-variable-container" />').appendTo(content);

            //content.append(NextendModal.prototype.createHeading('Functions'));
            var functionsContainer = $('<div class="n2-generator-functions-container n2-form-element-mixed" />')
                .appendTo($('<div class="n2-form" />').appendTo(content));

            content.append(NextendModal.prototype.createHeading(n2_('Result')));
            resultContainer.appendTo(content);


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Filter') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-list"><select autocomplete="off" name="filter" id="n2-generator-function-filter"><option selected="selected" value="no">' + n2_('No') + '</option><option value="cleanhtml">' + n2_('Clean HTML') + '</option><option value="removehtml">' + n2_('Remove HTML') + '</option></select></div></div></div>')
                .appendTo(functionsContainer);
            var filter = functionsContainer.find('#n2-generator-function-filter');
            filter.on('change', $.proxy(function () {
                active.filter = filter.val();
                updateResult();
            }, this));


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Split by chars') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-list"><select autocomplete="off" name="split" id="n2-generator-function-split"><option selected="selected" value="no">' + n2_('No') + '</option><option value="splitbychars">' + n2_('Strict') + '</option><option value="splitbywords">' + n2_('Respect words') + '</option></select></div><div class="n2-form-element-text n2-text-has-unit n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + n2_('Start') + '</div><input type="text" autocomplete="off" style="width: 22px;" class="n2-h5" value="0" id="n2-generator-function-split-start"></div><div class="n2-form-element-text n2-text-has-unit n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + n2_('Length') + '</div><input type="text" autocomplete="off" style="width: 22px;" class="n2-h5" value="300" id="n2-generator-function-split-length"></div></div></div>')
                .appendTo(functionsContainer);
            var split = functionsContainer.find('#n2-generator-function-split');
            split.on('change', $.proxy(function () {
                active.split = split.val();
                updateResult();
            }, this));
            var splitStart = functionsContainer.find('#n2-generator-function-split-start');
            splitStart.on('change', $.proxy(function () {
                active.splitStart = parseInt(splitStart.val());
                updateResult();
            }, this));
            var splitLength = functionsContainer.find('#n2-generator-function-split-length');
            splitLength.on('change', $.proxy(function () {
                active.splitLength = parseInt(splitLength.val());
                updateResult();
            }, this));


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Find image') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-onoff"><div class="n2-onoff-slider"><div class="n2-onoff-no"><i class="n2-i n2-i-close"></i></div><div class="n2-onoff-round"></div><div class="n2-onoff-yes"><i class="n2-i n2-i-tick"></i></div></div><input type="hidden" autocomplete="off" value="0" id="n2-generator-function-findimage"></div><div class="n2-form-element-text n2-text-has-unit n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + n2_('Index') + '</div><input type="text" autocomplete="off" style="width: 22px;" class="n2-h5" value="1" id="n2-generator-function-findimage-index"></div></div></div>')
                .appendTo(functionsContainer);

            var findImage = functionsContainer.find('#n2-generator-function-findimage');
            findImage.on('nextendChange', $.proxy(function () {
                active.findImage = parseInt(findImage.val());
                updateResult();
            }, this));
            var findImageIndex = functionsContainer.find('#n2-generator-function-findimage-index');
            findImageIndex.on('change', $.proxy(function () {
                active.findImageIndex = parseInt(findImageIndex.val());
                updateResult();
            }, this));


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Find link') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-onoff"><div class="n2-onoff-slider"><div class="n2-onoff-no"><i class="n2-i n2-i-close"></i></div><div class="n2-onoff-round"></div><div class="n2-onoff-yes"><i class="n2-i n2-i-tick"></i></div></div><input type="hidden" autocomplete="off" value="0" id="n2-generator-function-findlink"></div><div class="n2-form-element-text n2-text-has-unit n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + n2_('Index') + '</div><input type="text" autocomplete="off" style="width: 22px;" class="n2-h5" value="1" id="n2-generator-function-findlink-index"></div></div></div>')
                .appendTo(functionsContainer);

            var findLink = functionsContainer.find('#n2-generator-function-findlink');
            findLink.on('nextendChange', $.proxy(function () {
                active.findLink = parseInt(findLink.val());
                updateResult();
            }, this));
            var findLinkIndex = functionsContainer.find('#n2-generator-function-findlink-index');
            findLinkIndex.on('change', $.proxy(function () {
                active.findLinkIndex = parseInt(findLinkIndex.val());
                updateResult();
            }, this));


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Remove links') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-onoff"><div class="n2-onoff-slider"><div class="n2-onoff-no"><i class="n2-i n2-i-close"></i></div><div class="n2-onoff-round"></div><div class="n2-onoff-yes"><i class="n2-i n2-i-tick"></i></div></div><input type="hidden" autocomplete="off" value="0" id="n2-generator-function-removevarlink"></div></div></div>')
                .appendTo(functionsContainer);

            var removeVarLink = functionsContainer.find('#n2-generator-function-removevarlink');
            removeVarLink.on('nextendChange', $.proxy(function () {
                active.removeVarLink = parseInt(removeVarLink.val());
                updateResult();
            }, this));
            var removeVarLinkIndex = functionsContainer.find('#n2-generator-function-removevarlink-index');
            removeVarLinkIndex.on('change', $.proxy(function () {
                active.removeVarLinkIndex = parseInt(removeVarLinkIndex.val());
                updateResult();
            }, this));

            for (var k in this.variables[0]) {
                $('<a href="#" class="n2-button n2-button-normal n2-button-s n2-button-grey n2-radius-s">' + k + '</a>')
                    .on('click', $.proxy(function (key, e) {
                        e.preventDefault();
                        variables.removeClass('n2-active');
                        $(e.currentTarget).addClass('n2-active');
                        active.key = key;
                        updateResult();
                    }, this, k))
                    .appendTo(variableContainer);
            }

            variables = variableContainer.find('a');
            variables.eq(0).trigger('click');

            if (group == 1) {
                groupHeader.css('display', 'none');
                groupContainer.css('display', 'none');
            }
            for (var i = 0; i < group; i++) {
                $('<a href="#" class="n2-button n2-button-normal n2-button-s n2-button-grey n2-radius-s">' + (i + 1) + '</a>')
                    .on('click', $.proxy(function (groupIndex, e) {
                        e.preventDefault();
                        groups.removeClass('n2-active');
                        $(e.currentTarget).addClass('n2-active');
                        active.group = groupIndex + 1;
                        updateResult();
                    }, this, i))
                    .appendTo(groupContainer);
            }
            groups = groupContainer.find('a');
            groups.eq(0).trigger('click');

            var inited = false;

            this.modal = new NextendModal({
                zero: {
                    size: [
                        1000,
                        group > 1 ? 560 : 490
                    ],
                    title: n2_('Insert variable'),
                    back: false,
                    close: true,
                    content: content,
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green">' + n2_('Insert') + '</a>'],
                    fn: {
                        show: function () {
                            if (!inited) {
                                new NextendElementOnoff("n2-generator-function-findimage");
                                new NextendElementOnoff("n2-generator-function-findlink");
                                new NextendElementOnoff("n2-generator-function-removevarlink");
                                inited = true;
                            }
                            this.controls.find('.n2-button').on('click', $.proxy(function (e) {
                                e.preventDefault();
                                that.insert(getVariableString());
                                this.hide(e);
                            }, this));
                        }
                    }
                }
            }, false);

            this.modal.setCustomClass('n2-ss-generator-modal');
        }
        return this.modal;
    };

    Generator.prototype.showModal = function () {

        this.getModal().show();
    };

    Generator.prototype.insert = function (value) {
        this.activeField.val(value).trigger('change');
    };

    Generator.prototype.initSlideDataRefresh = function () {

        var name = $('#slidetitle').on('nextendChange', $.proxy(function () {
            this.variables.slide.name = name.val();
            this.refresh();
        }, this));

        var description = $('#slidedescription').on('nextendChange', $.proxy(function () {
            this.variables.slide.description = description.val();
            this.refresh();
        }, this));

    };


    Generator.prototype.refresh = function () {
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = null;
        }
        this._refreshTimeout = setTimeout($.proxy(this._refresh, this), 100);
    };

    Generator.prototype._refresh = function () {
        var layers = smartSlider.layerManager.layerList;
        for (var j = 0; j < layers.length; j++) {
            var items = layers[j].items;
            for (var i = 0; i < items.length; i++) {
                items[i].reRender();
            }
        }
    };


    scope.SmartSliderAdminGenerator = Generator;

})(nextend.smartSlider, n2, window);
(function ($, scope, undefined) {

    function GeneratorRecords(ajaxUrl) {
        this.ajaxUrl = ajaxUrl;

        $("#generatorrecord-viewer").on("click", $.proxy(this.showRecords, this));
    };

    GeneratorRecords.prototype.showRecords = function (e) {
        e.preventDefault();
        NextendAjaxHelper.ajax({
            type: "POST",
            url: this.ajaxUrl,
            data: $("#smartslider-form").serialize(),
            dataType: "json"
        }).done(function (response) {
            var modal = new NextendModal({
                zero: {
                    size: [
                        1300,
                        700
                    ],
                    title: "Records",
                    content: response.data.html
                }
            }, true);
            modal.content.css('overflow', 'auto');
        }).error(function (response) {
            if (response.status == 200) {
                var modal = new NextendModal({
                    zero: {
                        size: [
                            1300,
                            700
                        ],
                        title: "Response",
                        content: response.responseText
                    }
                }, true);
                modal.content.css('overflow', 'auto');
            }
        });
    };

    scope.NextendSmartSliderGeneratorRecords = GeneratorRecords;
})(n2, window);
(function (smartSlider, $, scope, undefined) {

    function Item(item, layer, itemEditor, createPosition) {
        this.item = item;
        this.layer = layer;
        this.itemEditor = itemEditor;

        this.type = this.item.data('item');
        this.values = this.item.data('itemvalues');

        if (typeof this.values !== 'object') {
            this.values = $.parseJSON(this.values);
        }

        if (scope['NextendSmartSliderItemParser_' + this.type] !== undefined) {
            this.parser = new scope['NextendSmartSliderItemParser_' + this.type](this, itemEditor.getItemType(this.type));
        } else {
            this.parser = new scope['NextendSmartSliderItemParser'](this);
        }
        this.item.data('item', this);

        if (typeof createPosition !== 'undefined') {
            if (this.layer.items.length == 0 || this.layer.items.length <= createPosition) {
                this.item.appendTo(this.layer.layer);
            } else {
                this.layer.items[createPosition].item.before(this.item);
            }
        }

        if (typeof createPosition === 'undefined' || this.layer.items.length == 0 || this.layer.items.length <= createPosition) {
            this.layer.items.push(this);
        } else {
            this.layer.items.splice(createPosition, 0, this);
        }

        if (this.item.children().length === 0) {
            this.reRender();
        }


        $('<div/>')
            .addClass('ui-helper ui-item-overlay')
            .css('zIndex', 89)
            .appendTo(this.item);

        $(window).trigger('ItemCreated');
    };

    Item.prototype.changeValue = function (property, value) {
        if (this == this.itemEditor.activeItem) {
            $('#item_' + this.type + property).data('field')
                .insideChange(value);
        } else {
            this.values[property] = value;
        }
    };

    Item.prototype.activate = function (e, context, force) {
        if (this.itemEditor.setActiveItem(this, context, force)) {
            this.parser.activate();
        }
    };

    Item.prototype.deActivate = function () {
        this.parser.deActivate();
    };

    Item.prototype.render = function (html, data, originalData) {
        this.layer.layer.triggerHandler('itemRender');
        this.item.html(this.parser.render(html, data));

        // These will be available on the backend render
        this.values = originalData;

        $('<div/>')
            .addClass('ui-helper ui-item-overlay')
            .css('zIndex', 89)
            .appendTo(this.item);

        var layerName = this.parser.getName(data);
        if (layerName === false) {
            layerName = this.type;
        } else {
            layerName = layerName.replace(/[<>]/gi, '');
        }
        this.layer.rename(layerName, false);

        this.layer.update();
    };

    Item.prototype.reRender = function (newData) {

        var data = {},
            itemEditor = this.itemEditor,
            form = itemEditor.getItemType(this.type),
            html = form.template;

        for (var name in this.values) {
            data[name] = this.values[name];
            //$.extend(data, this.parser.parse(name, data[name]));
        }

        data = $.extend({}, this.parser.getDefault(), data, newData);

        var originalData = $.extend({}, data);

        this.parser.parseAll(data, this);
        this.values = originalData;

        for (var k in data) {
            var reg = new RegExp('\\{' + k + '\\}', 'g');
            html = html.replace(reg, data[k]);
        }

        this.render($(html), data, this.values);
    };

    Item.prototype.duplicate = function () {
        this.layer.addItem(this.getHTML(), true);
    };

    Item.prototype.delete = function () {
        this.item.trigger('mouseleave');
        this.item.remove();

        if (this.itemEditor.activeItem == this) {
            this.itemEditor.activeItem = null;
        }

    };

    Item.prototype.getHTML = function (base64) {
        var item = '';
        if (base64) {

            item = '[' + this.type + ' values="' + Base64.encode(JSON.stringify(this.values)) + '"]';
        } else {
            item = $('<div class="n2-ss-item n2-ss-item-' + this.type + '"></div>')
                .attr('data-item', this.type)
                .attr('data-itemvalues', JSON.stringify(this.values));
        }
        return item;
    };

    Item.prototype.getData = function () {
        return {
            type: this.type,
            values: this.values
        };
    };


    Item.prototype.history = function (method, value, other) {
        switch (method) {
            case 'updateCurrentItem':
                this.reRender($.extend(true, {}, value));
                this.values = value;
                this.itemEditor.setActiveItem(this, null, true);
                break;
        }
    };

    scope.NextendSmartSliderItem = Item;
})(nextend.smartSlider, n2, window);
(function (smartSlider, $, scope, undefined) {

    function ItemManager(layerEditor) {
        this.suppressChange = false;

        this.activeItemOriginalData = null;

        this.layerEditor = layerEditor;

        this._initInstalledItems();

        this.form = {};
        this.activeForm = {
            form: $('<div></div>')
        };
    }

    ItemManager.prototype.setActiveItem = function (item, context, force) {
        if (item != this.activeItem || force) {
            this.activeItemOriginalData = null;

            var type = item.type,
                values = item.values;

            this.activeForm.form.css('display', 'none');

            this.activeForm = this.getItemType(type);

            if (this.activeItem) {
                this.activeItem.deActivate();
            }

            this.activeItem = item;

            this.suppressChange = true;

            for (var key in values) {
                var field = $('#item_' + type + key).data('field');
                if (field) {
                    field.insideChange(values[key]);
                }
            }

            this.suppressChange = false;

            this.activeForm.form.css('display', 'block');
            this.focusFirst(context);
            return true;
        }
        //this.focusFirst(context);
        return false;
    };

    ItemManager.prototype.focusFirst = function (context) {
        var field = this.activeForm.fields.eq(0).data('field');
        if (nextend.smartSlider.generator.isDynamicSlide() && field.connectedField && field.connectedField instanceof NextendElementImage) {

        } else {
            this.activeForm.fields.eq(0).data('field').focus(typeof context !== 'undefined' && context);
        }
    }

    ItemManager.prototype._initInstalledItems = function () {

        $('.n2-ss-core-item')
            .on('click', $.proxy(function (e) {
                this.createLayerItem(this.layerEditor.getActiveGroup(), $(e.currentTarget).data('item'), 'click');
            }, this));
    };

    ItemManager.prototype.createLayerItem = function (group, type, interaction) {

        group = group || this.layerEditor.getActiveGroup();

        var itemData = this.getItemType(type),
            layer = this.layerEditor.createLayer(group, $('.n2-ss-core-item-' + type).data('layerproperties'));

        var itemNode = $('<div></div>').data('item', type).data('itemvalues', $.extend(true, {}, itemData.values))
            .addClass('n2-ss-item n2-ss-item-' + type);

        var item = new scope.NextendSmartSliderItem(itemNode, layer, this, 0);
        if (interaction && interaction == "click") {
            layer.layer.trigger('mousedown', ['create']).trigger('mouseup', ['create']).trigger('click', ['create']);
        } else {
            layer.activate();
        }

        smartSlider.sidebarManager.switchTab('item');

        smartSlider.history.add($.proxy(function () {
            return [this, 'createLayer', 'create', 'delete', [group, item, type]];
        }, this));

        return item;
    };

    /**
     * Initialize an item type and subscribe the field changes on that type.
     * We use event normalization to stop not necessary rendering.
     * @param type
     * @private
     */
    ItemManager.prototype.getItemType = function (type) {
        if (this.form[type] === undefined) {
            var form = $('#smartslider-slide-toolbox-item-type-' + type),
                formData = {
                    form: form,
                    template: form.data('itemtemplate'),
                    values: form.data('itemvalues'),
                    fields: form.find('[name^="item_' + type + '"]'),
                    fieldNameRegexp: new RegExp('item_' + type + "\\[(.*?)\\]", "")
                };
            formData.fields.on({
                nextendChange: $.proxy(this.updateCurrentItem, this),
                keydown: $.proxy(this.updateCurrentItemDeBounced, this)
            });

            this.form[type] = formData;
        }
        return this.form[type];
    };

    /**
     * This function renders the current item with the current values of the related form field.
     */
    ItemManager.prototype.updateCurrentItem = function (e) {
        if (!this.suppressChange) {
            if (this.activeItemOriginalData === null) {
                this.activeItemOriginalData = $.extend({}, this.activeItem.values);
            }
            var data = {},
                originalData = {},
                form = this.form[this.activeItem.type],
                html = form.template,
                parser = this.activeItem.parser;

            // Get the current values of the fields
            // Run through the related item filter
            // Replace the variables in the template of the item type
            form.fields.each($.proxy(function (i, field) {
                var field = $(field),
                    name = field.attr('name').match(form.fieldNameRegexp)[1];

                originalData[name] = data[name] = field.val();

            }, this));

            data = $.extend({}, parser.getDefault(), data);

            parser.parseAll(data, this.activeItem);
            for (var k in data) {
                var reg = new RegExp('\\{' + k + '\\}', 'g');
                html = html.replace(reg, data[k]);
            }
            if (e && e.type == 'nextendChange') {
                smartSlider.history.add($.proxy(function () {
                    return [this.activeItem, 'updateCurrentItem', $.extend({}, originalData), this.activeItemOriginalData, []];
                }, this));

                this.activeItemOriginalData = null;
            }
            this.activeItem.render($(html), data, originalData);
        }
    };

    ItemManager.prototype.updateCurrentItemDeBounced = NextendDeBounce(function (e) {
        this.updateCurrentItem(e);
    }, 100);


    ItemManager.prototype.history = function (method, value, other) {
        switch (method) {
            case 'createLayer':
                switch (value) {
                    case 'delete':
                        other[1].layer.delete();
                        break;
                    case 'create':
                        var item = this.createLayerItem(other[0], other[2]);
                        smartSlider.history.changeFuture(other[1].layer, item.layer);
                        smartSlider.history.changeFuture(other[1], item);
                        break;
                }
                break;
        }
    };

    scope.NextendSmartSliderItemManager = ItemManager;

})(nextend.smartSlider, n2, window);
(function ($, scope, undefined) {

    function ItemParser(item, formData) {
        this.pre = 'div#' + nextend.smartSlider.frontend.sliderElement.attr('id') + ' ';
        this.formData = formData;
        this.item = item;

        this.fonts = [];
        this.styles = [];

        this.needFill = [];
        this.added();
    }

    ItemParser.prototype.getDefault = function () {
        return {};
    };

    ItemParser.prototype.added = function () {

    };

    ItemParser.prototype.addedFont = function (mode, name) {
        var $input = $('#item_' + this.item.type + name);
        if ($input.length) {
            this.fonts.push({
                mode: mode,
                name: name,
                field: $input.data('field'),
                def: this.formData.values[name]
            });
            $.when(nextend.fontManager.addVisualUsage(mode, this.item.values[name], this.pre))
                .done($.proxy(function (existsFont) {
                    if (!existsFont) {
                        this.item.changeValue(name, '');
                    }
                }, this));
        }
    };

    ItemParser.prototype.addedStyle = function (mode, name) {
        var $input = $('#item_' + this.item.type + name);
        if ($input.length) {
            this.styles.push({
                mode: mode,
                name: name,
                field: $input.data('field'),
                def: this.formData.values[name]
            });

            $.when(nextend.styleManager.addVisualUsage(mode, this.item.values[name], this.pre))
                .done($.proxy(function (existsStyle) {
                    if (!existsStyle) {
                        this.item.changeValue(name, '');
                    }
                }, this));
        }

    };

    ItemParser.prototype.parseAll = function (data, item) {

        for (var i = 0; i < this.fonts.length; i++) {
            data[this.fonts[i].name + 'class'] = nextend.fontManager.getClass(data[this.fonts[i].name], this.fonts[i].mode) + ' ';
        }

        for (var i = 0; i < this.styles.length; i++) {
            data[this.styles[i].name + 'class'] = nextend.styleManager.getClass(data[this.styles[i].name], this.styles[i].mode) + ' ';
        }

        for (var i = 0; i < this.needFill.length; i++) {
            if (typeof data[this.needFill[i]] !== 'undefined') {
                data[this.needFill[i]] = nextend.smartSlider.generator.fill(data[this.needFill[i]] + '');
            }
        }
    };

    ItemParser.prototype.render = function (node, data) {
        return node;
    };

    ItemParser.prototype.getName = function (data) {
        return false;
    };

    ItemParser.prototype.resizeLayerToImage = function (item, image) {
        $("<img/>")
            .attr("src", image)
            .load(function () {
                var slideSize = item.layer.layerEditor.slideSize;
                var maxWidth = slideSize.width,
                    maxHeight = slideSize.height;

                if (this.width > 0 && this.height > 0) {
                    maxWidth = parseInt(Math.min(this.width, maxWidth));
                    maxHeight = parseInt(Math.min(this.height, maxHeight));
                    nextend.smartSlider.history.off();
                    if (slideSize.width / slideSize.height <= maxWidth / maxHeight) {
                        item.layer.setProperty('width', maxWidth);
                        item.layer.setProperty('height', this.height * maxWidth / this.width);
                    } else {
                        var width = Math.min(this.width * slideSize.height / this.height, maxWidth);
                        item.layer.setProperty('width', width);
                        item.layer.setProperty('height', this.height * width / this.width);
                    }
                    nextend.smartSlider.history.on();
                }
            });
    };

    ItemParser.prototype.fitLayer = function (item) {
        return false;
    };

    ItemParser.prototype.activate = function () {
        nextend.basicCSS.activate('ss3item' + this.item.type, this.item.values, {
            font: this.fonts,
            style: this.styles
        });
    }

    ItemParser.prototype.deActivate = function () {
        nextend.basicCSS.deActivate();
    }

    scope.NextendSmartSliderItemParser = ItemParser;

})(n2, window);
(function ($, scope, undefined) {

    function ItemParserButton() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserButton.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserButton.prototype.constructor = ItemParserButton;

    ItemParserButton.prototype.added = function () {
        this.needFill = ['content', 'url'];
        this.addedFont('link', 'font');
        this.addedStyle('button', 'style');

        nextend.smartSlider.generator.registerField($('#item_buttoncontent'));
        nextend.smartSlider.generator.registerField($('#linkitem_buttonlink_0'));
    };

    ItemParserButton.prototype.getName = function (data) {
        return data.content;
    };

    ItemParserButton.prototype.parseAll = function (data) {
        var link = data.link.split('|*|');
        data.url = link[0];
        data.target = link[1];
        delete data.link;

        if (data.fullwidth | 0) {
            data.display = 'block;';
        } else {
            data.display = 'inline-block;';
        }

        data.extrastyle = data.nowrap | 0 ? 'white-space: nowrap;' : '';

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);
    };

    scope.NextendSmartSliderItemParser_button = ItemParserButton;
})(n2, window);
(function ($, scope, undefined) {

    function ItemParserHeading() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserHeading.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserHeading.prototype.constructor = ItemParserHeading;

    ItemParserHeading.prototype.getDefault = function () {
        return {
            link: '#|*|_self',
            font: '',
            style: ''
        }
    };

    ItemParserHeading.prototype.added = function () {
        this.needFill = ['heading', 'url'];

        this.addedFont('hover', 'font');
        this.addedStyle('heading', 'style');

        nextend.smartSlider.generator.registerField($('#item_headingheading'));
        nextend.smartSlider.generator.registerField($('#linkitem_headinglink_0'));

    };

    ItemParserHeading.prototype.getName = function (data) {
        return data.heading;
    };

    ItemParserHeading.prototype.parseAll = function (data) {

        data.uid = $.fn.uid();

        var link = data.link.split('|*|');
        data.url = link[0];
        data.target = link[1];
        delete data.link;


        if (data.fullwidth | 0) {
            data.display = 'block;';
        } else {
            data.display = 'inline-block;';
        }

        data.extrastyle = data.nowrap | 0 ? 'white-space: nowrap;' : '';

        data.heading = $('<div>' + data.heading + '</div>').text().replace(/\n/g, '<br />');
        data.priority = 2;
        data.class = '';
    

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);

        if (data['url'] == '#' || data['url'] == '') {
            data['afontclass'] = '';
            data['astyleclass'] = '';
        } else {
            data['afontclass'] = data['fontclass'];
            data['fontclass'] = '';
            data['astyleclass'] = data['styleclass'];
            data['styleclass'] = '';
        }
    };

    ItemParserHeading.prototype.render = function (node, data) {
        if (data['url'] == '#' || data['url'] == '') {
            var a = node.find('a');
            a.parent().html(a.html());
        }
        return node;
    }

    scope.NextendSmartSliderItemParser_heading = ItemParserHeading;
})(n2, window);
(function ($, scope, undefined) {

    function ItemParserImage() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserImage.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserImage.prototype.constructor = ItemParserImage;

    ItemParserImage.prototype.getDefault = function () {
        return {
            size: '100%|*|auto',
            link: '#|*|_self',
            style: ''
        }
    };

    ItemParserImage.prototype.added = function () {
        this.needFill = ['image', 'url'];

        this.addedStyle('box', 'style');

        nextend.smartSlider.generator.registerField($('#item_imageimage'));
        nextend.smartSlider.generator.registerField($('#item_imagealt'));
        nextend.smartSlider.generator.registerField($('#item_imagetitle'));
        nextend.smartSlider.generator.registerField($('#linkitem_imagelink_0'));
    };

    ItemParserImage.prototype.getName = function (data) {
        return data.image.split('/').pop();
    };

    ItemParserImage.prototype.parseAll = function (data, item) {
        var size = data.size.split('|*|');
        data.width = size[0];
        data.height = size[1];
        delete data.size;

        var link = data.link.split('|*|');
        data.url = link[0];
        data.target = link[1];
        delete data.link;

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);

        if (item && item.values.image == '$system$/images/placeholder/image.png' && data.image != item.values.image) {
            data.image = nextend.imageHelper.fixed(data.image);
            this.resizeLayerToImage(item, data.image);
        } else {
            data.image = nextend.imageHelper.fixed(data.image);
        }

    };

    ItemParserImage.prototype.fitLayer = function (item) {
        this.resizeLayerToImage(item, nextend.imageHelper.fixed(item.values.image));
        return true;
    };

    ItemParserImage.prototype.render = function (node, data) {
        if (data['url'] == '#') {
            node.html(node.children('a').html());
        }
        return node;
    };

    scope.NextendSmartSliderItemParser_image = ItemParserImage;
})(n2, window);

(function ($, scope, undefined) {

    function ItemParserText() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserText.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserText.prototype.constructor = ItemParserText;

    ItemParserText.prototype.getDefault = function () {
        return {
            contentmobile: '',
            contenttablet: '',
            font: '',
            style: ''
        }
    };

    ItemParserText.prototype.added = function () {
        this.needFill = ['content', 'contenttablet', 'contentmobile'];

        this.addedFont('paragraph', 'font');
        this.addedStyle('heading', 'style');

        nextend.smartSlider.generator.registerField($('#item_textcontent'));
        nextend.smartSlider.generator.registerField($('#item_textcontenttablet'));
        nextend.smartSlider.generator.registerField($('#item_textcontentmobile'));
    };

    ItemParserText.prototype.getName = function (data) {
        return data.content;
    };

    ItemParserText.prototype.parseAll = function (data) {
        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);

        data['p'] = _wp_Autop(data['content']);
        data['ptablet'] = _wp_Autop(data['contenttablet']);
        data['pmobile'] = _wp_Autop(data['contentmobile']);
    };
    ItemParserText.prototype.render = function (node, data) {
        if (data['contenttablet'] == '') {
            node = node.filter(':not(.n2-ss-tablet)');
            node.filter('.n2-ss-desktop').addClass('n2-ss-tablet');
        }
        if (data['contentmobile'] == '') {
            node = node.filter(':not(.n2-ss-mobile)');
            node.filter('.n2-ss-tablet, .n2-ss-desktop').last().addClass('n2-ss-mobile');
        }

        node.find('p').addClass(data['fontclass'] + ' ' + data['styleclass']);
        node.find('a').on('click', function (e) {
            e.preventDefault();
        });
        return node;
    };

    scope.NextendSmartSliderItemParser_text = ItemParserText;

    function _wp_Autop(pee) {
        var preserve_linebreaks = false,
            preserve_br = false,
            blocklist = 'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre' +
                '|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|noscript|legend|section' +
                '|article|aside|hgroup|header|footer|nav|figure|details|menu|summary';

        if (pee.indexOf('<object') !== -1) {
            pee = pee.replace(/<object[\s\S]+?<\/object>/g, function (a) {
                return a.replace(/[\r\n]+/g, '');
            });
        }

        pee = pee.replace(/<[^<>]+>/g, function (a) {
            return a.replace(/[\r\n]+/g, ' ');
        });

        // Protect pre|script tags
        if (pee.indexOf('<pre') !== -1 || pee.indexOf('<script') !== -1) {
            preserve_linebreaks = true;
            pee = pee.replace(/<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, function (a) {
                return a.replace(/(\r\n|\n)/g, '<wp-line-break>');
            });
        }

        // keep <br> tags inside captions and convert line breaks
        if (pee.indexOf('[caption') !== -1) {
            preserve_br = true;
            pee = pee.replace(/\[caption[\s\S]+?\[\/caption\]/g, function (a) {
                // keep existing <br>
                a = a.replace(/<br([^>]*)>/g, '<wp-temp-br$1>');
                // no line breaks inside HTML tags
                a = a.replace(/<[a-zA-Z0-9]+( [^<>]+)?>/g, function (b) {
                    return b.replace(/[\r\n\t]+/, ' ');
                });
                // convert remaining line breaks to <br>
                return a.replace(/\s*\n\s*/g, '<wp-temp-br />');
            });
        }

        pee = pee + '\n\n';
        pee = pee.replace(/<br \/>\s*<br \/>/gi, '\n\n');
        pee = pee.replace(new RegExp('(<(?:' + blocklist + ')(?: [^>]*)?>)', 'gi'), '\n$1');
        pee = pee.replace(new RegExp('(</(?:' + blocklist + ')>)', 'gi'), '$1\n\n');
        pee = pee.replace(/<hr( [^>]*)?>/gi, '<hr$1>\n\n'); // hr is self closing block element
        pee = pee.replace(/\r\n|\r/g, '\n');
        pee = pee.replace(/\n\s*\n+/g, '\n\n');
        pee = pee.replace(/([\s\S]+?)\n\n/g, '<p>$1</p>\n');
        pee = pee.replace(/<p>\s*?<\/p>/gi, '');
        pee = pee.replace(new RegExp('<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi'), '$1');
        pee = pee.replace(/<p>(<li.+?)<\/p>/gi, '$1');
        pee = pee.replace(/<p>\s*<blockquote([^>]*)>/gi, '<blockquote$1><p>');
        pee = pee.replace(/<\/blockquote>\s*<\/p>/gi, '</p></blockquote>');
        pee = pee.replace(new RegExp('<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)', 'gi'), '$1');
        pee = pee.replace(new RegExp('(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi'), '$1');
        pee = pee.replace(/\s*\n/gi, '<br />\n');
        pee = pee.replace(new RegExp('(</?(?:' + blocklist + ')[^>]*>)\\s*<br />', 'gi'), '$1');
        pee = pee.replace(/<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)/gi, '$1');
        pee = pee.replace(/(?:<p>|<br ?\/?>)*\s*\[caption([^\[]+)\[\/caption\]\s*(?:<\/p>|<br ?\/?>)*/gi, '[caption$1[/caption]');

        pee = pee.replace(/(<(?:div|th|td|form|fieldset|dd)[^>]*>)(.*?)<\/p>/g, function (a, b, c) {
            if (c.match(/<p( [^>]*)?>/)) {
                return a;
            }

            return b + '<p>' + c + '</p>';
        });

        // put back the line breaks in pre|script
        if (preserve_linebreaks) {
            pee = pee.replace(/<wp-line-break>/g, '\n');
        }

        if (preserve_br) {
            pee = pee.replace(/<wp-temp-br([^>]*)>/g, '<br$1>');
        }

        return pee;
    };
})(n2, window);
(function ($, scope, undefined) {

    function ItemParserVimeo() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserVimeo.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserVimeo.prototype.constructor = ItemParserVimeo;

    ItemParserVimeo.prototype.added = function () {
        this.needFill = ['vimeourl'];

        nextend.smartSlider.generator.registerField($('#item_vimeovimeourl'));
    };

    ItemParserVimeo.prototype.getName = function (data) {
        return data.vimeourl;
    };

    ItemParserVimeo.prototype.parseAll = function (data, item) {
        var vimeoChanged = item.values.vimeourl != data.vimeourl;

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);

        if (data.image == '') {
            data.image = '$system$/images/placeholder/video.png';
        }

        data.image = nextend.imageHelper.fixed(data.image);

        if (vimeoChanged && data.vimeourl != '') {
            var vimeoRegexp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/,
                vimeoMatch = data.vimeourl.match(vimeoRegexp);

            var videoCode = false;
            if (vimeoMatch) {
                videoCode = vimeoMatch[3];
            } else if (data.vimeourl.match(/^[0-9]+$/)) {
                videoCode = data.vimeourl;
            }

            if (videoCode) {
                NextendAjaxHelper.getJSON('https://vimeo.com/api/v2/video/' + encodeURI(videoCode) + '.json').done($.proxy(function (data) {
                    $('#item_vimeoimage').val(data[0].thumbnail_large).trigger('change');
                }, this)).fail(function (data) {
                    nextend.notificationCenter.error(data.responseText);
                });
            } else {
                nextend.notificationCenter.error('The provided URL does not match any known Vimeo url or code!');
            }
        }
    };

    ItemParserVimeo.prototype.fitLayer = function (item) {
        return true;
    };

    scope.NextendSmartSliderItemParser_vimeo = ItemParserVimeo;
})(n2, window);
(function ($, scope, undefined) {

    function ItemParserYouTube() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserYouTube.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserYouTube.prototype.constructor = ItemParserYouTube;

    ItemParserYouTube.prototype.added = function () {
        this.needFill = ['youtubeurl', 'image', 'start'];

        nextend.smartSlider.generator.registerField($('#item_youtubeyoutubeurl'));
        nextend.smartSlider.generator.registerField($('#item_youtubeimage'));
        nextend.smartSlider.generator.registerField($('#item_youtubestart'));
    };

    ItemParserYouTube.prototype.getName = function (data) {
        return data.youtubeurl;
    };

    ItemParserYouTube.prototype.parseAll = function (data, item) {

        var youTubeChanged = item.values.youtubeurl != data.youtubeurl;

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);

        if (data.image == '') {
            data.image = '$system$/images/placeholder/video.png';
        }

        data.image = nextend.imageHelper.fixed(data.image);

        if (youTubeChanged) {
            var youtubeRegexp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
                youtubeMatch = data.youtubeurl.match(youtubeRegexp);

            if (youtubeMatch) {
                NextendAjaxHelper.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + encodeURI(youtubeMatch[2]) + '&part=snippet&key=AIzaSyC3AolfvPAPlJs-2FgyPJdEEKS6nbPHdSM').done($.proxy(function (_data) {
                    if (_data.items.length) {

                        var thumbnails = _data.items[0].snippet.thumbnails,
                            thumbnail = thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default,
                            url = thumbnail.url;
                        if (item.values.youtubeurl == '{video_url}') {
                            url = url.replace(youtubeMatch[2], '{video_id}');
                        }
                        $('#item_youtubeimage').val(url).trigger('change');
                    }
                }, this)).fail(function (data) {
                    nextend.notificationCenter.error(data.error.errors[0].message);
                });
            } else {
                nextend.notificationCenter.error('The provided URL does not match any known YouTube url or code!');
            }
        }
    };

    ItemParserYouTube.prototype.fitLayer = function (item) {
        return true;
    };

    ItemParserYouTube.prototype.render = function (node, data) {
        if (!parseInt(data.playbutton)) {
            node.find('.n2-video-play').remove();
        }
        return node;
    }

    scope.NextendSmartSliderItemParser_youtube = ItemParserYouTube;
})(n2, window);
(function (smartSlider, $, scope, undefined) {
    function LayerDataStorage() {
        this.property = {};
        this.deviceProperty = {};
    }

    LayerDataStorage.prototype.getMode = function () {
        return this.layerEditor.getMode();
    };

    LayerDataStorage.prototype.getProperty = function (deviceBased, name) {

        if (deviceBased) {
            var properties = this.deviceProperty[this.getMode()],
                fallbackProperties = this.deviceProperty['desktopPortrait'];
            if (typeof properties[name] !== 'undefined') {
                return properties[name];
            } else if (typeof fallbackProperties[name] !== 'undefined') {
                return fallbackProperties[name];
            }
        }
        return this.property[name];
    };

    LayerDataStorage.prototype.store = function (deviceBased, name, value, needRender) {

        var oldValue = this.property[name];
        this.property[name] = value;
        if (deviceBased) {
            var mode = this.getMode();
            smartSlider.history.add($.proxy(function () {
                return [this, 'store', value, this.deviceProperty[mode][name], [this.layer, deviceBased, name, mode]];
            }, this));
            this.deviceProperty[mode][name] = value;
        } else {
            smartSlider.history.add($.proxy(function () {
                return [this, 'store', value, oldValue, [this.layer, deviceBased, name, this.getMode()]];
            }, this));
        }

        if (needRender) {
            this.render(name, value);
        }
    }

    LayerDataStorage.prototype.storeWithModifier = function (name, value, modifier, needRender) {
        this.property[name] = value;
        var mode = this.getMode();

        smartSlider.history.add($.proxy(function () {
            return [this, 'storeWithModifier', value, this.deviceProperty[mode][name], [this.layer, name, mode]];
        }, this));
        this.deviceProperty[mode][name] = value;

        if (needRender) {
            this.renderWithModifier(name, value, modifier);
        }
    }

    LayerDataStorage.prototype.render = function (name, value) {
        this['_sync' + name](value);
    };

    LayerDataStorage.prototype.renderWithModifier = function (name, value, modifier) {
        this['_sync' + name](Math.round(value * modifier));
    }

    LayerDataStorage.prototype.isDimensionPropertyAccepted = function (value) {
        if ((value + '').match(/[0-9]+%/) || value == 'auto') {
            return true;
        }
        return false;
    };

    LayerDataStorage.prototype.history = function (method, value, other) {
        switch (method) {
            case 'store':
                var mode = this.getMode();
                if (!other[1] || other[3] == mode) {
                    this[method](other[1], other[2], value, true);
                } else {
                    this.deviceProperty[other[3]][other[2]] = value;
                }
                this._renderModeProperties(true);
                break;
            case 'storeWithModifier':
                var mode = this.getMode();
                var ratio = 1;
                switch (other[1]) {
                    case 'width':
                    case 'left':
                        ratio = this.layerEditor.getResponsiveRatio('h');
                        break;
                    case 'height':
                    case 'top':
                        ratio = this.layerEditor.getResponsiveRatio('v');
                        break;
                }
                if (other[2] == mode) {
                    this[method](other[1], value, ratio, true);
                } else {
                    this.deviceProperty[other[2]][other[1]] = value;
                }
                this._renderModeProperties(true);
                break;
        }
    };

    scope.NextendSmartSliderLayerDataStorageAbtract = LayerDataStorage;
})(nextend.smartSlider, n2, window);
(function (smartSlider, $, scope, undefined) {

    var connectedSortables = $();

    var fakeGroup = {
        zIndexList: [],
        reIndexLayers: function () {

        }
    };

    function LayerContainerAbstract(layerEditor, group) {
        if (typeof this.layer === 'undefined') {
            this.layer = null;
        }
        this.layerEditor = layerEditor;
        if (!group) {
            group = fakeGroup;
        }
        this.group = group;

        this.layers = [];

        this.zIndexList = [];

        this.$ = $(this);

        this.createLayer();

        this.layerContainerElement = this.layer;

        this.createLayerRow();

        connectedSortables = connectedSortables.add(this.layersItemsUlElement);

        this.layersItemsUlElement.sortable({
            axis: "y",
            helper: 'clone',
            distance: 10,
            placeholder: "sortable-placeholder",
            forcePlaceholderSize: false,
            tolerance: "intersect",
            connectWith: connectedSortables,
            items: '.n2-ss-layer-row',
            connectWith: this.layerEditor.layersItemsElement.find('ul'),
            start: $.proxy(this.layersSortableStart, this),
            stop: $.proxy(this.layersSortableStop, this),
        }).appendTo(this.layerRow);

    }

    LayerContainerAbstract.prototype.addLayerBeforeInit = function (layer, zIndex) {
        this.moveLayerToGroup(layer, zIndex);
    }

    LayerContainerAbstract.prototype.lateInit = function (zIndexOffset, layerCountOnMain) {


        if (this.layers.length || zIndexOffset) {
            this.zIndex = zIndexOffset - (layerCountOnMain - 1);
        } else {
            this.zIndex = this.group.zIndexList.length;
        }

        /**
         * This is a fix for the editor load. The layers might not in the z-index order on the load,
         * so we have to "mess up" the array and let the algorithm to fix it.
         */
        if (typeof this.group.zIndexList[this.zIndex] === 'undefined') {
            this.group.zIndexList[this.zIndex] = this;
        } else {
            this.group.zIndexList.splice(this.zIndex, 0, this);
        }

        this.group.reIndexLayers();

        if (this.layers.length > 0) {
            this.reIndexLayers();
        }
    }

    LayerContainerAbstract.prototype.startWithExistingNodes = function () {
        this.layer.find('> div').each($.proxy(function (i, el) {
            var $el = $(el);
            switch ($el.data('type')) {
                case 'group':
                    var newGroup = new NextendSmartSliderLayerGroup(this.layerEditor, this, $el, []);
                    newGroup.lateInit();
                    newGroup.startWithExistingNodes();
                    break;
                case 'layer':
                    var layer = new NextendSmartSliderLayer(this.layerEditor, this, $el, this.layerEditor.itemEditor);
                    this.layers.push(layer);
                    break;
            }
        }, this));
        if (this.layers.length > 0) {
            this.reIndexLayers();
        }
    }

    LayerContainerAbstract.prototype.getChildLayersRecursive = function (nodeOnly) {
        var layers = [];
        for (var i = 0; i < this.zIndexList.length; i++) {
            if (this.zIndexList[i] instanceof NextendSmartSliderLayer) {
                if (nodeOnly) {
                    layers.push(this.zIndexList[i].layer[0]);
                } else {
                    layers.push(this.zIndexList[i]);
                }
            } else {
                layers.push.apply(layers, this.zIndexList[i].getChildLayersRecursive(nodeOnly));
            }
        }
        return layers;
    }


    LayerContainerAbstract.prototype.moveLayerToGroup = function (layer, newZIndex) {
        this.moveLayersToGroup([layer], [newZIndex]);
    }


    LayerContainerAbstract.prototype.moveLayersToGroup = function (layers, newZIndexs) {

        var originalGroups = [];
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i],
                originalGroup = layer.group;

            this.layers.push(layer);

            layer.setGroup(this, newZIndexs[i]);

            if (this != originalGroup) {
                var j = originalGroup.layers.length;
                while (j--) {
                    if (originalGroup.layers[j] == layer) {
                        originalGroup.layers.splice(j, 1);
                    }
                }

                if ($.inArray(originalGroup, originalGroups) == -1) {
                    originalGroups.push(originalGroup);
                }
            }
        }
        for (var i = 0; i < originalGroups.length; i++) {
            originalGroups[i].reIndexLayers();
        }
        this.reIndexLayers();
    }

    LayerContainerAbstract.prototype.reIndexLayers = function () {
        this.zIndexList = this.zIndexList.filter(function (item) {
            return item != undefined
        });
        for (var i = this.zIndexList.length - 1; i >= 0; i--) {
            this.zIndexList[i].setZIndex(i);
        }
    };

    LayerContainerAbstract.prototype.layersSortableStart = function (event, ui) {
        ui.item.show();
        ui.placeholder.html("<div></div>");
        ui.item.data("startindex", ui.item.index());
    };

    LayerContainerAbstract.prototype.layersSortableStop = function (event, ui) {
        var newContainer = ui.item.parent().data('container');
        if (newContainer instanceof NextendSmartSliderLayerGroup && ui.item.hasClass("n2-ss-layer-group-row")) {
            this.layersItemsUlElement.sortable("cancel");
        } else {
            var startIndex = this.zIndexList.length - $(ui.item).data("startindex") - 1,
                newIndex = newContainer.zIndexList.length - $(ui.item).index() - 1;

            if (newContainer != this) {
                newIndex++;
                var layer = this.zIndexList[startIndex];
                newContainer.moveLayerToGroup(layer, newIndex);

                smartSlider.history.add($.proxy(function () {
                    return [newContainer, 'changeZIndexWithContainer', [layer, newIndex, this, newContainer], [layer, startIndex, newContainer, this], []];
                }, this));

                // @TODO here should come the history
            } else if (startIndex != newIndex) {
                newContainer.zIndexList.splice(newIndex, 0, newContainer.zIndexList.splice(startIndex, 1)[0]);
                newContainer.reIndexLayers();

                smartSlider.history.add($.proxy(function () {
                    return [newContainer, 'changeZIndex', [startIndex, newIndex], [newIndex, startIndex], []];
                }, this));
            }
        }
    };

    LayerContainerAbstract.prototype.activateFirst = function () {

        if (this.zIndexList.length > 0) {
            this.zIndexList[this.zIndexList.length - 1].activate(); //Do not show editor on load!
            //this.zIndexList[this.zIndexList.length - 1].activate({});
        }
    }

    LayerContainerAbstract.prototype.childDeleted = function (child) {

        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i] == child) {
                this.layers.splice(i, 1);
                break;
            }
        }

        this.zIndexList.splice(child.zIndex, 1);
    }


    LayerContainerAbstract.prototype.history = function (method, value, other) {
        switch (method) {
            case 'changeZIndex':
                var fromZIndex = value[0],
                    targetZIndex = value[1];
                this.zIndexList.splice(targetZIndex, 0, this.zIndexList.splice(fromZIndex, 1)[0]);
                this.reIndexLayers();
                break;
            case 'changeZIndexWithContainer':
                var layer = value[0],
                    fromContainer = value[2],
                    targetZIndex = value[1],
                    targetContainer = value[3];
                targetContainer.moveLayerToGroup(layer, targetZIndex);
                break;
            case 'createGroup':
                switch (value) {
                    case 'create':
                        var zIndex = other[0],
                            group = new NextendSmartSliderLayerGroup(this.layerEditor, this.layerEditor.mainLayerGroup, false);

                        smartSlider.history.changeFuture(this, group);

                        group.lateInit(zIndex, 0);

                        break;
                    case 'delete':
                        this.delete();
                        break;
                }
                break;
            case 'deleteGroup':
                switch (value) {
                    case 'create':
                        var group = new NextendSmartSliderLayerGroup(this.layerEditor, this.layerEditor.mainLayerGroup, false, {data: $.extend(true, {}, other[0])});
                        group.lateInit();
                        smartSlider.history.changeFuture(this, group);
                        this.layerEditor.fixActiveLayer();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                }
                break;
        }
    };

    scope.NextendSmartSliderLayerContainerAbstract = LayerContainerAbstract;
})(nextend.smartSlider, n2, window);
(function (smartSlider, $, scope, undefined) {

    var highlighted = false,
        timeout = null;
    window.nextendPreventClick = false;
    var preventActivation = false;

    var UNDEFINED,
        rAFShim = (function () {
            var timeLast = 0;

            return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
                    var timeCurrent = (new Date()).getTime(),
                        timeDelta;

                    /* Dynamically set delay on a per-tick basis to match 60fps. */
                    /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
                    timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
                    timeLast = timeCurrent + timeDelta;

                    return setTimeout(function () {
                        callback(timeCurrent + timeDelta);
                    }, timeDelta);
                };
        })(),
        resizeCollection = {
            raf: false,
            ratios: null,
            isThrottled: false,
            layers: []
        },
        requestRender = function () {
            if (resizeCollection.raf === false) {
                resizeCollection.raf = true;
                rAFShim(function () {
                    for (var i = 0; i < resizeCollection.layers.length; i++) {
                        if (!resizeCollection.layers[i].isDeleted) {
                            resizeCollection.layers[i].doTheResize(resizeCollection.ratios, true, resizeCollection.isThrottled);
                        }
                    }
                    resizeCollection = {
                        raf: false,
                        ratios: null,
                        isThrottled: false,
                        layers: []
                    };
                });
            }
        };

    var LAYER_STATUS = {
            UNDEFINED: 0,
            NORMAL: 1,
            LOCKED: 2,
            HIDDEN: 3
        },
        LAYER_STATUS_INV = {
            0: 'UNDEFINED',
            1: 'NORMAL',
            2: 'LOCKED',
            3: 'HIDDEN'
        };


    function Layer(layerEditor, group, layer, itemEditor, properties) {
        this.status = LAYER_STATUS.UNDEFINED;

        this.isDeleted = false;
        //this.resize = NextendDeBounce(this.resize, 200);
        //this.triggerLayerResized = NextendThrottle(this.triggerLayerResized, 30);
        this._triggerLayerResizedThrottled = NextendThrottle(this._triggerLayerResized, 30);
        //this.doThrottledTheResize = NextendThrottle(this.doTheResize, 16.6666);
        this.doThrottledTheResize = this.doTheResize;
        this.parent = false;
        this.parentIsVisible = true;

        this.$ = $(this);

        this.layerEditor = layerEditor;
        this.group = group;

        /** @type {NextendSmartSliderTimelineLayer} */
        this.timelineLayer = null;
        if (!layer) {
            layer = $('<div class="n2-ss-layer" style="z-index: ' + this.group.zIndexList.length + ';"></div>')
                .appendTo(this.group.layerContainerElement);
            this.property = $.extend({
                id: null,
                class: '',
                parentid: null,
                parentalign: 'center',
                parentvalign: 'middle',
                name: 'New layer',
                nameSynced: 1,
                crop: 'visible',
                rotation: 0,
                inneralign: 'left',
                parallax: 0,
                align: 'center',
                valign: 'middle',
                fontsize: 100,
                adaptivefont: 0,
                generatorvisible: '',
                desktopPortrait: 1,
                desktopLandscape: 1,
                tabletPortrait: 1,
                tabletLandscape: 1,
                mobilePortrait: 1,
                mobileLandscape: 1,
                left: 0,
                top: 0,
                responsiveposition: 1,
                width: 'auto',
                height: 'auto',
                responsivesize: 1,
                mouseenter: UNDEFINED,
                click: UNDEFINED,
                mouseleave: UNDEFINED,
                play: UNDEFINED,
                pause: UNDEFINED,
                stop: UNDEFINED
            }, properties);
        } else {
            this.property = {
                id: layer.attr('id'),
                class: layer.data('class'),
                parentid: layer.data('parentid'),
                parentalign: layer.data('desktopportraitparentalign'),
                parentvalign: layer.data('desktopportraitparentvalign'),
                name: layer.data('name') + '',
                nameSynced: layer.data('namesynced'),
                crop: layer.data('crop'),
                rotation: layer.data('rotation'),
                inneralign: layer.data('inneralign'),
                parallax: layer.data('parallax'),
                align: layer.data('desktopportraitalign'),
                valign: layer.data('desktopportraitvalign'),
                fontsize: layer.data('desktopportraitfontsize'),
                adaptivefont: layer.data('adaptivefont'),
                generatorvisible: layer.data('generatorvisible') || '',
                desktopPortrait: parseFloat(layer.data('desktopportrait')),
                desktopLandscape: parseFloat(layer.data('desktoplandscape')),
                tabletPortrait: parseFloat(layer.data('tabletportrait')),
                tabletLandscape: parseFloat(layer.data('tabletlandscape')),
                mobilePortrait: parseFloat(layer.data('mobileportrait')),
                mobileLandscape: parseFloat(layer.data('mobilelandscape')),
                left: parseInt(layer.data('desktopportraitleft')),
                top: parseInt(layer.data('desktopportraittop')),
                responsiveposition: parseInt(layer.data('responsiveposition')),
                responsivesize: parseInt(layer.data('responsivesize')),
                mouseenter: layer.data('mouseenter'),
                click: layer.data('click'),
                mouseleave: layer.data('mouseleave'),
                play: layer.data('play'),
                pause: layer.data('pause'),
                stop: layer.data('stop')
            };

            var width = layer.data('desktopportraitwidth');
            if (this.isDimensionPropertyAccepted(width)) {
                this.property.width = width;
            } else {
                this.property.width = parseInt(width);
            }

            var height = layer.data('desktopportraitheight');
            if (this.isDimensionPropertyAccepted(height)) {
                this.property.height = height;
            } else {
                this.property.height = parseInt(height);
            }
        }
        this.layer = layer;

        if (!this.property.id) {
            this.property.id = null;
        }

        this.subscribeParentCallbacks = {};
        if (this.property.parentid) {
            this.subscribeParent();
        } else {
            this.property.parentid = null;
        }

        if (!this.property.parentalign) {
            this.property.parentalign = 'center';
        }

        if (!this.property.parentvalign) {
            this.property.parentvalign = 'middle';
        }

        if (typeof this.property.nameSynced === 'undefined') {
            this.property.nameSynced = 1;
        }

        if (typeof this.property.responsiveposition === 'undefined') {
            this.property.responsiveposition = 1;
        }

        if (typeof this.property.responsivesize === 'undefined') {
            this.property.responsivesize = 1;
        }

        if (!this.property.inneralign) {
            this.property.inneralign = 'left';
        }

        if (!this.property.crop) {
            this.property.crop = 'visible';
        }

        if (!this.property.rotation) {
            this.property.rotation = 0;
        }

        if (!this.property.parallax) {
            this.property.parallax = 0;
        }

        if (typeof this.property.fontsize == 'undefined') {
            this.property.fontsize = 100;
        }

        if (typeof this.property.adaptivefont == 'undefined') {
            this.property.adaptivefont = 0;
        }

        if (!this.property.align) {
            this.property.align = 'left';
        }

        if (!this.property.valign) {
            this.property.valign = 'top';
        }
        layer.attr('data-align', this.property.align);
        layer.attr('data-valign', this.property.valign);

        layer.data('layerObject', this);
        layer.css('visibility', 'hidden');

        this.zIndex = parseInt(this.layer.css('zIndex'));
        if (isNaN(this.zIndex)) {
            this.zIndex = 0;
        }

        this.deviceProperty = {
            desktopPortrait: {
                left: this.property.left,
                top: this.property.top,
                width: this.property.width,
                height: this.property.height,
                align: this.property.align,
                valign: this.property.valign,
                parentalign: this.property.parentalign,
                parentvalign: this.property.parentvalign,
                fontsize: this.property.fontsize
            },
            desktopLandscape: {
                left: layer.data('desktoplandscapeleft'),
                top: layer.data('desktoplandscapetop'),
                width: layer.data('desktoplandscapewidth'),
                height: layer.data('desktoplandscapeheight'),
                align: layer.data('desktoplandscapealign'),
                valign: layer.data('desktoplandscapevalign'),
                parentalign: layer.data('desktoplandscapeparentalign'),
                parentvalign: layer.data('desktoplandscapeparentvalign'),
                fontsize: layer.data('desktoplandscapefontsize')
            },
            tabletPortrait: {
                left: layer.data('tabletportraitleft'),
                top: layer.data('tabletportraittop'),
                width: layer.data('tabletportraitwidth'),
                height: layer.data('tabletportraitheight'),
                align: layer.data('tabletportraitalign'),
                valign: layer.data('tabletportraitvalign'),
                parentalign: layer.data('tabletportraitparentalign'),
                parentvalign: layer.data('tabletportraitparentvalign'),
                fontsize: layer.data('tabletportraitfontsize')
            },
            tabletLandscape: {
                left: layer.data('tabletlandscapeleft'),
                top: layer.data('tabletlandscapetop'),
                width: layer.data('tabletlandscapewidth'),
                height: layer.data('tabletlandscapeheight'),
                align: layer.data('tabletlandscapealign'),
                valign: layer.data('tabletlandscapevalign'),
                parentalign: layer.data('tabletlandscapeparentalign'),
                parentvalign: layer.data('tabletlandscapeparentvalign'),
                fontsize: layer.data('tabletlandscapefontsize')
            },
            mobilePortrait: {
                left: layer.data('mobileportraitleft'),
                top: layer.data('mobileportraittop'),
                width: layer.data('mobileportraitwidth'),
                height: layer.data('mobileportraitheight'),
                align: layer.data('mobileportraitalign'),
                valign: layer.data('mobileportraitvalign'),
                parentalign: layer.data('mobileportraitparentalign'),
                parentvalign: layer.data('mobileportraitparentvalign'),
                fontsize: layer.data('mobileportraitfontsize')
            },
            mobileLandscape: {
                left: layer.data('mobilelandscapeleft'),
                top: layer.data('mobilelandscapetop'),
                width: layer.data('mobilelandscapewidth'),
                height: layer.data('mobilelandscapeheight'),
                align: layer.data('mobilelandscapealign'),
                valign: layer.data('mobilelandscapevalign'),
                parentalign: layer.data('mobilelandscapeparentalign'),
                parentvalign: layer.data('mobilelandscapeparentvalign'),
                fontsize: layer.data('mobilelandscapefontsize')
            }
        };

        this.createRow();

        this.itemEditor = itemEditor;

        this.initItems();

        if (this.property.inneralign != 'left') {
            this._syncinneralign(this.property.inneralign);
        }

        if (this.property.rotation) {
            this._syncrotation(this.property.rotation);
        }

        this.___makeLayerAlign();
        this.___makeLayerResizeable();
        this.___makeLayerDraggable();

        var $lastParent = null;
        this.chainParent = $('<div class="n2-ss-layer-chain-parent n2-button n2-button-icon n2-button-xs n2-radius-s n2-button-blue"><i class="n2-i n2-i-layerunlink"></i></div>').on({
            click: $.proxy(this.unlink, this),
            mouseenter: $.proxy(function () {
                $lastParent = $('#' + this.getProperty(false, 'parentid')).addClass('n2-highlight');
            }, this),
            mouseleave: $.proxy(function () {
                if ($lastParent) {
                    $lastParent.removeClass('n2-highlight');
                    $lastParent = null;
                }
            }, this)
        }).appendTo(this.layer);


        layerEditor.layerList.push(this);
        //this.index = layerEditor.layerList.push(this) - 1;

        /**
         * This is a fix for the editor load. The layers might not in the z-index order on the load,
         * so we have to "mess up" the array and let the algorithm to fix it.
         */
        if (typeof this.group.zIndexList[this.zIndex] === 'undefined') {
            this.group.zIndexList[this.zIndex] = this;
        } else {
            this.group.zIndexList.splice(this.zIndex, 0, this);
        }


        this.layerEditor.$.trigger('layerCreated', this);
        $(window).triggerHandler('layerCreated');

        this.layer.on({
            mousedown: $.proxy(nextend.context.setMouseDownArea, nextend.context, 'layerClicked'),
            click: $.proxy(this.activate, this),
            dblclick: $.proxy(function () {
                $('[data-tab="item"]').trigger('click');
                this.items[0].itemEditor.focusFirst('dblclick');
            }, this)
        });

        var status = layer.data('status');
        if (status !== null && typeof status != 'undefined') {
            this.changeStatus(status);
        } else {
            this.changeStatus(LAYER_STATUS.NORMAL);
        }

        setTimeout($.proxy(function () {
            this._resize(true);
            if (this.status != LAYER_STATUS.HIDDEN) {
                this.layer.css('visibility', '');
            }
        }, this), 300);
    };

    Layer.prototype = Object.create(scope.NextendSmartSliderLayerDataStorageAbtract.prototype);
    Layer.prototype.constructor = Layer;

    Layer.prototype.setGroup = function (group, newZIndex) {

        group.layersItemsUlElement.append(this.layerRow);
        group.layerContainerElement.append(this.layer);

        this.group.zIndexList.splice(this.zIndex, 1);

        this.group = group;


        if (typeof newZIndex == 'undefined') {
            newZIndex = this.zIndex;
        }
        /**
         * This is a fix for the editor load. The layers might not in the z-index order on the load,
         * so we have to "mess up" the array and let the algorithm to fix it.
         */
        if (typeof group.zIndexList[newZIndex] === 'undefined') {
            group.zIndexList[newZIndex] = this;
        } else {
            group.zIndexList.splice(newZIndex, 0, this);
        }
    };

    Layer.prototype.getIndex = function () {
        return this.layerEditor.layerList.indexOf(this);
    };

    Layer.prototype.getParent = function () {
        return $('#' + this.getProperty(false, 'parentid')).data('layerObject');
    };

    Layer.prototype.requestID = function () {
        var id = this.getProperty(false, 'id');
        if (!id) {
            id = $.fn.uid();
            this.setProperty('id', id, 'layer');
        }
        return id;
    };

    Layer.prototype.createRow = function () {
        var dblClickInterval = 300,
            timeout = null,
            status = $('<div class="n2-ss-layer-status"></div>'),
            remove = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Delete layer') + '"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>').on('click', $.proxy(this.delete, this)),
            duplicate = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Duplicate layer') + '"><i class="n2-i n2-i-duplicate n2-i-grey-opacity"></i></div>').on('click', $.proxy(function () {
                this.duplicate(true, false)
            }, this));

        $('<a href="#" class="n2-ss-sc-hide n2-button n2-button-icon n2-button-m"><i class="n2-i n2-i-eye"></i></a>').appendTo(status).on('click', $.proxy(function (e) {
            e.preventDefault();
            if (this.status == LAYER_STATUS.HIDDEN || this.status == LAYER_STATUS.LOCKED) {
                this.setStatusNormal();
            } else {
                this.changeStatus(LAYER_STATUS.HIDDEN);
            }
        }, this));

        this.layerRow = $('<li class="n2-ss-layer-row"></li>')
            .data('layer', this)
            .on({
                mouseenter: $.proxy(function () {
                    this.layer.addClass('n2-highlight');
                }, this),
                mouseleave: $.proxy(function (e) {
                    this.layer.removeClass('n2-highlight');
                }, this),
                mousedown: $.proxy(nextend.context.setMouseDownArea, nextend.context, 'layerRowClicked')
            })
            .appendTo(this.group.layersItemsUlElement);

        this.layerTitleSpan = $('<span class="n2-ucf">' + this.property.name + '</span>').on({
            mouseup: $.proxy(function (e) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                    this.editName();
                } else {
                    this.activate(e);
                    timeout = setTimeout($.proxy(function () {
                        timeout = null;
                    }, this), dblClickInterval);
                }
            }, this)
        });

        this.layerTitle = $('<div class="n2-ss-layer-title"></div>')
            .append(this.layerTitleSpan)
            .append($('<div class="n2-actions-left"></div>').append(status))
            .append($('<div class="n2-actions"></div>').append(duplicate).append(remove))
            .appendTo(this.layerRow)
            .on({
                mouseup: $.proxy(function (e) {
                    if (e.target.tagName === 'DIV') {
                        this.activate(e);
                    }
                }, this)
            });

        nextend.tooltip.add(this.layerRow);
    };

    Layer.prototype.editName = function () {
        var input = new NextendSmartSliderAdminInlineField();

        input.$input.on({
            valueChanged: $.proxy(function (e, newName) {
                this.rename(newName, true);
                this.layerTitleSpan.css('display', 'inline');
            }, this),
            cancel: $.proxy(function () {
                this.layerTitleSpan.css('display', 'inline');
            }, this)
        });

        this.layerTitleSpan.css('display', 'none');
        input.injectNode(this.layerTitle, this.property.name);

    };

    Layer.prototype.rename = function (newName, force) {

        if (this.property.nameSynced || force) {

            if (force) {
                this.property.nameSynced = 0;
            }

            if (newName == '') {
                if (force) {
                    this.property.nameSynced = 1;
                    if (this.items.length) {
                        this.items[0].reRender();
                        return false;
                    }
                }
                newName = 'Layer #' + (this.layerEditor.layerList.length + 1);
            }
            newName = newName.substr(0, 35);
            if (this.property.name != newName) {
                this.property.name = newName;
                this.layerTitleSpan.html(newName);

                this.$.trigger('layerRenamed', newName);
            }
        }
    };

    Layer.prototype.setZIndex = function (targetIndex) {
        this.zIndex = targetIndex;
        this.layer.css('zIndex', targetIndex);
        this.group.layersItemsUlElement.append(this.layerRow);
        this.$.trigger('layerIndexed', targetIndex);
    };

    Layer.prototype.select = function (e) {
        this.layerEditor.selectLayer(this, true);
    };

    Layer.prototype.positionSidebar = function () {
        this.layerEditor.panel.show(this, this.layer);
    }

    Layer.prototype.showEditor = function () {
        this.layerEditor.panel._show();
    }

    /**
     *
     * @param item {optional}
     */
    Layer.prototype.activate = function (e, context, preventExitFromSelection) {

        if (preventActivation) return;
        if (document.activeElement) {
            document.activeElement.blur();
        }
        if (e && (e.ctrlKey || e.metaKey) && this.layerEditor.layerList[this.layerEditor.activeLayerIndex]) {
            this.select();
            return;
        } else {
            if (e && e.which == 3 && this.layerEditor.selectMode) {
                return;
            }

            if (!preventExitFromSelection) {
                this.layerEditor.exitSelectMode();
            }
        }

        if (e) {
            this.positionSidebar();
        }

        if (this.items.length == 0) {
            console.error('The layer do not have item on it!');
        } else {
            this.items[0].activate(null, context);
        }

        // Set the layer active if it is not active currently
        var currentIndex = this.getIndex();
        if (this.layerEditor.activeLayerIndex !== currentIndex) {
            this.layerRow.addClass('n2-active');
            this.layer.addClass('n2-active');
            this.layer.triggerHandler('n2-ss-activate');
            this.layerEditor.changeActiveLayer(currentIndex, preventExitFromSelection);
            nextend.activeLayer = this.layer;


            this.layerEditor.ui.onActivateLayer(this);
        }
    };

    Layer.prototype.deActivate = function () {
        this.layer.removeClass('n2-active');
        this.layerRow.removeClass('n2-active');
        this.layer.triggerHandler('n2-ss-deactivate');
    };

    Layer.prototype.fit = function () {
        var layer = this.layer.get(0);

        var slideSize = this.layerEditor.slideSize,
            position = this.layer.position();

        if (layer.scrollWidth > 0 && layer.scrollHeight > 0) {
            var resized = false;
            for (var i = 0; i < this.items.length; i++) {
                resized = this.items[i].parser.fitLayer(this.items[i]);
                if (resized) {
                    break;
                }
            }
            if (!resized) {
                this.setProperty('width', 'auto', 'layer');
                this.setProperty('height', 'auto', 'layer');

                var layerWidth = this.layer.width();
                if (Math.abs(this.layerEditor.layerContainerElement.width() - this.layer.position().left - layerWidth) < 2) {
                    this.setProperty('width', layerWidth, 'layer');
                }
            }
        }
    };
    /*
     Layer.prototype.switchToAnimation = function () {
     smartSlider.sidebarManager.switchTab('animations');
     };
     */
    Layer.prototype.hide = function (targetMode) {
        this.store(false, (targetMode ? targetMode : this.getMode()), 0, true);
    };

    Layer.prototype.show = function (targetMode) {
        this.store(false, (targetMode ? targetMode : this.getMode()), 1, true);
    };


    Layer.prototype.changeStatus = function (status) {

        if (status == this.status) {
            status = LAYER_STATUS.NORMAL;
        }

        switch (this.status) {
            case LAYER_STATUS.HIDDEN:
                this.layer.css('visibility', '');
                this.layerRow.removeClass('n2-ss-layer-status-hidden');
                break;
            case LAYER_STATUS.LOCKED:
                this.layer.nextenddraggable("enable");
                this.layer.nextendResizable("enable");
                this.layer.removeClass('n2-ss-layer-locked');
                this.layerRow.removeClass('n2-ss-layer-status-locked');
                break;
        }
        this.status = status;

        switch (this.status) {
            case LAYER_STATUS.HIDDEN:
                this.layer.css('visibility', 'hidden');
                this.layerRow.addClass('n2-ss-layer-status-hidden');
                break;
            case LAYER_STATUS.LOCKED:
                this.layer.nextenddraggable("disable");
                this.layer.nextendResizable("disable");
                this.layer.addClass('n2-ss-layer-locked');
                this.layerRow.addClass('n2-ss-layer-status-locked');
                break;
        }
    }

    Layer.prototype.setStatusNormal = function () {
        this.changeStatus(LAYER_STATUS.NORMAL);
    };

    Layer.prototype._hide = function () {
        this.layer.css('display', 'none');
    };

    Layer.prototype._show = function () {
        if (parseInt(this.property[this.layerEditor.getMode()])) {
            this.layer.css('display', 'block');
        }
    };

    Layer.prototype.duplicate = function (needActivate, newParentId, newLayers) {
        var layer = this.getHTML(true, false);

        var id = layer.attr('id');
        if (id) {
            id = $.fn.uid();
            layer.attr('id', id);
        }

        if (newParentId) {
            layer.attr('data-parentid', newParentId);
        }

        if (!id && !newParentId) {
            layer.data('desktopportraittop', layer.data('desktopportraittop') + 40);
            layer.data('desktopportraitleft', layer.data('desktopportraitleft') + 40);
        }

        var newLayer = this.layerEditor._addLayer(this.group, layer, true);

        if (typeof newLayers === 'undefined') {
            newLayers = [];
        } else {
            newLayers.push(newLayer);
        }

        this.layer.triggerHandler('LayerDuplicated', [id, newLayers]);

        this.layerRow.trigger('mouseleave');

        if (needActivate) {
            newLayer.activate();
        }


        if (!newParentId) {
            smartSlider.history.add($.proxy(function () {
                return [this, 'duplicateLayer', 'duplicate', 'delete', [newLayer]];
            }, this));
        }
    };

    Layer.prototype.delete = function (deleteChild, oldLayers) {

        if (this.layerEditor.getSelectedLayer() == this) {
            this.layerEditor.panel.hide();
        }

        smartSlider.history.add($.proxy(function () {
            return [this, 'deleteLayer', 'delete', 'create', [this.group, this.getData({
                layersIncluded: true,
                itemsIncluded: true
            })]];
        }, this));

        this.deActivate();

        for (var i = 0; i < this.items.length; i++) {
            this.items[i].delete();
        }

        this.group.childDeleted(this);

        var parentId = this.getProperty(false, 'parentid');
        if (parentId) {
            this.unSubscribeParent(true);
        }
        // If delete happen meanwhile layer dragged or resized, we have to cancel that.
        this.layer.trigger('mouseup');

        this.isDeleted = true;

        this.layerEditor.layerDeleted(this.getIndex());
        if (typeof oldLayers === 'undefined') {
            oldLayers = [];
        } else {
            oldLayers.push(this);
        }
        this.layer.triggerHandler('LayerDeleted', [typeof deleteChild !== 'undefined' ? deleteChild : false, oldLayers]);
        this.layer.remove();
        this.layerRow.remove();


        this.$.trigger('layerDeleted');

        //delete this.layerEditor;
        delete this.layer;
        delete this.itemEditor;
    };

    Layer.prototype.getHTML = function (itemsIncluded, base64) {
        var layer = $('<div class="n2-ss-layer"></div>')
            .attr('style', this.getStyleText());

        for (var k in this.property) {
            if (k != 'width' && k != 'height' && k != 'left' && k != 'top') {
                layer.attr('data-' + k.toLowerCase(), this.property[k]);
            }
        }

        for (var k in this.deviceProperty) {
            for (var k2 in this.deviceProperty[k]) {
                layer.attr('data-' + k.toLowerCase() + k2, this.deviceProperty[k][k2]);
            }
        }

        layer.css({
            position: 'absolute',
            zIndex: this.zIndex + 1
        });

        for (var k in this.deviceProperty['desktop']) {
            layer.css(k, this.deviceProperty['desktop'][k] + 'px');
        }

        if (itemsIncluded) {
            for (var i = 0; i < this.items.length; i++) {
                layer.append(this.items[i].getHTML(base64));
            }
        }
        var id = this.getProperty(false, 'id');
        if (id && id != '') {
            layer.attr('id', id);
        }

        if (this.status > LAYER_STATUS.NORMAL) {
            layer.attr('data-status', this.status);
        }

        return layer;
    };

    Layer.prototype.getData = function (params) {
        var layer = {
            zIndex: (this.zIndex + 1)
        };

        if (this.status > LAYER_STATUS.NORMAL) {
            layer.status = this.status;
        }
        for (var k in this.property) {
            switch (k) {
                case 'width':
                case 'height':
                case 'left':
                case 'top':
                case 'align':
                case 'valign':
                case 'parentalign':
                case 'parentvalign':
                case 'fontsize':
                    break;
                default:
                    layer[k.toLowerCase()] = this.property[k];
            }
        }

        // store the device based properties
        for (var device in this.deviceProperty) {
            for (var property in this.deviceProperty[device]) {
                var value = this.deviceProperty[device][property];
                if (typeof value === 'undefined') {
                    continue;
                }
                if (!(property == 'width' && this.isDimensionPropertyAccepted(value)) && !(property == 'height' && this.isDimensionPropertyAccepted(value)) && property != 'align' && property != 'valign' && property != 'parentalign' && property != 'parentvalign') {
                    value = parseFloat(value);
                }
                layer[device.toLowerCase() + property] = value;
            }
        }

        if (params.itemsIncluded) {
            layer.items = [];
            for (var i = 0; i < this.items.length; i++) {
                layer.items.push(this.items[i].getData());
            }
        }
        return layer;
    };

    Layer.prototype.getDataWithChildren = function (layers) {
        layers.push(this.getData({
            layersIncluded: true,
            itemsIncluded: true
        }));
        this.layer.triggerHandler('LayerGetDataWithChildren', [layers]);
        return layers;
    };

    Layer.prototype.initItems = function () {
        this.items = [];
        var items = this.layer.find('.n2-ss-item');

        for (var i = 0; i < items.length; i++) {
            this.addItem(items.eq(i), false);
        }
    };

    Layer.prototype.addItem = function (item, place) {
        if (place) {
            item.appendTo(this.layer);
        }
        new NextendSmartSliderItem(item, this, this.itemEditor);
    };
    /*
     Layer.prototype.editName = function () {
     var input = new NextendSmartSliderAdminInlineField();

     input.$input.on({
     valueChanged: $.proxy(function (e, newName) {
     this.rename(newName, true);
     this.layerTitleSpan.css('display', '');
     }, this),
     cancel: $.proxy(function () {
     this.layerTitleSpan.css('display', '');
     }, this)
     });

     this.layerTitleSpan.css('display', 'none');
     input.injectNode(this.layerTitle, this.property.name);

     };
     */
    Layer.prototype.rename = function (newName, force) {

        if (this.property.nameSynced || force) {

            if (force) {
                this.property.nameSynced = 0;
            }

            if (newName == '') {
                if (force) {
                    this.property.nameSynced = 1;
                    if (this.items.length) {
                        this.items[0].reRender();
                        return false;
                    }
                }
                newName = 'Layer #' + (this.layerEditor.layerList.length + 1);
            }
            newName = newName.substr(0, 35);
            if (this.property.name != newName) {
                this.property.name = newName;
                this.layerTitleSpan.html(newName);

                this.$.trigger('layerRenamed', newName);
            }
        }
    };

    // from: manager or other
    Layer.prototype.setProperty = function (name, value, from) {
        switch (name) {
            case 'responsiveposition':
            case 'responsivesize':
                value = parseInt(value);
            case 'id':
            case 'parentid':
            case 'class':
            case 'inneralign':
            case 'crop':
            case 'rotation':
            case 'parallax':
            case 'adaptivefont':
            case 'generatorvisible':
            case 'mouseenter':
            case 'click':
            case 'mouseleave':
            case 'play':
            case 'pause':
            case 'stop':
                this.store(false, name, value, true);
                break;
            case 'parentalign':
            case 'parentvalign':
            case 'align':
            case 'valign':
            case 'fontsize':
                this.store(true, name, value, true);
                break;
            case 'width':
                var ratioSizeH = this.layerEditor.getResponsiveRatio('h')
                if (!parseInt(this.getProperty(false, 'responsivesize'))) {
                    ratioSizeH = 1;
                }

                var v = value;
                if (!this.isDimensionPropertyAccepted(value)) {
                    v = ~~value;
                    if (v != value) {
                        this.$.trigger('propertyChanged', [name, v]);
                    }
                }
                this.storeWithModifier(name, v, ratioSizeH, true);
                this._resize(false);
                break;
            case 'height':
                var ratioSizeV = this.layerEditor.getResponsiveRatio('v')
                if (!parseInt(this.getProperty(false, 'responsivesize'))) {
                    ratioSizeV = 1;
                }

                var v = value;
                if (!this.isDimensionPropertyAccepted(value)) {
                    v = ~~value;
                    if (v != value) {
                        this.$.trigger('propertyChanged', [name, v]);
                    }
                }

                this.storeWithModifier(name, v, ratioSizeV, true);
                this._resize(false);
                break;
            case 'left':
                var ratioPositionH = this.layerEditor.getResponsiveRatio('h')
                if (!parseInt(this.getProperty(false, 'responsiveposition'))) {
                    ratioPositionH = 1;
                }

                var v = ~~value;
                if (v != value) {
                    this.$.trigger('propertyChanged', [name, v]);
                }

                this.storeWithModifier(name, v, ratioPositionH, true);
                break;
            case 'top':
                var ratioPositionV = this.layerEditor.getResponsiveRatio('v')
                if (!parseInt(this.getProperty(false, 'responsiveposition'))) {
                    ratioPositionV = 1;
                }

                var v = ~~value;
                if (v != value) {
                    this.$.trigger('propertyChanged', [name, v]);
                }

                this.storeWithModifier(name, v, ratioPositionV, true);
                break;
            case 'showFieldDesktopPortrait':
                this.store(false, 'desktopPortrait', parseInt(value), true);
                break;
            case 'showFieldDesktopLandscape':
                this.store(false, 'desktopLandscape', parseInt(value), true);
                break;
            case 'showFieldTabletPortrait':
                this.store(false, 'tabletPortrait', parseInt(value), true);
                break;
            case 'showFieldTabletLandscape':
                this.store(false, 'tabletLandscape', parseInt(value), true);
                break;
            case 'showFieldMobilePortrait':
                this.store(false, 'mobilePortrait', parseInt(value), true);
                break;
            case 'showFieldMobileLandscape':
                this.store(false, 'mobileLandscape', parseInt(value), true);
                break;
        }

        if (from != 'manager') {
            // jelezzuk a sidebarnak, hogy valamely property megvaltozott
            this.$.trigger('propertyChanged', [name, value]);
        }
    };

    Layer.prototype.render = function (name, value) {
        this['_sync' + name](value);
    };

    Layer.prototype.renderWithModifier = function (name, value, modifier) {
        if ((name == 'width' || name == 'height') && this.isDimensionPropertyAccepted(value)) {
            this['_sync' + name](value);
        } else {
            this['_sync' + name](Math.round(value * modifier));
        }
    };

    Layer.prototype._syncclass = function (value) {
        this.layer.removeClass();
        this.layer.addClass('n2-ss-layer');
        if (value && value != '') {
            this.layer.addClass(value);
        }
    };

    Layer.prototype._syncid = function (value) {
        if (!value || value == '') {
            this.layer.removeAttr('id');
        } else {
            this.layer.attr('id', value);
        }
    };

    Layer.prototype.subscribeParent = function () {
        var that = this;
        this.subscribeParentCallbacks = {
            LayerResized: function () {
                that.resizeParent.apply(that, arguments);
            },
            LayerParent: function () {
                that.layer.addClass('n2-ss-layer-parent');
                that.layer.triggerHandler('LayerParent');
            },
            LayerUnParent: function () {
                that.layer.removeClass('n2-ss-layer-parent');
                that.layer.triggerHandler('LayerUnParent');
            },
            LayerDeleted: function (e, deleteChild, oldLayers) {
                if (deleteChild) {
                    that.delete(deleteChild, oldLayers);
                } else {
                    that.setProperty('parentid', '', 'layer');
                }
            },
            LayerDuplicated: function (e, newParentId, newLayers) {
                that.duplicate(false, newParentId, newLayers);
            },
            LayerShowChange: function (e, mode, value) {
                if (that.getMode() == mode) {
                    that.parentIsVisible = value;
                }
            },
            'n2-ss-activate': function () {
                that.layerRow.addClass('n2-parent-active');
            },
            'n2-ss-deactivate': function () {
                that.layerRow.removeClass('n2-parent-active');
            },
            'LayerGetDataWithChildren': function (e, layers) {
                that.getDataWithChildren(layers);
            }
        };
        this.parent = n2('#' + this.property.parentid).on(this.subscribeParentCallbacks);
        this.layer.addClass('n2-ss-layer-has-parent');
    };

    Layer.prototype.unSubscribeParent = function (isDelete) {
        this.layerRow.removeClass('n2-parent-active');
        this.layer.removeClass('n2-ss-layer-has-parent');
        if (this.parent) {
            this.parent.off(this.subscribeParentCallbacks);
        }
        this.parent = false;
        this.subscribeParentCallbacks = {};
        if (!isDelete) {
            var position = this.layer.position();
            this.setPosition(position.left, position.top);
        }
    };

    Layer.prototype.unlink = function (e) {
        if (e) e.preventDefault();
        this.setProperty('parentid', '', 'layer');
    };

    Layer.prototype.parentPicked = function (parentObject, parentAlign, parentValign, align, valign) {
        this.setProperty('parentid', '', 'layer');

        this.setProperty('align', align, 'layer');
        this.setProperty('valign', valign, 'layer');
        this.setProperty('parentalign', parentAlign, 'layer');
        this.setProperty('parentvalign', parentValign, 'layer');

        this.setProperty('parentid', parentObject.requestID(), 'layer');

        var undef;
        for (var device in this.deviceProperty) {
            if (device == 'desktopPortrait') continue;
            this.deviceProperty[device].left = undef;
            this.deviceProperty[device].top = undef;
            this.deviceProperty[device].valign = undef;
            this.deviceProperty[device].align = undef;
        }
    };

    Layer.prototype._syncparentid = function (value) {
        if (!value || value == '') {
            this.layer.removeAttr('data-parentid');
            this.unSubscribeParent(false);
        } else {
            if ($('#' + value).length == 0) {
                this.setProperty('parentid', '', 'layer');
            } else {
                this.layer.attr('data-parentid', value).addClass('n2-ss-layer-has-parent');
                this.subscribeParent();
                this.setPosition(this.layer.position().left, this.layer.position().top);
            }
        }
    };

    Layer.prototype._syncparentalign = function (value) {
        this.layer.data('parentalign', value);
        var parent = this.getParent();
        if (parent) {
            parent._resize(false);
        }
    };

    Layer.prototype._syncparentvalign = function (value) {
        this.layer.data('parentvalign', value);
        var parent = this.getParent();
        if (parent) {
            parent._resize(false);
        }
    };

    Layer.prototype._syncinneralign = function (value) {
        this.layer.css('text-align', value);
    };

    Layer.prototype._synccrop = function (value) {
        if (value == 'auto') {
            value = 'hidden';
        }

        var mask = this.layer.find('> .n2-ss-layer-mask');
        if (value == 'mask') {
            value = 'hidden';
            if (!mask.length) {
                mask = $("<div class='n2-ss-layer-mask'></div>").appendTo(this.layer);
                var rotationMask = this.layer.find('.n2-ss-layer-rotation');
                if (rotationMask.length) {
                    rotationMask.appendTo(mask);
                } else {
                    for (var i = 0; i < this.items.length; i++) {
                        mask.append(this.items[i].item);
                    }
                }
            }
        } else {
            if (mask.length) {
                var rotationMask = this.layer.find('.n2-ss-layer-rotation');
                if (rotationMask.length) {
                    rotationMask.appendTo(this.layer);
                } else {
                    for (var i = 0; i < this.items.length; i++) {
                        this.layer.append(this.items[i].item);
                    }
                }
                mask.remove();
            }
        }
        this.layer.css('overflow', value);
    };

    Layer.prototype._syncrotation = function (value) {

        var rotationMask = this.layer.find('.n2-ss-layer-rotation');
        if (value != 0) {
            if (!rotationMask.length) {
                rotationMask = $("<div class='n2-ss-layer-rotation'></div>").appendTo(this.layer.find('.n2-ss-layer-mask').addBack().last());
                for (var i = 0; i < this.items.length; i++) {
                    rotationMask.append(this.items[i].item);
                }
            }
            NextendTween.set(rotationMask[0], {
                rotationZ: value
            });
            this.layer.data('rotation', value);
        } else {
            if (rotationMask.length) {
                for (var i = 0; i < this.items.length; i++) {
                    this.layer.find('.n2-ss-layer-mask').addBack().last().append(this.items[i].item);
                }
                rotationMask.remove();
            } else {
                NextendTween.set(rotationMask, {
                    rotationZ: 0
                });
            }
            this.layer.data('rotation', 0);
        }
    };

    Layer.prototype._syncparallax = function (value) {

    };

    Layer.prototype._syncalign = function (value, lastValue) {
        if (lastValue !== 'undefined' && value != lastValue) {
            this.setPosition(this.layer.position().left, this.layer.position().top);
        }
        this.layer.attr('data-align', value);
    };

    Layer.prototype._syncvalign = function (value, lastValue) {
        if (lastValue !== 'undefined' && value != lastValue) {
            this.setPosition(this.layer.position().left, this.layer.position().top);
        }
        this.layer.attr('data-valign', value);
    };

    Layer.prototype._syncfontsize = function (value) {
        this.adjustFontSize(this.getProperty(false, 'adaptivefont'), value, true);
    };

    Layer.prototype._syncadaptivefont = function (value) {
        this.adjustFontSize(value, this.getProperty(true, 'fontsize'), true);
    };

    Layer.prototype.adjustFontSize = function (isAdaptive, fontSize, shouldUpdatePosition) {
        fontSize = parseInt(fontSize);
        if (parseInt(isAdaptive)) {
            this.layer.css('font-size', (nextend.smartSlider.frontend.sliderElement.data('fontsize') * fontSize / 100) + 'px');
        } else if (fontSize != 100) {
            this.layer.css('font-size', fontSize + '%');
        } else {
            this.layer.css('font-size', '');
        }
        if (shouldUpdatePosition) {
            this.update();
        }
    };

    Layer.prototype._syncgeneratorvisible = function (value) {
    };

    Layer.prototype._syncleft = function (value) {
        if (!this.parent || !this.parentIsVisible) {
            switch (this.getProperty(true, 'align')) {
                case 'right':
                    this.layer.css({
                        left: 'auto',
                        right: -value + 'px'
                    });
                    break;
                case 'center':
                    this.layer.css({
                        left: (this.layer.parent().width() / 2 + value - this.layer.width() / 2) + 'px',
                        right: 'auto'
                    });
                    break;
                default:
                    this.layer.css({
                        left: value + 'px',
                        right: 'auto'
                    });
            }
        } else {
            var position = this.parent.position(),
                align = this.getProperty(true, 'align'),
                parentAlign = this.getProperty(true, 'parentalign'),
                left = 0;
            switch (parentAlign) {
                case 'right':
                    left = position.left + this.parent.width();
                    break;
                case 'center':
                    left = position.left + this.parent.width() / 2;
                    break;
                default:
                    left = position.left;
            }

            switch (align) {
                case 'right':
                    this.layer.css({
                        left: 'auto',
                        right: (this.layer.parent().width() - left - value) + 'px'
                    });
                    break;
                case 'center':
                    this.layer.css({
                        left: (left + value - this.layer.width() / 2) + 'px',
                        right: 'auto'
                    });
                    break;
                default:
                    this.layer.css({
                        left: (left + value) + 'px',
                        right: 'auto'
                    });
            }

        }

        this.triggerLayerResized();
    };

    Layer.prototype._synctop = function (value) {
        if (!this.parent || !this.parentIsVisible) {
            switch (this.getProperty(true, 'valign')) {
                case 'bottom':
                    this.layer.css({
                        top: 'auto',
                        bottom: -value + 'px'
                    });
                    break;
                case 'middle':
                    this.layer.css({
                        top: (this.layer.parent().height() / 2 + value - this.layer.height() / 2) + 'px',
                        bottom: 'auto'
                    });
                    break;
                default:
                    this.layer.css({
                        top: value + 'px',
                        bottom: 'auto'
                    });
            }
        } else {
            var position = this.parent.position(),
                valign = this.getProperty(true, 'valign'),
                parentVAlign = this.getProperty(true, 'parentvalign'),
                top = 0;
            switch (parentVAlign) {
                case 'bottom':
                    top = position.top + this.parent.height();
                    break;
                case 'middle':
                    top = position.top + this.parent.height() / 2;
                    break;
                default:
                    top = position.top;
            }

            switch (valign) {
                case 'bottom':
                    this.layer.css({
                        top: 'auto',
                        bottom: (this.layer.parent().height() - top - value) + 'px'
                    });
                    break;
                case 'middle':
                    this.layer.css({
                        top: (top + value - this.layer.height() / 2) + 'px',
                        bottom: 'auto'
                    });
                    break;
                default:
                    this.layer.css({
                        top: (top + value) + 'px',
                        bottom: 'auto'
                    });
            }
        }

        this.triggerLayerResized();
    };

    Layer.prototype._syncresponsiveposition = function (value) {
        this._resize(false);
    };

    Layer.prototype._syncwidth = function (value) {
        this.layer.css('width', value + (this.isDimensionPropertyAccepted(value) ? '' : 'px'));
    };

    Layer.prototype._syncheight = function (value) {
        this.layer.css('height', value + (this.isDimensionPropertyAccepted(value) ? '' : 'px'));
    };

    Layer.prototype._syncresponsivesize = function (value) {
        this._resize(false);
    };

    Layer.prototype._syncdesktopPortrait = function (value) {
        this.__syncShowOnDevice('desktopPortrait', value);
    };

    Layer.prototype._syncdesktopLandscape = function (value) {
        this.__syncShowOnDevice('desktopLandscape', value);
    };

    Layer.prototype._synctabletPortrait = function (value) {
        this.__syncShowOnDevice('tabletPortrait', value);
    };

    Layer.prototype._synctabletLandscape = function (value) {
        this.__syncShowOnDevice('tabletLandscape', value);
    };

    Layer.prototype._syncmobilePortrait = function (value) {
        this.__syncShowOnDevice('mobilePortrait', value);
    };

    Layer.prototype._syncmobileLandscape = function (value) {
        this.__syncShowOnDevice('mobileLandscape', value);
    };

    Layer.prototype.__syncShowOnDevice = function (mode, value) {
        if (this.getMode() == mode) {
            var value = parseInt(value);
            if (value) {
                this._show();
            } else {
                this._hide();
            }
            this.layer.triggerHandler('LayerShowChange', [mode, value]);
            this.triggerLayerResized();
        }
    };

    Layer.prototype._syncmouseenter =
        Layer.prototype._syncclick =
            Layer.prototype._syncmouseleave =
                Layer.prototype._syncplay =
                    Layer.prototype._syncpause =
                        Layer.prototype._syncstop = function () {
                        };

    Layer.prototype.___makeLayerAlign = function () {
        $('<div class="n2-ss-layer-border" />').prependTo(this.layer);
        this.alignMarker = $('<div class="n2-ss-layer-cc" />').appendTo(this.layer);
    };

    //<editor-fold desc="Makes layer resizable">

    /**
     * Add resize handles to the specified layer
     * @param {jQuery} layer
     * @private
     */
    Layer.prototype.___makeLayerResizeable = function () {
        this._resizableJustClick = false;
        this.layer.nextendResizable({
            handles: 'n, e, s, w, ne, se, sw, nw',
            _containment: this.layerEditor.layerContainerElement,
            start: $.proxy(this.____makeLayerResizeableStart, this),
            resize: $.proxy(this.____makeLayerResizeableResize, this),
            stop: $.proxy(this.____makeLayerResizeableStop, this),
            create: $.proxy(function () {
                this.layer.find('.ui-resizable-handle, .n2-ss-layer-cc').on({
                    mousedown: $.proxy(function (e) {
                        this._resizableJustClick = [e.clientX, e.clientY];
                    }, this),
                    mouseup: $.proxy(function (e) {
                        if (this._resizableJustClick && Math.abs(Math.sqrt(Math.pow(this._resizableJustClick[0] - e.clientX, 2) + Math.pow(this._resizableJustClick[1] - e.clientY, 2))) < 1) {
                            $target = $(e.currentTarget);
                            var layerFeatures = this.layerEditor.sidebar.layerFeatures;
                            if ($target.hasClass('ui-resizable-nw')) {
                                layerFeatures.horizontalAlign('left', false);
                                layerFeatures.verticalAlign('top', false);
                            } else if ($target.hasClass('ui-resizable-w')) {
                                layerFeatures.horizontalAlign('left', false);
                                layerFeatures.verticalAlign('middle', false);
                            } else if ($target.hasClass('ui-resizable-sw')) {
                                layerFeatures.horizontalAlign('left', false);
                                layerFeatures.verticalAlign('bottom', false);
                            } else if ($target.hasClass('ui-resizable-n')) {
                                layerFeatures.horizontalAlign('center', false);
                                layerFeatures.verticalAlign('top', false);
                            } else if ($target.hasClass('n2-ss-layer-cc')) {
                                layerFeatures.horizontalAlign('center', false);
                                layerFeatures.verticalAlign('middle', false);
                            } else if ($target.hasClass('ui-resizable-s')) {
                                layerFeatures.horizontalAlign('center', false);
                                layerFeatures.verticalAlign('bottom', false);
                            } else if ($target.hasClass('ui-resizable-ne')) {
                                layerFeatures.horizontalAlign('right', false);
                                layerFeatures.verticalAlign('top', false);
                            } else if ($target.hasClass('ui-resizable-e')) {
                                layerFeatures.horizontalAlign('right', false);
                                layerFeatures.verticalAlign('middle', false);
                            } else if ($target.hasClass('ui-resizable-se')) {
                                layerFeatures.horizontalAlign('right', false);
                                layerFeatures.verticalAlign('bottom', false);
                            }
                        }
                        this._resizableJustClick = false;
                    }, this)
                });
            }, this),
            smartguides: $.proxy(function () {
                this.layer.triggerHandler('LayerParent');
                return this.layerEditor.getSnap();
            }, this),
            tolerance: 5
        })
            .on({
                mousedown: $.proxy(function (e) {
                    if (!this.status != LAYER_STATUS.LOCKED) {
                        this.layerEditor.positionDisplay
                            .css({
                                left: e.pageX + 10,
                                top: e.pageY + 10
                            })
                            .html('W: ' + parseInt(this.layer.width()) + 'px<br />H: ' + parseInt(this.layer.height()) + 'px')
                            .addClass('n2-active');
                    }
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                }, this),
                mouseup: $.proxy(function (e) {
                    this.layerEditor.positionDisplay.removeClass('n2-active');
                }, this)
            });
    };

    Layer.prototype.____makeLayerResizeableStart = function (event, ui) {
        preventActivation = true;
        this.resizableDeferred = $.Deferred();
        this.layerEditor.panel.hideWithDeferred(this.resizableDeferred);
        $('body').addClass('n2-ss-resize-layer');
        if (this._resizableJustClick) {
            this._resizableJustClick = false;
        }
        this.____makeLayerResizeableResize(event, ui);
        this.layerEditor.positionDisplay.addClass('n2-active');
    };

    Layer.prototype.____makeLayerResizeableResize = function (e, ui) {
        this.layerEditor.positionDisplay
            .css({
                left: e.pageX + 10,
                top: e.pageY + 10
            })
            .html('W: ' + ui.size.width + 'px<br />H: ' + ui.size.height + 'px');
        this.triggerLayerResized();
    };

    Layer.prototype.____makeLayerResizeableStop = function (event, ui) {
        window.nextendPreventClick = true;
        setTimeout(function () {
            window.nextendPreventClick = false;
        }, 50);
        $('body').removeClass('n2-ss-resize-layer');
        this.resizableDeferred.resolve();

        var isAutoWidth = false;
        if (ui.originalSize.width == ui.size.width) {
            var currentValue = this.getProperty(true, 'width');
            if (this.isDimensionPropertyAccepted(currentValue)) {
                isAutoWidth = true;
                this['_syncwidth'](currentValue);
            }
        }

        var isAutoHeight = false;
        if (ui.originalSize.height == ui.size.height) {
            var currentValue = this.getProperty(true, 'height');
            if (this.isDimensionPropertyAccepted(currentValue)) {
                isAutoHeight = true;
                this['_syncheight'](currentValue);
            }
        }
        this.setPosition(ui.position.left, ui.position.top);


        var ratioSizeH = this.layerEditor.getResponsiveRatio('h'),
            ratioSizeV = this.layerEditor.getResponsiveRatio('v');

        if (!parseInt(this.getProperty(false, 'responsivesize'))) {
            ratioSizeH = ratioSizeV = 1;
        }

        if (!isAutoWidth) {
            var value = Math.round(ui.size.width * (1 / ratioSizeH));
            this.storeWithModifier('width', value, ratioSizeH, false);
            this.$.trigger('propertyChanged', ['width', value]);
        }
        if (!isAutoHeight) {
            var value = Math.round(ui.size.height * (1 / ratioSizeV));
            this.storeWithModifier('height', value, ratioSizeV, false);
            this.$.trigger('propertyChanged', ['height', value]);
        }
        this.triggerLayerResized();

        this.layer.triggerHandler('LayerUnParent');

        this.layerEditor.positionDisplay.removeClass('n2-active');

        setTimeout(function () {
            preventActivation = false;
        }, 80);

        //this.layerEditor.panel.positionMenu(this.layer);
    };
    //</editor-fold>

    //<editor-fold desc="Makes layer draggable">

    /**
     * Add draggable handles to the specified layer
     * @param layer
     * @private
     */
    Layer.prototype.___makeLayerDraggable = function () {

        this.layer.nextenddraggable({
            _containment: this.layerEditor.layerContainerElement,
            start: $.proxy(this.____makeLayerDraggableStart, this),
            drag: $.proxy(this.____makeLayerDraggableDrag, this),
            stop: $.proxy(this.____makeLayerDraggableStop, this),
            smartguides: $.proxy(function () {
                this.layer.triggerHandler('LayerParent');
                return this.layerEditor.getSnap();
            }, this),
            tolerance: 5
        });
    };

    Layer.prototype.____makeLayerDraggableStart = function (event, ui) {
        preventActivation = true;
        this.draggableDeferred = $.Deferred();
        this.layerEditor.panel.hideWithDeferred(this.draggableDeferred);
        $('body').addClass('n2-ss-move-layer');

        this.layerEditor.draggableStart(ui);

        this.____makeLayerDraggableDrag(event, ui);
        this.layerEditor.positionDisplay.addClass('n2-active');

        var currentValue = this.getProperty(true, 'width');
        if (this.isDimensionPropertyAccepted(currentValue)) {
            this.layer.width(this.layer.width() + 0.5); // Center positioned element can wrap the last word to a new line if this fix not added
        }

        var currentValue = this.getProperty(true, 'height');
        if (this.isDimensionPropertyAccepted(currentValue)) {
            this['_syncheight'](currentValue);
        }
    };

    Layer.prototype.____makeLayerDraggableDrag = function (e, ui) {
        this.layerEditor.positionDisplay
            .css({
                left: e.pageX + 10,
                top: e.pageY + 10
            })
            .html('L: ' + parseInt(ui.position.left | 0) + 'px<br />T: ' + parseInt(ui.position.top | 0) + 'px');
        this.triggerLayerResized();

        this.layerEditor.draggableDrag(ui);
    };

    Layer.prototype.____makeLayerDraggableStop = function (event, ui) {
        window.nextendPreventClick = true;
        setTimeout(function () {
            window.nextendPreventClick = false;
        }, 50);
        $('body').removeClass('n2-ss-move-layer');
        this.draggableDeferred.resolve();

        this.setPosition(ui.position.left, ui.position.top);

        var currentValue = this.getProperty(true, 'width');
        if (this.isDimensionPropertyAccepted(currentValue)) {
            this['_syncwidth'](currentValue);
        }

        var currentValue = this.getProperty(true, 'height');
        if (this.isDimensionPropertyAccepted(currentValue)) {
            this['_syncheight'](currentValue);
        }

        this.triggerLayerResized();

        this.layer.triggerHandler('LayerUnParent');
        this.layerEditor.positionDisplay.removeClass('n2-active');


        var inMultipleSelection = this.layerEditor.draggableStop(ui);
        if (!inMultipleSelection) {
            preventActivation = false;
            this.activate(event);
        } else {
            setTimeout(function () {
                preventActivation = false;
            }, 80);

        }

        //this.layerEditor.panel.positionMenu(this.layer);
    };

    Layer.prototype.moveX = function (x) {
        this.setDeviceBasedAlign();
        this.setProperty('left', this.getProperty(true, 'left') + x, 'layer');
        this.triggerLayerResized();
    };

    Layer.prototype.moveY = function (y) {
        this.setDeviceBasedAlign();
        this.setProperty('top', this.getProperty(true, 'top') + y, 'layer');
        this.triggerLayerResized();
    };

    Layer.prototype.setPosition = function (left, top) {

        var ratioH = this.layerEditor.getResponsiveRatio('h'),
            ratioV = this.layerEditor.getResponsiveRatio('v');

        if (!parseInt(this.getProperty(false, 'responsiveposition'))) {
            ratioH = ratioV = 1;
        }

        this.setDeviceBasedAlign();

        var parent = this.parent,
            p = {
                left: 0,
                leftMultiplier: 1,
                top: 0,
                topMultiplier: 1
            };
        if (!parent || !parent.is(':visible')) {
            parent = this.layer.parent();


            switch (this.getProperty(true, 'align')) {
                case 'center':
                    p.left += parent.width() / 2;
                    break;
                case 'right':
                    p.left += parent.width();
                    break;
            }

            switch (this.getProperty(true, 'valign')) {
                case 'middle':
                    p.top += parent.height() / 2;
                    break;
                case 'bottom':
                    p.top += parent.height();
                    break;
            }
        } else {
            var position = parent.position();
            switch (this.getProperty(true, 'parentalign')) {
                case 'right':
                    p.left = position.left + parent.width();
                    break;
                case 'center':
                    p.left = position.left + parent.width() / 2;
                    break;
                default:
                    p.left = position.left;
            }
            switch (this.getProperty(true, 'parentvalign')) {
                case 'bottom':
                    p.top = position.top + parent.height();
                    break;
                case 'middle':
                    p.top = position.top + parent.height() / 2;
                    break;
                default:
                    p.top = position.top;
            }
        }


        var left, needRender = false;
        switch (this.getProperty(true, 'align')) {
            case 'left':
                left = -Math.round((p.left - left) * (1 / ratioH));
                break;
            case 'center':
                left = -Math.round((p.left - left - this.layer.width() / 2) * (1 / ratioH))
                break;
            case 'right':
                left = -Math.round((p.left - left - this.layer.width()) * (1 / ratioH));
                needRender = true;
                break;
        }
        this.storeWithModifier('left', left, ratioH, needRender);
        this.$.trigger('propertyChanged', ['left', left]);

        var top, needRender = false;
        switch (this.getProperty(true, 'valign')) {
            case 'top':
                top = -Math.round((p.top - top) * (1 / ratioV));
                break;
            case 'middle':
                top = -Math.round((p.top - top - this.layer.height() / 2) * (1 / ratioV));
                break;
            case 'bottom':
                top = -Math.round((p.top - top - this.layer.height()) * (1 / ratioV));
                needRender = true;
                break;
        }
        this.storeWithModifier('top', top, ratioV, needRender);
        this.$.trigger('propertyChanged', ['top', top]);
    }

    Layer.prototype.setDeviceBasedAlign = function () {
        var mode = this.getMode();
        if (typeof this.deviceProperty[mode]['align'] == 'undefined') {
            this.setProperty('align', this.getProperty(true, 'align'), 'layer');
        }
        if (typeof this.deviceProperty[mode]['valign'] == 'undefined') {
            this.setProperty('valign', this.getProperty(true, 'valign'), 'layer');
        }
    };
    //</editor-fold

    Layer.prototype.snap = function () {
        this.layer.nextendResizable("option", "smartguides", $.proxy(function () {
            this.layer.triggerHandler('LayerParent');
            return this.layerEditor.getSnap();
        }, this));
        this.layer.nextenddraggable("option", "smartguides", $.proxy(function () {
            this.layer.triggerHandler('LayerParent');
            return this.layerEditor.getSnap();
        }, this));
    };

    Layer.prototype.changeEditorMode = function (mode) {
        var value = parseInt(this.property[mode]);
        if (value) {
            this._show();
        } else {
            this._hide();
        }

        this.layer.triggerHandler('LayerShowChange', [mode, value]);

        this._renderModeProperties(false);
    };

    Layer.prototype.resetMode = function (mode, currentMode) {
        if (mode != 'desktopPortrait') {
            var undefined;

            smartSlider.history.add($.proxy(function () {
                return [this, 'resetMode', 'reset', 'restore', [mode, $.extend({}, this.deviceProperty[mode])]];
            }, this));

            for (var k in this.property) {
                this.deviceProperty[mode][k] = undefined;
            }
            if (mode == currentMode) {
                this._renderModeProperties(true);
            }
        }
    };

    Layer.prototype.restoreMode = function (mode, currentMode, data) {
        if (mode != 'desktopPortrait') {

            this.deviceProperty[mode] = $.extend({}, data);

            if (mode == currentMode) {
                this._renderModeProperties(true);
            }
        }
    };

    Layer.prototype._renderModeProperties = function (isReset) {

        for (var k in this.property) {
            this.property[k] = this.getProperty(true, k);
            this.$.trigger('propertyChanged', [k, this.property[k]]);
        }

        var fontSize = this.getProperty(true, 'fontsize');
        this.adjustFontSize(this.getProperty(false, 'adaptivefont'), fontSize, false);

        this.layer.attr('data-align', this.property.align);
        this.layer.attr('data-valign', this.property.valign);
        if (isReset) {
            this._resize(true);
        }

    };

    Layer.prototype.copyMode = function (from, to) {
        if (from != to) {
            this.deviceProperty[to] = $.extend({}, this.deviceProperty[to], this.deviceProperty[from]);
        }
    };

    Layer.prototype._resize = function (isForced) {
        this.resize({
            slideW: this.layerEditor.getResponsiveRatio('h'),
            slideH: this.layerEditor.getResponsiveRatio('v')
        }, isForced);
    };

    Layer.prototype.doLinearResize = function (ratios) {
        this.doThrottledTheResize(ratios, true);
    };

    Layer.prototype.resize = function (ratios, isForced) {

        if (!this.parent || isForced) {
            //this.doThrottledTheResize(ratios, false);
            this.addToResizeCollection(this, ratios, false);
        }
    };

    Layer.prototype.doTheResize = function (ratios, isLinear, isThrottled) {
        var ratioPositionH = ratios.slideW,
            ratioSizeH = ratioPositionH,
            ratioPositionV = ratios.slideH,
            ratioSizeV = ratioPositionV;

        if (!parseInt(this.getProperty(false, 'responsivesize'))) {
            ratioSizeH = ratioSizeV = 1;
        }

        //var width = this.getProperty(true, 'width');
        //this.storeWithModifier('width', this.isDimensionPropertyAccepted(width) ? width : Math.round(width), ratioSizeH, true);
        //var height = this.getProperty(true, 'height');
        //this.storeWithModifier('height', this.isDimensionPropertyAccepted(height) ? height : Math.round(height), ratioSizeV, true);
        this.renderWithModifier('width', this.getProperty(true, 'width'), ratioSizeH);
        this.renderWithModifier('height', this.getProperty(true, 'height'), ratioSizeV);

        if (!parseInt(this.getProperty(false, 'responsiveposition'))) {
            ratioPositionH = ratioPositionV = 1;
        }
        //this.storeWithModifier('left', Math.round(this.getProperty(true, 'left')), ratioPositionH, true);
        //this.storeWithModifier('top', Math.round(this.getProperty(true, 'top')), ratioPositionV, true);
        this.renderWithModifier('left', this.getProperty(true, 'left'), ratioPositionH);
        this.renderWithModifier('top', this.getProperty(true, 'top'), ratioPositionV);
        if (!isLinear) {
            this.triggerLayerResized(isThrottled, ratios);
        }
    };

    Layer.prototype.resizeParent = function (e, ratios, isThrottled) {
        //this.doThrottledTheResize(ratios, false, isThrottled);
        this.addToResizeCollection(this, ratios, isThrottled);
    };

    Layer.prototype.addToResizeCollection = function (layer, ratios, isThrottled) {
        resizeCollection.ratios = ratios;
        resizeCollection.isThrottled = isThrottled;
        for (var i = 0; i < resizeCollection.layers.length; i++) {
            if (resizeCollection.layers[i] == this) {
                resizeCollection.layers.splice(i, 1);
                break;
            }
        }
        resizeCollection.layers.push(layer);

        requestRender();
        this.triggerLayerResized(isThrottled, ratios);
    };

    Layer.prototype.update = function () {
        var parent = this.parent;

        if (this.getProperty(true, 'align') == 'center') {
            var left = 0;
            if (parent) {
                left = parent.position().left + parent.width() / 2;
            } else {
                left = this.layer.parent().width() / 2;
            }
            var ratio = this.layerEditor.getResponsiveRatio('h');
            if (!parseInt(this.getProperty(false, 'responsiveposition'))) {
                ratio = 1;
            }
            this.layer.css('left', (left - this.layer.width() / 2 + this.getProperty(true, 'left') * ratio));
        }

        if (this.getProperty(true, 'valign') == 'middle') {
            var top = 0;
            if (parent) {
                top = parent.position().top + parent.height() / 2;
            } else {
                top = this.layer.parent().height() / 2;
            }
            var ratio = this.layerEditor.getResponsiveRatio('v');
            if (!parseInt(this.getProperty(false, 'responsiveposition'))) {
                ratio = 1;
            }
            this.layer.css('top', (top - this.layer.height() / 2 + this.getProperty(true, 'top') * ratio));
        }
        this.triggerLayerResized();
    };

    Layer.prototype.triggerLayerResized = function (isThrottled, ratios) {
        if (isThrottled) {
            this._triggerLayerResized(isThrottled, ratios);
        } else {
            this._triggerLayerResizedThrottled(true, ratios);
        }
    };

    Layer.prototype._triggerLayerResized = function (isThrottled, ratios) {
        if (!this.isDeleted) {
            this.layer.triggerHandler('LayerResized', [ratios || {
                slideW: this.layerEditor.getResponsiveRatio('h'),
                slideH: this.layerEditor.getResponsiveRatio('v')
            }, isThrottled || false]);
        }
    };

    Layer.prototype.getStyleText = function () {
        var style = '';
        var crop = this.property.crop;
        if (crop == 'auto' || crop == 'mask') {
            crop = 'hidden';
        }

        style += 'overflow:' + crop + ';';
        style += 'text-align:' + this.property.inneralign + ';';
        return style;
    };

    Layer.prototype.nextLayer = function () {
        var nextIndex = this.zIndex - 1;
        if (nextIndex < 0 || typeof this.group.zIndexList[nextIndex] == 'undefined') {
            this.group.nextLayer();
        } else {
            this.group.zIndexList[nextIndex].activate();
        }
    }

    Layer.prototype.previousLayer = function () {
        var previousIndex = this.zIndex + 1;
        if (previousIndex > this.group.zIndexList.length - 1 || typeof this.group.zIndexList[previousIndex] == 'undefined') {
            this.group.previousLayer();
        } else {
            this.group.zIndexList[previousIndex].activate();
        }
    }

    Layer.prototype.history = function (method, value, other, context) {

        NextendSmartSliderLayerDataStorageAbtract.prototype.history.apply(this, arguments);
        switch (method) {
            case 'addLayer':
                switch (value) {
                    case 'add':
                        var group = other[0],
                            data = $.extend(true, {}, other[1]);
                        this.layerEditor._zIndexOffset = -1;
                        this.layerEditor._idTranslation = {};
                        var layer = this.layerEditor.loadSingleData(data, group);
                        smartSlider.history.changeFuture(this, layer);
                        smartSlider.history.changeFuture(this.items[0], layer.items[0]);
                        this.group.reIndexLayers();
                        this.layerEditor.refreshMode();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                }
                break;
            case 'createLayer':
                switch (value) {
                    case 'add':
                        var group = other[0],
                            data = $.extend(true, {}, other[1]);
                        this.layerEditor._zIndexOffset = -1;
                        this.layerEditor._idTranslation = {};
                        var layer = this.layerEditor.loadSingleData(data, group);
                        smartSlider.history.changeFuture(this, layer);
                        smartSlider.history.changeFuture(this.items[0], layer.items[0]);
                        this.group.reIndexLayers();
                        this.layerEditor.refreshMode();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                }
                break;
            case 'duplicateLayer':
                switch (value) {
                    case 'duplicate':
                        var newLayers = [];
                        this.duplicate(true, false, newLayers);
                        for (var i = 0; i < newLayers.length; i++) {
                            smartSlider.history.changeFuture(context.oldLayers[i], newLayers[i]);
                            smartSlider.history.changeFuture(context.oldLayers[i].items[0], newLayers[i].items[0]);
                        }
                        context.oldLayers = [];
                        break;
                    case 'delete':
                        var oldLayers = [];
                        other[0].delete(true, oldLayers);
                        context.oldLayers = oldLayers;
                        break;
                }
                break;
            case 'deleteLayer':
                switch (value) {
                    case 'create':
                        var group = other[0],
                            data = $.extend(true, {}, other[1]);
                        this.layerEditor._zIndexOffset = -1;
                        this.layerEditor._idTranslation = {};
                        var layer = this.layerEditor.loadSingleData(data, group);
                        smartSlider.history.changeFuture(this, layer);
                        smartSlider.history.changeFuture(this.items[0], layer.items[0]);
                        group.reIndexLayers();
                        this.layerEditor.refreshMode();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                }
                break;
            case 'storeAnimations':
                break;
            case 'resetMode':
                switch (value) {
                    case 'reset':
                        this.resetMode(other[0], this.layerEditor.getMode());
                        break;
                    case 'restore':
                        this.restoreMode(other[0], this.layerEditor.getMode(), other[1]);
                        break;
                }
                break;
        }
    };

    Layer.prototype.updateAnimations = function () {
    }


    Layer.prototype._sortZIndex = function (layer) {
        if (layer.group == this.group) {
            return this.zIndex >= layer.zIndex;
        }

        if (layer.group instanceof NextendSmartSliderLayerGroup && this.group instanceof NextendSmartSliderLayerGroup) {
            return this.group.zIndex >= layer.group.zIndex;
        }

        if (layer.group instanceof NextendSmartSliderLayerGroup) {
            return this.zIndex >= layer.group.zIndex;
        }

        if (this.group instanceof NextendSmartSliderLayerGroup) {
            return this.group.zIndex >= layer.zIndex;
        }

        return this.zIndex >= layer.zIndex;
    }

    scope.NextendSmartSliderLayer = Layer;

})(nextend.smartSlider, n2, window);
(function (smartSlider, $, scope, undefined) {
    var preventActivation = false;

    function parseFloatWithDefault(string, def) {
        var value = parseFloat(string);
        if (isNaN(value)) return def;
        return value;
    }

    function LayerGroup(layerEditor, group, $node, params) {
        params || (params = {});
        this.isMainGroup = false;
        this.isDeleted = false;
        this.opened = true;
        if ($node) {
            this.layer = $node;

            this.property = $.extend({
                name: 'Group',
                parallax: 0,
                fontsize: 100,
                adaptivefont: 0,
                generatorvisible: '',
                desktopPortrait: 1,
                desktopLandscape: 1,
                tabletPortrait: 1,
                tabletLandscape: 1,
                mobilePortrait: 1,
                mobileLandscape: 1
            }, {
                name: this.layer.data('name') + '',
                parallax: this.layer.data('parallax'),
                fontsize: this.layer.data('desktopportraitfontsize'),
                adaptivefont: this.layer.data('adaptivefont'),
                generatorvisible: this.layer.data('generatorvisible') || '',
                desktopPortrait: parseFloatWithDefault(this.layer.data('desktopportrait'), 1),
                desktopLandscape: parseFloatWithDefault(this.layer.data('desktoplandscape'), 1),
                tabletPortrait: parseFloatWithDefault(this.layer.data('tabletportrait'), 1),
                tabletLandscape: parseFloatWithDefault(this.layer.data('tabletlandscape'), 1),
                mobilePortrait: parseFloatWithDefault(this.layer.data('mobileportrait'), 1),
                mobileLandscape: parseFloatWithDefault(this.layer.data('mobilelandscape'), 1)
            });
            if (!this.property.name.length) {
                this.property.name = 'Group';
            }
        } else {
            this.layer = false;
            if (typeof params.data !== 'undefined') {
                this.property = {
                    name: params.data.name,
                    fontsize: params.data.fontsize,
                    adaptivefont: params.data.adaptivefont,
                    generatorvisible: params.data.generatorvisible,
                    desktopPortrait: params.data.desktopportrait,
                    desktopLandscape: params.data.desktoplandscape,
                    tabletPortrait: params.data.tabletportrait,
                    tabletLandscape: params.data.tabletlandscape,
                    mobilePortrait: params.data.mobileportrait,
                    mobileLandscape: params.data.mobilelandscape
                };
            } else {
                this.property = {
                    name: 'Group',
                    fontsize: 100,
                    adaptivefont: 0,
                    generatorvisible: '',
                    desktopPortrait: 1,
                    desktopLandscape: 1,
                    tabletPortrait: 1,
                    tabletLandscape: 1,
                    mobilePortrait: 1,
                    mobileLandscape: 1
                };
            }
        }

        NextendSmartSliderLayerContainerAbstract.prototype.constructor.call(this, layerEditor, group);

        var opened = this.layer.data('opened');
        if (opened !== null && typeof opened != 'undefined') {
            this.opened = !!opened;
        }

        this.deviceProperty = {
            desktopPortrait: {
                fontsize: this.property.fontsize
            },
            desktopLandscape: {
                fontsize: this.layer.data('desktoplandscapefontsize')
            },
            tabletPortrait: {
                fontsize: this.layer.data('tabletportraitfontsize')
            },
            tabletLandscape: {
                fontsize: this.layer.data('tabletlandscapefontsize')
            },
            mobilePortrait: {
                fontsize: this.layer.data('mobileportraitfontsize')
            },
            mobileLandscape: {
                fontsize: this.layer.data('mobilelandscapefontsize')
            }
        };


        this.layerEditor.$.trigger('layerCreated', this);
        $(window).triggerHandler('layerCreated');

        layerEditor.layerList.push(this);

        this._opened();

        if (typeof params.layers !== 'undefined') {

            var historyTask = smartSlider.history.add($.proxy(function () {
                return [this, 'createGroup', 'create', 'delete', []];
            }, this));

            var layers = [];
            for (var i = 0; i < params.layers.length; i++) {
                layers.push(this.layerEditor.loadSingleData(params.layers[i], this.layerEditor.mainLayerGroup));
            }

            this.groupLayersStartAndLateInit(layers);
            historyTask[4].push(this.zIndex);
        }
    }


    LayerGroup.prototype = Object.create(NextendSmartSliderLayerContainerAbstract.prototype);
    LayerGroup.prototype.constructor = LayerGroup;

    // Multi inheritance
    for (var k in NextendSmartSliderLayerDataStorageAbtract.prototype) {
        LayerGroup.prototype[k] = NextendSmartSliderLayerDataStorageAbtract.prototype[k];
    }

    LayerGroup.prototype.groupLayersStartAndLateInit = function (layers) {

        var zIndexOffset = 0,
            layerCountOnMain = 0;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].group != this.layerEditor.mainLayerGroup) continue;
            zIndexOffset = Math.max(zIndexOffset, layers[i].zIndex);
            layerCountOnMain++;
        }

        if (isNaN(zIndexOffset)) {
            zIndexOffset = 0;
        }

        for (var i = 0; i < layers.length; i++) {
            smartSlider.history.add($.proxy(function (layer, oldGroup, startIndex) {
                return [this, 'changeZIndexWithContainer', [layer, i, oldGroup, this], [layer, startIndex, this, oldGroup], []];
            }, this, layers[i], layers[i].group, layers[i].zIndex));

            this.addLayerBeforeInit(layers[i], i);
        }
        this.lateInit(zIndexOffset, layerCountOnMain);
    }

    LayerGroup.prototype.createLayer = function () {
        if (!this.layer) {
            this.layer = $('<div class="n2-ss-layer-group" style="z-index: ' + this.group.zIndexList.length + ';"></div>')
                .appendTo(this.group.layerContainerElement);
            // TODO 'layerContainerElement' should be 'layer'
        }
    }

    LayerGroup.prototype.createLayerRow = function () {
        var dblClickInterval = 300,
            timeout = null;

        this.selectElement = $('<a href="#" class="n2-ss-layer-list-selector"><i class="n2-i n2-i-select"></i></a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.select();
        }, this));

        var remove = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Delete layer') + '"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>').on('click', $.proxy(this.delete, this)),
            duplicate = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Duplicate layer') + '"><i class="n2-i n2-i-duplicate n2-i-grey-opacity"></i></div>').on('click', $.proxy(function () {
                this.duplicate(true, false)
            }, this));

        this.openerElement = $('<a href="#" class="n2-button n2-button-icon n2-button-m n2-ss-layer-list-group-opener" onclick="return false;"><i class="n2-i n2-i-folderopened"></i></a>').on('click', $.proxy(this.switchOpened, this));

        this.layerRow = $('<li class="n2-ss-layer-row n2-ss-layer-group-row"></li>')
            .data('layer', this)
            .appendTo(this.group.layersItemsUlElement);

        this.layerTitleSpan = $('<span class="n2-ucf">' + this.property.name + '</span>').on({
            mouseup: $.proxy(function (e) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                    this.editName();
                } else {
                    this.activate(e);
                    timeout = setTimeout($.proxy(function () {
                        timeout = null;
                    }, this), dblClickInterval);
                }
            }, this)
        });


        this.layerTitle = $('<div class="n2-ss-layer-title"></div>')
            .append(this.layerTitleSpan)
            .append($('<div class="n2-actions-left"></div>')/*.append(status)*/.append(this.openerElement)/*.append(this.bulkElement)*/)
            .append($('<div class="n2-actions"></div>').append(duplicate).append(remove))
            .appendTo(this.layerRow)
            .on({
                mouseup: $.proxy(function (e) {
                    if (e.target.tagName === 'DIV') {
                        this.activate(e);
                    }
                }, this)
            });

        this.layersItemsUlElement = $('<ul class="n2-list n2-h4 n2-list-orderable" />')
            .data('container', this);

        nextend.tooltip.add(this.layerRow);
    }

    LayerGroup.prototype.switchOpened = function () {
        this.opened = !this.opened;
        this._opened();
    };

    LayerGroup.prototype._opened = function () {
        if (this.opened) {
            this.openerElement.removeClass('n2-closed');
            this.layersItemsUlElement.css('display', '');

            this.layer.triggerHandler('opened');
        } else {
            this.openerElement.addClass('n2-closed');
            this.layersItemsUlElement.css('display', 'none');
            this.layerEditor.$.trigger('groupHidden', this);

            this.layer.triggerHandler('closed');
        }
    };


    LayerGroup.prototype.setZIndex = function (targetIndex) {
        this.zIndex = targetIndex;
        this.layer.css('zIndex', targetIndex);
        this.group.layersItemsUlElement.append(this.layerRow);
        this.$.trigger('layerIndexed', targetIndex);
    };

    LayerGroup.prototype.editName = function () {
        var input = new NextendSmartSliderAdminInlineField();

        input.$input.on({
            valueChanged: $.proxy(function (e, newName) {
                this.rename(newName, true);
                this.layerTitleSpan.css('display', 'inline');
            }, this),
            cancel: $.proxy(function () {
                this.layerTitleSpan.css('display', 'inline');
            }, this)
        });

        this.layerTitleSpan.css('display', 'none');
        input.injectNode(this.layerTitle, this.property.name);

    };

    LayerGroup.prototype.rename = function (newName) {
        if (newName == '') {
            newName = 'GROUP';
        }
        newName = newName.substr(0, 35);
        if (this.property.name != newName) {
            this.property.name = newName;
            this.layerTitleSpan.html(newName);
        }
    };


    LayerGroup.prototype.getData = function (params) {
        var data = {
            type: 'group',
            zIndex: this.zIndex,
            layers: [],
            opened: this.opened,
        };

        if (params.layersIncluded) {
            for (var i = 0; i < this.zIndexList.length; i++) {
                data.layers.push(this.zIndexList[i].getData(params))
            }
        }

        for (var k in this.property) {
            switch (k) {
                case 'fontsize':
                    break;
                default:
                    data[k.toLowerCase()] = this.property[k];
            }
        }

        // store the device based properties
        for (var device in this.deviceProperty) {
            for (var property in this.deviceProperty[device]) {
                var value = this.deviceProperty[device][property];
                if (typeof value === 'undefined') {
                    continue;
                }
                if (!(property == 'width' && this.isDimensionPropertyAccepted(value)) && !(property == 'height' && this.isDimensionPropertyAccepted(value)) && property != 'align' && property != 'valign' && property != 'parentalign' && property != 'parentvalign') {
                    value = parseFloat(value);
                }
                data[device.toLowerCase() + property] = value;
            }
        }

        return data;
    }

    LayerGroup.prototype.positionSidebar = function () {
        this.layerEditor.panel.show(this, $('#n2-ss-layer-list'));
    }

    LayerGroup.prototype.activate = function (e, preventExitFromSelection) {
        if (preventActivation) return;
        if (document.activeElement) {
            document.activeElement.blur();
        }
        if (e && (e.ctrlKey || e.metaKey)) {
            this.select();
            return;
        } else {
            if (e && e.which == 3 /*&& this.layerEditor.selectMode*/) {
                return;
            }

            if (!preventExitFromSelection) {
                this.layerEditor.exitSelectMode();
            }
        }

        if (e) {
            this.positionSidebar();
        }

        // Set the layer active if it is not active currently
        var currentIndex = this.getIndex();
        if (this.layerEditor.activeLayerIndex !== currentIndex) {
            this.layerRow.addClass('n2-active');
            this.layer.triggerHandler('n2-ss-activate');
            this.layerEditor.changeActiveLayer(currentIndex, preventExitFromSelection);
            nextend.activeLayer = this.layer;

            var scroll = this.layerEditor.mainLayerGroup.layersItemsUlElement.parent(),
                scrollTop = scroll.scrollTop(),
                top = this.layerRow.get(0).offsetTop;
            if (top < scrollTop || top > scrollTop + scroll.height() - this.layerRow.height()) {
                scroll.scrollTop(top);
            }
        }

        this.layerEditor.startSelection(true);

        this.layerEditor.addSelection(this.layers, true);
    };

    LayerGroup.prototype.deActivate = function () {

        this.layerEditor.endSelection(true);

        this.layerRow.removeClass('n2-active');
        this.layer.triggerHandler('n2-ss-deactivate');
    };

    LayerGroup.prototype.select = function () {
        this.layerEditor.selectLayer(this, false);
        this.layerEditor.addSelection(this.layers, false);
    };

    LayerGroup.prototype.getIndex = function () {
        return this.layerEditor.layerList.indexOf(this);
    };

    LayerGroup.prototype.nextLayer = function () {
        var nextIndex = this.zIndex - 1;
        if (nextIndex < 0 || typeof this.group.zIndexList[nextIndex] == 'undefined') {
            this.group.nextLayer();
        } else {
            var nextLayer = this.group.zIndexList[nextIndex];
            nextLayer.activate();
        }
    }

    LayerGroup.prototype.previousLayer = function () {
        var previousIndex = this.zIndex + 1;
        if (previousIndex > this.zIndexList.length - 1 || typeof this.group.zIndexList[previousIndex] == 'undefined') {
            this.group.previousLayer();
        } else {
            var previousLayer = this.group.zIndexList[previousIndex];
            previousLayer.activate();
        }
    }

    LayerGroup.prototype.dispatchActionToChildren = function (action, args) {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i][action].apply(this.layers[i], args);
        }
    };

    LayerGroup.prototype.snap = function () {
    };

    LayerGroup.prototype.delete = function () {

        if (this.layerEditor.getSelectedLayer() == this) {
            this.layerEditor.panel.hide();
        }

        // @TODO history

        this.deActivate();

        var layers = $.extend([], this.layers);
        for (var i = 0; i < layers.length; i++) {
            layers[i].delete();
        }

        smartSlider.history.add($.proxy(function () {
            return [this, 'deleteGroup', 'delete', 'create', [this.getData({
                layersIncluded: false,
                itemsIncluded: false
            })]];
        }, this));

        this.group.childDeleted(this);

        // If delete happen meanwhile layer dragged or resized, we have to cancel that.
        this.layer.trigger('mouseup');

        this.isDeleted = true;

        this.layerEditor.layerDeleted(this.getIndex());

        this.layer.triggerHandler('LayerDeleted');
        this.layer.remove();
        this.layerRow.remove();

        this.$.trigger('layerDeleted');

        delete this.layer;
    };

    LayerGroup.prototype.duplicate = function (needActivate, newParentId) {

        this.layerEditor.loadData([this.getData({
            layersIncluded: true,
            itemsIncluded: true
        })], false);
        /*
         var group = new NextendSmartSliderLayerGroup(this.layerEditor, this.layerEditor.mainLayerGroup, false, {
         data: $.extend(true, {}, this.getData({
         layersIncluded: true,
         itemsIncluded: true
         }))
         });
         group.lateInit();*/
    }

    LayerGroup.prototype._syncparallax = function (value) {

    };

    LayerGroup.prototype._syncfontsize = function (value) {
        this.adjustFontSize(this.getProperty(false, 'adaptivefont'), value, true);
    };

    LayerGroup.prototype._syncadaptivefont = function (value) {
        this.adjustFontSize(value, this.getProperty(true, 'fontsize'), true);
    };

    LayerGroup.prototype.adjustFontSize = function (isAdaptive, fontSize, shouldUpdatePosition) {
        fontSize = parseInt(fontSize);
        if (parseInt(isAdaptive)) {
            this.layer.css('font-size', (nextend.smartSlider.frontend.sliderElement.data('fontsize') * fontSize / 100) + 'px');
        } else if (fontSize != 100) {
            this.layer.css('font-size', fontSize + '%');
        } else {
            this.layer.css('font-size', '');
        }
        if (shouldUpdatePosition) {
            this.update();
        }
    };

    LayerGroup.prototype._syncgeneratorvisible = function (value) {
    };

    LayerGroup.prototype._syncdesktopPortrait = function (value) {
        this.__syncShowOnDevice('desktopPortrait', value);
    };

    LayerGroup.prototype._syncdesktopLandscape = function (value) {
        this.__syncShowOnDevice('desktopLandscape', value);
    };

    LayerGroup.prototype._synctabletPortrait = function (value) {
        this.__syncShowOnDevice('tabletPortrait', value);
    };

    LayerGroup.prototype._synctabletLandscape = function (value) {
        this.__syncShowOnDevice('tabletLandscape', value);
    };

    LayerGroup.prototype._syncmobilePortrait = function (value) {
        this.__syncShowOnDevice('mobilePortrait', value);
    };

    LayerGroup.prototype._syncmobileLandscape = function (value) {
        this.__syncShowOnDevice('mobileLandscape', value);
    };

    LayerGroup.prototype.__syncShowOnDevice = function (mode, value) {
        if (this.getMode() == mode) {
            var value = parseInt(value);
            if (value) {
                this._show();
            } else {
                this._hide();
            }
            this.layer.triggerHandler('LayerShowChange', [mode, value]);
        }
    };

    LayerGroup.prototype._hide = function () {
        this.layer.css('display', 'none');
    };

    LayerGroup.prototype._show = function () {
        if (parseInt(this.property[this.layerEditor.getMode()])) {
            this.layer.css('display', 'block');
        }

        this.update();
    };

    LayerGroup.prototype.update = function () {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].update();
        }
    }

    // from: manager or other
    LayerGroup.prototype.setProperty = function (name, value, from) {
        switch (name) {
            case 'parallax':
            case 'generatorvisible':
            case 'adaptivefont':
                this.store(false, name, value, true);
                break;
            case 'fontsize':
                this.store(true, name, value, true);
                break;
            case 'showFieldDesktopPortrait':
                this.store(false, 'desktopPortrait', parseInt(value), true);
                break;
            case 'showFieldDesktopLandscape':
                this.store(false, 'desktopLandscape', parseInt(value), true);
                break;
            case 'showFieldTabletPortrait':
                this.store(false, 'tabletPortrait', parseInt(value), true);
                break;
            case 'showFieldTabletLandscape':
                this.store(false, 'tabletLandscape', parseInt(value), true);
                break;
            case 'showFieldMobilePortrait':
                this.store(false, 'mobilePortrait', parseInt(value), true);
                break;
            case 'showFieldMobileLandscape':
                this.store(false, 'mobileLandscape', parseInt(value), true);
                break;
        }

        if (from != 'manager') {
            // jelezzuk a sidebarnak, hogy valamely property megvaltozott
            this.$.trigger('propertyChanged', [name, value]);
        }
    };

    LayerGroup.prototype.changeEditorMode = function (mode) {
        var value = parseInt(this.property[mode]);
        if (value) {
            this._show();
        } else {
            this._hide();
        }

        this.layer.triggerHandler('LayerShowChange', [mode, value]);

        this._renderModeProperties(false);
    };

    LayerGroup.prototype._renderModeProperties = function (isReset) {

        for (var k in this.property) {
            this.property[k] = this.getProperty(true, k);
            this.$.trigger('propertyChanged', [k, this.property[k]]);
        }

        var fontSize = this.getProperty(true, 'fontsize');
        this.adjustFontSize(this.getProperty(false, 'adaptivefont'), fontSize, false);

        if (isReset) {
            //this._resize(true);
        }

    };

    LayerGroup.prototype.updateAnimations = function () {
    }

    LayerGroup.prototype.showEditor = function () {
        this.layerEditor.panel._show();
    }

    LayerGroup.prototype.doAction = function (action, args) {
        var layers = $.extend([], this.zIndexList);
        for (var i = 0; i < layers.length; i++) {
            layers[i][action].apply(layers[i], args);
        }
    }

    LayerGroup.prototype.copyMode = function (from, to) {
        if (from != to) {
            this.deviceProperty[to] = $.extend({}, this.deviceProperty[to], this.deviceProperty[from]);
        }
    };

    LayerGroup.prototype.resetMode = function (mode, currentMode) {
        if (mode != 'desktopPortrait') {
            var undefined;

            for (var k in this.property) {
                this.deviceProperty[mode][k] = undefined;
            }
            if (mode == currentMode) {
                this._renderModeProperties(true);
            }
        }
    };

    LayerGroup.prototype.restoreMode = function (mode, currentMode, data) {
        if (mode != 'desktopPortrait') {

            this.deviceProperty[mode] = $.extend({}, data);

            if (mode == currentMode) {
                this._renderModeProperties(true);
            }
        }
    };

    LayerGroup.prototype.history = function (method, value, other, context) {

        NextendSmartSliderLayerDataStorageAbtract.prototype.history.apply(this, arguments);
        NextendSmartSliderLayerContainerAbstract.prototype.history.apply(this, arguments);
    }

    scope.NextendSmartSliderLayerGroup = LayerGroup;
})(nextend.smartSlider, n2, window);
(function (smartSlider, $, scope, undefined) {

    function LayersUserInterface() {
        this.isShown = !$.jStorage.get('ssLayersShown', false);
        this.tlHeight = $.jStorage.get('ssLayersHeight') || 200;

        this.$container = $('#n2-ss-layers');
        this.fixScroll();
        this.switchLayerList();

        this.topBar = $('.n2-ss-layer-list-top-bar')
            .on('mousedown', $.proxy(this.resizeStart, this));

        this.topBar.find('.n2-ss-layer-list-opener').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.switchLayerList();
        }, this));

        $('.n2-ss-slide-show-layers').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.switchLayerList();
        }, this));

        this.onResize();
        $(window).on('resize', $.proxy(this.onResize, this));
    };

    LayersUserInterface.prototype.onResize = function () {
        var h = this.$container.height();
        this.paneLeft.height(h - 48);
        this.paneRight.height(h - 48);
    }

    LayersUserInterface.prototype.onActivateLayer = function (layer) {

        var scrollTop = this.paneLeft.scrollTop(),
            top = layer.layerRow.get(0).offsetTop;
        if (top < scrollTop || top > scrollTop + this.paneLeft.height() - layer.layerRow.height()) {
            this.paneLeft.scrollTop(top);
            this.paneRight.scrollTop(top);
        }
    }

    LayersUserInterface.prototype.fixScroll = function () {

        this.paneLeft = $('.n2-ss-layers-sidebar-rows');
        this.paneRight = $('.n2-ss-timeline-content-layers-container');

        var cb = $.proxy(function (e) {
            var top = this.paneLeft.scrollTop();
            if (e.originalEvent.deltaY > 0) {
                top += 40;
            } else {
                top -= 40;
            }
            top = Math.round(top / 40) * 40;
            this.paneLeft.scrollTop(top);
            this.paneRight.scrollTop(top);
            e.preventDefault();
        }, this);

        this.paneLeft.on('mousewheel', cb);
        this.paneLeft.on('scroll', $.proxy(function (e) {
            var top = this.paneLeft.scrollTop();
            this.paneRight.scrollTop(top);
            e.preventDefault();
        }, this));

        this.paneRight.on('mousewheel', cb);
    }

    LayersUserInterface.prototype.resizeStart = function (e) {
        if (!this.isShown) return;
        if (e.target == this.topBar[0] || $(e.target).hasClass('n2-h2')) {
            e.preventDefault();
            this.startY = e.clientY;
            this.height = this.$container.height();
            $('body').on({
                'mousemove.n2-ss-tl-resize': $.proxy(this.resizeMove, this),
                'mouseup.n2-ss-tl-resize': $.proxy(this.resizeStop, this),
                'mouseleave.n2-ss-tl-resize': $.proxy(this.resizeStop, this)
            });
        }
    }

    LayersUserInterface.prototype.resizeMove = function (e) {
        e.preventDefault();
        this.setTLHeight(this._calculateDesiredHeight(e));
    }

    LayersUserInterface.prototype.resizeStop = function (e) {
        e.preventDefault();
        $('body').off('.n2-ss-tl-resize');
        var h = this._calculateDesiredHeight(e);
        this.setTLHeight(h);

        this.tlHeight = h;
        $.jStorage.set('ssLayersHeight', h);
        $('#n2-admin').triggerHandler('resize');
    }

    LayersUserInterface.prototype._calculateDesiredHeight = function (e) {
        var h = this.startY - e.clientY + this.height - 48;
        return this.__calculateDesiredHeight(h);
    }

    LayersUserInterface.prototype.__calculateDesiredHeight = function (h) {
        return Math.round(Math.min(Math.max(40, h), (window.innerHeight || document.documentElement.clientHeight) / 2) / 40) * 40 + 48;
    }


    LayersUserInterface.prototype.switchLayerList = function () {
        this.isShown = !this.isShown;
        this.$container.toggleClass('n2-active', this.isShown);
        if (this.isShown) {
            this.setTLHeight(this.tlHeight);
        } else {
            this.setTLHeight(48);
        }
        $.jStorage.set('ssLayersShown', this.isShown);
    }

    LayersUserInterface.prototype.setTLHeight = function (h) {
        h = Math.max(48, h);
        this.$container.height(h);
        h = this.$container.height();
        this.paneLeft.height(h - 48);
        this.paneRight.height(h - 48);

        nextend.triggerResize();
    }

    LayersUserInterface.prototype.activateAdd = function (x, y) {
        this.$add.css({
            left: x,
            top: y
        }).appendTo(this.$container);
    }

    window.NextendSmartSliderAdminLayersUserInterface = LayersUserInterface;
})(nextend.smartSlider, n2, window);
(function (smartSlider, $, scope, undefined) {

    function MainLayerGroup(layerEditor) {
        this.isMainGroup = true;
        NextendSmartSliderLayerContainerAbstract.prototype.constructor.call(this, layerEditor, false);

        this.lateInit();

        this.startWithExistingNodes();
    }


    MainLayerGroup.prototype = Object.create(NextendSmartSliderLayerContainerAbstract.prototype);
    MainLayerGroup.prototype.constructor = MainLayerGroup;


    MainLayerGroup.prototype.createLayer = function () {
        if (!this.layer) {
            this.layer = this.layerEditor.layerContainerElement;
            // TODO 'layerContainerElement' should be 'layer'
        }
    }

    MainLayerGroup.prototype.createLayerRow = function () {

        this.layersItemsUlElement = this.layerEditor.layersItemsElement.find('ul')
            .data('container', this);
    }

    MainLayerGroup.prototype.nextLayer = function () {
        var nextLayer = this.zIndexList[this.zIndexList.length - 1];
        nextLayer.activate();
    }

    MainLayerGroup.prototype.previousLayer = function () {
        var nextLayer = this.zIndexList[0];
        nextLayer.activate();
    }


    scope.NextendSmartSliderMainLayerGroup = MainLayerGroup;

})(nextend.smartSlider, n2, window);
(function (smartSlider, $, scope, undefined) {
    var layerClass = '.n2-ss-layer',
        keys = {
            16: 0,
            38: 0,
            40: 0,
            37: 0,
            39: 0
        },
        nameToIndex = {
            left: 0,
            center: 1,
            right: 2,
            top: 0,
            middle: 1,
            bottom: 2
        },
        horizontalAlign = {
            97: 'left',
            98: 'center',
            99: 'right',
            100: 'left',
            101: 'center',
            102: 'right',
            103: 'left',
            104: 'center',
            105: 'right'
        },
        verticalAlign = {
            97: 'bottom',
            98: 'bottom',
            99: 'bottom',
            100: 'middle',
            101: 'middle',
            102: 'middle',
            103: 'top',
            104: 'top',
            105: 'top'
        },
        SELECT_MODE = {
            OFF: 0,
            ON: 1,
            GROUP: 2
        },
        SELECT_MODE_INV = {
            0: 'OFF',
            1: 'ON',
            2: 'GROUP'
        };

    function AdminSlideLayerManager(layerManager, staticSlide, isUploadDisabled, uploadUrl, uploadDir) {
        this.activeLayerIndex = -1;
        this.snapToEnabled = true;
        this.staticSlide = staticSlide;

        this.initSelectMode();

        this.$ = $(this);
        smartSlider.layerManager = this;

        this.responsive = smartSlider.frontend.responsive;

        this.panel = new NextendSmartSliderSidebar(this);

        this.layerList = [];

        this.layersItemsElement = $('#n2-ss-layer-list');

        this.frontendSlideLayers = layerManager;

        this.frontendSlideLayers.setZero();


        this.layerContainerElement = smartSlider.$currentSlideElement.find('.n2-ss-layers-container');
        if (!this.layerContainerElement.length) {
            this.layerContainerElement = smartSlider.$currentSlideElement;
        }

        this.layerContainerElement.parent().prepend('<div class="n2-ss-slide-border n2-ss-slide-border-left" /><div class="n2-ss-slide-border n2-ss-slide-border-top" /><div class="n2-ss-slide-border n2-ss-slide-border-right" /><div class="n2-ss-slide-border n2-ss-slide-border-bottom" />');


        this.slideSize = {
            width: this.layerContainerElement.width(),
            height: this.layerContainerElement.height()
        };

        smartSlider.frontend.sliderElement.on('SliderResize', $.proxy(this.refreshSlideSize, this));

        this.sidebar = new NextendSmartSliderAdminSlideSidebarSettings(this);

        this.ui = new NextendSmartSliderAdminLayersUserInterface(this);

        smartSlider.itemEditor = this.itemEditor = new NextendSmartSliderItemManager(this);

        this.positionDisplay = $('<div class="n2 n2-ss-position-display"/>')
            .appendTo('body');

        this.mainLayerGroup = new NextendSmartSliderMainLayerGroup(this);

        $('#smartslider-slide-toolbox-layer').on('mouseenter', function () {
            $('#n2-admin').addClass('smartslider-layer-highlight-active');
        }).on('mouseleave', function () {
            $('#n2-admin').removeClass('smartslider-layer-highlight-active');
        });

        this._initDeviceModeChange();

        this.initSettings();

        this.sidebar.startFeatures();

        var globalAdaptiveFont = $('#n2-ss-layer-adaptive-font').on('click', $.proxy(function () {
            this.sidebar.forms.layer.adaptivefont.data('field').onoff.trigger('click');
        }, this));

        this.sidebar.forms.layer.adaptivefont.on('nextendChange', $.proxy(function () {
            if (this.sidebar.forms.layer.adaptivefont.val() == 1) {
                globalAdaptiveFont.addClass('n2-active');
            } else {
                globalAdaptiveFont.removeClass('n2-active');
            }
        }, this));


        new NextendElementNumber("n2-ss-layer-font-size", -Number.MAX_VALUE, Number.MAX_VALUE);
        new NextendElementAutocompleteSlider("n2-ss-layer-font-size", {
            min: 50,
            max: 300,
            step: 5
        });

        var globalFontSize = $('#n2-ss-layer-font-size').on('outsideChange', $.proxy(function () {
            var value = parseInt(globalFontSize.val());
            this.sidebar.forms.layer.fontsize.val(value).trigger('change');
        }, this));

        this.sidebar.forms.layer.fontsize.on('nextendChange', $.proxy(function () {
            globalFontSize.data('field').insideChange(this.sidebar.forms.layer.fontsize.val());
        }, this));

        //this.mainLayerGroup.activateFirst();

        $('.n2-ss-slide-duplicate-layer').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.duplicate();
        }, this));

        $('.n2-ss-slide-delete-layer').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.delete();
        }, this));

        $(window).on({
            keydown: $.proxy(function (e) {
                if (e.target.tagName != 'TEXTAREA' && e.target.tagName != 'INPUT' && (!smartSlider.timelineControl || !smartSlider.timelineControl.isActivated())) {
                    if (this.activeLayerIndex != -1) {
                        var keyCode = e.keyCode;
                        if (keyCode >= 49 && keyCode <= 57) {
                            var location = e.originalEvent.location || e.originalEvent.keyLocation || 0;
                            // Fix OSX Chrome numeric keycodes
                            if (location == 3) {
                                keyCode += 48;
                            }
                        }

                        if (keyCode == 46 || keyCode == 8) {
                            this.delete();
                            e.preventDefault();
                        } else if (keyCode == 35) {
                            this.duplicate();
                            e.preventDefault();
                        } else if (keyCode == 16) {
                            keys[keyCode] = 1;
                        } else if (keyCode == 38) {
                            if (!keys[keyCode]) {
                                var fn = $.proxy(function () {
                                    //this.layerList[this.activeLayerIndex].moveY(-1 * (keys[16] ? 10 : 1))
                                    this.doActionOnActiveLayer('moveY', [-1 * (keys[16] ? 10 : 1)]);
                                }, this);
                                fn();
                                keys[keyCode] = setInterval(fn, 100);
                            }
                            e.preventDefault();
                        } else if (keyCode == 40) {
                            if (!keys[keyCode]) {
                                var fn = $.proxy(function () {
                                    //this.layerList[this.activeLayerIndex].moveY((keys[16] ? 10 : 1))
                                    this.doActionOnActiveLayer('moveY', [(keys[16] ? 10 : 1)]);
                                }, this);
                                fn();
                                keys[keyCode] = setInterval(fn, 100);
                            }
                            e.preventDefault();
                        } else if (keyCode == 37) {
                            if (!keys[keyCode]) {
                                var fn = $.proxy(function () {
                                    //this.layerList[this.activeLayerIndex].moveX(-1 * (keys[16] ? 10 : 1))
                                    this.doActionOnActiveLayer('moveX', [-1 * (keys[16] ? 10 : 1)]);
                                }, this);
                                fn();
                                keys[keyCode] = setInterval(fn, 100);
                            }
                            e.preventDefault();
                        } else if (keyCode == 39) {
                            if (!keys[keyCode]) {
                                var fn = $.proxy(function () {
                                    //this.layerList[this.activeLayerIndex].moveX((keys[16] ? 10 : 1))
                                    this.doActionOnActiveLayer('moveX', [keys[16] ? 10 : 1]);
                                }, this);
                                fn();
                                keys[keyCode] = setInterval(fn, 100);
                            }
                            e.preventDefault();
                        } else if (keyCode >= 97 && keyCode <= 105) {

                            var hAlign = horizontalAlign[keyCode],
                                vAlign = verticalAlign[keyCode],
                                toZero = false;
                            if (this.sidebar.forms.layer.align.val() == hAlign && this.sidebar.forms.layer.valign.val() == vAlign) {
                                toZero = true;
                            }
                            // numeric pad
                            this.sidebar.layerFeatures.horizontalAlign(hAlign, toZero);
                            this.sidebar.layerFeatures.verticalAlign(vAlign, toZero);

                        } else if (keyCode == 34) {
                            e.preventDefault();

                            this.layerList[this.activeLayerIndex].nextLayer();

                        } else if (keyCode == 33) {
                            e.preventDefault();

                            this.layerList[this.activeLayerIndex].previousLayer();

                        } else if (keyCode == 65) {
                            e.preventDefault();

                            this.layerList[this.activeLayerIndex].fit();

                        } else if (e.ctrlKey || e.metaKey) {
                            if (keyCode == 90) {
                                if (e.shiftKey) {
                                    smartSlider.history.redo();
                                } else {
                                    smartSlider.history.undo();
                                }
                            } else if (keyCode == 67) {
                                this.copy();
                            } else if (keyCode == 86) {
                                this.paste(0);
                            } else if (keyCode == 71) {
                                this.createGroupFromSelected();
                                e.preventDefault();
                            }
                        }
                    }
                }
            }, this),
            keyup: $.proxy(function (e) {
                if (typeof keys[e.keyCode] !== 'undefined' && keys[e.keyCode]) {
                    clearInterval(keys[e.keyCode]);
                    keys[e.keyCode] = 0;
                }
            }, this)
        });

        this.addContextMenu();

        if (!isUploadDisabled) {
            smartSlider.frontend.sliderElement.fileupload({
                url: uploadUrl,
                pasteZone: false,
                dropZone: smartSlider.frontend.sliderElement,
                dataType: 'json',
                paramName: 'image',
                add: $.proxy(function (e, data) {
                    data.formData = {path: '/' + uploadDir};
                    data.submit();
                }, this),
                done: $.proxy(function (e, data) {
                    var response = data.result;
                    if (response.data && response.data.name) {
                        var item = this.itemEditor.createLayerItem(false, 'image');
                        item.reRender({
                            image: response.data.url
                        });
                        item.activate(null, null, true);
                    } else {
                        NextendAjaxHelper.notification(response);
                    }

                }, this),
                fail: $.proxy(function (e, data) {
                    NextendAjaxHelper.notification(data.jqXHR.responseJSON);
                }, this),

                start: function () {
                    NextendAjaxHelper.startLoading();
                },

                stop: function () {
                    setTimeout(function () {
                        NextendAjaxHelper.stopLoading();
                    }, 100);
                }
            });
        }


        var that = this;
        window.validateLayers = function () {
            console.group();
            for (var i = 0; i < that.mainLayerGroup.zIndexList.length; i++) {
                console.log(i, that.mainLayerGroup.zIndexList[i].layerRow.get(0));
            }
            console.groupEnd();
        };

        this.$.on('layerCreated', $.proxy(function () {
            this.editorVisibilityRefresh();
        }, this));

        this.editorVisibilityRefresh();

        $('body').on('mousedown', $.proxy(function (e) {
            if (nextend.context.getCurrentWindow() == 'main') {
                if (nextend.context.mouseDownArea === false) {
                    this.panel.hide();
                }
                /*else {
                 setTimeout($.proxy(function () {
                 this.panel.show(this.getSelectedLayer());
                 }, this), 200);
                 }*/
            }
        }, this));
    };

    AdminSlideLayerManager.prototype.getMode = function () {
        return this.mode;
    };

    AdminSlideLayerManager.prototype._getMode = function () {
        return this.responsive.getNormalizedModeString();
    };

    AdminSlideLayerManager.prototype.getResponsiveRatio = function (axis) {
        if (axis == 'h') {
            return this.responsive.lastRatios.slideW;
        } else if (axis == 'v') {
            return this.responsive.lastRatios.slideH;
        }
        return 0;
    };

    AdminSlideLayerManager.prototype.isGroup = function (layer) {
        return layer instanceof NextendSmartSliderLayerGroup;
    }

    AdminSlideLayerManager.prototype.getActiveGroup = function () {
        var activeLayer = this.getSelectedLayer();
        if (this.isGroup(activeLayer)) {
            return activeLayer;
        } else if (activeLayer) {
            return activeLayer.group;
        }
        return this.mainLayerGroup;
    }

    AdminSlideLayerManager.prototype.createLayer = function (group, properties) {
        var defaultAlign = this.sidebar.layerFeatures.layerDefault;
        for (var k in defaultAlign) {
            if (defaultAlign[k] !== null) {
                properties[k] = defaultAlign[k];
            }
        }

        var newLayer = new NextendSmartSliderLayer(this, group, false, this.itemEditor, properties);

        group.reIndexLayers();

        return newLayer;
    };

    AdminSlideLayerManager.prototype.addLayer = function (group, html, refresh) {
        var layerObj = this._addLayer(group, html, refresh);

        smartSlider.history.add($.proxy(function () {
            return [layerObj, 'addLayer', 'add', 'delete', [group, layerObj.getData({
                layersIncluded: true,
                itemsIncluded: true
            })]];
        }, this));

        return layerObj;
    };

    AdminSlideLayerManager.prototype._addLayer = function (group, html, refresh) {
        var newLayer = $(html);
        this.layerContainerElement.append(newLayer);
        var layerObj = new NextendSmartSliderLayer(this, group, newLayer, this.itemEditor);

        if (group != this.mainLayerGroup) {
            group.moveLayerToGroup(layerObj, layerObj.zIndex);
        }

        if (refresh) {
            this.mainLayerGroup.reIndexLayers();
            this.refreshMode();
        }
        return layerObj;
    };

    /**
     * Force the view to change to the second mode (layer)
     */
    AdminSlideLayerManager.prototype.switchToLayerTab = function () {
        smartSlider.slide._changeView(1);
    };

    //<editor-fold desc="Initialize the device mode changer">


    AdminSlideLayerManager.prototype._initDeviceModeChange = function () {
        var resetButton = $('#layerresettodesktop').on('click', $.proxy(this.__onResetToDesktopClick, this));
        this.resetToDesktopTRElement = resetButton.closest('tr');
        this.resetToDesktopGlobalElement = $('#n2-ss-layer-reset-to-desktop').on('click', $.proxy(function () {
            if (this.resetToDesktopTRElement.css('display') == 'block') {
                resetButton.trigger('click');
            }
        }, this));

        var showOn = $('#n2-ss-layer-show-on'),
            showOnShortCuts = {},
            deviceModes = smartSlider.frontend.responsive.parameters.deviceModes;
        for (var k in deviceModes) {
            if (deviceModes[k]) {
                showOnShortCuts[k] = $('<div class="n2-radio-option"><i class="n2-i n2-it n2-i-' + k + '"></i></div>').on('click', $.proxy(function (mode) {
                    this.sidebar.forms.layer['showField' + mode.charAt(0).toUpperCase() + mode.substr(1)]
                        .data('field')
                        .onoff.trigger('click');
                }, this, k)).appendTo(showOn);
            }
        }

        showOn.children().first().addClass('n2-first');
        showOn.children().last().addClass('n2-last');


        this.globalShowOnDeviceCB = function (mode) {
            if (typeof showOnShortCuts[mode] !== 'undefined') {
                showOnShortCuts[mode].toggleClass('n2-active', this.sidebar.forms.layer['showField' + mode.charAt(0).toUpperCase() + mode.substr(1)].val() == 1);
            }
        };

        this.sidebar.forms.layer.showFieldDesktopPortrait.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'desktopPortrait'));
        this.sidebar.forms.layer.showFieldDesktopLandscape.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'desktopLandscape'));

        this.sidebar.forms.layer.showFieldTabletPortrait.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'tabletPortrait'));
        this.sidebar.forms.layer.showFieldTabletLandscape.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'tabletLandscape'));

        this.sidebar.forms.layer.showFieldMobilePortrait.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'mobilePortrait'));
        this.sidebar.forms.layer.showFieldMobileLandscape.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'mobileLandscape'));

        $('#layershow').data('field').setAvailableDevices(deviceModes);
        $('#layergroup-show').data('field').setAvailableDevices(deviceModes);

        this.__onChangeDeviceOrientation();
        smartSlider.frontend.sliderElement.on('SliderDeviceOrientation', $.proxy(this.__onChangeDeviceOrientation, this));


        //this.__onResize();
        smartSlider.frontend.sliderElement.on('SliderResize', $.proxy(this.__onResize, this));
    };

    /**
     * Refresh the current responsive mode. Example: you are in tablet view and unpublish a layer for tablet, then you should need a refresh on the mode.
     */
    AdminSlideLayerManager.prototype.refreshMode = function () {

        this.__onChangeDeviceOrientation();

        smartSlider.frontend.responsive.reTriggerSliderDeviceOrientation();
    };

    /**
     * When the device mode changed we have to change the slider
     * @param mode
     * @private
     */
    AdminSlideLayerManager.prototype.__onChangeDeviceOrientation = function () {

        this.mode = this._getMode();
        this.globalShowOnDeviceCB(this.mode);

        this.resetToDesktopTRElement.css('display', (this.mode == 'desktopPortrait' ? 'none' : 'block'));
        this.resetToDesktopGlobalElement.css('display', (this.mode == 'desktopPortrait' ? 'none' : ''));
        for (var i = 0; i < this.layerList.length; i++) {
            this.layerList[i].changeEditorMode(this.mode);
        }
    };

    AdminSlideLayerManager.prototype.__onResize = function (e, ratios) {

        var sortedLayerList = this.getSortedLayers();

        for (var i = 0; i < sortedLayerList.length; i++) {
            sortedLayerList[i].doLinearResize(ratios);
        }
    };

    /**
     * Reset the custom values of the current mode on the current layer to the desktop values.
     * @private
     */
    AdminSlideLayerManager.prototype.__onResetToDesktopClick = function () {
        if (this.activeLayerIndex != -1) {
            var mode = this.getMode();
            this.layerList[this.activeLayerIndex].resetMode(mode, mode);
        }
    };

    AdminSlideLayerManager.prototype.copyOrResetMode = function (mode) {

        var currentMode = this.getMode();
        if (mode != 'desktopPortrait' && mode == currentMode) {
            for (var i = 0; i < this.layerList.length; i++) {
                this.layerList[i].resetMode(mode, currentMode);
            }
        } else if (mode != 'desktopPortrait' && currentMode == 'desktopPortrait') {
            for (var i = 0; i < this.layerList.length; i++) {
                this.layerList[i].resetMode(mode, currentMode);
            }
        } else if (mode != currentMode) {
            for (var i = 0; i < this.layerList.length; i++) {
                this.layerList[i].copyMode(currentMode, mode);
            }
        }

    };

    AdminSlideLayerManager.prototype.refreshSlideSize = function () {
        this.slideSize.width = smartSlider.frontend.dimensions.slide.width;
        this.slideSize.height = smartSlider.frontend.dimensions.slide.height;
    };

//</editor-fold>

    AdminSlideLayerManager.prototype.initSettings = function () {
        this.settings = {}
        var $settings = $('#n2-ss-slide-canvas-settings')
            .on('mouseleave', $.proxy(function () {
                $settings.removeClass('n2-active');
            }, this));
        $settings.find('> a').on('click', function (e) {
            e.preventDefault();
            $settings.toggleClass('n2-active');
        });
        this.$settingsPanel = $settings.find('.n2-ss-settings-panel-inner');
        this.initSnapTo();
        this.initEditorTheme();
        this.initRuler();
    }

    AdminSlideLayerManager.prototype.addSettings = function (hash, title, _default, cb) {
        this.settings[hash] = parseInt($.jStorage.get(hash, _default));
        var row = $('<a href="">' + title + '<span class="n2-setting-tick"><i class="n2-i n2-it n2-i-tick2"></i></span></a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.settings[hash] = (this.settings[hash] == 1 ? 0 : 1);
            $.jStorage.set(hash, this.settings[hash]);
            row.toggleClass('n2-setting-enabled', this.settings[hash] == 1);
            cb(this.settings[hash]);
        }, this)).appendTo(this.$settingsPanel);

        row.toggleClass('n2-setting-enabled', this.settings[hash] == 1);
        cb(this.settings[hash]);
    }

    AdminSlideLayerManager.prototype.addAction = function (title, cb) {
        $('<a href="" class="n2-panel-action">' + title + '</a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            cb();
        }, this)).appendTo(this.$settingsPanel);
    }

    AdminSlideLayerManager.prototype.initRuler = function () {

        var editor = $('#n2-tab-smartslider-editor');
        this.addSettings("n2-ss-ruler-enabled", 'Ruler', 1, $.proxy(function (value) {
            editor.toggleClass('n2-ss-has-ruler', value == 1);
            nextend.triggerResize();
        }, this));


        this.addSettings("n2-ss-show-guides", 'Show Guides', 1, $.proxy(function (value) {
            nextend.ruler.showGuides = value;
            editor.toggleClass('n2-ss-show-guides', value == 1);
        }, this));
        this.addSettings("n2-ss-lock-guides", 'Lock Guides', 0, $.proxy(function (value) {
            editor.toggleClass('n2-ss-lock-guides', value == 1);
        }, this));

        this.addAction('Clear Guides', $.proxy(function () {
            nextend.ruler.clearGuides();
        }, this))
    };

    AdminSlideLayerManager.prototype.initSnapTo = function () {

        this.addSettings("n2-ss-snap-to-enabled", 'Smart Snap', 1, $.proxy(function (value) {
            for (var i = 0; i < this.layerList.length; i++) {
                this.layerList[i].snap();
            }
        }, this));
    };

    AdminSlideLayerManager.prototype.getSnap = function () {
        if (!this.settings["n2-ss-snap-to-enabled"]) {
            return false;
        }

        if (this.staticSlide) {
            return $('.n2-ss-static-slide .n2-ss-layer:not(.n2-ss-layer-locked):not(.n2-ss-layer-parent):not(.n2-ss-layer-selected):visible, .n2-ruler-guide');
        }
        return $('.n2-ss-slide.n2-ss-slide-active .n2-ss-layer:not(.n2-ss-layer-locked):not(.n2-ss-layer-parent):not(.n2-ss-layer-selected):visible, .n2-ruler-guide');
    };

    AdminSlideLayerManager.prototype.initEditorTheme = function () {

        var themeElement = $('#n2-tab-smartslider-editor');
        this.addSettings("n2-ss-theme-dark", 'Dark Mode', 0, function (value) {
            themeElement.toggleClass('n2-ss-theme-dark', value == 1);
        });
    };

    /**
     * Delete all layers on the slide
     */
    AdminSlideLayerManager.prototype.deleteLayers = function () {
        for (var i = this.mainLayerGroup.zIndexList.length - 1; i >= 0; i--) {
            this.mainLayerGroup.zIndexList[i].delete();
        }
    };

    AdminSlideLayerManager.prototype.layerDeleted = function (index) {

        var deletedLayer = this.layerList[index];
        deletedLayer.group.reIndexLayers();

        var i = this.selectedLayers.length;
        while (i--) {
            if (deletedLayer == this.selectedLayers[i]) {
                this.selectedLayers.splice(i, 1);
            }
        }

        this.layerList.splice(index, 1);

        if (index === this.activeLayerIndex) {
            this.activeLayerIndex = -1;
        }

        this.afterLayerDeleted(index);

        this.editorVisibilityRefresh();
    };

    AdminSlideLayerManager.prototype.editorVisibilityRefresh = function () {
        switch (this.layerList.length > 0) {
            case false:
                $('body').removeClass('n2-ss-has-layers');
                nextend.triggerResize();
                break;
            default:
                $('body').addClass('n2-ss-has-layers');
                nextend.triggerResize();
                break;
        }
    }

    AdminSlideLayerManager.prototype.afterLayerDeleted = NextendDeBounce(function (index) {

        var activeLayer = this.getSelectedLayer();
        if (!activeLayer || activeLayer.isDeleted) {
            this.resetActiveLayer();
        } else if (activeLayer) {
            this.activeLayerIndex = activeLayer.getIndex();
        }
    }, 50);

    AdminSlideLayerManager.prototype.getSortedLayers = function () {
        var list = this.mainLayerGroup.getChildLayersRecursive(false),
            children = {};
        for (var i = list.length - 1; i >= 0; i--) {
            if (typeof list[i].property.parentid !== 'undefined' && list[i].property.parentid) {
                if (typeof children[list[i].property.parentid] == 'undefined') {
                    children[list[i].property.parentid] = [];
                }
                children[list[i].property.parentid].push(list[i]);
                list.splice(i, 1);
            }
        }
        for (var i = 0; i < list.length; i++) {
            if (typeof list[i].property.id !== 'undefined' && list[i].property.id && typeof children[list[i].property.id] !== 'undefined') {
                children[list[i].property.id].unshift(0);
                children[list[i].property.id].unshift(i + 1);
                list.splice.apply(list, children[list[i].property.id]);
                delete children[list[i].property.id];
            }
        }
        return list;
    };


    AdminSlideLayerManager.prototype.getActiveLayerData = function () {
        var layers = [];
        if (typeof this.layerList[this.activeLayerIndex] !== 'undefined') {
            if (this.selectMode == SELECT_MODE.ON) {
                for (var i = 0; i < this.selectedLayers.length; i++) {
                    this.selectedLayers[i].getDataWithChildren(layers);
                }
            } else {
                this.layerList[this.activeLayerIndex].getDataWithChildren(layers);
            }
        }
        return layers;
    };

    /**
     * Get the HTML code of the whole slide
     * @returns {string} HTML
     */
    AdminSlideLayerManager.prototype.getHTML = function () {
        var node = $('<div></div>');

        var list = this.layerList;
        for (var i = 0; i < list.length; i++) {
            node.append(list[i].getHTML(true, true));
        }

        return node.html();
    };


    AdminSlideLayerManager.prototype.getData = function () {
        var layers = [];

        var list = this.mainLayerGroup.zIndexList;
        for (var i = 0; i < list.length; i++) {
            layers.push(list[i].getData({
                layersIncluded: true,
                itemsIncluded: true
            }));
        }

        return layers;
    };

    AdminSlideLayerManager.prototype.loadData = function (data, overwrite, group) {

        group = group || this.mainLayerGroup;

        smartSlider.history.add($.proxy(function () {
            return [this, 'fixActiveLayer', '', '', []];
        }, this));

        var layers = $.extend(true, [], data);
        if (overwrite) {
            this.deleteLayers();
        }
        this._zIndexOffset = this.mainLayerGroup.zIndexList.length;
        this._idTranslation = {};
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type == 'group') {
                this.loadSingleGroupData(layers[i]);
            } else {
                this.loadSingleData(layers[i], this.mainLayerGroup);
            }
        }
        this.mainLayerGroup.reIndexLayers();
        this.refreshMode();

        if (this.activeLayerIndex == -1 && this.layerList.length > 0) {
            this.layerList[0].activate();
        }

        smartSlider.history.add($.proxy(function () {
            return [this, 'fixActiveLayer', '', '', []];
        }, this));

    };

    AdminSlideLayerManager.prototype.loadSingleGroupData = function (data) {
        return new NextendSmartSliderLayerGroup(this, this.mainLayerGroup, false, data);
    }

    AdminSlideLayerManager.prototype.loadSingleData = function (layerData, group) {

        var layer = $('<div class="n2-ss-layer"></div>')
            .attr('style', layerData.style);

        var storedZIndex = layer.css('zIndex');
        if (storedZIndex == 'auto' || storedZIndex == '') {
            if (layerData.zIndex) {
                storedZIndex = layerData.zIndex;
            } else {
                storedZIndex = 1;
            }
        }
        layer.css('zIndex', storedZIndex + this._zIndexOffset);
        if (layerData.id) {
            var id = $.fn.uid();
            this._idTranslation[layerData.id] = id;
            layer.attr('id', id);
        }
        if (layerData.parentid) {
            if (typeof this._idTranslation[layerData.parentid] != 'undefined') {
                layerData.parentid = this._idTranslation[layerData.parentid];
            } else {
                layerData.parentid = '';
            }
        }

        for (var j = 0; j < layerData.items.length; j++) {
            $('<div class="n2-ss-item n2-ss-item-' + layerData.items[j].type + '"></div>')
                .data('item', layerData.items[j].type)
                .data('itemvalues', layerData.items[j].values)
                .appendTo(layer);
        }

        delete layerData.style;
        delete layerData.items;
        for (var k in layerData) {
            layer.data(k, layerData[k]);
        }
        return this.addLayer(group, layer, false);
    };


    /**
     * getter for the currently selected layer
     * @returns {jQuery|boolean} layer element in jQuery representation or false
     * @private
     */
    AdminSlideLayerManager.prototype.getSelectedLayer = function () {
        if (this.activeLayerIndex == -1) {
            return false;
        }
        return this.layerList[this.activeLayerIndex];
    };

    AdminSlideLayerManager.prototype.fixActiveLayer = function () {
        var selectedLayer = this.getSelectedLayer();
        if (selectedLayer == false || selectedLayer.isDeleted) {
            this.resetActiveLayer();
        }
    };

    AdminSlideLayerManager.prototype.resetActiveLayer = function () {
        if (this.mainLayerGroup.zIndexList.length > 0) {
            this.mainLayerGroup.zIndexList[this.mainLayerGroup.zIndexList.length - 1].activate();
        } else {
            this.changeActiveLayer(-1);
        }
    };

    AdminSlideLayerManager.prototype.changeActiveLayer = function (index, preventExitFromSelection) {
        var lastActive = this.activeLayerIndex;
        if (lastActive != -1) {
            var $layer = this.layerList[lastActive];
            // There is a chance that the layer already deleted
            if ($layer) {
                $layer.$.off('propertyChanged.layerEditor');

                $layer.deActivate();
            }
        }
        this.activeLayerIndex = index;

        if (!preventExitFromSelection) {
            this.exitSelectMode();
        }

        if (index != -1) {
            var layer = this.layerList[index];


            if (layer instanceof NextendSmartSliderLayerGroup) {
                this.sidebar.changeMode('GROUP');
            } else {
                this.sidebar.changeMode('LAYER');
            }

            layer.$.on('propertyChanged.layerEditor', $.proxy(this.sidebar.activatePropertyChanged, this.sidebar));

            var properties = layer.property;
            for (var name in properties) {
                this.sidebar.activatePropertyChanged({
                    target: layer
                }, name, properties[name]);
            }
        }

        this.$.trigger('activeLayerChanged');
    };

    AdminSlideLayerManager.prototype.eye = function () {
        if (typeof this.layerList[this.activeLayerIndex] !== 'undefined') {
            this.doActionOnActiveLayer('changeStatus', [3]);
        }
    };

    AdminSlideLayerManager.prototype.lock = function () {
        if (typeof this.layerList[this.activeLayerIndex] !== 'undefined') {
            this.doActionOnActiveLayer('changeStatus', [2]);
        }
    };

    AdminSlideLayerManager.prototype.delete = function () {
        if (typeof this.layerList[this.activeLayerIndex] !== 'undefined') {
            this.doActionOnActiveLayer('delete');
        }
    };

    AdminSlideLayerManager.prototype.duplicate = function () {
        if (typeof this.layerList[this.activeLayerIndex] !== 'undefined') {

            this.doActionOnActiveLayer('duplicate', [this.selectMode == SELECT_MODE.ON ? false : true, false]);
        }
    };

    AdminSlideLayerManager.prototype.copy = function (copied) {
        if (typeof copied === 'undefined') {
            copied = this.getCopied();
        }
        var layers = this.getActiveLayerData();
        if (layers.length) {
            copied.unshift({
                name: layers[0].name,
                layers: layers
            });
            while (copied.length > 5) {
                copied.pop();
            }
            $.jStorage.set('copied', JSON.stringify(copied));
        }
    };

    AdminSlideLayerManager.prototype.paste = function (index, copied) {
        if (typeof copied === 'undefined') {
            copied = this.getCopied();
        }
        if (copied.length && typeof copied[index] !== 'undefined') {
            nextend.smartSlider.layerManager.loadData(copied[index].layers, false);
        }
    };

    AdminSlideLayerManager.prototype.getCopied = function () {

        var copied = $.jStorage.get('copied');
        if (copied === null) {
            return [];
        }
        return JSON.parse(copied);
    };

    AdminSlideLayerManager.prototype.addContextMenu = function () {
        var that = this;

        $.contextMenu({
            selector: '#n2-ss-0',
            className: 'n2',
            autoHide: true,
            build: function ($triggerElement, e) {
                var layer = null;

                var $layer = $(e.target).closest('.n2-ss-layer');
                if ($layer.length) {
                    layer = $layer.data('layerObject');
                    layer.activate(e);
                } else {
                    layer = that.layerList[that.activeLayerIndex] || false;
                }

                var items = {};

                if (layer) {
                    items['delete'] = {name: "Delete layer", icon: "delete"};
                    items['duplicate'] = {name: "Duplicate layer", icon: "duplicate"};
                    items['copy'] = {name: "Copy layer", icon: "copy"};
                }


                var copied = that.getCopied();
                if (copied.length == 1) {
                    items['paste'] = {
                        name: "Paste layer",
                        icon: "paste",
                        callback: $.proxy(that.paste, this, 0, copied)
                    }
                } else if (copied.length > 1) {
                    var pasteItems = {};
                    for (var i = 0; i < copied.length; i++) {
                        pasteItems['paste' + i] = {
                            name: copied[i].name,
                            callback: $.proxy(that.paste, this, i, copied)
                        }
                    }
                    items['paste'] = {
                        name: "Paste layer",
                        icon: "paste",
                        items: pasteItems
                    }
                }

                if ($.isEmptyObject(items)) {
                    return false;
                }

                return {
                    animation: {duration: 0, show: 'show', hide: 'hide'},
                    zIndex: 1000000,
                    callback: function (key, options) {
                        that[key]();
                    },
                    positionSubmenu: function ($menu) {
                        if ($.ui && $.ui.position) {
                            // .position() is provided as a jQuery UI utility
                            // (...and it won't work on hidden elements)
                            $menu.css('display', 'block').position({
                                my: 'left+2 top',
                                at: 'right top',
                                of: this,
                                collision: 'flipfit fit'
                            }).css('display', '');
                        } else {
                            // determine contextMenu position
                            var offset = {
                                top: 0,
                                left: this.outerWidth()
                            };
                            $menu.css(offset);
                        }
                    },
                    items: items
                };
            }
        });
    };

    AdminSlideLayerManager.prototype.history = function (method, value, other) {
        switch (method) {
            case 'fixActiveLayer':
                this.fixActiveLayer();
                break;
        }
    };


    AdminSlideLayerManager.prototype.initSelectMode = function () {
        this.selectMode = SELECT_MODE.OFF;
        this.selectedLayers = [];

        $('.n2-ss-layer-list-top-bar .n2-button').on('mousedown', $.proxy(function (e) {
            e.preventDefault();
            switch ($(e.currentTarget).data('action')) {
                case 'delete':
                    this.delete();
                    break;
                case 'duplicate':
                    this.duplicate();
                    break;
                case 'group':
                    this.createGroupFromSelected();
                    break;
                case 'cancel':
                    this.exitSelectMode();
                    break;
            }
        }, this))
    }

    AdminSlideLayerManager.prototype.startSelection = function (isGroupMode) {
        if (isGroupMode) {
            if (this.selectMode == SELECT_MODE.ON) {
                this.exitSelectMode();
            }
            this.changeSelectMode(SELECT_MODE.GROUP);
        } else {
            this.changeSelectMode(SELECT_MODE.ON);
        }
    }

    AdminSlideLayerManager.prototype.changeSelectMode = function (targetMode) {
        var lastMode = this.selectMode;
        if (lastMode != targetMode) {

            if (lastMode == SELECT_MODE.ON) {
                $('#n2-admin').removeClass('n2-ss-select-layer-mode-on');
            } else if (lastMode == SELECT_MODE.GROUP) {
                $('#n2-admin').removeClass('n2-ss-select-layer-mode-group');
            }

            this.selectMode = targetMode;

            if (lastMode == SELECT_MODE.GROUP && targetMode == SELECT_MODE.ON) {
                this.selectedLayers[0].activate(null, null, true);
            }

            if (targetMode == SELECT_MODE.OFF) {
                $('#n2-admin').removeClass('n2-ss-select-layer-mode');
            } else {
                $('#n2-admin').addClass('n2-ss-select-layer-mode');
                if (targetMode == SELECT_MODE.ON) {
                    $('#n2-admin').addClass('n2-ss-select-layer-mode-on');
                } else if (targetMode == SELECT_MODE.GROUP) {
                    $('#n2-admin').addClass('n2-ss-select-layer-mode-group');
                }
            }

            if (this.selectMode == SELECT_MODE.OFF) {
                $('body').off('.n2-ss-selection');
            } else {
                $('body').on('mousedown.n2-ss-selection', $.proxy(function (e) {
                    if (nextend.context.getCurrentWindow() == 'main') {
                        if (nextend.context.mouseDownArea === false) {
                            this.exitSelectMode();
                        }
                    }
                }, this));
            }
        }
    }

    AdminSlideLayerManager.prototype.endSelection = function (isGroupMode) {
        if (isGroupMode && this.selectMode == SELECT_MODE.GROUP) {
            this.exitSelectMode();
        }
    }

    AdminSlideLayerManager.prototype.selectLayer = function (layer, addActive) {

        if (this.selectMode != SELECT_MODE.ON) {

            this.startSelection(false);

            if (addActive) this.selectedLayers.push(this.layerList[this.activeLayerIndex]);
        }

        this._selectLayer(layer);
    };

    AdminSlideLayerManager.prototype._selectLayer = function (layer) {

        var index = $.inArray(layer, this.selectedLayers);
        if (index != -1) {
            if (this.selectMode == SELECT_MODE.ON && this.selectedLayers.length <= 1) {
                this.exitSelectMode();
                return false;
            }

            var deSelectedLayer = this.selectedLayers[index];
            this.selectedLayers.splice(index, 1);
            layer.layerRow.removeClass('n2-selected');
            layer.layer.removeClass('n2-ss-layer-selected');

            if (this.selectMode == SELECT_MODE.ON && this.selectedLayers.length <= 1) {
                this.selectedLayers[0].activate();
                this.exitSelectMode();
                return false;
            }

            // As the active layer removed from the selection,
            // change the active layer to the first of the current selection
            if (deSelectedLayer === this.layerList[this.activeLayerIndex]) {
                this.selectedLayers[0].activate(false, null, true);
            }

        } else {
            var pushToIndex = this.selectedLayers.length;
            for (var i = 0; i < this.selectedLayers.length; i++) {
                if (this.selectedLayers[i]._sortZIndex(layer)) {
                    pushToIndex = i;
                    break;
                }
            }
            this.selectedLayers.splice(pushToIndex, 0, layer);
        }
        for (var i = 0; i < this.selectedLayers.length; i++) {
            this.selectedLayers[i].layerRow.addClass('n2-selected');
            this.selectedLayers[i].layer.addClass('n2-ss-layer-selected');
        }
    }

    AdminSlideLayerManager.prototype.addSelection = function (layers, isGroupSelected) {
        if (!isGroupSelected) {
            this.changeSelectMode(SELECT_MODE.ON);
        }

        for (var i = 0; i < layers.length; i++) {
            this._selectLayer(layers[i], false);
        }
    }

    AdminSlideLayerManager.prototype.exitSelectMode = function () {
        if (this.selectMode) {
            for (var i = 0; i < this.selectedLayers.length; i++) {
                if (this.selectedLayers[i] != this.layerList[this.activeLayerIndex]) {
                    this.selectedLayers[i].layerRow.removeClass('n2-active');
                }
                this.selectedLayers[i].layerRow.removeClass('n2-selected');
                this.selectedLayers[i].layer.removeClass('n2-ss-layer-selected');
            }
            $('#n2-admin').removeClass('n2-ss-select-layer-mode');
            this.selectedLayers = [];
            this.changeSelectMode(SELECT_MODE.OFF);
        }
    }

    AdminSlideLayerManager.prototype.doActionOnActiveLayer = function (action, args) {
        if (this.selectMode == SELECT_MODE.ON) {

            var selectedLayers = $.extend([], this.selectedLayers);
            for (var i = 0; i < selectedLayers.length; i++) {
                selectedLayers[i][action].apply(selectedLayers[i], args);
            }
        } else {
            if (typeof this.layerList[this.activeLayerIndex][action] == 'function') {
                this.layerList[this.activeLayerIndex][action].apply(this.layerList[this.activeLayerIndex], args);
            } else {
                this.layerList[this.activeLayerIndex].doAction(action, args);
            }
        }
    }

    AdminSlideLayerManager.prototype.draggableStart = function (ui) {
        if (this.selectMode) {
            var targetFoundInSelection = false;
            for (var i = 0; i < this.selectedLayers.length; i++) {
                var selectedLayer = this.selectedLayers[i],
                    $selectedLayer = selectedLayer.layer;

                if ($selectedLayer[0] != ui.helper[0]) {

                    var display = $selectedLayer.css('display');
                    if (display == 'none') {
                        $selectedLayer.css('display', 'block');
                    }

                    selectedLayer._originalPosition = $selectedLayer.position();


                    if (display == 'none') {
                        $selectedLayer.css('display', display);
                    }
                } else {
                    targetFoundInSelection = true;
                }
            }
            if (!targetFoundInSelection) {
                this.exitSelectMode();
            }
        }
    }

    AdminSlideLayerManager.prototype.draggableDrag = function (ui) {
        if (this.selectMode) {
            var movement = {
                left: ui.position.left - ui.originalPosition.left,
                top: ui.position.top - ui.originalPosition.top
            }
            for (var i = 0; i < this.selectedLayers.length; i++) {
                var selectedLayer = this.selectedLayers[i],
                    $selectedLayer = selectedLayer.layer;

                if (selectedLayer instanceof NextendSmartSliderLayerGroup) {

                } else {

                    if ($selectedLayer[0] != ui.helper[0]) {

                        $selectedLayer.css({
                            left: selectedLayer._originalPosition.left + movement.left,
                            top: selectedLayer._originalPosition.top + movement.top,
                            bottom: 'auto',
                            right: 'auto'
                        });
                        selectedLayer.triggerLayerResized();

                    }
                }
            }
        }
    }

    AdminSlideLayerManager.prototype.draggableStop = function (ui) {
        if (this.selectMode) {
            var movement = {
                left: ui.position.left - ui.originalPosition.left,
                top: ui.position.top - ui.originalPosition.top
            }
            for (var i = 0; i < this.selectedLayers.length; i++) {
                var selectedLayer = this.selectedLayers[i],
                    $selectedLayer = selectedLayer.layer;

                if (selectedLayer instanceof NextendSmartSliderLayerGroup) {

                } else {
                    if ($selectedLayer[0] != ui.helper[0]) {
                        var display = $selectedLayer.css('display');
                        if (display == 'none') {
                            $selectedLayer.css('display', 'block');
                        }

                        selectedLayer.setPosition(selectedLayer._originalPosition.left + movement.left, selectedLayer._originalPosition.top + movement.top);

                        selectedLayer.triggerLayerResized();

                        if (display == 'none') {
                            $selectedLayer.css('display', display);
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }


    AdminSlideLayerManager.prototype.createGroupFromSelected = function () {
        var group;
        switch (this.selectMode) {
            case SELECT_MODE.ON:
                group = new NextendSmartSliderLayerGroup(this, this.mainLayerGroup, false);

                var historyTask = smartSlider.history.add($.proxy(function () {
                    return [group, 'createGroup', 'create', 'delete', []];
                }, this));

                group.groupLayersStartAndLateInit(this.selectedLayers);

                historyTask[4].push(group.zIndex);

                this.exitSelectMode();
                group.activate();

                break;
            case SELECT_MODE.OFF:
                var activeLayer = this.layerList[this.activeLayerIndex];

                // If the single layer is already in a group, we just activate that group
                if (activeLayer.group instanceof NextendSmartSliderLayerGroup) {
                    activeLayer.group.activate();
                } else {
                    group = new NextendSmartSliderLayerGroup(this, this.mainLayerGroup, false);

                    var historyTask = smartSlider.history.add($.proxy(function () {
                        return [group, 'createGroup', 'create', 'delete', []];
                    }, this));

                    group.groupLayersStartAndLateInit([activeLayer]);

                    historyTask[4].push(group.zIndex);

                    group.activate();
                }
                break;
            case SELECT_MODE.GROUP:
                break;
        }
    }

    scope.NextendSmartSliderAdminSlideLayerManager = AdminSlideLayerManager;

    var MODES = {
            UNDEFINED: 0,
            LAYER: 1,
            GROUP: 2
        },
        MODESINV = {
            0: 'UNDEFINED',
            1: 'LAYER',
            2: 'GROUP'
        };

    function AdminSlideSidebarSettings(layerEditor) {
        this.mode = MODES.UNDEFINED;
        this.forms = {'undefined': null};
        this.layerEditor = layerEditor;

        this.toolboxElement = $('#smartslider-slide-toolbox-layer');

        this.startLayer();
        this.startGroup();
    }

    AdminSlideSidebarSettings.prototype.changeMode = function (targetMode) {
        if (this.mode != MODES[targetMode]) {
            $('body').removeClass('n2-ss-editor-mode-' + MODESINV[this.mode]).addClass('n2-ss-editor-mode-' + targetMode);
            if (MODES[targetMode] == MODES.LAYER) {
                $('#n2-tabbed-slide-editor-settings').data('pane').showTabs(['item', 'style', 'animations', 'position']);
            } else if (MODES[targetMode] == MODES.GROUP) {
                $('#n2-tabbed-slide-editor-settings').data('pane').showTabs(['group', 'animations']);
            }
            this.mode = MODES[targetMode];
        }
    }

    AdminSlideSidebarSettings.prototype.activatePropertyChanged = function (e, name, value) {
        switch (this.mode) {
            case MODES.LAYER:
                this.activeLayerPropertyChanged(e, name, value);
                break;
            case MODES.GROUP:
                this.activeGroupPropertyChanged(e, name, value);
                break;
        }
    }

    AdminSlideSidebarSettings.prototype.getActiveForm = function () {
        switch (this.mode) {
            case MODES.LAYER:
                return this.forms.layer;
                break;
            case MODES.GROUP:
                return this.forms.group;
                break;
        }
        return false;
    }

    AdminSlideSidebarSettings.prototype.startLayer = function () {
        this.forms.layer = {
            id: $('#layerid'),
            parentid: $('#layerparentid'),
            parentalign: $('#layerparentalign'),
            parentvalign: $('#layerparentvalign'),
            left: $('#layerleft'),
            top: $('#layertop'),
            responsiveposition: $('#layerresponsive-position'),
            width: $('#layerwidth'),
            height: $('#layerheight'),
            responsivesize: $('#layerresponsive-size'),
            class: $('#layerclass'),
            generatorvisible: $('#layergenerator-visible'),
            showFieldDesktopPortrait: $('#layershow-desktop-portrait'),
            showFieldDesktopLandscape: $('#layershow-desktop-landscape'),
            showFieldTabletPortrait: $('#layershow-tablet-portrait'),
            showFieldTabletLandscape: $('#layershow-tablet-landscape'),
            showFieldMobilePortrait: $('#layershow-mobile-portrait'),
            showFieldMobileLandscape: $('#layershow-mobile-landscape'),
            crop: $('#layercrop'),
            rotation: $('#layerrotation'),
            inneralign: $('#layerinneralign'),
            parallax: $('#layerparallax'),
            align: $('#layeralign'),
            valign: $('#layervalign'),
            fontsize: $('#layerfont-size'),
            adaptivefont: $('#layeradaptive-font'),
            mouseenter: $('#layeronmouseenter'),
            click: $('#layeronclick'),
            mouseleave: $('#layeronmouseleave'),
            play: $('#layeronplay'),
            pause: $('#layeronpause'),
            stop: $('#layeronstop')
        };

        for (var k in this.forms.layer) {
            this.forms.layer[k].on('outsideChange', $.proxy(this.activateLayerPropertyChanged, this, k));
        }

        if (!this.layerEditor.responsive.isEnabled('desktop', 'Landscape')) {
            this.forms.layer.showFieldDesktopLandscape.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!this.layerEditor.responsive.isEnabled('tablet', 'Portrait')) {
            this.forms.layer.showFieldTabletPortrait.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!this.layerEditor.responsive.isEnabled('tablet', 'Landscape')) {
            this.forms.layer.showFieldTabletLandscape.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!this.layerEditor.responsive.isEnabled('mobile', 'Portrait')) {
            this.forms.layer.showFieldMobilePortrait.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!this.layerEditor.responsive.isEnabled('mobile', 'Landscape')) {
            this.forms.layer.showFieldMobileLandscape.closest('.n2-mixed-group').css('display', 'none');
        }
    }

    AdminSlideSidebarSettings.prototype.activateLayerPropertyChanged = function (name, e) {
        if (this.layerEditor.activeLayerIndex != -1) {
            //@todo  batch? throttle
            var value = this.forms.layer[name].val();
            this.layerEditor.layerList[this.layerEditor.activeLayerIndex].setProperty(name, value, 'manager');
        } else {
            var field = this.forms.layer[name].data('field');
            if (typeof field !== 'undefined' && field !== null) {
                field.insideChange('');
            }
        }
    };

    AdminSlideSidebarSettings.prototype.activeLayerPropertyChanged = function (e, name, value) {
        if (typeof this['layerFormSet' + name] === 'function') {
            this['layerFormSet' + name](value, e.target);
        } else {
            var field = this.forms.layer[name].data('field');
            if (typeof field !== 'undefined') {
                field.insideChange(value);
            }
        }
    };

    AdminSlideSidebarSettings.prototype.layerFormSetname = function (value) {

    };

    AdminSlideSidebarSettings.prototype.layerFormSetnameSynced = function (value) {

    };

    AdminSlideSidebarSettings.prototype.layerFormSetdesktopPortrait = function (value, layer) {
        this.forms.layer.showFieldDesktopPortrait.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.layerFormSetdesktopLandscape = function (value, layer) {
        this.forms.layer.showFieldDesktopLandscape.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.layerFormSettabletPortrait = function (value, layer) {
        this.forms.layer.showFieldTabletPortrait.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.layerFormSettabletLandscape = function (value, layer) {
        this.forms.layer.showFieldTabletLandscape.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.layerFormSetmobilePortrait = function (value, layer) {
        this.forms.layer.showFieldMobilePortrait.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.layerFormSetmobileLandscape = function (value, layer) {
        this.forms.layer.showFieldMobileLandscape.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.startFeatures = function () {
        this.layerFeatures = new LayerFeatures(this.forms.layer);
    }

    AdminSlideSidebarSettings.prototype.startGroup = function () {
        this.forms.group = {
            parallax: $('#layergroup-parallax'),
            showFieldDesktopPortrait: $('#layergroup-show-desktop-portrait'),
            showFieldDesktopLandscape: $('#layergroup-show-desktop-landscape'),
            showFieldTabletPortrait: $('#layergroup-show-tablet-portrait'),
            showFieldTabletLandscape: $('#layergroup-show-tablet-landscape'),
            showFieldMobilePortrait: $('#layergroup-show-mobile-portrait'),
            showFieldMobileLandscape: $('#layergroup-show-mobile-landscape'),
            fontsize: $('#layergroup-font-size'),
            adaptivefont: $('#layergroup-adaptive-font'),
            generatorvisible: $('#layergroup-generator-visible')
        };

        for (var k in this.forms.group) {
            this.forms.group[k].on('outsideChange', $.proxy(this.activateGroupPropertyChanged, this, k));
        }

        if (!this.layerEditor.responsive.isEnabled('desktop', 'Landscape')) {
            this.forms.group.showFieldDesktopLandscape.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!this.layerEditor.responsive.isEnabled('tablet', 'Portrait')) {
            this.forms.group.showFieldTabletPortrait.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!this.layerEditor.responsive.isEnabled('tablet', 'Landscape')) {
            this.forms.group.showFieldTabletLandscape.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!this.layerEditor.responsive.isEnabled('mobile', 'Portrait')) {
            this.forms.group.showFieldMobilePortrait.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!this.layerEditor.responsive.isEnabled('mobile', 'Landscape')) {
            this.forms.group.showFieldMobileLandscape.closest('.n2-mixed-group').css('display', 'none');
        }
    }

    AdminSlideSidebarSettings.prototype.activateGroupPropertyChanged = function (name, e) {
        if (this.layerEditor.activeLayerIndex != -1) {
            //@todo  batch? throttle
            var value = this.forms.group[name].val();
            this.layerEditor.layerList[this.layerEditor.activeLayerIndex].setProperty(name, value, 'manager');
        } else {
            var field = this.forms.group[name].data('field');
            if (typeof field !== 'undefined' && field !== null) {
                field.insideChange('');
            }
        }
    };

    AdminSlideSidebarSettings.prototype.activeGroupPropertyChanged = function (e, name, value) {
        if (typeof this['groupFormSet' + name] === 'function') {
            this['groupFormSet' + name](value, e.target);
        } else {
            var field = this.forms.group[name].data('field');
            if (typeof field !== 'undefined') {
                field.insideChange(value);
            }
        }
    };

    AdminSlideSidebarSettings.prototype.groupFormSetname = function (value) {

    };

    AdminSlideSidebarSettings.prototype.groupFormSetdesktopPortrait = function (value) {
        this.forms.group.showFieldDesktopPortrait.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.groupFormSetdesktopLandscape = function (value) {
        this.forms.group.showFieldDesktopLandscape.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.groupFormSettabletPortrait = function (value) {
        this.forms.group.showFieldTabletPortrait.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.groupFormSettabletLandscape = function (value) {
        this.forms.group.showFieldTabletLandscape.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.groupFormSetmobilePortrait = function (value) {
        this.forms.group.showFieldMobilePortrait.data('field').insideChange(value);
    };

    AdminSlideSidebarSettings.prototype.groupFormSetmobileLandscape = function (value) {
        this.forms.group.showFieldMobileLandscape.data('field').insideChange(value);
    };

    scope.NextendSmartSliderAdminSlideSidebarSettings = AdminSlideSidebarSettings;

    function LayerFeatures(fields) {
        this.fields = fields;

        this.initParentLinker();
        this.initAlign();
        this.initEvents();
    }

    LayerFeatures.prototype.initParentLinker = function () {
        var field = this.fields.parentid.data('field'),
            parentLinker = $('#n2-ss-layer-parent-linker').on({
                click: function (e) {
                    field.click(e);
                }
            });
    };

    LayerFeatures.prototype.initAlign = function () {

        this.layerDefault = {
            align: null,
            valign: null
        };

        var hAlignButton = $('#n2-ss-layer-horizontal-align .n2-radio-option'),
            vAlignButton = $('#n2-ss-layer-vertical-align .n2-radio-option');

        hAlignButton.add(vAlignButton).on('click', $.proxy(function (e) {
            if (e.ctrlKey || e.metaKey) {
                var $el = $(e.currentTarget),
                    isActive = $el.hasClass('n2-sub-active'),
                    align = $el.data('align');
                switch (align) {
                    case 'left':
                    case 'center':
                    case 'right':
                        hAlignButton.removeClass('n2-sub-active');
                        if (isActive) {
                            $.jStorage.set('ss-item-horizontal-align', null);
                            this.layerDefault.align = null;
                        } else {
                            $.jStorage.set('ss-item-horizontal-align', align);
                            this.layerDefault.align = align;
                            $el.addClass('n2-sub-active');
                        }
                        break;
                    case 'top':
                    case 'middle':
                    case 'bottom':
                        vAlignButton.removeClass('n2-sub-active');
                        if (isActive) {
                            $.jStorage.set('ss-item-vertical-align', null);
                            this.layerDefault.valign = null;
                        } else {
                            $.jStorage.set('ss-item-vertical-align', align);
                            this.layerDefault.valign = align;
                            $el.addClass('n2-sub-active');
                        }
                        break;
                }
            } else if (this.activeLayerIndex != -1) {
                var align = $(e.currentTarget).data('align');
                switch (align) {
                    case 'left':
                    case 'center':
                    case 'right':
                        this.horizontalAlign(align, true);
                        break;
                    case 'top':
                    case 'middle':
                    case 'bottom':
                        this.verticalAlign(align, true);
                        break;
                }
            }
        }, this));

        this.fields.align.on('nextendChange', $.proxy(function () {
            hAlignButton.removeClass('n2-active');
            switch (this.fields.align.val()) {
                case 'left':
                    hAlignButton.eq(0).addClass('n2-active');
                    break;
                case 'center':
                    hAlignButton.eq(1).addClass('n2-active');
                    break;
                case 'right':
                    hAlignButton.eq(2).addClass('n2-active');
                    break;
            }
        }, this));
        this.fields.valign.on('nextendChange', $.proxy(function () {
            vAlignButton.removeClass('n2-active');
            switch (this.fields.valign.val()) {
                case 'top':
                    vAlignButton.eq(0).addClass('n2-active');
                    break;
                case 'middle':
                    vAlignButton.eq(1).addClass('n2-active');
                    break;
                case 'bottom':
                    vAlignButton.eq(2).addClass('n2-active');
                    break;
            }
        }, this));


        var hAlign = $.jStorage.get('ss-item-horizontal-align', null),
            vAlign = $.jStorage.get('ss-item-vertical-align', null);
        if (hAlign != null) {
            hAlignButton.eq(nameToIndex[hAlign]).addClass('n2-sub-active');
            this.layerDefault.align = hAlign;
        }
        if (vAlign != null) {
            vAlignButton.eq(nameToIndex[vAlign]).addClass('n2-sub-active');
            this.layerDefault.valign = vAlign;
        }
    };

    LayerFeatures.prototype.horizontalAlign = function (align, toZero) {
        if (this.fields.align.val() != align) {
            this.fields.align.data('field').options.eq(nameToIndex[align]).trigger('click');
        } else if (toZero) {
            this.fields.left.val(0).trigger('change');
        }
    };

    LayerFeatures.prototype.verticalAlign = function (align, toZero) {
        if (this.fields.valign.val() != align) {
            this.fields.valign.data('field').options.eq(nameToIndex[align]).trigger('click');
        } else if (toZero) {
            this.fields.top.val(0).trigger('change');
        }
    };

    LayerFeatures.prototype.initEvents = function () {
        var parent = $('#n2-tab-events'),
            heading = parent.find('.n2-h3'),
            headingLabel = heading.html(),
            row = $('<div class="n2-editor-header n2-h2 n2-uc"><span>' + headingLabel + '</span></div>');

        heading.replaceWith(row);
        //button.appendTo(row.find('.n2-ss-button-container'));
    }

})(nextend.smartSlider, n2, window);