<?php

	/*
		Template Name: Waste Info
	*/

// Waste Info request
	$waste_info_args = [
		'post_status' => array('publish'),
		'post_type' => array('waste-info'),
		'order' => 'ASC',
		'orderby' => 'date',
	];

	$waste_info_query = new WP_Query($waste_info_args);

	get_header();
?>

<?php if ($waste_info_query->have_posts()) : ?>
	<section class="waste-page">
		<div class="waste-page__inner-container layout__content">
			<div class="waste-page__title-container">
				<h2 class="waste-page__title">Информация об отходах</h2>
			</div>

			<div class="waste-page__tiles-list">
				<?php
					while ($waste_info_query->have_posts()) {
					$waste_info_query->the_post();
					$waste_info_background = wp_get_attachment_image_src(get_post_thumbnail_id(), 'full')[0];

					echo '<div class="waste-page__tile">';
					include('template-parts/template-part-waste-info.php');
					echo '</div>';
				}

				wp_reset_postdata();
				?>
			</div>
		</div>
	</section>
<?php endif; ?>


<?php get_footer(); ?>

