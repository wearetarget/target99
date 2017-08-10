<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 
		
	$accordions_content = apply_filters( 'accordions_filter_content', $accordions_content_body[$index] );	
	
	if(empty($accordions_content)){
		$accordions_content = '&nbsp;';
		}
	
	$html.= '<div class="accordion-content">'.wpautop($accordions_content).'</div>';
