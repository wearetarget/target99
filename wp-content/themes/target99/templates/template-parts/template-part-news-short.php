<section class="short-news">
    <div class="short-news__inner-container">
        <div class="visibility-layout visibility-layout--mobile">
            <div class="short-news__content">
                <h3 class="short-news__content-title">
                    <a href="<?php echo get_the_permalink(); ?>"><?php echo get_the_title(); ?></a>
                </h3>
                <p class="short-news__content-text">
                    <?php echo get_the_excerpt(); ?>
                </p>
            </div>
            <div class="short-news__image-container">
                <a href="<?php echo get_the_permalink(); ?>">
                    <img src="<?php echo $news_image_url; ?>" class="short-news__image"/>
                </a>
                <div  class="short-news__content-link-container">
                    <a href="<?php echo get_the_permalink(); ?>" class="short-news__content-link">
                        <span>Читать дальше</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="visibility-layout visibility-layout--desktop visibility-layout--tablet">
            <div class="short-news__image-container">
                <a href="<?php echo get_the_permalink(); ?>">
                    <img src="<?php echo $news_image_url; ?>" class="short-news__image"/>
                </a>
            </div>

            <div class="short-news__content">
                <h3 class="short-news__content-title">
                    <a href="<?php echo get_the_permalink(); ?>"><?php echo get_the_title(); ?></a>
                </h3>
                <p class="short-news__content-text">
                    <?php echo get_the_excerpt(); ?>
                </p>
                <div  class="short-news__content-link-container">
                    <a href="<?php echo get_the_permalink(); ?>" class="short-news__content-link">
                        <span class="button button--dark">Читать дальше</span>
                    </a>
                </div>
            </div>
        </div>

    </div>
</section>