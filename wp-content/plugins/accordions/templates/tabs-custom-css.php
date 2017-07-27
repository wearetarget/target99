<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 
		

		$html .= "<style type='text/css'>";	
			

				
		$html .= '
		#accordions-tabs-'.$post_id.'{
				text-align: '.$accordions_container_text_align.';}';	
			

		$html .= '
		#accordions-tabs-'.$post_id.'{
				background:'.$accordions_container_bg_color.' url('.$accordions_bg_img.') repeat scroll 0 0;
				padding: '.$accordions_container_padding.';
				}';			

		$html .= '
		#accordions-tabs-'.$post_id.' .accordions-tab-head{
			color:'.$accordions_items_title_color.';
			font-size:'.$accordions_items_title_font_size.';
			background:'.$accordions_default_bg_color.';			
			}		
		
		#accordions-tabs-'.$post_id.' .accordions-head-title{
			
			}
		
		
		#accordions-tabs-'.$post_id.' .ui-tabs-active a{
			background: '.$accordions_active_bg_color.';
		
			}';


		$html .= '
		#accordions-tabs-'.$post_id.' .tabs-content{
				background:'.$accordions_items_content_bg_color.' none repeat scroll 0 0;
				color:'.$accordions_items_content_color.';
				font-size:'.$accordions_items_content_font_size.';
				}
				';


		$html .= '
		#accordions-tabs-'.$post_id.' .accordions-tab-icons{
				color:'.$accordions_icons_color.';
				font-size:'.$accordions_icons_font_size.';				
				}
				';		
	
	

		$html .= '</style>';
			
			
			
		if(!empty($accordions_custom_css)){
				$html .= '<style type="text/css">'.$accordions_custom_css.'</style>';	
			}
			
			
		
		
			
			
			
			