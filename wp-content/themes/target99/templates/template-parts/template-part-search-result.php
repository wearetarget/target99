<section class="search-result">
    <div class="search-result__inner-container">
        <div class="search-result__image-container">
            <img class="search-result__image" src="<?php echo $post_image_url; ?>"/>
        </div>
        <div class="search-result__content">
            <div class="search-result__title-container">
                <h2 class="search-result__title"><?php the_title(); ?></h2>
                <div class="search-result__date">
                    <span class="fa fa-calendar"></span><?php echo get_the_date(); ?>
                </div>
            </div>

            <div class="search-result__teaser-container">
                <?php echo trim_excerpt(get_the_excerpt()); ?>
                <div class="search-result__link-container">
                    <a class="search-result__link" href="<?php the_permalink(); ?>">Читать дальше</a>
                </div>
            </div>
        </div>

    </div>
</section>