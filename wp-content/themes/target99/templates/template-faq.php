<?php

/*
    Template Name: Faq
*/
$post_args = [
    'post_status' => array('publish'),
    'post_type' => array('faq'),
    'order' => 'ASC',
    'orderby' => 'date'
];

$the_query = new WP_Query($post_args);

the_post();
get_header();
?>

<section class="faq-panel">
    <div class="faq-panel__inner-container layout__content">
        <div class="faq-panel__title-container">
            <h2 class="faq-panel__title"><?php echo get_the_title(); ?></h2>
        </div>
        <div class="faq-panel__content">
            <div id="faq-accordion" class="faq-accordion">
                <?php
                if ($the_query->have_posts()) {
                    while ($the_query->have_posts()) {
                        $the_query->the_post();
                        ?>

                        <h2 class="faq-accordion__button"><?php the_title(); ?>
                            <span class="faq-accordion__active-indicator">
                                <span class="fa fa-chevron-down"></span>
                                <span class="fa fa-chevron-up"></span>
                            </span>
                        </h2>
                        <div class="faq-accordion__content">
                            <?php the_content(); ?>
                        </div>
                        <?php
                    }

                    wp_reset_postdata();
                }
                ?>
            </div>
        </div>
    </div>
</section>

<script>
    jQuery(document).ready(function () {
        jQuery('.faq-accordion__button').click(function () {
            jQuery(this).toggleClass('faq-accordion__button--active').next().toggle();

            return false;
        });
    });
</script>

<section class="contact-form">
    <div class="contact-form__inner-container layout__content">
        <div class="contact-form__title-container">
            <h2 class="contact-form__title">
                ЗАДАТЬ ВОПРОС, НАПИСАТЬ СООБЩЕНИЕ
            </h2>
        </div>
        <?php echo do_shortcode('[contact-form-7 id="119" title="Contact form"]'); ?>
    </div>
</section>


<?php get_footer(); ?>

