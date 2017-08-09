<?php

/*
	Template Name: Promo
*/

//	// Post query arguments
//	$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;
//	$post_args = [
//		'post_status'       => array('publish'),
//		'posts_per_page'    => 10,
//		'post_type'         => array( 'post'),
//		'order'             => 'DSC',
//		'orderby'           => 'date',
//		'paged'             => $paged
//	];
//
//	$the_query = new WP_Query($post_args);

get_header();
?>

<section class="post-page">

    <section class="promo">

        <div class="promo__inner-container layout__service">
            <div class="promo__title-container">
                <h2 class="promo__title">
                    Промо материалы
                </h2>
            </div>
        </div>


        <div class="promo__inner-container layout__content">

            <div class="about-us__videoWrapper">
                <!-- Copy & Pasted from YouTube -->
                <iframe width="100%" src="http://lib.pravmir.ru/data/files/Bible.pdf" frameborder="0"
                        allowfullscreen></iframe>
            </div>

            <div class="promo__container">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">

                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">

                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">

                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">
                <button type="button">Наклейка на конейнер БУМАГА.pdf</button>
                <br class="hide">

            </div>

        </div>

    </section>

    <div class="post-page__pagination-container">
    </div>

</section>

<?php get_footer(); ?>

