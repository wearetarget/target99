<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

add_action('template_redirect', function () {
    if (Elementor\Plugin::instance()->editor->is_edit_mode() || Elementor\Plugin::instance()->preview->is_preview_mode()) {
        remove_shortcode('smartslider3');
    }
}, -1);


add_action('wp_ajax_elementor_render_widget', function () {
    remove_shortcode('smartslider3');
}, -1);
