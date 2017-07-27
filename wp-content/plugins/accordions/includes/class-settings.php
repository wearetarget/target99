<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access

class class_accordions_settings{

    public function __construct(){

		add_action( 'admin_menu', array( $this, 'accordions_menu_init' ), 12 );

		}



	
	public function accordions_help(){
		include('menu/help.php');	
	}




	
	public	function accordions_menu_init(){

		add_submenu_page('edit.php?post_type=accordions', __('Help & Contact','accordions'), __('Help & Contact','accordions'), 'manage_options', 'accordions_paratheme_menu_help', array( $this, 'accordions_help' ));
		

		}






	}
	
new class_accordions_settings();