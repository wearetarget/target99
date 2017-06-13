<?php

	get_header();


	// Query the 404 page
	$args = [
		'page_id' => 1
	];

	$the_query = new WP_Query( $args );
	$the_query -> the_post();
	$featured_image_url = wp_get_attachment_image_src( get_post_thumbnail_id(), 'full')[0];
?>

	<section class="content">
		<div class="container container--content">
			<?php if ($featured_image_url) : ?>
				<img src="<?php echo $featured_image_url; ?>">
			<?php endif; ?>

			<div class="copy">
				<h1>404</h1>
				<?php the_content(); ?>
			</div>

		</div>
	</section>

<?php get_footer(); ?>
