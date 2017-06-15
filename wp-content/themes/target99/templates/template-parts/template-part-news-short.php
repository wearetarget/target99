<section class="short-news">
    <div class="short-news__inner-container">
        <div class="short-news__image-container">
            <img src="<?php echo $news_image_url; ?>" class="short-news__image"/>
        </div>

        <div class="short-news__content">
            <h3 class="short-news__content-title"><?php echo get_the_title(); ?></h3>
            <p class="short-news__content-text">
                <?php echo get_the_excerpt(); ?>
            </p>
            <a href="<?php echo get_the_permalink(); ?>"><span class="button button--dark">Читать дальше</span></a>
        </div>
    </div>
</section>