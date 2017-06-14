<?php

	/*
		Template Name: Promo
	*/

	// Post query arguments
	$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
	$post_args = [
		'post_status'       => array('publish'),
		'posts_per_page'    => 10,
		'post_type'         => array( 'post'),
		'order'             => 'DSC',
		'orderby'           => 'date',
		'paged'             => $paged
	];

	$the_query = new WP_Query($post_args);

	get_header();
?>

<section class="post-page">

	<section class="post-page__posts-container">
			<?php
				if ( $the_query->have_posts() ) {
					while ( $the_query->have_posts() ) {
						$the_query->the_post();
						$post_image_url = wp_get_attachment_image_src( get_post_thumbnail_id(), 'medium')[0];
						$content_width_class = (bool)$post_image_url ? '' : 'news-post-single__details--full';

						include('template-parts/template-part-news-short.php');
					}

					wp_reset_postdata();
				} else {
			?>
				<p><?php _e('There haven\'t been any posts yet. Check back soon!'); ?></p>
			<?php } ?>

	</section>

	<div class="post-page__pagination-container">
	</div>

</section>

<?php get_footer(); ?>

