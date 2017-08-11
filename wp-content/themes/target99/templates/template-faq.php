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

<section class="faq">
    <div class="faq__inner-container layout__service">
        <div class="faq__title-container">
            <h2 class="faq__title">
                ЗАДАТЬ ВОПРОС, НАПИСАТЬ СООБЩЕНИЕ
            </h2>
            <div class="faq__forms">
                <input type="text" class="faq__input faq__half__input" placeholder="ИМЯ ФАМИЛИЯ" name="full_name">
                <input type="text" class="faq__input faq__half__input" placeholder="EMAIL" name="email">
                <textarea type="text" class="faq__input faq__full__input" placeholder="ВОПРОС"
                          name="question"></textarea>
                <span class="button button--warning button--mobile-full faq__button">Отправить</span>
            </div>
        </div>
    </div>
</section>


<?php get_footer(); ?>

