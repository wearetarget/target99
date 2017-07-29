<?php

/*
	Template Name: About us
*/

// Post query arguments
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

    <section class="about-us">
        <div class="about-us__inner-container layout__service">
            <div class="about-us__title-container">
                <div class="about-us__title">
                    <h2 class="about-us__title-module">Движение "Цель 99"</h2>
                </div>
            </div>

            <div class="about-us__videoWrapper">
                <!-- Copy & Pasted from YouTube -->
                <iframe width="100%"  src="http://www.youtube.com/embed/n_dZNLr2cME?rel=0&hd=1" frameborder="0" allowfullscreen></iframe>
            </div>

        </div>
        <div class="about-us__inner-container layout__content">

            <div class="about-us__center">
                <div class="about-us__title">
                    <h2 class="about-us__title-question">Кто мы?</h2>
                </div>
            </div>
            <div class="about-us__text-answer">
                Мы – это вы.<br>
                Да-да. Не партия, не фракция, не государственная структура.<br>
                Мы – это гражданское движение, к которому можете присоединиться вы, ваши родные, друзья, коллеги, соседи.<br>
                Мы –это неравнодушные вы – те жители Беларуси, кто хочет и готов сделать свой дом чистым, двор – уютным, страну – ухоженной.
            </div>

            <div class="about-us__center">
                <div class="about-us__title">
                    <h2 class="about-us__title-question">В чем суть движения?</h2>
                </div>
            </div>
            <div class="about-us__text-answer">
                Наша цель – сортировать и перерабатывать 99% бытовых отходов.<br>
                Бумага, стекло, пластик, металл, старая техника– при разумном подходе все это из отходов превращается в полезные ресурсы.<br>
                А энергосберегающие лампы и батарейки перестают быть опасными для природы.<br>
                Экология и экономика – все просто. За вторичными ресурсами – будущее, все же в курсе?<br>
                Если мы хотим пить чистую воду, дышать свежим воздухом, любоваться природой – нам просто необходимо справиться с мусором!
            </div>

            <div class="about-us__center">
                <div class="about-us__title">
                    <h2 class="about-us__title-question">Почему 99%?</h2>
                </div>
            </div>
            <div class="about-us__text-answer">
                Да, почему не 100?<br>
                Потому что никому не нужны красивые круглые цифры, написанные на бумаге.<br>
                99% - это символ того, что мы стремимся к максимуму, понимая при этом, что совершенства нет. Важна не просто конечная цель, а движение в нужном направлении.<br>
                Давайте просто начнем!<br>
                Это не сложно – бумажку туда, а бутылку сюда... Вот и пошло-поехало! Желание, движение, процесс – вот самое главное!</div>


        </div>
    </section>

    <div class="post-page__pagination-container">
    </div>

</section>

<?php get_footer(); ?>

