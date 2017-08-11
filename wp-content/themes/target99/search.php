<?php

global $query_string;
$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
$query_args = explode("&", $query_string);
$search_query = [
    'post_status' => array('publish'),
    'post_type' => array('post', 'waste-info', 'achievement'),
    'posts_per_page' => 10,
    'order' => 'DSC',
    'orderby' => 'date',
    'paged' => $paged
];

if (strlen($query_string) > 0) {
    foreach ($query_args as $key => $string) {
        $query_split = explode("=", $string);
        $search_query[$query_split[0]] = urldecode($query_split[1]);
    }
}

$the_query = new WP_Query($search_query);

get_header();
?>

<div class="archive-page">
    <div class="archieve-page__inner-container layout__content">
        <div class="archive-page__title-container">
            <h1 class="archive-page__title">Результаты поиска</h1>
        </div>

        <div class="archive-page__posts-container">
            <?php

            if ($the_query->have_posts()) {
                while ($the_query->have_posts()) {
                    $the_query->the_post();
                    $post_image_url = wp_get_attachment_image_src(get_post_thumbnail_id(), 'medium')[0];

                    echo '<div class="archive-page__post">';
                    include('templates/template-parts/template-part-search-result.php');
                    echo '</div>';
                }

                wp_reset_postdata();
            } else {
                ?>
                <p><?php _e('Ничего не найдено. Попробуйте поискать что-то другое :)'); ?></p>
            <?php } ?>

        </div>

        <div class="archive-page__pagination-container">
            <?php custom_pagination($the_query->max_num_pages, "", $paged); ?>
        </div>
    </div>
</div>

<?php get_footer(); ?>
