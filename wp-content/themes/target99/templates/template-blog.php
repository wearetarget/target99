<?php

	/*
		Template Name: Blog
	*/

	// Post query arguments
	$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
	$posts_per_page = get_option( 'posts_per_page' );
	$post_args = [
		'post_status'       => array('publish'),
		'posts_per_page'    => 6,
		'post_type'         => array( 'post'),
		'order'             => 'DSC',
		'orderby'           => 'date',
		'paged'             => $paged
	];

	$the_query = new WP_Query($post_args);

	get_header();
?>

<section class="post-list">

	<section class="post-list__inner-container layout__content">
			<?php
				if ( $the_query->have_posts() ) {
					while ( $the_query->have_posts() ) {
						$the_query->the_post();
						$post_image_url = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'thumbnail' )[0];

						echo '<div class="post-list__post-container">';
						include('template-parts/template-part-post-short.php');
						echo "</div>";
					}

					wp_reset_postdata();
				} else {
			?>
				<p><?php _e('There haven\'t been any posts yet. Check back soon!'); ?></p>
			<?php } ?>

	</section>

	<div class="post-list__pagination-container">
		<?php custom_pagination($the_query->max_num_pages, "", $paged); ?>
	</div>

</section>

<?php get_footer(); ?>

