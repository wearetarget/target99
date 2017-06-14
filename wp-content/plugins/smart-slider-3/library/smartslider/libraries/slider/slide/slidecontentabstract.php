<?php

class N2SmartSliderSlideContentAbstract {

    protected $slider, $slide, $renderers;

    /**
     * @param $slider    N2SmartSliderAbstract
     * @param $slide     N2SmartSliderSlide
     * @param $renderers array
     */

    public function __construct($slider, $slide, &$renderers) {
        $this->slider    = $slider;
        $this->slide     = $slide;
        $this->renderers = $renderers;
    }
}