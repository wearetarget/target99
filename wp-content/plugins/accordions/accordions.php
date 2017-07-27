<?php
/*
Plugin Name: Accordions
Plugin URI: http://www.pickplugins.com/item/accordions-html-css3-responsive-accordion-grid-for-wordpress/
Description: Fully responsive and mobile ready accordion grid for wordpress.
Version: 2.0.18
Author: pickplugins
Author URI: http://pickplugins.com
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 


class Accordions{
	
	public function __construct(){

		define('accordions_plugin_url', plugins_url('/', __FILE__)  );
		define('accordions_plugin_dir', plugin_dir_path( __FILE__ ) );
		define('accordions_wp_url', 'https://wordpress.org/plugins/accordions/' );
		define('accordions_wp_reviews', 'http://wordpress.org/support/view/plugin-reviews/accordions' );
		define('accordions_pro_url','https://www.pickplugins.com/product/accordions/?ref=dashboard' );
		define('accordions_demo_url', 'http://pickplugins.com' );
		define('accordions_conatct_url', 'http://pickplugins.com/contact' );
		define('accordions_qa_url', 'http://www.pickplugins.com/questions/' );
		define('accordions_plugin_name', 'Accordions' );
		define('accordions_plugin_version', '2.0.18' );
		define('accordions_customer_type', 'free' );
		define('accordions_share_url', 'https://wordpress.org/plugins/accordions/' );
		define('accordions_tutorial_video_url', '//www.youtube.com/embed/h2wNFJaaY8s?rel=0' );

		define('accordions_textdomain', 'accordions' );

		require_once( plugin_dir_path( __FILE__ ) . 'includes/meta.php');
		require_once( plugin_dir_path( __FILE__ ) . 'includes/functions.php');
		
		require_once( plugin_dir_path( __FILE__ ) . 'includes/class-functions.php');
		require_once( plugin_dir_path( __FILE__ ) . 'includes/class-shortcodes.php');
		require_once( plugin_dir_path( __FILE__ ) . 'includes/class-settings.php');		
		
		

		add_action( 'wp_enqueue_scripts', array( $this, 'accordions_front_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'accordions_admin_scripts' ) );
		
		add_action( 'plugins_loaded', array( $this, 'accordions_load_textdomain' ));

		// DIsplay shortcode in widgets
		add_filter('widget_text', 'do_shortcode');
		
		add_filter( 'plugin_action_links_'.plugin_basename( __FILE__ ), array( $this, 'plugin_list_pro_link' ));		
		
		}
	
	
	public function accordions_load_textdomain() {
	  load_plugin_textdomain( accordions_textdomain, false, plugin_basename( dirname( __FILE__ ) ) . '/languages/' ); 
	}
	
	
	public function accordions_install(){
		
		do_action( 'accordions_action_install' );
		
		}		
		
	public function accordions_uninstall(){
		
		do_action( 'accordions_action_uninstall' );
		}		
		
	public function accordions_deactivation(){
		
		do_action( 'accordions_action_deactivation' );
		}
	
	
	public function accordions_front_scripts(){


		wp_enqueue_script( 'jquery' );
		wp_enqueue_script( 'jquery-ui-core' );
		wp_enqueue_script('jquery-ui-accordion');
		wp_enqueue_script('jquery-ui-tabs');		
		wp_enqueue_style('jquery-ui', plugins_url( 'assets/frontend/css/jquery-ui.min.css', __FILE__ ));
		wp_enqueue_style('accordions_style', plugins_url( 'assets/frontend/css/style.css', __FILE__ ));
		wp_enqueue_style('accordions_themes.style', plugins_url( 'assets/global/css/themes.style.css', __FILE__ ));
		wp_enqueue_style('accordions_themes.Tabs.style', plugins_url( 'assets/global/css/themesTabs.style.css', __FILE__ ));		
		wp_enqueue_style('font-awesome', plugins_url( 'assets/global/css/font-awesome.min.css', __FILE__ ));				

		}

	public function accordions_admin_scripts(){
		
		wp_enqueue_script('jquery');
		//wp_enqueue_script('jquery-ui-core');
		wp_enqueue_script('jquery-ui-sortable');
		wp_enqueue_script('accordions_admin_js', plugins_url( 'assets/admin/js/scripts.js' , __FILE__ ) , array( 'jquery' ));
		wp_localize_script( 'accordions_admin_js', 'L10n_accordions', array(
							'confirm_text' => __( 'Confirm', accordions_textdomain )
							));


		wp_enqueue_style('accordions_admin_style', plugins_url( 'assets/admin/css/style.css', __FILE__ ));
		wp_enqueue_style('font-awesome', plugins_url( 'assets/global/css/font-awesome.min.css', __FILE__ ));
		
		//ParaAdmin
		wp_enqueue_style('ParaAdmin', plugins_url( 'assets/admin/ParaAdmin/css/ParaAdmin.css', __FILE__ ));
		wp_enqueue_script('ParaAdmin', plugins_url( 'assets/admin/ParaAdmin/js/ParaAdmin.js' , __FILE__ ) , array( 'jquery' ));
		
		wp_enqueue_script('tooltipster.bundle.min', plugins_url( 'assets/admin/js/tooltipster.bundle.min.js' , __FILE__ ) , array( 'jquery' ));		
		wp_enqueue_style('tooltipster.bundle.min', plugins_url( 'assets/admin/css/tooltipster.bundle.min.css', __FILE__ ));		
		
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'accordions_color_picker', plugins_url('assets/admin/js/color-picker.js', __FILE__ ), array( 'wp-color-picker' ), false, true );
		

		}
	
	
	public function plugin_list_pro_link( $links ) {
	
			return array_merge(
				array(
					'get_premium' => '<a target="_blank" class="" style=" font-weight:bold;color:#f00;" href="https://www.pickplugins.com/product/accordions/?ref=wordpress.org">Buy Premium!</a>'
					),
				$links
			);
		
		}
	
	
	}

new Accordions();
