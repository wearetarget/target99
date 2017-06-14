<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

function Nextend_ET_Builder_Module_Smart_Slider_Field() {
    $output = sprintf('<input type="button" class="button button-upload" value="%1$s" onclick="return NextendSmartSliderDiviModal(this);" />', 'Select Slider');

    return $output;
}

class Nextend_ET_Builder_Module_Smart_Slider extends ET_Builder_Module {

    function init() {
        $this->name = 'Smart Slider 3';
        $this->slug = 'et_pb_nextend_smart_slider_3';
        if(defined('EXTRA_LAYOUT_POST_TYPE')){
            $this->post_types = array( EXTRA_LAYOUT_POST_TYPE );
        }

        $this->whitelisted_fields = array(
            'slider',
        );

        $this->fields_defaults = array();

        $this->advanced_options = array();

        add_action('admin_footer', 'Nextend_ET_Builder_Module_Smart_Slider::add_admin_icon');
    }

    public static function add_admin_icon() {
        ?>
        <style type="text/css">
            .et-pb-all-modules .et_pb_nextend_smart_slider_3::before,
            .et-pb-all-modules .et_pb_nextend_smart_slider_3_fullwidth::before {
                content: 'S';
            }
        </style>
        <?php
    }

    function get_fields() {
        $fields = array(
            'slider' => array(
                'label'               => 'Slider',
                'option_category'     => 'basic_option',
                'type'                => 'text',
                'renderer'            => 'Nextend_ET_Builder_Module_Smart_Slider_Field',
                'renderer_with_field' => true
            )
        );

        return $fields;
    }

    function shortcode_callback($atts, $content = null, $function_name) {
        $sliderId     = $this->shortcode_atts['slider'];
        $module_class = '';
        $module_class = ET_Builder_Element::add_module_order_class($module_class, $function_name);

        return '<div class="et_pb_module et-waypoint ' . $module_class . ' et_pb_animation_off">' . do_shortcode('[smartslider3 slider=' . $sliderId . ']') . '</div>';
    }
}

class Nextend_ET_Builder_Module_Smart_Slider_Fullwidth extends Nextend_ET_Builder_Module_Smart_Slider {

    function init() {
        parent::init();
        $this->fullwidth = true;
        $this->slug      = 'et_pb_nextend_smart_slider_3_fullwidth';
    }
}

function Nextend_et_builder_get_child_modules_fix($child_modules) {
    if ($child_modules === '') {
        $child_modules = array();
    }
    return $child_modules;
}

add_filter('et_builder_get_child_modules', 'Nextend_et_builder_get_child_modules_fix');

if(function_exists('et_fb_is_enabled') && et_fb_is_enabled()){
    Nextend_et_builder_remove_shortcode();
}

function Nextend_et_builder_remove_shortcode() {
    remove_shortcode('smartslider3');
}

add_action( 'wp_ajax_et_fb_retrieve_builder_data', 'Nextend_et_builder_remove_shortcode', 9);

new Nextend_ET_Builder_Module_Smart_Slider;
new Nextend_ET_Builder_Module_Smart_Slider_Fullwidth;