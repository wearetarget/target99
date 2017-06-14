<?php

N2Loader::import('libraries.plugins.N2SliderItemAbstract', 'smartslider');

class N2SSPluginItemVimeo extends N2SSPluginItemAbstract {

    var $_identifier = 'vimeo';

    protected $priority = 20;

    protected $layerProperties = array(
        "width"  => 300,
        "height" => 180
    );

    protected $group = 'Media';

    public function __construct() {
        $this->_title = n2_x('Vimeo', 'Slide item');
    }

    function getTemplate($slider) {
        return N2Html::tag('div', array(
            "style" => 'width: 100%; height: 100%; min-height: 50px; background: url({image}) no-repeat 50% 50%; background-size: cover;'
        ), '<img class="n2-video-play n2-ow" alt="" src="' . N2ImageHelperAbstract::SVGToBase64('$ss$/images/play.svg') . '"/>');
    }

    function _render($data, $itemId, $slider, $slide) {

        $data->set("vimeocode", preg_replace('/\D/', '', $slide->fill($data->get("vimeourl"))));

        $style = '';

        $hasImage  = 0;
        $image     = $data->get('image');
        $playImage = '';
        if (!empty($image)) {
            $style    = 'cursor:pointer; background: url(' . N2ImageHelper::fixed($image) . ') no-repeat 50% 50%; background-size: cover';
            $hasImage = 1;
            if ($data->get('playbutton', 1) != 0) {
                $playImage = '<img class="n2-video-play n2-ow" alt="" style="';
                $playWidth = intval($data->get('playbuttonwidth', '48'));
                $playHeight = intval($data->get('playbuttonheight', '48'));
                if ($playWidth != 0 && $playHeight != 0) {
                    $playImage .= 'width:' . $playWidth . 'px;';
                    $playImage .= 'height:' . $playHeight . 'px;';
                    $playImage .= 'margin-left:' . ($playWidth / -2) . 'px;';
                    $playImage .= 'margin-top:' . ($playHeight / -2) . 'px;';
                }
                $playImage .= '" src="';
                $playbuttonimage = $data->get('playbuttonimage', '');
                if (!empty($playbuttonimage)) {
                    $playImage .= N2ImageHelper::fixed($data->get('playbuttonimage', ''));
                } else {
                    $playImage .= N2ImageHelperAbstract::SVGToBase64('$ss$/images/play.svg');
                }
                $playImage .= '"/>';
            }
        }

        N2JS::addInline('window["' . $slider->elementId . '"].ready(function() {
                var vimeo = new NextendSmartSliderVimeoItem(this, "' . $itemId . '", "' . $slider->elementId . '", ' . $data->toJSON() . ', ' . $hasImage . ', ' . $slide->fill($data->get('start', '0')) . ');
            });
        ');

        return N2Html::tag('div', array(
            'id'    => $itemId,
            'style' => 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;' . $style
        ), $playImage);
    }

    function _renderAdmin($data, $itemId, $slider, $slide) {
        return N2Html::tag('div', array(
            "style" => 'width: 100%; height: 100%; background: url(' . N2ImageHelper::fixed($data->getIfEmpty('image', '$system$/images/placeholder/video.png')) . ') no-repeat 50% 50%; background-size: cover;'
        ), '<img class="n2-video-play n2-ow" alt="" src="' . N2ImageHelperAbstract::SVGToBase64('$ss$/images/play.svg') . '"/>');
    }

    function getValues() {
        return array(
            'vimeourl' => '75251217',
            'image'    => '$system$/images/placeholder/video.png',
            'center'   => 0,
            'autoplay' => 0,
            'title'    => 1,
            'byline'   => 1,
            'portrait' => 0,
            'color'    => '00adef',
            'loop'     => 0,
            'start'    => 0
        );
    }

    function getPath() {
        return dirname(__FILE__) . DIRECTORY_SEPARATOR . $this->_identifier . DIRECTORY_SEPARATOR;
    }

    public function getFilled($slide, $data) {
        $data->set('image', $slide->fill($data->get('image', '')));
        $data->set('vimeourl', $slide->fill($data->get('vimeourl', '')));

        return $data;
    }

    public function prepareExport($export, $data) {
        $export->addImage($data->get('image'));
    }

    public function prepareImport($import, $data) {
        $data->set('image', $import->fixImage($data->get('image')));

        return $data;
    }

    public function prepareFixed($data) {
        $data->set('image', $this->fixImage($data->get('image')));

        return $data;
    }
}

N2Plugin::addPlugin('ssitem', 'N2SSPluginItemVimeo');