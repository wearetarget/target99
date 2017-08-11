<?php

/*
    Template Name: Home
*/

// Waste Info request
$waste_info_args = [
    'post_status' => array('publish'),
    'post_type' => array('waste-info'),
    'order' => 'ASC',
    'orderby' => 'date',
];

$waste_info_query = new WP_Query($waste_info_args);

// News request
$news_args = [
    'post_status' => array('publish'),
    'post_type' => array('post'),
    'category_name' => 'news',
    'posts_per_page' => 2,
    'order' => 'DSC',
    'orderby' => 'date',
];

$news_query = new WP_Query($news_args);

// Events request
$events_args = [
    'post_status' => array('publish'),
    'post_type' => array('post'),
    'category_name' => 'event',
    'posts_per_page' => 2,
    'order' => 'DSC',
    'orderby' => 'date',
];

$events_query = new WP_Query($events_args);

// Achievements request
$achievements_args = [
    'post_status' => array('publish'),
    'post_type' => array('achievement'),
    'order' => 'ASC',
    'orderby' => 'date',
    'meta_query' => array(
        array(
            'key' => 'show_in_achievement_panel',
            'value' => '1',
            'compare' => '='
        )
    )
];

$achievements_query = new WP_Query($achievements_args);

// Partners request
$partners_args = [
    'post_status' => array('publish'),
    'post_type' => array('partner-info'),
    'order' => 'ASC',
    'orderby' => 'date',
];

$partners_query = new WP_Query($partners_args);

get_header();
?>

<section class="slider-panel">
    <div class="visibility-layout visibility-layout--desktop visibility-layout--tablet">
        <?php echo do_shortcode('[smartslider3 slider=1]'); ?>
    </div>

    <div class="visibility-layout visibility-layout--mobile">
        <img class="slider-panel__image" src="<?php echo get_field('mobile_slider_image'); ?>"/>
    </div>

</section>

<?php if ($waste_info_query->have_posts()) : ?>
    <section class="waste-info-panel">
        <div class="waste-info-panel__inner-container layout__content">
            <div class="waste-info-panel__title-container">
                <h2 class="waste-info-panel__title">Информация об отходах</h2>
            </div>

            <div class="waste-info-panel__tiles-list">
                <?php
                while ($waste_info_query->have_posts()) {
                    $waste_info_query->the_post();
                    $waste_info_background = wp_get_attachment_image_src(get_post_thumbnail_id(), 'full')[0];

                    echo '<div class="waste-info-panel__tile">';
                    include('template-parts/template-part-waste-info.php');
                    echo '</div>';

                    }

                wp_reset_postdata();
                ?>
            </div>
        </div>
    </section>
<?php endif; ?>

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
                <a href="/category/news/"><span class="button button--warning button--mobile-full">Смотреть всю информацию</span></a>
            </div>
        </div>
    </section>
<?php endif; ?>

<?php if ($events_query->have_posts()) : ?>
    <section class="event-panel">
        <div class="event-panel__inner-container layout__content">
            <div class="event-panel__title-container">
                <h2 class="event-panel__title">Актуально</h2>
            </div>

            <div class="event-panel__list">
                <?php
                while ($events_query->have_posts()) {
                    $events_query->the_post();
                    $event_background = wp_get_attachment_image_src(get_post_thumbnail_id(), 'medium')[0];

                    echo '<div class="event-panel__list-item">';
                    include('template-parts/template-part-event-short.php');

                    echo '</div>';
                }

                wp_reset_postdata();
                ?>
            </div>

            <div class="event-panel__footer">
                <a href="/category/event/"><span class="button button--warning button--mobile-full">Смотреть все мероприятия</span></a>
            </div>
        </div>
    </section>
<?php endif; ?>

<?php if ($achievements_query->have_posts()) : ?>
    <section class="achievements-panel">
        <div class="achievements-panel__inner-container layout__content">
            <div class="achievements-panel__title-container">
                <h2 class="achievements-panel__title">Достижения</h2>
            </div>
            <div class="achievements-panel__list">
                <?php
                while ($achievements_query->have_posts()) {
                    $achievements_query->the_post();

                    echo '<div class="achievements-panel__list-item">';
                    include('template-parts/template-part-achievement.php');
                    echo '</div>';
                }

                wp_reset_postdata();
                ?>
            </div>
        </div>
    </section>
<?php endif; ?>

<?php if ($partners_query->have_posts()) : ?>
    <section class="partners">
        <div class="partners__inner-container layout__content">
            <div class="partners__list">
                <?php
                while ($partners_query->have_posts()) {
                    $partners_query->the_post();
                    $partner_image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'medium')[0];

                    include('template-parts/template-part-partner.php');
                }

                wp_reset_postdata();
                ?>
            </div>
        </div>
    </section>
<?php endif; ?>

<section class="subscription">
    <div class="subscription__inner-container layout__service">
        <div class="subscription__title-container">
            <h3 class="subscription__title">Хотите быть в курсе всех событий?</h3>
        </div>

        <div class="subscription__form-container">
            <form action="https://target99.us16.list-manage.com/subscribe/post" method="POST" target="_blank">
                <input type="hidden" name="u" value="6b794d30ade1369da55eaf7b1">
                <input type="hidden" name="id" value="d67980ed43">

                <div class="subscription__email-container">
                    <input type="email" class="subscription__email" autocapitalize="off" autocorrect="off" name="MERGE0"
                           id="MERGE0" size="25" value="" placeholder="EMAIL"/>
                </div>
                <div class="subscription__button-container">
                    <input type="submit" class="button button--warning button--mobile-full" name="submit"
                           value="Подписаться">
                </div>
            </form>
        </div>
    </div>
</section>

<section class="contact-panel">
    <div class="contact-panel__inner-container">
        <?php echo do_shortcode('[google_map_easy id="1"]') ?>
        <div class="contact-panel__card-container">
            <div class="contact-info">
                <?php echo get_theme_mod('target99_contact_info'); ?>
            </div>
        </div>
    </div>
</section>

<?php get_footer(); ?>

