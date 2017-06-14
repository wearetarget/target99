<div class="waste-info__tile">
    <a href="<?php echo get_the_permalink(); ?>">
        <div class="waste-info-tile" style="background: url(<?php echo $waste_info_background; ?>);">
            <div class="waste-info-tile__content">
                <div class="waste-info-tile__title-container">
                    <h4 class="waste-info-tile__title"><?php echo get_the_title(); ?></h4>
                </div>
                <div class="waste-info-tile__text-container">
                    <p class="waste-info-tile__text">
                        <?php echo get_the_excerpt(); ?>
                    </p>
                </div>
            </div>
        </div>
    </a>
</div>