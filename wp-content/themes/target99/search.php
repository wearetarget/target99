<?php

	global $query_string;
	$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
	$query_args = explode("&", $query_string);
	$search_query = [
		'post_status'       => array('publish'),
		'post_type'         => array('post'),
		'posts_per_page'    => 10,
		'order'             => 'DSC',
		'orderby'           => 'date',
		'paged'             => $paged
	];

	if( strlen($query_string) > 0 ) {
		foreach($query_args as $key => $string) {
			$query_split = explode("=", $string);
			$search_query[$query_split[0]] = urldecode($query_split[1]);
		}
	}

	$the_query = new WP_Query($search_query);

	get_header();
?>

<section class="search-page">

	<section class="search-page__posts-container">
		<?php

				if ( $the_query->have_posts() ) {
					while ( $the_query->have_posts() ) {
						$the_query->the_post();

						include('templates/template-parts/template-part-news-short.php');
					}

					wp_reset_postdata();
				} else {
		?>
			<p><?php _e('There were no posts that matched your search.'); ?></p>
		<?php } ?>

	</section>

	<div class="search-page__pagination-container">
	</div>

</section>

<?php get_footer(); ?>
