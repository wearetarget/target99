<?php
    $achievements_image_url = wp_get_attachment_image_src(get_post_thumbnail_id(), 'thumbnail')[0];

    if (!$achievements_image_url){
        $selected_icon = get_field('achievement_icon');
        $achievements_image_url = get_bloginfo('template_url') . '/images/' . $selected_icon . '.png';
    }
?>

<div class="achievement">
    <a href="<?php echo get_the_permalink(); ?>" class="achievement__content">
        <div class="achievement__icon-container">
            <div class="achievement__icon" style="background:url('<?php echo $achievements_image_url; ?>');"></div>
        </div>
        <div class="achievement__title-container">
            <h3 class="achievement__title"><?php echo get_field('archivement_short_result'); ?></h3>
        </div>
        <div class="achievement__description-container">
            <span class="achievement__description">
                <?php echo get_field('achievement_result_desc'); ?>
            </span>
        </div>
    </a>
</div>