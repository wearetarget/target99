<?php

/*
    Template Name: Faq
*/

//// Post query arguments
//$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
//$post_args = [
//    'post_status' => array('publish'),
//    'posts_per_page' => 10,
//    'post_type' => array('post'),
//    'order' => 'DSC',
//    'orderby' => 'date',
//    'paged' => $paged
//];
//
//$the_query = new WP_Query($post_args);

get_header();
?>



<section class="faq-info">
    <div class="faq-info__inner-container layout__service">
        <div class="faq-info__title-container">
            <h2 class="faq-info__title">Вопросы и ответы</h2>
        </div>
        <?php echo do_shortcode("[accordions id=\"76\"]"); ?>
    </div>
</section>

<section class="faq-ask-question">
    <div class="faq-ask-question__inner-container layout__service">
        <div class="faq-ask-question__title-container">
            <h2 class="faq-ask-question__title">
                ЗАДАТЬ ВОПРОС, НАПИСАТЬ СООБЩЕНИЕ
            </h2>
<div class="faq-ask-question__forms">
            <input type="text" class="faq-ask-question__input faq-ask-question__sm__input" placeholder="ИМЯ ФАМИЛИЯ" name="full_name">
            <input type="text" class="faq-ask-question__input right faq-ask-question__sm__input" placeholder="EMAIL" name="email">
           <textarea type="text" class="faq-ask-question__input faq-ask-question__big__input"  placeholder="ВОПРОС" name="question"></textarea>
                  <span class="button button--warning button--mobile-full faq-ask-question__button">Отправить</span>
            </div>
        </div>
    </div>
</section>


<?php get_footer(); ?>

