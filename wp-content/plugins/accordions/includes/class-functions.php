<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access


class class_accordions_functions  {
	
	
    public function __construct(){
				
		//add_action( 'admin_menu', array( $this, 'admin_menu' ), 12 );
       //add_action('admin_menu', array($this, 'create_menu'));
    }
	




		
	public function accordions_themes($themes = array())
		{

			$themes = array( 
							'flat'=>'Flat',					
							'border-bottom'=>'Border Bottom',																		
							);
			
			foreach(apply_filters( 'accordions_themes', $themes ) as $theme_key=> $theme_name)
				{
					$theme_list[$theme_key] = $theme_name;
				}

			
			return $theme_list;

		}
	
		
		

		
	public function our_plugins(){
		
		$plugins_data = array(
							

			'post-grid'=>array(			
								'title'=>'Post Grid',
								'content'=>'Awesome post grid for query post from any post type and display on grid.',
								'item_link'=>'http://www.pickplugins.com/item/post-grid-create-awesome-grid-from-any-post-type-for-wordpress/',
								'item_link_free'=>'https://wordpress.org/plugins/post-grid/',
								'thumb'=>accordions_plugin_url.'includes/menu/images/post-grid.png',							
			),	


			'team'=>array(			
								'title'=>'Team',
								'content'=>'Fully responsive and mobile ready meet the team showcase plugin for wordpress.',
								'item_link'=>'http://www.pickplugins.com/item/team-responsive-meet-the-team-grid-for-wordpress/',
								'item_link_free'=>'https://wordpress.org/plugins/team/',
								'thumb'=>accordions_plugin_url.'includes/menu/images/team.png',							
			),	

			'job-board-manager'=>array(			
								'title'=>'Job Board Manager',
								'content'=>' Awesome Job Board Manager.',
								'item_link'=>'https://wordpress.org/plugins/job-board-manager/',
								'item_link_free'=>'https://wordpress.org/plugins/job-board-manager/',
								'thumb'=>accordions_plugin_url.'includes/menu/images/job-board-manager.png',							
			),

			'classified-maker'=>array(			
								'title'=>'Classified Maker',
								'content'=>'Create Awesome Classified Website in a Minute.',
								'item_link'=>'https://wordpress.org/plugins/classified-maker/',
								'item_link_free'=>'https://wordpress.org/plugins/classified-maker/',
								'thumb'=>accordions_plugin_url.'includes/menu/images/classified-maker.png',							
			),


			'woocommerce-products-slider'=>array(			
								'title'=>'Woocommerce Products Slider',
								'content'=>'Fully responsive and mobile ready Carousel Slider for your woo-commerce product.',
								'item_link'=>'http://www.pickplugins.com/item/woocommerce-products-slider-for-wordpress/',
								'item_link_free'=>'https://wordpress.org/plugins/woocommerce-products-slider/',
								'thumb'=>accordions_plugin_url.'includes/menu/images/woocommerce-products-slider.png',							
			),


			'user-profile'=>array(			
								'title'=>'User Profile',
								'content'=>'Create beautiful user profile page for your WordPress powered website.',
								'item_link'=>'http://www.pickplugins.com/product/user-profile/',
								'item_link_free'=>'https://wordpress.org/plugins/user-profile/',
								'thumb'=>accordions_plugin_url.'includes/menu/images/user-profile.png',							
			),







		);

		
		$plugins_data = apply_filters('pickplugins_plugins', $plugins_data);
		
		$html= '';
		
		$html.= '<div class="our-plugins">';
		
		foreach($plugins_data as $key=>$plugin){
			
			$html.= '<div class="single">';
			
			$html.= '<div class="thumb"><a href="'.$plugin['item_link'].'"><img src="'.$plugin['thumb'].'" /></a></div>';			
			$html.= '<div class="title"><a href="'.$plugin['item_link'].'">'.$plugin['title'].'</a></div>';
			$html.= '<div class="content">'.$plugin['content'].'</div>';			
			

			$html.= '</div>';
			
		
			
			}	
			
		$html.= '</div>';
			
				
		return $html;
		
		
		}
		
		
		

		
		
		
		
		
		
	}
	
new class_accordions_functions();