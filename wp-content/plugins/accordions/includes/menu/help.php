<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access


?>



<div class="wrap">
	<h2><?php echo accordions_plugin_name ." ".__('Help','accordions');?>
    </h2>
    <br />



    <div class="para-settings">
        <ul class="tab-nav"> 
            <li nav="1" class="nav1 active"><i class="fa fa-hand-o-right"></i> <?php _e('Help & Support','accordions'); ?></li>
            <li nav="2" class="nav2"><i class="fa fa-star"></i> <?php _e('Our Plugins','accordions'); ?></li>            
        </ul> <!-- tab-nav end -->  
        
		<ul class="box">
        
            <li style="display: block;" class="box1 tab-box active">
				<div class="option-box">
                    <p class="option-title"><?php _e('Need Help ?','accordions'); ?></p>
                    <p class="option-info"><?php _e('Feel free to contact with any issue for this plugin, Ask any question via forum','accordions'); ?> <a href="<?php echo accordions_qa_url; ?>"><?php echo accordions_qa_url; ?></a><br />


                    </p>

                </div>
                
                <?php
                
				if(accordions_customer_type=='free'):
				
				?>
                
				<div class="option-box">
                    <p class="option-title"><?php _e('Try Premium','accordions'); ?></p>
                    
					<?php
                    
					echo 'You are using <strong> '.accordions_customer_type.' version  '.accordions_plugin_version.'</strong> of <strong>'.accordions_plugin_name.'</strong>, To get more feature you could try our premium version. ';
					
					echo '<br /><a href="'.accordions_pro_url.'">'.accordions_pro_url.'</a>';
					
					?>
                </div>  
                
                
                
                <?php
				
				endif;
				
				?>
                
              
                
                
                
                
                
                
				<div class="option-box">
                    <p class="option-title"><?php _e('Submit Reviews.','accordions'); ?></p>
                    <p class="option-info"><?php _e('We are working hard to build some awesome plugins for you and spend thousand hour for plugins. we wish your three(3) minute by submitting five star reviews at wordpress.org. if you have any issue please submit at forum.','accordions'); ?></p>
                	<img src="<?php echo accordions_plugin_url."assets/admin/css/five-star.png";?>" /><br />
                    <a target="_blank" href="<?php echo accordions_wp_reviews; ?>">
                		<?php echo accordions_wp_reviews; ?>
               		</a>

                </div>
                
                
                
				<div class="option-box">
                    <p class="option-title"><?php _e('Documentation.','accordions'); ?></p>
                    <p class="option-info"><?php _e('Please go following link for documentation','accordions'); ?></p>
                	
                    <a target="_blank" href="http://pickplugins.com/docs/documentation/accordions/">http://pickplugins.com/docs/documentation/accordions/</a>

                </div>                
                
                
                
                
                
				<div class="option-box">
                    <p class="option-title"><?php _e('Please Share','accordions'); ?></p>
                    <p class="option-info"><?php _e('If you like this plugin please share with your social share network.','accordions'); ?></p>
                    <?php
                    
						echo accordions_share_plugin();
					?>
                </div>

            </li>        
        
        	<li style="display: none;" class="box2 tab-box">
            
            <?php
            
			$class_accordions_functions = new class_accordions_functions();
			
			echo $class_accordions_functions->our_plugins();
			
			?>
            
            
            </li>
    
    </div>

        
</div> <!-- wrap end -->