<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 
		
	$accordions_tabs_content = apply_filters( 'accordions_tabs_filter_content', $accordions_content_body[$index] );	
	
	if(empty($accordions_tabs_content)){
		$accordions_tabs_content = '&nbsp;';
		}
	
	$html.= ''.wpautop($accordions_tabs_content).'';
