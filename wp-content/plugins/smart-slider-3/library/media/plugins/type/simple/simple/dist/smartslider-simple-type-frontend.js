N2Require('SmartSliderMainAnimationSimple', ['SmartSliderMainAnimationAbstract'], [], function ($, scope, undefined) {

    function SmartSliderMainAnimationSimple(slider, parameters) {

        this.postBackgroundAnimation = false;
        this._currentBackgroundAnimation = false;
        this.reverseSlideIndex = null;

        parameters = $.extend({
            delay: 0,
            parallax: 0.45,
            type: 'horizontal',
            shiftedBackgroundAnimation: 'auto'
        }, parameters);
        parameters.delay /= 1000;

        scope.SmartSliderMainAnimationAbstract.prototype.constructor.apply(this, arguments);

        switch (this.parameters.type) {
            case 'no':
                this.animation = this._mainAnimationNo;
                this.isNoAnimation = true;
                break;
            case 'fade':
                this.animation = this._mainAnimationFade;
                break;
            case 'crossfade':
                this.animation = this._mainAnimationCrossFade;
                break;
            case 'vertical':
                if (this.parameters.parallax == 1) {
                    this.animation = this._mainAnimationVertical;
                } else {
                    this.animation = this._mainAnimationVerticalParallax;
                }
                break;
            case 'vertical-reversed':
                if (this.parameters.parallax == 1) {
                    this.animation = this._mainAnimationVerticalReversed;
                } else {
                    this.animation = this._mainAnimationVerticalReversedParallax;
                }
                break;
            case 'horizontal-reversed':
                if (this.parameters.parallax == 1) {
                    this.animation = this._mainAnimationHorizontalReversed;
                } else {
                    this.animation = this._mainAnimationHorizontalReversedParallax;
                }
                break;
            default:
                if (this.parameters.parallax == 1) {
                    this.animation = this._mainAnimationHorizontal;
                } else {
                    this.animation = this._mainAnimationHorizontalParallax;
                }
        }
    }

    SmartSliderMainAnimationSimple.prototype = Object.create(scope.SmartSliderMainAnimationAbstract.prototype);
    SmartSliderMainAnimationSimple.prototype.constructor = SmartSliderMainAnimationSimple;

    SmartSliderMainAnimationSimple.prototype.setToStarterSlide = function (slide) {
        this.setActiveSlide(slide);
    };

    SmartSliderMainAnimationSimple.prototype.changeTo = function (currentSlide, nextSlide, reversed, isSystem) {
        if (this.postBackgroundAnimation) {
            this.postBackgroundAnimation.prepareToSwitchSlide(currentSlide, nextSlide);
        }

        scope.SmartSliderMainAnimationAbstract.prototype.changeTo.apply(this, arguments);
    };

    /**
     * Used to hide non active slides
     * @param slide
     */
    SmartSliderMainAnimationSimple.prototype.setActiveSlide = function (slide) {
        for (var i = 0; i < this.slider.slides.length; i++) {
            if (this.slider.slides[i] != slide) {
                this._hideSlide(this.slider.slides[i]);
            }
        }
    };

    /**
     * Hides the slide, but not the usual way. Simply positions them outside of the slider area.
     * If we use the visibility or display property to hide we would end up corrupted YouTube api.
     * If opacity 0 might also work, but that might need additional resource from the browser
     * @param slide
     * @private
     */
    SmartSliderMainAnimationSimple.prototype._hideSlide = function (slide) {
        var obj = {};
        obj[nextend.rtl.left] = '-100000px';
        NextendTween.set(slide.$element, obj);
        if (slide.backgroundImage) {
            NextendTween.set(slide.backgroundImage.element, obj);
        }
    };

    SmartSliderMainAnimationSimple.prototype._showSlide = function (slide) {
        var obj = {};
        obj[nextend.rtl.left] = 0;
        NextendTween.set(slide.$element.get(0), obj);
        if (slide.backgroundImage) {
            NextendTween.set(slide.backgroundImage.element, obj);
        }
    };

    SmartSliderMainAnimationSimple.prototype.cleanSlideIndex = function (slideIndex) {
        this._hideSlide(this.slider.slides[slideIndex]);
    };


    SmartSliderMainAnimationSimple.prototype.revertTo = function (slideIndex, originalNextSlideIndex) {

        this.slider.slides[originalNextSlideIndex].$element.css('zIndex', '');
        this._hideSlide(this.slider.slides[originalNextSlideIndex]);

        scope.SmartSliderMainAnimationAbstract.prototype.revertTo.apply(this, arguments);
    };

    SmartSliderMainAnimationSimple.prototype._initAnimation = function (currentSlide, nextSlide, reversed) {

        this.animation(currentSlide, nextSlide, reversed);
    };

    SmartSliderMainAnimationSimple.prototype.onBackwardChangeToComplete = function (previousSlide, currentSlide, isSystem) {
        this.reverseSlideIndex = null;
        this.onChangeToComplete(previousSlide, currentSlide, isSystem);
    };

    SmartSliderMainAnimationSimple.prototype.onChangeToComplete = function (previousSlide, currentSlide, isSystem) {
        if (this.reverseSlideIndex !== null) {
            this.slider.slides[this.reverseSlideIndex].triggerHandler('mainAnimationStartInCancel');
            this.reverseSlideIndex = null;
        }
        this._hideSlide(previousSlide);

        scope.SmartSliderMainAnimationAbstract.prototype.onChangeToComplete.apply(this, arguments);
    };

    SmartSliderMainAnimationSimple.prototype.onReverseChangeToComplete = function (previousSlide, currentSlide, isSystem) {

        this._hideSlide(previousSlide);

        scope.SmartSliderMainAnimationAbstract.prototype.onReverseChangeToComplete.apply(this, arguments);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationNo = function (currentSlide, nextSlide) {

        this._showSlide(nextSlide);

        this.slider.unsetActiveSlide(currentSlide);

        nextSlide.$element.css('opacity', 0);
        if (nextSlide.backgroundImage) {
            nextSlide.backgroundImage.element.css('opacity', 0);
        }

        this.slider.setActiveSlide(nextSlide);

        var totalDuration = this.timeline.totalDuration(),
            extraDelay = this.getExtraDelay();

        if (this._currentBackgroundAnimation && this.parameters.shiftedBackgroundAnimation) {
            if (this._currentBackgroundAnimation.shiftedPreSetup) {
                this._currentBackgroundAnimation._preSetup();
            }
        }

        if (totalDuration == 0) {
            totalDuration = 0.00001;
            extraDelay += totalDuration;
        }

        this.timeline.set(currentSlide.$element, {
            opacity: 0
        }, extraDelay);
        if (!this._currentBackgroundAnimation && currentSlide.backgroundImage) {
            this.timeline.set(currentSlide.backgroundImage.element, {
                opacity: 0
            }, extraDelay);
        }

        this.timeline.set(nextSlide.$element, {
            opacity: 1
        }, totalDuration);
        if (!this._currentBackgroundAnimation && nextSlide.backgroundImage) {
            this.timeline.set(nextSlide.backgroundImage.element, {
                opacity: 1
            }, totalDuration);
        }

        this.sliderElement.on('mainAnimationComplete.n2-simple-no', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-no');

            var currentSlide = this.slider.slides[currentSlideIndex],
                nextSlide = this.slider.slides[nextSlideIndex];

            currentSlide.$element.css('opacity', '');
            if (!this._currentBackgroundAnimation && currentSlide.backgroundImage) {
                currentSlide.backgroundImage.element.css('opacity', '');
            }

            nextSlide.$element.css('opacity', '');
            if (!this._currentBackgroundAnimation && nextSlide.backgroundImage) {
                nextSlide.backgroundImage.element.css('opacity', '');
            }
        }, this));
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationFade = function (currentSlide, nextSlide) {
        currentSlide.$element.css('zIndex', 23);
        if (currentSlide.backgroundImage) {
            currentSlide.backgroundImage.element.css('zIndex', 23);
        }

        nextSlide.$element.css('opacity', 0);

        this._showSlide(nextSlide);

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var adjustedTiming = this.adjustMainAnimation();

        if (this.parameters.shiftedBackgroundAnimation != 0) {
            var needShift = false,
                resetShift = false;
            if (this.parameters.shiftedBackgroundAnimation == 'auto') {
                if (currentSlide.hasLayers()) {
                    needShift = true;
                } else {
                    resetShift = true;
                }
            } else {
                needShift = true;
            }

            if (this._currentBackgroundAnimation && needShift) {
                this.timeline.shiftChildren(adjustedTiming.outDuration - adjustedTiming.extraDelay);
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            } else if (resetShift) {
                this.timeline.shiftChildren(adjustedTiming.extraDelay);
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            }
        }

        this.timeline.to(currentSlide.$element.get(0), adjustedTiming.outDuration, {
            opacity: 0,
            ease: this.getEase()
        }, adjustedTiming.outDelay);
        if (!this._currentBackgroundAnimation && currentSlide.backgroundImage) {
            this.timeline.to(currentSlide.backgroundImage.element, adjustedTiming.outDuration, {
                opacity: 0,
                ease: this.getEase()
            }, adjustedTiming.outDelay);
        }

        this.timeline.to(nextSlide.$element.get(0), adjustedTiming.inDuration, {
            opacity: 1,
            ease: this.getEase()
        }, adjustedTiming.inDelay);

        if (!this._currentBackgroundAnimation && nextSlide.backgroundImage) {
            nextSlide.backgroundImage.element.css('opacity', 1);
        }

        this.sliderElement.on('mainAnimationComplete.n2-simple-fade', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-fade');
            var currentSlide = this.slider.slides[currentSlideIndex],
                nextSlide = this.slider.slides[nextSlideIndex];

            currentSlide.$element
                .css({
                    zIndex: '',
                    opacity: ''
                });

            if (!this._currentBackgroundAnimation && currentSlide.backgroundImage) {
                currentSlide.backgroundImage.element
                    .css({
                        zIndex: '',
                        opacity: ''
                    });
            }

            nextSlide.$element.css('opacity', '');
            if (!this._currentBackgroundAnimation && nextSlide.backgroundImage) {
                nextSlide.backgroundImage.element.css('opacity', '');
            }
        }, this));
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationCrossFade = function (currentSlide, nextSlide) {
        currentSlide.$element.css('zIndex', 23);
        if (currentSlide.backgroundImage) {
            currentSlide.backgroundImage.element.css('zIndex', 23);
        }

        nextSlide.$element.css('opacity', 0);
        if (nextSlide.backgroundImage) {
            nextSlide.backgroundImage.element.css('opacity', 0);
        }
        this._showSlide(nextSlide);

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var adjustedTiming = this.adjustMainAnimation();

        if (this.parameters.shiftedBackgroundAnimation != 0) {
            var needShift = false,
                resetShift = false;
            if (this.parameters.shiftedBackgroundAnimation == 'auto') {
                if (currentSlide.hasLayers()) {
                    needShift = true;
                } else {
                    resetShift = true;
                }
            } else {
                needShift = true;
            }

            if (this._currentBackgroundAnimation && needShift) {
                this.timeline.shiftChildren(adjustedTiming.outDuration - adjustedTiming.extraDelay);
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            } else if (resetShift) {
                this.timeline.shiftChildren(adjustedTiming.extraDelay);
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            }
        }

        this.timeline.to(currentSlide.$element.get(0), adjustedTiming.outDuration, {
            opacity: 0,
            ease: this.getEase()
        }, adjustedTiming.outDelay);
        if (!this._currentBackgroundAnimation && currentSlide.backgroundImage) {
            this.timeline.to(currentSlide.backgroundImage.element.get(0), adjustedTiming.outDuration, {
                opacity: 0,
                ease: this.getEase()
            }, adjustedTiming.outDelay);
        }

        this.timeline.to(nextSlide.$element.get(0), adjustedTiming.inDuration, {
            opacity: 1,
            ease: this.getEase()
        }, adjustedTiming.inDelay);
        if (!this._currentBackgroundAnimation && nextSlide.backgroundImage) {
            this.timeline.to(nextSlide.backgroundImage.element.get(0), adjustedTiming.inDuration, {
                opacity: 1,
                ease: this.getEase()
            }, adjustedTiming.inDelay);
        }

        this.sliderElement.on('mainAnimationComplete.n2-simple-fade', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-fade');
            var currentSlide = this.slider.slides[currentSlideIndex],
                nextSlide = this.slider.slides[nextSlideIndex];

            currentSlide.$element
                .css({
                    zIndex: '',
                    opacity: ''
                });

            if (!this._currentBackgroundAnimation && currentSlide.backgroundImage) {
                currentSlide.backgroundImage.element
                    .css({
                        zIndex: '',
                        opacity: ''
                    });
            }

            nextSlide.$element.css('opacity', '');
            if (!this._currentBackgroundAnimation && nextSlide.backgroundImage) {
                nextSlide.backgroundImage.element.css('opacity', '');
            }
        }, this));
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationHorizontal = function (currentSlide, nextSlide, reversed) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', 1, reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationVertical = function (currentSlide, nextSlide, reversed) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', 1, reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationHorizontalParallax = function (currentSlide, nextSlide, reversed) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', this.parameters.parallax, reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationVerticalParallax = function (currentSlide, nextSlide, reversed) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', this.parameters.parallax, reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationHorizontalReversed = function (currentSlide, nextSlide, reversed) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', 1, !reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationVerticalReversed = function (currentSlide, nextSlide, reversed) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', 1, !reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationHorizontalReversedParallax = function (currentSlide, nextSlide, reversed) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', this.parameters.parallax, !reversed);
    };

    SmartSliderMainAnimationSimple.prototype._mainAnimationVerticalReversedParallax = function (currentSlide, nextSlide, reversed) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', this.parameters.parallax, !reversed);
    };

    SmartSliderMainAnimationSimple.prototype.__mainAnimationDirection = function (currentSlide, nextSlide, direction, parallax, reversed) {
        var property = '',
            propertyValue = 0,
            originalPropertyValue = 0,
            parallaxProperty = '';

        if (direction == 'horizontal') {
            property = nextend.rtl.left;
            parallaxProperty = 'width';
            originalPropertyValue = propertyValue = this.slider.dimensions.slideouter.width;
        } else if (direction == 'vertical') {
            property = 'top';
            parallaxProperty = 'height';
            originalPropertyValue = propertyValue = this.slider.dimensions.slideouter.height;
        }

        if (reversed) {
            propertyValue *= -1;
        }

        var nextSlideFrom = {},
            nextSlideTo = {
                ease: this.getEase()
            },
            nextSlideFromImage = {},
            nextSlideToImage = {
                ease: this.getEase()
            },
            currentSlideTo = {
                ease: this.getEase()
            },
            currentSlideToImage = {
                ease: this.getEase()
            };

        if (parallax != 1) {
            if (!reversed) {
                //forward
                currentSlide.$element.css('zIndex', 24);
                if (currentSlide.backgroundImage) {
                    currentSlide.backgroundImage.element.css('zIndex', 24);
                }
                propertyValue *= parallax;
                nextSlide.$element.css(property, propertyValue);
                if (nextSlide.backgroundImage) {
                    nextSlide.backgroundImage.element.css(property, propertyValue);
                }

                nextSlide.$element.addClass('n2-ss-parallax-clip');
                nextSlideFrom[property] = originalPropertyValue;
                nextSlideFrom[parallaxProperty] = propertyValue;
                nextSlideTo[parallaxProperty] = originalPropertyValue;

                nextSlideFromImage[property] = propertyValue;

                currentSlideTo[parallaxProperty] = propertyValue;
                currentSlideToImage[parallaxProperty] = propertyValue;

                currentSlideTo[property] = -propertyValue;
                currentSlideToImage[property] = -propertyValue;
            } else {
                //backward
                currentSlide.$element.css('zIndex', 24);
                if (currentSlide.backgroundImage) {
                    currentSlide.backgroundImage.element.css('zIndex', 24);
                }
                currentSlide.$element.addClass('n2-ss-parallax-clip');

                nextSlideTo[parallaxProperty] = -propertyValue;
                nextSlideToImage[parallaxProperty] = -propertyValue;
                propertyValue *= parallax;

                nextSlideFrom[property] = propertyValue;
                nextSlideFrom[parallaxProperty] = -propertyValue;

                nextSlideFromImage[property] = propertyValue;
                nextSlideFromImage[parallaxProperty] = -propertyValue;


                currentSlideTo[parallaxProperty] = -propertyValue;
                currentSlideTo[property] = originalPropertyValue;

                currentSlideToImage[property] = -propertyValue;
            }
        } else {
            nextSlide.$element.css(property, propertyValue);
            if (nextSlide.backgroundImage) {
                nextSlide.backgroundImage.element.css(property, propertyValue);
            }
            nextSlideFrom[property] = propertyValue;

            currentSlideTo[property] = -propertyValue;
            currentSlideToImage[property] = -propertyValue;
        }

        nextSlide.$element.css('zIndex', 23);
        if (nextSlide.backgroundImage) {
            nextSlide.backgroundImage.element.css('zIndex', 23);
        }

        if (reversed || parallax == 1) {
            currentSlide.$element.css('zIndex', 22);
            if (currentSlide.backgroundImage) {
                currentSlide.backgroundImage.element.css('zIndex', 22);
            }
        }

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var adjustedTiming = this.adjustMainAnimation();

        nextSlideTo[property] = 0;
        nextSlideToImage[property] = 0;

        this.timeline.fromTo(nextSlide.$element.get(0), adjustedTiming.inDuration, nextSlideFrom, nextSlideTo, adjustedTiming.inDelay);
        if (nextSlide.backgroundImage) {
            this.timeline.fromTo(nextSlide.backgroundImage.element, adjustedTiming.inDuration, nextSlideFromImage, nextSlideToImage, adjustedTiming.inDelay);
        }

        if (this.parameters.shiftedBackgroundAnimation != 0) {
            var needShift = false,
                resetShift = false;
            if (this.parameters.shiftedBackgroundAnimation == 'auto') {
                if (currentSlide.hasLayers()) {
                    needShift = true;
                } else {
                    resetShift = true;
                }
            } else {
                needShift = true;
            }

            if (this._currentBackgroundAnimation && needShift) {
                this.timeline.shiftChildren(adjustedTiming.outDuration - adjustedTiming.extraDelay);
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            } else if (resetShift) {
                this.timeline.shiftChildren(adjustedTiming.extraDelay);
                if (this._currentBackgroundAnimation.shiftedPreSetup) {
                    this._currentBackgroundAnimation._preSetup();
                }
            }
        }

        this.timeline.to(currentSlide.$element.get(0), adjustedTiming.outDuration, currentSlideTo, adjustedTiming.outDelay);
        if (currentSlide.backgroundImage) {
            this.timeline.to(currentSlide.backgroundImage.element, adjustedTiming.outDuration, currentSlideToImage, adjustedTiming.outDelay);
        }

        if (this.isTouch && this.isReverseAllowed && parallax == 1) {
            var reverseSlideIndex = reversed ? currentSlide.index + 1 : currentSlide.index - 1;
            if (reverseSlideIndex < 0) {
                if (this.slider.parameters.carousel) {
                    reverseSlideIndex = this.slider.slides.length - 1;
                } else {
                    reverseSlideIndex = currentSlide.index;
                }
            } else if (reverseSlideIndex >= this.slider.slides.length) {
                if (this.slider.parameters.carousel) {
                    reverseSlideIndex = 0;
                } else {
                    reverseSlideIndex = currentSlide.index;
                }
            }

            if (reverseSlideIndex != nextSlide.index) {

                if (reverseSlideIndex != currentSlide.index) {
                    this.reverseSlideIndex = reverseSlideIndex;
                    this.enableReverseMode();

                    var reverseSlide = this.slider.slides[reverseSlideIndex];
                    if (direction == 'vertical') {
                        this._showSlide(reverseSlide);
                    }
                    reverseSlide.$element.css(property, propertyValue);
                    var reversedInFrom = {},
                        reversedInProperties = {
                            ease: this.getEase()
                        },
                        reversedOutFrom = {},
                        reversedOutProperties = {
                            ease: this.getEase()
                        };

                    reversedInProperties[property] = 0;
                    reversedInFrom[property] = -propertyValue;
                    reversedOutProperties[property] = propertyValue;
                    reversedOutFrom[property] = 0;

                    reverseSlide.$element.trigger('mainAnimationStartIn', [this, currentSlide.index, reverseSlide.index, false]);

                    this.reverseTimeline.paused(true);
                    this.reverseTimeline.eventCallback('onComplete', this.onBackwardChangeToComplete, [currentSlide, reverseSlide, false], this);

                    this.reverseTimeline.fromTo(reverseSlide.$element.get(0), adjustedTiming.inDuration, reversedInFrom, reversedInProperties, adjustedTiming.inDelay);
                    if (reverseSlide.backgroundImage) {
                        this.reverseTimeline.fromTo(reverseSlide.backgroundImage.element, adjustedTiming.inDuration, reversedInFrom, reversedInProperties, adjustedTiming.inDelay);
                    }
                    this.reverseTimeline.fromTo(currentSlide.$element.get(0), adjustedTiming.inDuration, reversedOutFrom, reversedOutProperties, adjustedTiming.inDelay);
                    if (currentSlide.backgroundImage) {
                        this.reverseTimeline.fromTo(currentSlide.backgroundImage.element, adjustedTiming.inDuration, reversedOutFrom, reversedOutProperties, adjustedTiming.inDelay);
                    }
                }
            } else {
                this.reverseSlideIndex = null;
            }
        }


        this.sliderElement.on('mainAnimationComplete.n2-simple-fade', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-fade');
            var currentSlide = this.slider.slides[currentSlideIndex],
                nextSlide = this.slider.slides[nextSlideIndex];

            nextSlide.$element
                .css('zIndex', '')
                .css(property, '')
                .removeClass('n2-ss-parallax-clip');

            if (nextSlide.backgroundImage) {
                nextSlide.backgroundImage.element
                    .css('zIndex', '')
                    .css(property, '');
            }

            currentSlide.$element
                .css('zIndex', '')
                .css(parallaxProperty, '')
                .removeClass('n2-ss-parallax-clip');
            if (currentSlide.backgroundImage) {
                currentSlide.backgroundImage.element
                    .css('zIndex', '')
                    .css(parallaxProperty, '');
            }
        }, this));
    };

    SmartSliderMainAnimationSimple.prototype.getExtraDelay = function () {
        return 0;
    };

    SmartSliderMainAnimationSimple.prototype.adjustMainAnimation = function () {
        var duration = this.parameters.duration,
            delay = this.parameters.delay,
            backgroundAnimationDuration = this.timeline.totalDuration(),
            extraDelay = this.getExtraDelay();
        if (backgroundAnimationDuration > 0) {
            var totalMainAnimationDuration = duration + delay;
            if (totalMainAnimationDuration > backgroundAnimationDuration) {
                duration = duration * backgroundAnimationDuration / totalMainAnimationDuration;
                delay = delay * backgroundAnimationDuration / totalMainAnimationDuration;
                if (delay < extraDelay) {
                    duration -= (extraDelay - delay);
                    delay = extraDelay;
                }
            } else {
                return {
                    inDuration: duration,
                    outDuration: duration,
                    inDelay: backgroundAnimationDuration - duration,
                    outDelay: extraDelay,
                    extraDelay: extraDelay
                }
            }
        } else {
            delay += extraDelay;
        }
        return {
            inDuration: duration,
            outDuration: duration,
            inDelay: delay,
            outDelay: delay,
            extraDelay: extraDelay
        }
    };

    SmartSliderMainAnimationSimple.prototype.hasBackgroundAnimation = function () {
        return false;
    };

    return SmartSliderMainAnimationSimple;
});
N2Require('SmartSliderFrontendBackgroundAnimation', ['SmartSliderMainAnimationSimple'], [], function ($, scope, undefined) {

    function SmartSliderFrontendBackgroundAnimation(slider, parameters, backgroundAnimations) {
        this._currentBackgroundAnimation = false;
        scope.SmartSliderMainAnimationSimple.prototype.constructor.call(this, slider, parameters);
        this.isReverseAllowed = false;

        this.bgAnimationElement = this.sliderElement.find('.n2-ss-background-animation');
        this.backgroundAnimations = $.extend({
            global: 0,
            speed: 'normal'
        }, backgroundAnimations);

        this.backgroundImages = slider.backgroundImages.getBackgroundImages();

        /**
         * Hack to force browser to better image rendering {@link http://stackoverflow.com/a/14308227/305604}
         * Prevents a Firefox glitch
         */
        slider.backgroundImages.hack();
    }

    SmartSliderFrontendBackgroundAnimation.prototype = Object.create(scope.SmartSliderMainAnimationSimple.prototype);
    SmartSliderFrontendBackgroundAnimation.prototype.constructor = SmartSliderFrontendBackgroundAnimation;

    /**
     *
     * @param {scope.FrontendSliderSlide} nextSlide
     * @param {scope.FrontendSliderSlide} currentSlide
     * @returns {boolean|Array.<{scope.SmartSliderBackgroundAnimationAbstract, string}>}
     */
    SmartSliderFrontendBackgroundAnimation.prototype.getBackgroundAnimation = function (currentSlide, nextSlide) {
        if (nextSlide.hasBackgroundVideo() || currentSlide.hasBackgroundVideo()) {
            return false;
        }
        var animations = this.backgroundAnimations.global,
            speed = this.backgroundAnimations.speed;

        if (nextSlide.backgroundAnimation) {
            var backgroundAnimation = nextSlide.backgroundAnimation;
            animations = backgroundAnimation.animation;
            speed = backgroundAnimation.speed;
        }
        if (!animations) {
            return false;
        }
        return [animations[Math.floor(Math.random() * animations.length)], speed];
    };

    /**
     * Initialize the current background animation
     * @param {scope.FrontendSliderSlide} currentSlide
     * @param {scope.FrontendSliderSlide} nextSlide
     * @param reversed
     * @private
     */
    SmartSliderFrontendBackgroundAnimation.prototype._initAnimation = function (currentSlide, nextSlide, reversed) {
        this._currentBackgroundAnimation = false;
        var currentImage = currentSlide.backgroundImage,
            nextImage = nextSlide.backgroundImage;

        if (currentImage && nextImage) {
            var backgroundAnimation = this.getBackgroundAnimation(currentSlide, nextSlide);

            if (backgroundAnimation !== false) {
                var durationMultiplier = 1;
                switch (backgroundAnimation[1]) {
                    case 'superSlow':
                        durationMultiplier = 3;
                        break;
                    case 'slow':
                        durationMultiplier = 1.5;
                        break;
                    case 'fast':
                        durationMultiplier = 0.75;
                        break;
                    case 'superFast':
                        durationMultiplier = 0.5;
                        break;
                }
                this._currentBackgroundAnimation = new scope['SmartSliderBackgroundAnimation' + backgroundAnimation[0].type](this, currentImage.element, nextImage.element, backgroundAnimation[0], durationMultiplier, reversed);

                scope.SmartSliderMainAnimationSimple.prototype._initAnimation.apply(this, arguments);

                this._currentBackgroundAnimation.postSetup();

                this.timeline.set($('<div />'), {
                    opacity: 1, onComplete: $.proxy(function () {
                        if (this._currentBackgroundAnimation) {
                            this._currentBackgroundAnimation.ended();
                            this._currentBackgroundAnimation = false;
                        }
                    }, this)
                });

                return;
            }
        }

        scope.SmartSliderMainAnimationSimple.prototype._initAnimation.apply(this, arguments);
    };

    /**
     * Remove the background animation when the current animation finish
     * @param previousSlideIndex
     * @param currentSlideIndex
     */
    SmartSliderFrontendBackgroundAnimation.prototype.onChangeToComplete = function (previousSlideIndex, currentSlideIndex) {
        if (this._currentBackgroundAnimation) {
            this._currentBackgroundAnimation.ended();
            this._currentBackgroundAnimation = false;
        }
        scope.SmartSliderMainAnimationSimple.prototype.onChangeToComplete.apply(this, arguments);
    };

    SmartSliderFrontendBackgroundAnimation.prototype.onReverseChangeToComplete = function (previousSlideIndex, currentSlideIndex, isSystem) {
        if (this._currentBackgroundAnimation) {
            this._currentBackgroundAnimation.revertEnded();
            this._currentBackgroundAnimation = false;
        }
        scope.SmartSliderMainAnimationSimple.prototype.onReverseChangeToComplete.apply(this, arguments);
    };

    SmartSliderFrontendBackgroundAnimation.prototype.getExtraDelay = function () {
        if (this._currentBackgroundAnimation) {
            return this._currentBackgroundAnimation.getExtraDelay();
        }
        return 0;
    };

    SmartSliderFrontendBackgroundAnimation.prototype.hasBackgroundAnimation = function () {
        return this._currentBackgroundAnimation;
    };

    return SmartSliderFrontendBackgroundAnimation;

});
N2Require('SmartSliderResponsiveSimple', ['SmartSliderResponsive'], [], function ($, scope, undefined) {

    function SmartSliderResponsiveSimple() {
        this.round = 1;
        scope.SmartSliderResponsive.prototype.constructor.apply(this, arguments);
    };

    SmartSliderResponsiveSimple.prototype = Object.create(scope.SmartSliderResponsive.prototype);
    SmartSliderResponsiveSimple.prototype.constructor = SmartSliderResponsiveSimple;

    SmartSliderResponsiveSimple.prototype.init = function () {

        if (this.sliderElement.find('.n2-ss-section-main-content').length) {
            this.updateVerticalRatios = this._updateVerticalRatios;
        }

        this._sliderHorizontal = this.addHorizontalElement(this.sliderElement, ['width', 'marginLeft', 'marginRight'], 'w', 'slider');
        this.addHorizontalElement(this.sliderElement.find('.n2-ss-slider-1'), ['width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'], 'w');

        this._sliderVertical = this.addVerticalElement(this.sliderElement, ['marginTop', 'marginBottom'], 'h');
        this.addHorizontalElement(this.sliderElement, ['fontSize'], 'fontRatio', 'slider');
        this.addVerticalElement(this.sliderElement.find('.n2-ss-slider-1'), ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'], 'h', 'slider');

        this.addHorizontalElement(this.sliderElement.find('.n2-ss-slide'), ['width'], 'w', 'slideouter');

        this.addVerticalElement(this.sliderElement.find('.n2-ss-slide'), ['height'], 'h', 'slideouter');

        var layerContainers = this.sliderElement.find('.n2-ss-layers-container');
        this.addHorizontalElement(layerContainers, ['width'], 'slideW', 'slide');
        this.addVerticalElement(layerContainers, ['height'], 'slideH', 'slide').setCentered();

        var parallax = this.slider.parameters.mainanimation.parallax;
        var backgroundImages = this.slider.backgroundImages.getBackgroundImages();
        for (var i = 0; i < backgroundImages.length; i++) {
            if (parallax != 1) {
                this.addHorizontalElement(backgroundImages[i].element, ['width'], 'w');
                this.addVerticalElement(backgroundImages[i].element, ['height'], 'h');
                
                this.addHorizontalElement(backgroundImages[i].$mask, ['width'], 'w');
                this.addVerticalElement(backgroundImages[i].$mask, ['height'], 'h');
            }
        }


        var video = this.sliderElement.find('.n2-ss-slider-background-video');
        if (video.length) {
            if (video[0].videoWidth > 0) {
                this.videoPlayerReady(video);
            } else {
                video[0].addEventListener('error', $.proxy(this.videoPlayerError, this, video), true);
                video[0].addEventListener('canplay', $.proxy(this.videoPlayerReady, this, video));
            }
        }
    };

    SmartSliderResponsiveSimple.prototype.videoPlayerError = function (video) {
        video.remove();
    };

    SmartSliderResponsiveSimple.prototype.videoPlayerReady = function (video) {
        video.data('ratio', video[0].videoWidth / video[0].videoHeight);
        video.addClass('n2-active');

        this.slider.ready($.proxy(function () {
            this.slider.sliderElement.on('SliderResize', $.proxy(this.resizeVideo, this, video));
            this.resizeVideo(video);
        }, this));
    };

    SmartSliderResponsiveSimple.prototype.resizeVideo = function ($video) {

        var mode = $video.data('mode'),
            ratio = $video.data('ratio'),
            slideOuter = this.slider.dimensions.slideouter || this.slider.dimensions.slide,
            slideOuterRatio = slideOuter.width / slideOuter.height;

        if (mode == 'fill') {
            if (slideOuterRatio > ratio) {
                $video.css({
                    width: '100%',
                    height: 'auto'
                });
            } else {
                $video.css({
                    width: 'auto',
                    height: '100%'
                });
            }
        } else if (mode == 'fit') {
            if (slideOuterRatio < ratio) {
                $video.css({
                    width: '100%',
                    height: 'auto'
                });
            } else {
                $video.css({
                    width: 'auto',
                    height: '100%'
                });
            }
        }

        $video.css('marginTop', 0)
            .css(nextend.rtl.marginLeft, 0);
        this.center($video);
    };

    SmartSliderResponsiveSimple.prototype.center = function ($video) {
        var parent = $video.parent();

        $video.css({
            marginTop: parseInt((parent.height() - $video.height()) / 2)
        });
        $video.css(nextend.rtl.marginLeft, parseInt((parent.width() - $video.width()) / 2));
    };

    return SmartSliderResponsiveSimple;
});
N2Require('SmartSliderSimple', ['SmartSliderAbstract'], [], function ($, scope, undefined) {

    function SmartSliderSimple(elementID, parameters) {

        this.type = 'simple';

        scope.SmartSliderAbstract.prototype.constructor.call(this, elementID, $.extend({
            bgAnimations: 0,
            carousel: 1
        }, parameters));
    }

    SmartSliderSimple.prototype = Object.create(scope.SmartSliderAbstract.prototype);
    SmartSliderSimple.prototype.constructor = SmartSliderSimple;

    SmartSliderSimple.prototype.initResponsiveMode = function () {

        this.responsive = new scope.SmartSliderResponsiveSimple(this, this.parameters.responsive);
        this.responsive.start();

        scope.SmartSliderAbstract.prototype.initResponsiveMode.call(this);

        this.$backgroundsContainer = this.sliderElement.find('.n2-ss-slide-backgrounds');
    };

    SmartSliderSimple.prototype.initMainAnimation = function () {

        if (nModernizr.csstransforms3d && nModernizr.csstransformspreserve3d && this.parameters.bgAnimations) {
            this.mainAnimation = new scope.SmartSliderFrontendBackgroundAnimation(this, this.parameters.mainanimation, this.parameters.bgAnimations);
        } else {
            this.mainAnimation = new scope.SmartSliderMainAnimationSimple(this, this.parameters.mainanimation);
        }
    };

    SmartSliderSimple.prototype.afterRawSlidesReady = function () {
        if (this.parameters.postBackgroundAnimations && this.parameters.postBackgroundAnimations.slides) {
            for (var i = 0; i < this.slides.length; i++) {
                this.slides[i].postBackgroundAnimation = this.parameters.postBackgroundAnimations.slides[i];
            }
            delete this.parameters.postBackgroundAnimations.slides;
        }

        if (this.parameters.bgAnimations && this.parameters.bgAnimations.slides) {
            for (var j = 0; j < this.slides.length; j++) {
                this.slides[j].backgroundAnimation = this.parameters.bgAnimations.slides[j];
            }
            delete this.parameters.bgAnimations.slides;
        }
    };

    SmartSliderSimple.prototype.findSlideBackground = function (slide) {
        var $background = scope.SmartSliderAbstract.prototype.findSlideBackground.call(this, slide);
        $background.appendTo(this.sliderElement.find('.n2-ss-slide-backgrounds'));
        return $background;
    };

    return SmartSliderSimple;

});