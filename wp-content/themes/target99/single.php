<?php

	get_header();
?>

<section class="news-post">
	<div class="news-post__inner-container">
		<div class="news-post__details-container">
			<div class="news-post__socials-container">
			</div>
		</div>

		<div class="news-post__content">
			<?php the_content(); ?>
		</div>
	</div>

</section>

<?php get_footer(); ?>
