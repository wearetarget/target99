<?php if ( $related_posts ) : ?>
<div class="related-gallery">

    <?php foreach ( $related_posts as $post ) :
            setup_postdata( $post );

        // Check if size was set in widget or shortcode
        $size = isset( $rpbt_args['size'] ) ? $size : 'thumbnail';
    ?>
    <div class="related-gallery__item-container">
        <div class="related-post">
            <a class="related-post__inner-container" href="<?php the_permalink(); ?>">
                <img class="related-post__image" src="<?php the_post_thumbnail_url( $size ); ?>" />

                <div class="related-post__meta-container">
                    <div class="related-post__title-container">
                        <h4 class="related-post__title"><?php the_title(); ?></h4>
                    </div>

                    <div class="related-post__date-container">
                        <div class="related-post__date">
                            <span class="fa fa-calendar"></span><?php echo get_the_date(); ?>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </div>

    <?php endforeach; ?>

</div>

<?php endif ?>
