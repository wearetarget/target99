<section class="promo">
    <a class="short-post__inner-container" href="<?php echo get_the_permalink(); ?>">
        <img src="<?php echo $post_image_url; ?>" class="short-post__image"/>
        <div class="short-post__meta-container">
            <div class="short-post__title-container">
                <h2 class="short-post__title"><?php echo get_the_title(); ?></h2>
            </div>
            <div class="short-post__date-container">
                <div class="short-post__date">
                    <span class="fa fa-calendar"></span><?php echo get_the_date(); ?>
                </div>
            </div>
        </div>
    </a>
</section>
