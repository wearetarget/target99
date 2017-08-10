<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 
		

	
			
			$html.= '<script>
					jQuery(document).ready(function($)
					{';
						

						
						$html.= '
						$( "#accordions-tabs-'.$post_id.'" ).tabs({
								collapsible: '.$accordions_tabs_collapsible.',
								event: "'.$accordions_tabs_active_event.'",							
								});
								';
	
							
				$html.= '	})

					</script>';