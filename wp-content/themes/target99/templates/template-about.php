<?php

/*
    Template Name: About
*/

the_post();

get_header();
?>

<section class="post-page">

    <section class="about-us">
        <div class="about-us__inner-container layout__service">
            <div class="about-us__title-container">
                <h1 class="about-us__title"><?php echo get_the_title(); ?></h1>
            </div>
        </div>
        <div class="about-us__content">
                <?php the_content(); ?>
        </div>
    </section>
</section>

<?php get_footer(); ?>

