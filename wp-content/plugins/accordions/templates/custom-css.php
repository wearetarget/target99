<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 
		

		$html .= "<style type='text/css'>";	
			
				
		$html .= '
		#accordions-'.$post_id.'{
				text-align: '.$accordions_container_text_align.';}';	
			

		$html .= '
		#accordions-'.$post_id.'{
				background:'.$accordions_container_bg_color.' url('.$accordions_bg_img.') repeat scroll 0 0;
				padding: '.$accordions_container_padding.';
				}';			

		$html .= '
		#accordions-'.$post_id.' .accordions-head{
			color:'.$accordions_items_title_color.';
			font-size:'.$accordions_items_title_font_size.';
			background:'.$accordions_default_bg_color.';		
			}		
		
		#accordions-'.$post_id.' .accordions-head-title{
			
			}
		
		
		#accordions-'.$post_id.' .ui-accordion-header-active{
			background: '.$accordions_active_bg_color.';
		
			}';


		$html .= '
		#accordions-'.$post_id.' .accordion-content{
				background:'.$accordions_items_content_bg_color.' none repeat scroll 0 0;
				color:'.$accordions_items_content_color.';
				font-size:'.$accordions_items_content_font_size.';
				}
				';


		$html .= '
		#accordions-'.$post_id.' .accordion-icons{
				color:'.$accordions_icons_color.';
				font-size:'.$accordions_icons_font_size.';				
				}
				';		
	
	

		$html .= '</style>';
			
			
			
		if(!empty($accordions_custom_css)){
				$html .= '<style type="text/css">'.$accordions_custom_css.'</style>';	
			}