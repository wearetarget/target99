<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 
		
		
		$accordions_collapsible = get_post_meta( $post_id, 'accordions_collapsible', true );
		if(empty($accordions_collapsible)){$accordions_collapsible = 'true';}
			
		$accordions_heightStyle = get_post_meta( $post_id, 'accordions_heightStyle', true );
		if(empty($accordions_heightStyle)){$accordions_heightStyle = 'content';}
				
		$accordions_themes = get_post_meta( $post_id, 'accordions_themes', true );
		if(empty($accordions_themes)){$accordions_themes = 'flat';}

		$accordions_container_padding = get_post_meta( $post_id, 'accordions_container_padding', true );
		if(empty($accordions_container_padding)){$accordions_container_padding = 0;}
		
		$accordions_container_bg_color = get_post_meta( $post_id, 'accordions_container_bg_color', true );
		if(empty($accordions_container_bg_color)){$accordions_container_bg_color = '#ffffff';}
		
		$accordions_container_text_align = get_post_meta( $post_id, 'accordions_container_text_align', true );
		if(empty($accordions_container_text_align)){$accordions_container_text_align = 'left';}
						
		$accordions_bg_img = get_post_meta( $post_id, 'accordions_bg_img', true );
		if(empty($accordions_bg_img)){$accordions_bg_img = '';}
		
		$accordions_icons_plus = get_post_meta( $post_id, 'accordions_icons_plus', true );
		if(empty($accordions_icons_plus)){$accordions_icons_plus = 'fa-chevron-up';}
		
		$accordions_icons_minus = get_post_meta( $post_id, 'accordions_icons_minus', true );
		if(empty($accordions_icons_minus)){$accordions_icons_minus = 'fa-chevron-down';}
						
		$accordions_icons_color = get_post_meta( $post_id, 'accordions_icons_color', true );
		if(empty($accordions_icons_color)){$accordions_icons_color = '#565656';}
		
		$accordions_icons_font_size = get_post_meta( $post_id, 'accordions_icons_font_size', true );
		if(empty($accordions_icons_font_size)){$accordions_icons_font_size = '16px';}
		
		$accordions_icons_position = get_post_meta( $post_id, 'accordions_icons_position', true );
		if(empty($accordions_icons_position)){$accordions_icons_position = 'left';}
		
		$accordions_default_bg_color = get_post_meta( $post_id, 'accordions_default_bg_color', true );
		if(empty($accordions_default_bg_color)){$accordions_default_bg_color = '#70b0ff';}

		$accordions_active_bg_color = get_post_meta( $post_id, 'accordions_active_bg_color', true );
		if(empty($accordions_active_bg_color)){$accordions_active_bg_color = '#4b8fe3';}
		
		$accordions_bg_color = get_post_meta( $post_id, 'accordions_bg_color', true );		
		if(empty($accordions_active_bg_color)){$accordions_active_bg_color = '#ffffff';}
		
		$accordions_items_title_color = get_post_meta( $post_id, 'accordions_items_title_color', true );
		if(empty($accordions_items_title_color)){$accordions_items_title_color = '#ffffff';}
				
		$accordions_items_title_font_size = get_post_meta( $post_id, 'accordions_items_title_font_size', true );
		if(empty($accordions_items_title_font_size)){$accordions_items_title_font_size = '14px';}

		$accordions_items_content_color = get_post_meta( $post_id, 'accordions_items_content_color', true );
		if(empty($accordions_items_content_color)){$accordions_items_content_color = '#333333';}
		
		$accordions_items_content_font_size = get_post_meta( $post_id, 'accordions_items_content_font_size', true );
		if(empty($accordions_items_content_font_size)){$accordions_items_content_font_size = '13px';}
		
		$accordions_items_content_bg_color = get_post_meta( $post_id, 'accordions_items_content_bg_color', true );
		if(empty($accordions_items_content_bg_color)){$accordions_items_content_bg_color = '#ffffff';}
		
		$accordions_content_title = get_post_meta( $post_id, 'accordions_content_title', true );
		if(empty($accordions_content_title)){$accordions_content_title = array('0'=>'Demo Title');}
		
		$accordions_content_body = get_post_meta( $post_id, 'accordions_content_body', true );
		if(empty($accordions_content_body)){$accordions_content_body = array('0'=>'Demo content');}
		
		$accordions_hide = get_post_meta( $post_id, 'accordions_hide', true );
		if(empty($accordions_hide)){$accordions_hide = array('0'=>'');}
				
		$accordions_custom_css = get_post_meta( $post_id, 'accordions_custom_css', true );				
		if(empty($accordions_hide)){$accordions_hide = '';}	
		
		
		/*tabs options*/
		$accordions_tabs_collapsible = get_post_meta( $post_id, 'accordions_tabs_collapsible', true );
		if(empty($accordions_tabs_collapsible)){$accordions_tabs_collapsible = 'true';}
		
		$accordions_tabs_active_event = get_post_meta( $post_id, 'accordions_tabs_active_event', true );	
		if(empty($accordions_tabs_active_event)){$accordions_tabs_active_event = 'click';}







