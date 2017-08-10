<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access


class class_accordions_shortcodes  {
	
	
    public function __construct()
    {
		
		add_shortcode( 'accordions', array( $this, 'accordions_display' ) );
		add_shortcode( 'accordions_pickplguins', array( $this, 'accordions_display' ) );
		
		add_shortcode( 'accordions_tabs', array( $this, 'accordions_tabs_display' ) );		

    }
	

	
	
	public function accordions_display($atts, $content = null ) {
			$atts = shortcode_atts(
				array(
					'id' => "",
	
					), $atts);
	
				$html = '';
				$post_id = $atts['id'];
	
				$accordions_themes = get_post_meta( $post_id, 'accordions_themes', true );

				include accordions_plugin_dir.'/templates/variables.php';
				include accordions_plugin_dir.'/templates/scripts.php';
				include accordions_plugin_dir.'/templates/custom-css.php';
				//include accordions_plugin_dir.'/templates/lazy.php';

				$html.= '<div id="accordions-'.$post_id.'" class="'.$accordions_class.' accordions-themes '.$accordions_themes.' accordions-'.$post_id.'">';

					foreach ($accordions_content_title as $index => $accordions_title){
						
						if(empty($accordions_hide[$index])){
							
								include accordions_plugin_dir.'/templates/header.php';
								include accordions_plugin_dir.'/templates/content.php';
							}
						}
				$html.= '</div>';
				return $html;

	}
	
	
	
	
	
	
	public function accordions_tabs_display($atts, $content = null ) {
			$atts = shortcode_atts(
				array(
					'id' => "",
	
					), $atts);
	
				$html = '';
				$post_id = $atts['id'];
	
				$accordions_tabs_themes = get_post_meta( $post_id, 'accordions_tabs_themes', true );

				include accordions_plugin_dir.'/templates/variables.php';
				include accordions_plugin_dir.'/templates/tabs-scripts.php';
				include accordions_plugin_dir.'/templates/tabs-custom-css.php';
				//include accordions_plugin_dir.'/templates/tabs-lazy.php';
				
				if(empty($accordions_tabs_themes)){
					
					$accordions_tabs_themes = 'flat';
					}
				
				
				$html.= '<div id="accordions-tabs-'.$post_id.'" class="accordions-tabs-themes accordions-tabs '.$accordions_tabs_themes.' accordions-tabs-'.$post_id.'">';
				$html.= '<ul>';
					foreach ($accordions_content_title as $index => $accordions_title){
						
						if(empty($accordions_hide[$index])){
							
								include accordions_plugin_dir.'/templates/tabs-header.php';
								//include accordions_plugin_dir.'/templates/tabs-content.php';
							
							}
						}
						
				$html.= '</ul>';
				
				
					foreach ($accordions_content_title as $index => $accordions_title){
						
						if(empty($accordions_hide[$index])){
							$html.= '<div class="tabs-content" id="tabs-'.$index.'">';
								//include accordions_plugin_dir.'/templates/tabs-header.php';
								include accordions_plugin_dir.'/templates/tabs-content.php';
							$html.= '</div>';
							}
						}						
						
						
				$html.= '</div>';
				return $html;

	}	
	
	
	
	
	
	
	
	
	
	

}


new class_accordions_shortcodes();