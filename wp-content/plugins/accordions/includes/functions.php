<?php

/*
* @Author 		pickplugins
* Copyright: 	2015 pickplugins
*/

if ( ! defined('ABSPATH')) exit;  // if direct access








function accordions_add_shortcode_column( $columns ) {
    return array_merge( $columns, 
        array( 'shortcode' => __( 'Shortcode', 'accordions' ) ) );
}
add_filter( 'manage_accordions_posts_columns' , 'accordions_add_shortcode_column' );


function accordions_posts_shortcode_display( $column, $post_id ) {
    if ($column == 'shortcode'){
		?>
        <input style="background:#bfefff" type="text" onClick="this.select();" value="[accordions <?php echo 'id=&quot;'.$post_id.'&quot;';?>]" /><br />
      <textarea cols="50" rows="1" style="background:#bfefff" onClick="this.select();" ><?php echo '<?php echo do_shortcode("[accordions id='; echo "'".$post_id."']"; echo '"); ?>'; ?></textarea>
        <?php		
		
    }
}
add_action( 'manage_accordions_posts_custom_column' , 'accordions_posts_shortcode_display', 10, 2 );


function accordions_paratheme_dark_color($input_color)
	{
		if(empty($input_color))
			{
				return "";
			}
		else
			{
				$input = $input_color;
			  
				$col = Array(
					hexdec(substr($input,1,2)),
					hexdec(substr($input,3,2)),
					hexdec(substr($input,5,2))
				);
				$darker = Array(
					$col[0]/2,
					$col[1]/2,
					$col[2]/2
				);
		
				return "#".sprintf("%02X%02X%02X", $darker[0], $darker[1], $darker[2]);
			}

		
		
	}
	
	function accordions_share_plugin()
		{
			
			?>
            <iframe src="//www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwordpress.org%2Fplugins%2Faccordions&amp;width&amp;layout=standard&amp;action=like&amp;show_faces=true&amp;share=true&amp;height=80&amp;appId=652982311485932" scrolling="no" frameborder="0" style="border:none; overflow:hidden; height:80px;" allowTransparency="true"></iframe>
            
            <br />
            <!-- Place this tag in your head or just before your close body tag. -->
            <script src="https://apis.google.com/js/platform.js" async defer></script>
            
            <!-- Place this tag where you want the +1 button to render. -->
            <div class="g-plusone" data-size="medium" data-annotation="inline" data-width="300" data-href="<?php echo accordions_share_url; ?>"></div>
            
            <br />
            <br />
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="<?php echo accordions_share_url; ?>" data-text="<?php echo accordions_plugin_name; ?>" data-via="ParaTheme" data-hashtags="WordPress">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>



            <?php
			
			
			
		
		
		}
	
	
	

	
	
	
	