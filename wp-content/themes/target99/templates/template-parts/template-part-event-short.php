<div class="event">
    <div class="event__content" style="background: url(<?php echo $event_background; ?>)">
        <div class="event__description-container">
            <div class="event__title-container">
                <h3 class="event__title"><?php echo get_the_title(); ?></h3>
            </div>

            <div class="event__date-container">
                <div class="event__date">
                    <span class="icon-calendar"></span><?php echo get_field('event_date'); ?>
                </div>
            </div>
        </div>

        <div class="event__button-container">
            <span class="button button--light">Читать дальше</span>
        </div>
    </div>
</div>