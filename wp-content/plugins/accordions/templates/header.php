<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 
		
	$accordions_title = apply_filters( 'accordions_filter_title', $accordions_title );
	$html_icons = '';


	if(empty($accordions_title)){
		$accordions_title = '&nbsp;';
		}


	if(!empty($accordions_bg_color[$index])){
		$header_style = 'background-color:'.$accordions_bg_color[$index];
		}
	else{
		$header_style = '';
		}


	if(!empty($accordions_section_icon_plus[$index])){

		$accordions_icons_plus_section = $accordions_section_icon_plus[$index];
		}
	else{
		
		$accordions_icons_plus_section = $accordions_icons_plus;
		}
		
	if(!empty($accordions_section_icon_minus[$index])){
		
		$accordions_icons_minus_section = $accordions_section_icon_minus[$index];
		}
	else{
		$accordions_icons_minus_section = $accordions_icons_minus;
		}	




	$html.= '<div style="'.$header_style.'" class="accordions-head">';
	
	
	if($accordions_icons_position=='left'){
		
		$html.= '<i class="accordion-icons left accordion-plus fa '.$accordions_icons_plus_section.'"></i>';
		$html.= '<i class="accordion-icons left accordion-minus fa fa-arrow-down '.$accordions_icons_minus_section.'"></i>';
	
		}

	
	$html.= '<span class="accordions-head-title">'.do_shortcode($accordions_title).'</span>';
	
	if($accordions_icons_position=='right'){
		
		$html.= '<i class="accordion-icons right accordion-plus fa '.$accordions_icons_plus_section.'"></i>';
		$html.= '<i class="accordion-icons right accordion-minus fa '.$accordions_icons_minus_section.'"></i>';
	
		}	

	
	$html.= '</div>'; //accordions-head