<?php
N2Loader::import('libraries.slider.slide.slidecontentabstract', 'smartslider');

class N2SmartSliderLayer extends N2SmartSliderSlideContentAbstract {

    private $item;

    /**
     * @param $slider    N2SmartSliderAbstract
     * @param $slide     N2SmartSliderSlide
     * @param $renderers array
     */
    public function __construct($slider, $slide, &$renderers) {
        parent::__construct($slider, $slide, $renderers);
        $this->item = new N2SmartSliderItem($slider, $slide);
    }

    private function WHUnit($value) {
        if ($value == 'auto' || substr($value, -1) == '%') {
            return $value;
        }

        return $value . 'px';
    }

    public function render($layer) {

        if (!empty($layer['generatorvisible']) && $this->slide->hasGenerator() && !$this->slider->isAdmin) {
            $filled = $this->slide->fill($layer['generatorvisible']);
            if (empty($filled)) {
                return '';
            }
        }

        $innerHTML = '';
        for ($i = 0; $i < count($layer['items']); $i++) {
            $innerHTML .= $this->item->render($layer['items'][$i]);
        }
        unset($layer['items']);

        $cropStyle = $layer['crop'];

        if ($this->slider->isAdmin) {
            if ($layer['crop'] == 'auto') {
                $cropStyle = 'hidden';
            }
        } else {
            if ($layer['crop'] == 'auto') {
                $layer['class'] .= ' n2-scrollable';
            }
        }
        if (!isset($layer['rotation'])) $layer['rotation'] = 0;

        if ($layer['rotation'] != 0) {
            $innerHTML = N2Html::tag('div', array(
                'class' => 'n2-ss-layer-rotation',
                'style' => '-ms-transform: rotateZ(' . $layer['rotation'] . 'deg);-webkit-transform: rotateZ(' . $layer['rotation'] . 'deg);transform: rotateZ(' . $layer['rotation'] . 'deg);'
            ), $innerHTML);
        }

        if ($layer['crop'] == 'mask') {
            if ($layer['crop'] == 'mask') {
                $cropStyle = 'hidden';
            }
            $innerHTML = N2Html::tag('div', array('class' => 'n2-ss-layer-mask'), $innerHTML);
        } else if (!$this->slider->isAdmin && $layer['parallax'] > 0) {
            $innerHTML = N2Html::tag('div', array(
                'class' => 'n2-ss-layer-parallax'
            ), $innerHTML);
        }

        if (!isset($layer['responsiveposition'])) {
            $layer['responsiveposition'] = 1;
        }

        if (!isset($layer['responsivesize'])) {
            $layer['responsivesize'] = 1;
        }


        $style = '';
        /*if (isset($layer['adaptivefont']) && $layer['adaptivefont']) {
            $style .= 'font-size: ' . $this->slider->fontSize . 'px;';
        }*/
        if (isset($layer['inneralign'])) {
            $style .= 'text-align:' . $layer['inneralign'];
        }

        $style .= ';left:' . $layer['desktopportraitleft'] . 'px';
        $style .= ';top:' . $layer['desktopportraittop'] . 'px';
        $style .= ';width:' . $this->WHUnit($layer['desktopportraitwidth']);
        $style .= ';height:' . $this->WHUnit($layer['desktopportraitheight']);

        if (isset($layer['zIndex'])) {
            $zIndex = $layer['zIndex'];
            unset($layer['zIndex']);
        } else {
            preg_match('/z\-index:.*?([0-9]+);/', $layer['style'], $out);
            $zIndex = $out[1];
            unset($layer['style']);
        }

        $layerClass = '';
        if (!empty($layer['class']) && $this->slide->hasGenerator()) {
            $layerClass = $this->slide->fill($layer['class']);
        } else if(!empty($layer['class'])){
            $layerClass = $layer['class'];
        }
        $attributes = array(
            'class' => 'n2-ss-layer' . ' ' . $layerClass,
            'style' => 'z-index:' . $zIndex . ';overflow:' . $cropStyle . ';' . $style . ';'
        );

        if (!empty($layer['animations'])) {
            if (is_array($layer['animations'])) {
                if (isset($layer['animations']['in']) && is_array($layer['animations']['in'])) {
                    for ($i = 0; $i < count($layer['animations']['in']); $i++) {
                        $layer['animations']['in'][$i] = (object)$layer['animations']['in'][$i];
                    }
                }
                if (isset($layer['animations']['loop']) && is_array($layer['animations']['loop'])) {
                    for ($i = 0; $i < count($layer['animations']['loop']); $i++) {
                        $layer['animations']['loop'][$i] = (object)$layer['animations']['loop'][$i];
                    }
                }
                if (isset($layer['animations']['out']) && is_array($layer['animations']['out'])) {
                    for ($i = 0; $i < count($layer['animations']['out']); $i++) {
                        $layer['animations']['out'][$i] = (object)$layer['animations']['out'][$i];
                    }
                }
            }
            $attributes['data-animations'] = base64_encode(json_encode($layer['animations']));
        }

        if (!empty($layer['id'])) {
            $attributes['id'] = $layer['id'];
            unset($layer['id']);
        }

        unset($layer['animations']);

        if (!$this->slider->isAdmin && $layer['parallax'] < 1) {
            unset($layer['parallax']);
        }

        if (!$this->slider->isAdmin) {
            $this->getEventAttributes($attributes, $layer, $this->slider->elementId);

            unset($layer['name']);
            unset($layer['namesynced']);
            unset($layer['eye']);
            unset($layer['lock']);
            unset($layer['inneralign']);
            unset($layer['crop']);
            unset($layer['zIndex']);
        } else {
            $layer['type'] = 'layer';
        }

        foreach ($layer AS $k => $data) {
            $attributes['data-' . $k] = $data;
        }

        return N2Html::tag('div', $attributes, $innerHTML);
    }

    public function getFilled($layer) {
        $items = array();
        for ($i = 0; $i < count($layer['items']); $i++) {
            $items [] = $this->item->getFilled($layer['items'][$i]);
        }
        $layer['items'] = $items;

        return $layer;
    }

    public static function prepareExport($export, $layer) {
        foreach ($layer['items'] AS $item) {
            N2SmartSliderItem::prepareExport($export, $item);
        }
    }

    public static function prepareImport($import, &$layer) {
        for ($j = 0; $j < count($layer['items']); $j++) {
            $layer['items'][$j] = N2SmartSliderItem::prepareImport($import, $layer['items'][$j]);
        }
    }

    public static function prepareFixed($rawLayers) {
        $layers = json_decode($rawLayers, true);
        for ($i = 0; $i < count($layers); $i++) {
            for ($j = 0; $j < count($layers[$i]['items']); $j++) {
                $layers[$i]['items'][$j] = N2SmartSliderItem::prepareFixed($layers[$i]['items'][$j]);
            }
        }

        return json_encode($layers);
    }

    public static function sort($layers) {
        $children = array();
        for ($i = count($layers) - 1; $i >= 0; $i--) {
            if (!empty($layers[$i]['parentid'])) {
                $parentId = $layers[$i]['parentid'];
                if (!isset($children[$parentId])) {
                    $children[$parentId] = array();
                }
                $children[$parentId][] = $layers[$i];
                array_splice($layers, $i, 1);
            }
        }

        for ($i = 0; $i < count($layers); $i++) {
            if (isset($layers[$i]['id']) && isset($children[$layers[$i]['id']])) {
                array_splice($layers, $i + 1, 0, $children[$layers[$i]['id']]);
                unset($children[$layers[$i]['id']]);
            }
        }

        return $layers;
    }

    private static function uid($length = 12) {
        $characters       = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString     = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[mt_rand(0, $charactersLength - 1)];
        }

        return $randomString;
    }

    public static function translateIds($layers) {
        $layers        = self::sort($layers);
        $idTranslation = array();
        for ($i = 0; $i < count($layers); $i++) {
            if (!empty($layers[$i]['id'])) {
                $newId                            = 'd' . self::uid();
                $idTranslation[$layers[$i]['id']] = $newId;
                $layers[$i]['id']                 = $newId;
            }
            if (isset($layers[$i]['type']) && $layers[$i]['type'] == 'group') {
                for ($j = 0; $j < count($layers[$i]['layers']); $j++) {
                    if (!empty($layers[$i]['layers'][$j]['id'])) {
                        $newId                                          = 'd' . self::uid();
                        $idTranslation[$layers[$i]['layers'][$j]['id']] = $newId;
                        $layers[$i]['layers'][$j]['id']                 = $newId;
                    }
                }
            }
        }
        for ($i = 0; $i < count($layers); $i++) {
            if (!empty($layers[$i]['parentid'])) {
                if (isset($idTranslation[$layers[$i]['parentid']])) {
                    $layers[$i]['parentid'] = $idTranslation[$layers[$i]['parentid']];
                } else {
                    $layers[$i]['parentid'] = '';
                }
            }
            if (isset($layers[$i]['type']) && $layers[$i]['type'] == 'group') {
                for ($j = 0; $j < count($layers[$i]['layers']); $j++) {
                    if (!empty($layers[$i]['layers'][$j]['parentid'])) {
                        if (isset($idTranslation[$layers[$i]['layers'][$j]['parentid']])) {
                            $layers[$i]['layers'][$j]['parentid'] = $idTranslation[$layers[$i]['layers'][$j]['parentid']];
                        } else {
                            $layers[$i]['layers'][$j]['parentid'] = '';
                        }
                    }
                }
            }
        }

        return $layers;
    }

    protected function getEventAttributes(&$attributes, &$layer, $sliderId) {
        if (!empty($layer['mouseenter'])) {
            $attributes['data-mouseenter'] = $this->parseEventCode($layer['mouseenter'], $sliderId);
            unset($layer['mouseenter']);
        }
        if (!empty($layer['click'])) {
            $attributes['data-click'] = $this->parseEventCode($layer['click'], $sliderId);
            $attributes['style'] .= 'cursor:pointer;';
            unset($layer['click']);
        }
        if (!empty($layer['mouseleave'])) {
            $attributes['data-mouseleave'] = $this->parseEventCode($layer['mouseleave'], $sliderId);
            unset($layer['mouseleave']);
        }
        if (!empty($layer['play'])) {
            $attributes['data-play'] = $this->parseEventCode($layer['play'], $sliderId);
            unset($layer['play']);
        }
        if (!empty($layer['pause'])) {
            $attributes['data-pause'] = $this->parseEventCode($layer['pause'], $sliderId);
            unset($layer['pause']);
        }
        if (!empty($layer['stop'])) {
            $attributes['data-stop'] = $this->parseEventCode($layer['stop'], $sliderId);
            unset($layer['stop']);
        }
    }

    protected function parseEventCode($code, $elementId) {
        if (preg_match('/^[a-zA-Z0-9_\-,]+$/', $code)) {
            if (is_numeric($code)) {
                $code = "window['" . $elementId . "'].changeTo(" . ($code - 1) . ");";
            } else if ($code == 'next') {
                $code = "window['" . $elementId . "'].next();";
            } else if ($code == 'previous') {
                $code = "window['" . $elementId . "'].previous();";
            } else {
                $code = "n2ss.trigger(this, '" . $code . "');";
            }
        }

        return $code;
    }
}


class N2SmartSliderLayerHelper {

    public $data = array(
        "zIndex"                      => 1,
        "eye"                         => false,
        "lock"                        => false,
        "animations"                  => array(
            "specialZeroIn"       => 0,
            "transformOriginIn"   => "50|*|50|*|0",
            "inPlayEvent"         => "",
            "repeatCount"         => 0,
            "repeatStartDelay"    => 0,
            "transformOriginLoop" => "50|*|50|*|0",
            "loopPlayEvent"       => "",
            "loopPauseEvent"      => "",
            "loopStopEvent"       => "",
            "transformOriginOut"  => "50|*|50|*|0",
            "outPlayEvent"        => "",
            "instantOut"          => 1,
            "in"                  => array(),
            "loop"                => array(),
            "out"                 => array()
        ),
        "id"                          => null,
        "parentid"                    => null,
        "name"                        => "Layer",
        "namesynced"                  => 1,
        "crop"                        => "visible",
        "inneralign"                  => "left",
        "parallax"                    => 0,
        "adaptivefont"                => 0,
        "desktopportrait"             => 1,
        "desktoplandscape"            => 1,
        "tabletportrait"              => 1,
        "tabletlandscape"             => 1,
        "mobileportrait"              => 1,
        "mobilelandscape"             => 1,
        "responsiveposition"          => 1,
        "responsivesize"              => 1,
        "desktopportraitleft"         => 0,
        "desktopportraittop"          => 0,
        "desktopportraitwidth"        => "auto",
        "desktopportraitheight"       => "auto",
        "desktopportraitalign"        => "center",
        "desktopportraitvalign"       => "middle",
        "desktopportraitparentalign"  => "center",
        "desktopportraitparentvalign" => "middle",
        "desktopportraitfontsize"     => 100,
        "items"                       => array()

    );

    public function __construct($properties = array()) {
        foreach ($properties as $k => $v) {
            $this->data[$k] = $v;
        }
    }

    public function set($key, $value) {
        $this->data[$key] = $value;

        return $this;
    }
}