<?php

N2Loader::import('libraries.plugins.N2SliderItemAbstract', 'smartslider');

class N2SSPluginItemYouTube extends N2SSPluginItemAbstract {

    var $_identifier = 'youtube';

    protected $priority = 20;

    protected $layerProperties = array(
        "width"  => 300,
        "height" => 180
    );

    protected $group = 'Media';

    public function __construct() {
        $this->_title = n2_x('YouTube', 'Slide item');
    }

    function getTemplate($slider) {
        return N2Html::tag('div', array(
            "style" => 'width: 100%; height: 100%; min-height: 50px; background: url({image}) no-repeat 50% 50%; background-size: cover;'
        ), '<img class="n2-video-play n2-ow" alt="" src="' . N2ImageHelperAbstract::SVGToBase64('$ss$/images/play.svg') . '"/>');
    }

    function _render($data, $itemId, $slider, $slide) {
        /**
         * @var $data N2Data
         */
        $data->fillDefault(array(
            'image'             => '',
            'start'             => 0,
            'volume'            => -1,
            'autoplay'          => 0,
            'controls'          => 1,
            'center'            => 0,
            'loop'              => 0,
            'showinfo'          => 1,
            'modestbranding'    => 1,
            'reset'             => 0,
            'theme'             => 'dark',
            'related'           => 0,
            'vq'                => 'default'
        ));

        $rawYTUrl = $slide->fill($data->get('youtubeurl', ''));

        $url_parts = parse_url($rawYTUrl);
        if (!empty($url_parts['query'])) {
            parse_str($url_parts['query'], $query);
            if (isset($query['v'])) {
                unset($query['v']);
            }
            $data->set("query", $query);
        }

        $youTubeUrl = $this->parseYoutubeUrl($rawYTUrl);

        $start = $slide->fill($data->get('start', ''));
        $data->set("youtubecode", $youTubeUrl);
        $data->set("start", $start);

        $style = '';

        $hasImage = 0;
        $image    = $slide->fill($data->get('image'));

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

        N2JS::addInline('window["' . $slider->elementId . '"].ready(function(){
            new NextendSmartSliderYouTubeItem(this, "' . $itemId . '", ' . $data->toJSON() . ', ' . $hasImage . ');
        });');

        return N2Html::tag('div', array(
            'id'    => $itemId,
            'style' => 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;' . $style
        ), $playImage);
    }

    function _renderAdmin($data, $itemId, $slider, $slide) {
        $image = $slide->fill($data->get('image'));
        $data->set('image', $image);

        return N2Html::tag('div', array(
            "style" => 'width: 100%; height: 100%; background: url(' . N2ImageHelper::fixed($data->getIfEmpty('image', '$system$/images/placeholder/video.png')) . ') no-repeat 50% 50%; background-size: cover;'
        ), $data->get('playbutton', 1) ? '<img class="n2-video-play n2-ow" alt="" src="' . N2ImageHelperAbstract::SVGToBase64('$ss$/images/play.svg') . '"/>' : '');
    }

    function parseYoutubeUrl($youTubeUrl) {
        preg_match('/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/', $youTubeUrl, $matches);

        if ($matches && isset($matches[7]) && strlen($matches[7]) == 11) {
            return $matches[7];
        }

        return $youTubeUrl;
    }

    function getValues() {
        return array(
            'code'              => 'qesNtYIBDfs',
            'youtubeurl'        => 'https://www.youtube.com/watch?v=MKmIwHAFjSU',
            'image'             => '$system$/images/placeholder/video.png',
            'autoplay'          => 0,
            'controls'          => 1,
            'defaultimage'      => 'maxresdefault',
            'related'           => '0',
            'vq'                => 'default',
            'center'            => 0,
            'loop'              => 0,            
            'showinfo'          => 1,
            'modestbranding'    => 1,
            'reset'             => 0,
            'start'             => '0'
        );
    }

    function getPath() {
        return dirname(__FILE__) . DIRECTORY_SEPARATOR . $this->_identifier . DIRECTORY_SEPARATOR;
    }

    public function getFilled($slide, $data) {
        $data->set('image', $slide->fill($data->get('image', '')));
        $data->set('youtubeurl', $slide->fill($data->get('youtubeurl', '')));

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

N2Plugin::addPlugin('ssitem', 'N2SSPluginItemYouTube');