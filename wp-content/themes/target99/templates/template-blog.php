<?php

	/*
		Template Name: Blog
	*/

	// Post query arguments
	$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
// News request
$news_args = [
	'post_status' => array('publish'),
	'post_type' => array('post'),
	'category_name' => 'news',
	'posts_per_page' => get_field('amount_of_news'),
	'order' => 'DSC',
	'orderby' => 'date',
];

$news_query = new WP_Query($news_args);

	get_header();
?>

<section class="post-page">

	<?php if ($news_query->have_posts()) : ?>
        <section class="short-news-panel">
            <div class="short-news-panel__inner-container layout__content">
                <div class="short-news-panel__title-container">
                    <h2 class="short-news-panel__title">Новости</h2>
                </div>

                <div class="short-news-panel__list">
					<?php
					while ($news_query->have_posts()) {
						$news_query->the_post();
						$news_image_url = wp_get_attachment_image_src(get_post_thumbnail_id(), 'medium')[0];

						include('template-parts/template-part-news-short.php');
					}

					wp_reset_postdata();
					?>
                </div>

                <div class="short-news-panel__footer">
                    <span class="button button--warning button--mobile-full">Смотреть всю информацию</span>
                </div>
            </div>
        </section>
	<?php endif; ?>

</section>

<?php get_footer(); ?>

