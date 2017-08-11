<?php

$sub_url = $_SERVER['REQUEST_URI'];
$url_pieces = explode('/', preg_replace('{/$}', '', $sub_url));
$cat_key = array_search('category', $url_pieces);
$cats = []; // sanitize cats
$cats_arr = [];

if ($cat_key !== false) {
    $cats = explode('+', $url_pieces[$cat_key + 1]);

    foreach ($cats as $cat_single) {
        $cats[$cat_single] = get_cat_ID($cat_single);
    }
}

$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
$post_args = [
    'post_status' => array('publish'),
    'post_type' => array('post'),
    'posts_per_page' => 10,
    'order' => 'DSC',
    'orderby' => 'date',
    'paged' => $paged,
    'tax_query' => array(
        array(
            'taxonomy' => 'category',
            'field' => 'slug',
            'terms' => $cats
        )
    )
];

$the_query = new WP_Query($post_args);

get_header('blog');
?>


<div class="archive-page">
    <div class="archive-page__inner-container layout__content">
        <?php if ($cat_key !== false) : ?>
        <div class="archive-page__title-container">
            <h1 class="archive-page__title"><?php echo get_category_by_slug($cats[0])->cat_name; ?></h1>
        </div>
        <?php endif; ?>

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

        <div class="search-page__pagination-container">
            <?php custom_pagination($the_query->max_num_pages, "", $paged); ?>

        </div>
    </div>
</div>

<?php get_footer(); ?>
