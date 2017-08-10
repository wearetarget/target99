<?php

/*
    Template Name: Faq
*/

the_post();
get_header();
?>



<section class="faq-info">
    <div class="faq-info__inner-container layout__service">
        <div class="faq-info__title-container">
            <h2 class="faq-info__title"><?php echo get_the_title(); ?></h2>
        </div>
        <div class="faq-info__content">
            <?php echo do_shortcode("[accordions id=\"76\"]"); ?>
        </div>
    </div>
</section>

<section class="faq">
    <div class="faq__inner-container layout__service">
        <div class="faq__title-container">
            <h2 class="faq__title">
                ЗАДАТЬ ВОПРОС, НАПИСАТЬ СООБЩЕНИЕ
            </h2>
<div class="faq__forms">
            <input type="text" class="faq__input faq__half__input" placeholder="ИМЯ ФАМИЛИЯ" name="full_name">
            <input type="text" class="faq__input faq__half__input" placeholder="EMAIL" name="email">
           <textarea type="text" class="faq__input faq__full__input"  placeholder="ВОПРОС" name="question"></textarea>
                  <span class="button button--warning button--mobile-full faq__button">Отправить</span>
            </div>
        </div>
    </div>
</section>


<?php get_footer(); ?>

