<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function n2_fl_builder_force_iframe() {
    N2SS3Shortcode::forceIframe('beaverbuilder');
}

add_action('fl_builder_editing_enabled', 'n2_fl_builder_force_iframe');
add_action('fl_builder_editing_enabled', "N2SSShortcodeInsert::addForcedFrontend");


add_action('fl_ajax_before_render_new_module', 'n2_fl_builder_force_iframe');
add_action('fl_ajax_before_render_layout', 'n2_fl_builder_force_iframe');
add_action('fl_ajax_before_render_module_settings', 'n2_fl_builder_force_iframe');
add_action('fl_ajax_before_save_settings', 'n2_fl_builder_force_iframe');
add_action('fl_ajax_before_copy_module', 'n2_fl_builder_force_iframe');

/**
 * Custom modules
 */
function n2_fl_load_module_smart_slider() {
    if (class_exists('FLBuilder')) {
        require_once 'beaver-builder-module/beaver-builder-module.php';
    }
}

add_action('init', 'n2_fl_load_module_smart_slider');

function n2_fl_smart_slider_field($name, $value, $field) {
    echo '<input type="text" class="text" style="width:100px;" name="' . $name . '" value="' . $value . '" />
          <a style="" href="#" onclick="return NextendSmartSliderSelectModal(jQuery(this).siblings(\'input\'));" class="fl-builder-button fl-builder-button-small fl-builder-button-primary" title="Select slider">Select slider</a>';
}

add_action('fl_builder_control_smart-slider', 'n2_fl_smart_slider_field', 1, 3);