<?php
	$category = get_the_category()[0];
	$post_image_url = wp_get_attachment_image_src( get_post_thumbnail_id(), 'full' )[0];
	$promos = get_field('related_promos');
	get_header();
	the_post();
?>

<section class="waste-article">
	<div class="waste-article__content">
		<?php the_content(); ?>

	</div>

	<div class="waste-article__promo-container">
		<?php
				if( $promos ): ?>
		<?php foreach( $promos as $promo): ?>
		<div class="waste-article__promo-item">
			<div class="promo">
				<a class="promo__title-container" href="<?php echo get_field('promo-file', $promo->ID)['url']; ?>" target="_blank">
					<span class="promo__title"><?php echo get_the_title($promo->ID); ?></span>
				</a>
			</div>
		</div>
		<?php endforeach; ?>
		<?php endif; ?>

	</div>

</section>

<?php get_footer(); ?>
