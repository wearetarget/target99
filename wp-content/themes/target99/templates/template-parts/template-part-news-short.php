<?php
	/*
		Example of the template-part
	*/
?>

<div class="short-post">

	<?php if ( $post_image_url ) : ?>
        <div class="short-post__image-container">
            <img class="short-post__image" src="<?php echo $post_image_url; ?>"/>
        </div>
	<?php endif ?>


	<div class="short-post__details <?php echo $content_width_class ?>">
		<a class="short-post__title-link" href="<?php the_permalink(); ?>">
			<h2 class="short-post__title"><?php echo trim_title(the_title()); ?></h2>
		</a>
		<div class="short-post__meta-info">
			<span class="short-post__date"><?php the_time('M. d Y'); ?></span>
		</div>
		<p class="short-post__excerpt"><?php echo trim_excerpt( get_the_excerpt() ); ?></p>

		<a class="short-post__link" href="<?php the_permalink(); ?>">Read Article</a>
	</div>
</div>
