<?php

	$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
	$post_args = [
		'post_status'       => array('publish'),
		'post_type'         => array('post'),
		'posts_per_page'    => 10,
		'order'             => 'DSC',
		'orderby'           => 'date',
		'paged'             => $paged
	];

	$the_query = new WP_Query($post_args);

	get_header('blog');
?>


	<section class="archive-page">

		<div class="archive-page__posts-container">
			<div class="archive-page__posts-list">

				<?php
					 if ( $the_query->have_posts() ) {
						while ( $the_query->have_posts() ) {
							$the_query->the_post();

							$post_image_url = wp_get_attachment_image_src( get_post_thumbnail_id(), 'medium')[0];
							$content_width_class = !(bool)$post_image_url ? 'short-post__details--full' : '';

							include('templates/template-parts/template-part-news-short.php');
						}
						wp_reset_postdata();
					} else {
				?>
					<p><?php _e('There haven\'t been any posts yet. Check back soon!'); ?></p>
				<?php } ?>

			</div>
		</div>

		<div class="archive-page__pagination-container">
		</div>

	</section>

<?php get_footer(); ?>
