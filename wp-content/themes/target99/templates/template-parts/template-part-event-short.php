<div class="event">
    <a href="<?php echo get_the_permalink();?>" class="event__content" style="background: url(<?php echo $event_background; ?>)">
            <div class="event__description-container">
                <div class="event__title-container">
                    <h3 class="event__title"><?php echo get_the_title(); ?></h3>
                </div>

                <div class="event__date-container">
                    <div class="event__date">
                        <span class="fa fa-calendar"></span><?php echo get_field('event_date'); ?>
                    </div>
                </div>
            </div>
    </a>
</div>