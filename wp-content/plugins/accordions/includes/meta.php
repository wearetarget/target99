<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access	

function accordions_posttype_register() {
 
        $labels = array(
                'name' => _x('Accordions', 'accordions'),
                'singular_name' => _x('Accordions', 'accordions'),
                'add_new' => _x('New Accordions', 'accordions'),
                'add_new_item' => __('New Accordions'),
                'edit_item' => __('Edit Accordions'),
                'new_item' => __('New Accordions'),
                'view_item' => __('View Accordions'),
                'search_items' => __('Search Accordions'),
                'not_found' =>  __('Nothing found'),
                'not_found_in_trash' => __('Nothing found in Trash'),
                'parent_item_colon' => ''
        );
 
        $args = array(
                'labels' => $labels,
                'public' => false,
                'publicly_queryable' => false,
                'show_ui' => true,
                'query_var' => true,
                'menu_icon' => null,
                'rewrite' => true,
                'capability_type' => 'post',
                'hierarchical' => false,
                'menu_position' => null,
                'supports' => array('title'),
				'menu_icon' => 'dashicons-editor-justify',
				
          );
 
        register_post_type( 'accordions' , $args );

}

add_action('init', 'accordions_posttype_register');





/**
 * Adds a box to the main column on the Post and Page edit screens.
 */
function meta_boxes_accordions()
	{
		$screens = array( 'accordions' );
		foreach ( $screens as $screen )
			{
				add_meta_box('accordions_metabox',__( 'Accordions Options','accordions' ),'meta_boxes_accordions_input', $screen);
			}
	}
add_action( 'add_meta_boxes', 'meta_boxes_accordions' );


function meta_boxes_accordions_input( $post ) {
	
	global $post;
	wp_nonce_field( 'meta_boxes_accordions_input', 'meta_boxes_accordions_input_nonce' );
	
	
	$accordions_collapsible = get_post_meta( $post->ID, 'accordions_collapsible', true );
	$accordions_heightStyle = get_post_meta( $post->ID, 'accordions_heightStyle', true );			
		
	$accordions_active_event = get_post_meta( $post->ID, 'accordions_active_event', true );		
	
	$accordions_container_padding = get_post_meta( $post->ID, 'accordions_container_padding', true );	
	$accordions_container_bg_color = get_post_meta( $post->ID, 'accordions_container_bg_color', true );
	$accordions_container_text_align = get_post_meta( $post->ID, 'accordions_container_text_align', true );	
	$accordions_bg_img = get_post_meta( $post->ID, 'accordions_bg_img', true );
	
	
	$accordions_themes = get_post_meta( $post->ID, 'accordions_themes', true );

	$accordions_icons_plus = get_post_meta( $post->ID, 'accordions_icons_plus', true );
	
	if(empty($accordions_icons_plus)){
		$accordions_icons_plus = apply_filters('accordions_filter_default_icon_plus', 'fa-chevron-up');
		}
	
	$accordions_icons_minus = get_post_meta( $post->ID, 'accordions_icons_minus', true );	

	if(empty($accordions_icons_minus)){
		$accordions_icons_minus = apply_filters('accordions_filter_default_icon_minus', 'fa-chevron-down');
		}
		

		
	$accordions_icons_color = get_post_meta( $post->ID, 'accordions_icons_color', true );
	$accordions_icons_font_size = get_post_meta( $post->ID, 'accordions_icons_font_size', true );

	
	$accordions_default_bg_color = get_post_meta( $post->ID, 'accordions_default_bg_color', true );	
	$accordions_active_bg_color = get_post_meta( $post->ID, 'accordions_active_bg_color', true );
	
	$accordions_items_title_color = get_post_meta( $post->ID, 'accordions_items_title_color', true );	
	$accordions_items_title_font_size = get_post_meta( $post->ID, 'accordions_items_title_font_size', true );

	
	$accordions_items_content_color = get_post_meta( $post->ID, 'accordions_items_content_color', true );	
	$accordions_items_content_font_size = get_post_meta( $post->ID, 'accordions_items_content_font_size', true );		
	$accordions_items_content_bg_color = get_post_meta( $post->ID, 'accordions_items_content_bg_color', true );		
	
	$accordions_content_title = get_post_meta( $post->ID, 'accordions_content_title', true );	
	$accordions_content_body = get_post_meta( $post->ID, 'accordions_content_body', true );
	
	$accordions_hide = get_post_meta( $post->ID, 'accordions_hide', true );	
 
	$accordions_custom_css = get_post_meta( $post->ID, 'accordions_custom_css', true );	

	$accordions_tabs_collapsible = get_post_meta( $post->ID, 'accordions_tabs_collapsible', true );



?>




    <div class="para-settings">


        
        
        <ul class="tab-nav">
        
           	<li nav="1" class="nav1 active"><i class="fa fa-code"></i> <?php _e('Shortcode','accordions'); ?></li>         
            <li nav="2" class="nav2"><i class="fa fa-list"></i> <?php _e('Accordions Options','accordions'); ?></li>        
            <li nav="3" class="nav3"><i class="fa fa-diamond"></i> <?php _e('Style','accordions'); ?></li>
            <li nav="4" class="nav4"><i class="fa fa-pencil-square-o"></i> <?php _e('Content','accordions'); ?></li>
            <li nav="5" class="nav5"><i class="fa fa-bug"></i> <?php _e('Custom CSS','accordions'); ?></li>            
            <li nav="6" class="nav6"><i class="fa fa-cogs"></i> <?php _e('Tabs Options','accordions'); ?></li>  
            
            
        </ul> <!-- para-tab-nav end -->
        
		<ul class="box">
            
            <li style="display: block;" class="box1 tab-box active">   
                <div class="option-box">
                    <p class="option-title"><?php _e('Accordions Shortcode','accordions'); ?></p>
                    <p class="option-info"><?php _e('Copy this shortcode and paste on page or post where you want to display accordions, Use PHP code to your themes file to display accordions.','accordions'); ?></p>
                <br /> 
                <textarea cols="50" rows="1" style="background:#bfefff" onClick="this.select();" >[accordions <?php echo 'id="'.$post->ID.'"';?>]</textarea>
                <br />
                
                To avoid conflict:<br />
                <textarea cols="50" rows="1" style="background:#bfefff" onClick="this.select();" >[accordions_pickplguins <?php echo 'id="'.$post->ID.'"';?>]</textarea><br />                
                <br />   
                
                PHP Code:<br />
                <textarea cols="50" rows="1" style="background:#bfefff" onClick="this.select();" ><?php echo '<?php echo do_shortcode("[accordions id='; echo "'".$post->ID."']"; echo '"); ?>'; ?></textarea>  
                
                
                 <p class="option-title"><?php _e('Tabs Shortcode','accordions'); ?><span style="color: rgb(96, 173, 252);padding: 0 5px;">(New)</span></p>
                <textarea cols="50" rows="1" style="background:#bfefff" onClick="this.select();" >[accordions_tabs <?php echo 'id="'.$post->ID.'"';?>]</textarea>
                <br />
                PHP Code:<br />
                <textarea cols="50" rows="1" style="background:#bfefff" onClick="this.select();" ><?php echo '<?php echo do_shortcode("[accordions_tabs id='; echo "'".$post->ID."']"; echo '"); ?>'; ?></textarea>  
                
                
                
                </div>
            </li>         
            
            
            <li style="display: none;" class="box2 tab-box active">
				<div class="option-box">
                    <p class="option-title"><?php _e('Collapsible','accordions'); ?></p>
                    <p class="option-info"></p>
                    <select class="accordions_collapsible" name="accordions_collapsible"  >
                    <option  value="true" <?php if($accordions_collapsible=="true") echo "selected"; ?>><?php _e('True','accordions'); ?></option>
                    <option  value="false" <?php if($accordions_collapsible=="false") echo "selected"; ?>><?php _e('False','accordions'); ?></option>
                                      
                    </select>
                </div>
                
                
				<div class="option-box">
                    <p class="option-title"><?php _e('heightStyle','accordions'); ?></p>
                    <p class="option-info"></p>
                    <select class="accordions_heightStyle" name="accordions_heightStyle"  >
                    <option  value="content" <?php if($accordions_heightStyle=="content") echo "selected"; ?>><?php _e('Content','accordions'); ?></option> 
                    <option  value="fill" <?php if($accordions_heightStyle=="fill") echo "selected"; ?>><?php _e('Fill','accordions'); ?></option>
                                     
                    </select>
                </div>                
  
                    
				<div class="option-box">
                    <p class="option-title"><?php _e('Activate event','accordions'); ?></p>
                    <p class="option-info"></p>
                    <select class="accordions_active_event" name="accordions_active_event"  >
                    <option  value="click" <?php if($accordions_active_event=="click") echo "selected"; ?>><?php _e('Click','accordions'); ?></option>
                    <option  value="mouseover" <?php if($accordions_active_event=="mouseover") echo "selected"; ?>><?php _e('Mouseover','accordions'); ?></option>
                                      
                    </select>
                </div>
  
                 
            </li>           
            
            <li style="display: none;" class="box3 tab-box ">

				<div class="option-box">
                    <p class="option-title"><?php _e('Themes','accordions'); ?></p>
                    <p class="option-info"></p>
                    
                    <?php
						$class_accordions_functions = new class_accordions_functions();
						
						$accordions_themes_list = $class_accordions_functions->accordions_themes();
						
					
					
					?>
                    
                    
                    <select class="accordions_themes" name="accordions_themes"  >
                    
                    
					<?php


						
						foreach($accordions_themes_list as $theme_key => $theme_name)
							{
	
								echo '<option  value="'.$theme_key.'" ';
								
								if($accordions_themes == $theme_key ) 
									{
									echo "selected";
									}
									
								echo '>';
								
								
								echo $theme_name.'</option>';
								
							}
                    
                    ?>
                    
                    
                    
                    
                    
                    
                    
                    
                    
                  
                    </select>
                </div>
                
                
                
                
                <div class="option-box">
                    <p class="option-title"><?php _e('Container options','accordions'); ?></p>
                    
                    

                    <p class="option-info"><?php _e('Text Align:','accordions'); ?></p>
                    <select name="accordions_container_text_align"  >
                    <option value="left" <?php if($accordions_container_text_align=="left")echo "selected"; ?>><?php _e('Left','accordions'); ?></option>
                    <option value="center" <?php if($accordions_container_text_align=="center")echo "selected"; ?>><?php _e('Center','accordions'); ?></option>                    
                    <option value="right" <?php if($accordions_container_text_align=="right")echo "selected"; ?>><?php _e('Right','accordions'); ?></option>                    
                    </select> 

                    <p class="option-info"><?php _e('Padding: (ex: 10px)','accordions'); ?></p>
                    <input type="text" name="accordions_container_padding" value="<?php echo $accordions_container_padding; ?>" />


                    <p class="option-info"><?php _e('Background color:','accordions'); ?></p>
                    <input type="text" class="accordions_color" name="accordions_container_bg_color" value="<?php echo $accordions_container_bg_color; ?>" />
                    
                    <p class="option-info"><?php _e('Background image:','accordions'); ?></p>
                    <img class="bg_image_src" onClick="bg_img_src(this)" src="<?php echo accordions_plugin_url; ?>assets/global/images/bg/dark_embroidery.png" />
                    <img class="bg_image_src" onClick="bg_img_src(this)" src="<?php echo accordions_plugin_url; ?>assets/global/images/bg/dimension.png" />
                    <img class="bg_image_src" onClick="bg_img_src(this)" src="<?php echo accordions_plugin_url; ?>assets/global/images/bg/eight_horns.png" /> 
                    <br />                    
                    <input type="text" id="accordions_bg_img" class="accordions_bg_img" name="accordions_bg_img" value="<?php echo $accordions_bg_img; ?>" /> <div onClick="clear_container_bg_image()" class="button clear-container-bg-image"> <?php _e('Clear','accordions'); ?></div>
                    
                    <script>
					
					function bg_img_src(img){
						
						src =img.src;
						
						document.getElementById('accordions_bg_img').value  = src;
						
						}
					
					function clear_container_bg_image(){

						document.getElementById('accordions_bg_img').value  = '';
						
						}					
					
					
					</script>
                    
                    
                    
                         
                    
                                                        

                </div> 
                

                
				                
                
				<div class="option-box">
                    <p class="option-title"><?php _e('Icon set','accordions'); ?></p>
                    <p class="option-info"><?php _e('Please use font awesome icon id. ex: <b>fa-chevron-up</b>, please visit to see more <a href="https://fortawesome.github.io/Font-Awesome/icons/">https://fortawesome.github.io/Font-Awesome/icons/</a>','accordions'); ?></p>

                    	
                    <p class="option-info"><?php _e('Plus Icon.','accordions'); ?></p>
                    <span title="Plus Icon" class="accordions_icons_custom_plus"><i class="fa <?php echo $accordions_icons_plus; ?>"></i></span>
                    <input type="text" class="accordions_icons_custom_plus_input" name="accordions_icons_plus" value="<?php if(!empty($accordions_icons_plus)) echo $accordions_icons_plus; ?>" />
                    
                    <p class="option-info"><?php _e('Minus Icon.','accordions'); ?></p>
                    <span title="Minus Icon" class="accordions_icons_custom_minus"><i class="fa <?php echo $accordions_icons_minus; ?>"></i></span>
                    <input type="text" class="accordions_icons_custom_minus_input" name="accordions_icons_minus" value="<?php if(!empty($accordions_icons_minus)) echo $accordions_icons_minus; ?>" />


                    <p class="option-info"><?php _e('Icon color.','accordions'); ?></p>
                    <input type="text" name="accordions_icons_color" class="accordions_color" id="accordions_icons_color" value="<?php if(!empty($accordions_icons_color)) echo $accordions_icons_color; else echo "#565656"; ?>" />
                    
                    
                    <p class="option-info"><?php _e('Icon font size.','accordions'); ?></p>
                    <input type="text" name="accordions_icons_font_size" placeholder="20px" id="accordions_icons_font_size" value="<?php if(!empty($accordions_icons_font_size)) echo $accordions_icons_font_size; ?>" />                    

  
                        
                    </div>



				<div class="option-box">
                    <p class="option-title"><?php _e('Accordions Header.','accordions'); ?></p>
                    
                    <p class="option-info"><?php _e('Default Background Color.','accordions'); ?></p>
                    <input type="text" name="accordions_default_bg_color" class="accordions_color" id="accordions_default_bg_color" value="<?php if(!empty($accordions_default_bg_color)) echo $accordions_default_bg_color; else echo "#70b0ff"; ?>" />
                    
                    
                    <p class="option-info"><?php _e('Active Background Color.','accordions'); ?></p>
                    <input type="text" class="accordions_color" name="accordions_active_bg_color" id="accordions_active_bg_color" value="<?php if(!empty($accordions_active_bg_color)) echo $accordions_active_bg_color; else echo "#4b8fe3"; ?>" />
                    
                    
                    <p class="option-info"><?php _e('Accordions Header Font Color.','accordions'); ?></p>
                    <input type="text" class="accordions_color" name="accordions_items_title_color" id="accordions_items_title_color" value="<?php if(!empty($accordions_items_title_color)) echo $accordions_items_title_color; else echo "#ffffff"; ?>" />                
                
                	<p class="option-info"><?php _e('Accordions Header Font Size.','accordions'); ?></p>
                	<input type="text" name="accordions_items_title_font_size" placeholder="ex:14px number with px" id="accordions_items_title_font_size" value="<?php if(!empty($accordions_items_title_font_size)) echo $accordions_items_title_font_size; else echo "14px"; ?>" />
                    
                
                </div>

				<div class="option-box">
                    <p class="option-title"><?php _e('Accordions Content.','accordions'); ?></p>
                    <p class="option-info"><?php _e('Accordions Content Font Color.','accordions'); ?></p>
                    <input type="text" class="accordions_color" name="accordions_items_content_color" id="accordions_items_content_color" value="<?php if(!empty($accordions_items_content_color)) echo $accordions_items_content_color; else echo "#333333"; ?>" />
                    
                    <p class="option-info"><?php _e('Accordions Content Font Size.','accordions'); ?></p>
                    <input type="text" name="accordions_items_content_font_size" id="accordions_items_content_font_size" value="<?php if(!empty($accordions_items_content_font_size)) echo $accordions_items_content_font_size; else echo "13px"; ?>" />
                    
                    <p class="option-info"><?php _e('Accordions Content Background Color.','accordions'); ?></p>
                    <input type="text" class="accordions_color" name="accordions_items_content_bg_color" id="accordions_items_content_bg_color" value="<?php if(!empty($accordions_items_content_bg_color)) echo $accordions_items_content_bg_color; ?>" />
                    

                </div>
                
              
                            
            </li>
            <li style="display: none;" class="box4 tab-box ">
				<div class="option-box">
                    <p class="option-title"><?php _e('Content','accordions'); ?></p>
                    <p class="option-info"><?php _e('You can sorting accordion by dragging each title, click to expand title and see the input.','accordions'); ?></p>
                    
                    <div class="accordions-content-buttons" >
                        <div class="button add-accordions"><?php _e('Add','accordions'); ?></div>                       
                        <br />
                        <br />
                    </div>
                    
				<div class="accordions-content expandable" id="accordions-content">

                <?php
               // $total_row = count($accordions_content_title);
				
				if(empty($accordions_content_title))
					{
						$accordions_content_title = array('0'=>'Demo Title');
					}
				$i=0;
				foreach ($accordions_content_title as $accordions_key => $accordions_title)
					{
						
						if(empty($accordions_content_body[$accordions_key]))
							{
								$accordions_content_body[$accordions_key] = 'Demo Content';
							}
					
					?>
                    
                    <div class="items">

                        <div   class="section-header">
                        	<span title="Drag to sort." class="move accordions-tooltip"><i class="fa fa-bars"></i></span>
                            <span title="Click to Expand or collapse" class="expand-compress accordions-tooltip"><i class="fa fa-expand"></i><i class="fa fa-compress"></i></span>
                        	<div class="accordions-title-preview">
                            <?php if(!empty($accordions_title)) echo $accordions_title; ?>
                            </div>
							
                       		<span class="removeaccordions"><?php _e('Remove', accordions_textdomain); ?></span>
                        
                        <?php
                        
							if(!empty($accordions_hide[$accordions_key]))
								{
									$checked = 'checked';
								}
							else
								{
									$checked = '';
								}
						
						
						?>
                        
                        <label class="switch" ><input  type="checkbox" name="accordions_hide[<?php echo $accordions_key; ?>]" value="1" <?php echo $checked; ?> /><?php _e('Hide on Frontend','accordions'); ?></label>

                        
                        </div>
                        <div class="section-panel">

                         <strong><?php _e('Header','accordions'); ?></strong> <br>
                        <input style="width:80%" placeholder="Accordion header" type="text" name="accordions_content_title[<?php echo $accordions_key; ?>]" value="<?php if(!empty($accordions_title)) echo htmlentities($accordions_title); ?>" /><br><br>

      
                   <strong><?php _e('Content','accordions'); ?></strong> <br>
<?php

	wp_editor( $accordions_content_body[$accordions_key], 'accordions_content_body'.$accordions_key, $settings = array('textarea_name'=>'accordions_content_body['.$accordions_key.']') );


?>
                        </div>


                    
                    </div>
                    <?php
					
					$i++;
					}
				
				?>

</div>


 <script>
 jQuery(document).ready(function($)
	{
		$(function() {
			$( "#accordions-content" ).sortable({ handle: '.move' });
			//$( ".items-container" ).disableSelection();
		});


		// to add editor on textarea
		tinyMCE.init({
			mode : "none",
			statusbar: false,
			menubar: false,
			statusbar: true,
			setup: function (editor) {
				editor.on('change', function () {
					editor.save();
				});
				
			},
		});
		

		$(document).on('click', '.accordions-content-buttons .add-accordions', function()
			{	
				
				var unique_key = $.now();
				
				$("#accordions_metabox .accordions-content").append('<div class="items" valign="top"><div class="section-header"><span class="move"><i class="fa fa-bars"></i></span><span class="expand-compress"><i class="fa fa-expand"></i><i class="fa fa-compress"></i></span><div class="accordions-title-preview">Demo Title #'+unique_key+'</div><span class="removeaccordions">Remove</span><label class="switch"><input type="checkbox" value="1" name="accordions_hide['+unique_key+']">Hide on Frontend</label></div><div class="section-panel"><strong><?php _e('Header',accordions_textdomain); ?></strong> <br><input style="width:80%" placeholder="<?php echo __('Accordion header', accordions_textdomain); ?>" type="text" name="accordions_content_title['+unique_key+']" value="" /><br> <br /><strong><?php _e('Content', accordions_textdomain); ?></strong> <br><textarea class="accordion-content-textarea" id="content-'+unique_key+'" placeholder="Accordion content" name="accordions_content_body['+unique_key+']" ></textarea></div></div>');
				
				tinyMCE.execCommand('mceAddEditor', false, 'content-'+unique_key);
				
			})


})

</script>



                </div>  
            </li>
        
        
            
            <li style="display: none;" class="box5 tab-box ">
				<div class="option-box">
                    <p class="option-title"><?php _e('Custom CSS for this Accordions','accordions'); ?></p>
                    <p class="option-info"><?php _e('Do not use &lt;style>&lt;/style> tag, you can use bellow prefix to your css, sometime you need use "!important" to overrid.','accordions'); ?><br/>
                    
                    <b>#accordions-<?php echo $post->ID; ?></b>
                    <br/></p>
                    
                    
                    
                    
                   	<?php
                    
					$accordions_id = $post->ID;
					
					
					$empty_css_sample = '#accordions-'.$accordions_id.'{}\n#accordions-'.$accordions_id.' .accordions-head{}\n#accordions-'.$accordions_id.' .accordion-content{}';
					
					
					?>
                    
                    
                    
                    <textarea style="width:80%; min-height:150px" name="accordions_custom_css" ><?php if(!empty($accordions_custom_css)) echo htmlentities($accordions_custom_css); else echo str_replace('\n', PHP_EOL, $empty_css_sample); ?></textarea>
                    
                    
                </div> 
            
        	</li>
        	
            <li style="display: none;" class="box6 tab-box ">
            
				<div class="option-box">
                    <p class="option-title"><?php _e('Collapsible','accordions'); ?></p>
                    <p class="option-info"></p>
                    <select class="accordions_tabs_collapsible" name="accordions_tabs_collapsible"  >
                    <option  value="true" <?php if($accordions_tabs_collapsible=="true") echo "selected"; ?>><?php _e('True','accordions'); ?></option>
                    <option  value="false" <?php if($accordions_tabs_collapsible=="false") echo "selected"; ?>><?php _e('False','accordions'); ?></option>
                                      
                    </select>

                </div>  
                
				
                

            </li>
         
            
        
        </ul>
        


    </div> <!-- para-settings -->



<?php


	
}

/**
 * When the post is saved, saves our custom data.
 *
 * @param int $post_id The ID of the post being saved.
 */
function meta_boxes_accordions_save( $post_id ) {

  /*
   * We need to verify this came from the our screen and with proper authorization,
   * because save_post can be triggered at other times.
   */

  // Check if our nonce is set.
  if ( ! isset( $_POST['meta_boxes_accordions_input_nonce'] ) )
    return $post_id;

  $nonce = $_POST['meta_boxes_accordions_input_nonce'];

  // Verify that the nonce is valid.
  if ( ! wp_verify_nonce( $nonce, 'meta_boxes_accordions_input' ) )
      return $post_id;

  // If this is an autosave, our form has not been submitted, so we don't want to do anything.
  if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
      return $post_id;



  /* OK, its safe for us to save the data now. */

  // Sanitize user input.
 	$accordions_collapsible = sanitize_text_field( $_POST['accordions_collapsible'] );	   
  	$accordions_heightStyle = sanitize_text_field( $_POST['accordions_heightStyle'] );	  

		  
 
  	$accordions_active_event = sanitize_text_field( $_POST['accordions_active_event'] ); 		

	$accordions_container_padding = sanitize_text_field( $_POST['accordions_container_padding'] );	
	$accordions_container_bg_color = sanitize_text_field( $_POST['accordions_container_bg_color'] );
	$accordions_container_text_align = sanitize_text_field( $_POST['accordions_container_text_align'] );		 
	$accordions_bg_img = sanitize_text_field( $_POST['accordions_bg_img'] );
		
	$accordions_themes = sanitize_text_field( $_POST['accordions_themes'] );
	$accordions_icons_plus = sanitize_text_field( $_POST['accordions_icons_plus'] );
	$accordions_icons_minus = sanitize_text_field( $_POST['accordions_icons_minus'] );
	$accordions_icons_color = sanitize_text_field( $_POST['accordions_icons_color'] );	
	$accordions_icons_font_size = sanitize_text_field( $_POST['accordions_icons_font_size'] );			
	

	$accordions_default_bg_color = sanitize_text_field( $_POST['accordions_default_bg_color'] );	
	$accordions_active_bg_color = sanitize_text_field( $_POST['accordions_active_bg_color'] );


	$accordions_items_title_color = sanitize_text_field( $_POST['accordions_items_title_color'] );	
	$accordions_items_title_font_size = sanitize_text_field( $_POST['accordions_items_title_font_size'] );


	$accordions_items_content_color = sanitize_text_field( $_POST['accordions_items_content_color'] );	
	$accordions_items_content_font_size = sanitize_text_field( $_POST['accordions_items_content_font_size'] );	
	$accordions_items_content_bg_color = sanitize_text_field( $_POST['accordions_items_content_bg_color'] );		
	
	$accordions_content_title = stripslashes_deep( $_POST['accordions_content_title'] );	
	$accordions_content_body = stripslashes_deep( $_POST['accordions_content_body'] );		
	
	
	
	
	if(empty($_POST['accordions_hide']))
		{
			$_POST['accordions_hide'] = '';	
		}
	
	$accordions_hide = stripslashes_deep( $_POST['accordions_hide'] );	
	
	$accordions_custom_css = stripslashes_deep( $_POST['accordions_custom_css'] );			


	$accordions_tabs_collapsible = sanitize_text_field( $_POST['accordions_tabs_collapsible'] );


  // Update the meta field in the database.
 	update_post_meta( $post_id, 'accordions_collapsible', $accordions_collapsible );
 	update_post_meta( $post_id, 'accordions_heightStyle', $accordions_heightStyle );		  

 	update_post_meta( $post_id, 'accordions_active_event', $accordions_active_event );				  

	update_post_meta( $post_id, 'accordions_container_padding', $accordions_container_padding );	
	update_post_meta( $post_id, 'accordions_container_bg_color', $accordions_container_bg_color );
	update_post_meta( $post_id, 'accordions_container_text_align', $accordions_container_text_align );	 
	 
	update_post_meta( $post_id, 'accordions_bg_img', $accordions_bg_img );	
	update_post_meta( $post_id, 'accordions_themes', $accordions_themes );

	update_post_meta( $post_id, 'accordions_icons_plus', $accordions_icons_plus );
	update_post_meta( $post_id, 'accordions_icons_minus', $accordions_icons_minus );
	update_post_meta( $post_id, 'accordions_icons_color', $accordions_icons_color );
	update_post_meta( $post_id, 'accordions_icons_font_size', $accordions_icons_font_size );		


	update_post_meta( $post_id, 'accordions_default_bg_color', $accordions_default_bg_color );
	update_post_meta( $post_id, 'accordions_active_bg_color', $accordions_active_bg_color );


	update_post_meta( $post_id, 'accordions_items_title_color', $accordions_items_title_color );
	update_post_meta( $post_id, 'accordions_items_title_font_size', $accordions_items_title_font_size );


	update_post_meta( $post_id, 'accordions_items_content_color', $accordions_items_content_color );
	update_post_meta( $post_id, 'accordions_items_content_font_size', $accordions_items_content_font_size );
	update_post_meta( $post_id, 'accordions_items_content_bg_color', $accordions_items_content_bg_color );	
	
	update_post_meta( $post_id, 'accordions_content_title', $accordions_content_title );
	update_post_meta( $post_id, 'accordions_content_body', $accordions_content_body );	
	
	
	
	update_post_meta( $post_id, 'accordions_hide', $accordions_hide );

	update_post_meta( $post_id, 'accordions_custom_css', $accordions_custom_css );
	
	
	update_post_meta( $post_id, 'accordions_tabs_collapsible', $accordions_tabs_collapsible );



}
add_action( 'save_post', 'meta_boxes_accordions_save' );
