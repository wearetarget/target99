<?php
N2Loader::import('libraries.slider.slide.slidecontentabstract', 'smartslider');

class N2SmartSliderGroup extends N2SmartSliderSlideContentAbstract {


    public function render($group) {

        if (!empty($group['generatorvisible']) && $this->slide->hasGenerator() && !$this->slider->isAdmin) {
            $filled = $this->slide->fill($group['generatorvisible']);
            if (empty($filled)) {
                return '';
            }
        }

        $innerHTML = '';
        if (is_array($group['layers'])) {
            foreach ($group['layers'] AS $layer) {
                if (isset($layer['type'])) {
                    $innerHTML .= $this->renderers[$layer['type']]->render($layer);
                } else {
                    $innerHTML .= $this->renderers['layer']->render($layer);
                }
            }
        }
        unset($group['layers']);

        $zIndex = $group['zIndex'];
        unset($group['zIndex']);

        $attributes = array(
            'style' => 'z-index: ' . $zIndex . ';',
            'class' => 'n2-ss-layer-group'
        );

        if (!empty($group['animations'])) {
            $attributes['data-animations'] = base64_encode(json_encode($group['animations']));
            unset($group['animations']);
        }

        if (!$this->slider->isAdmin) {
            unset($group['type']);
            unset($group['name']);
            unset($group['opened']);
        }

        if (!$this->slider->isAdmin && isset($group['parallax'])) {
            if ($group['parallax'] > 0) {
                $innerHTML = N2Html::tag('div', array(
                    'class' => 'n2-ss-layer-parallax'
                ), $innerHTML);
            } else {
                unset($group['parallax']);
            }
        }

        foreach ($group AS $k => $data) {
            $attributes['data-' . $k] = $data;
        }

        return N2HTML::tag('div', $attributes, $innerHTML);
    }

    public function getFilled($group) {
        $layers = array();
        for ($i = 0; $i < count($group['layers']); $i++) {
            if (isset($group['layers'][$i]['type'])) {
                $layers[] = $this->renderers[$group['layers'][$i]['type']]->getFilled($group['layers'][$i]);
            } else {
                $layers[] = $this->renderers['layer']->getFilled($group['layers'][$i]);
            }
        }
        $group['layers'] = $layers;
        return $group;
    }

    public static function prepareExport($export, $layer) {
        foreach ($layer['layers'] AS $layer) {
            N2SmartSliderLayer::prepareExport($export, $layer);
        }
    }

    public static function prepareImport($import, &$layer) {
        for ($j = 0; $j < count($layer['layers']); $j++) {
            N2SmartSliderLayer::prepareImport($import, $layer['layers'][$j]);
        }
    }
}