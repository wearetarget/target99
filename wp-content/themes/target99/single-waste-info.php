<?php
	$category = get_the_category()[0];
	$post_image_url = wp_get_attachment_image_src( get_post_thumbnail_id(), 'full' )[0];
	get_header();
?>

<section class="full-post">
	<div class="full-post__inner-container">
		<div class="full-post__article-container">
			Waste Info
			<div class="full-post__header">
				<div class="full-post__category-container">
					<span class="full-post__category--prefix">Target99 / </span>
					<span class="full-post__category"><?php echo $category->cat_name; ?></span>
				</div>
				<img src="<?php echo $post_image_url; ?>" class="full-post__featured-image" />

				<div class="full-post__meta-container">
					<div class="full-post__title-container">
						<h1 class="full-post__title"><?php echo get_the_title(); ?></h1>
					</div>
					<div class="full-post__back-link-container">
						<a href="/blog" class="full-post__back-link">К списку новостей</a>
					</div>
					<div class="full-post__date-container">
						<div class="short-post__date">
							<span class="fa fa-calendar"></span><?php echo get_the_date(); ?>
						</div>
					</div>
				</div>
			</div>

			<div class="full-post__content">
				<?php the_content(); ?>
			</div>

			<div class="full-post__back-link-container">
				<a href="/blog" class="full-post__back-link full-post__back-link--green">К списку новостей</a>
			</div>

			<div class="full-post__share-container">
				<div class="full-post__share">
					Поделиться <span class="fa fa-share"></span>
				</div>
			</div>
		</div>

	</div>

</section>

<?php get_footer(); ?>
