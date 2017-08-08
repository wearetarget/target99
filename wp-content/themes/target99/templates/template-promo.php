<?php

	/*
		Template Name: Promo
	*/

	$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;

	$promo_args = [
		'post_status' => array('publish'),
		'post_type' => array('promo'),
		'order' => 'ASC',
		'orderby' => 'date',
		'posts_per_page' => 9,
		'paged' => $paged
	];

	$promo_query = new WP_Query($promo_args);

	get_header();
?>

<?php if ($promo_query->have_posts()) : ?>
<section class="promo-page">
	<div class="promo-page__inner-container layout__content">
		<div class="promo-page__title-container">
			<h2 class="promo-page__title">Информация об отходах</h2>
		</div>

		<div class="promo-page__preview-container">
            <div class="promo-preview">
                <div class="promo-preview__image-container">
                    <img class="promo-preview__image" src="" />
                </div>
                <div class="promo-preview__tip-container">
                    <div class="promo-preview__tip">Выберите один из промо-файлов</div>
                </div>
                <div class="promo-preview__controls-container">
                    <div class="promo-preview__control fa fa-download"></div>
                </div>
            </div>
        </div>

		<div class="promo-page__promos-list">

				<?php
					while ($promo_query->have_posts()) {
						$promo_query->the_post();
						$promo_preview = wp_get_attachment_image_src(get_post_thumbnail_id(), 'full')[0];

                ?>
                    <div class="promo-page__promo-item">
                        <div class="promo">
                            <div class="promo__title-container" href="">
                                <span class="promo__title"><?php echo get_the_title(); ?></span>
                            </div>
                        </div>
                    </div>
                <?php
					}

					wp_reset_postdata();
				?>

		</div>

        <div class="promo-page__pagination-container">
            <?php custom_pagination($promo_query->max_num_pages, "", $paged); ?>
        </div>
	</div>
</section>
<?php endif; ?>


<?php get_footer(); ?>

