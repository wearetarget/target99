<?php
	get_header();
?>

	<section class="content">
		<div class="container container--content">

			<h1><?php echo trim_title(the_title()); ?></h1>

			<?php the_content(); ?>

		</div>
	</section>

<?php get_footer(); ?>
